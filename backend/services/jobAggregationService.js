const ExternalJob = require('../models/ExternalJob');
const providerRegistry = require('../providers/providerRegistry');
const deduplicationService = require('./deduplicationService');
const fresherEligibilityService = require('./fresherEligibilityService');
const jobNormalizationService = require('./jobNormalizationService');

/**
 * JobAggregationService - Central orchestrator for the Real-Time Fresher IT Job Aggregator.
 * Coordinates parallel provider fetching, DB-synced external listings, caching, strict 0-exp filtering,
 * cross-platform deduplication, freshness tracking, category classification, and pagination.
 */
class JobAggregationService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache TTL
    this.jobIndex = new Map(); // Global index by ID for direct lookup
  }

  getCacheKey(prefix, params = {}) {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}=${Array.isArray(params[k]) ? params[k].join(',') : params[k]}`)
      .join('&');
    return `${prefix}:${sorted}`;
  }

  invalidateCache() {
    this.cache.clear();
    this.jobIndex.clear();
    console.log('[JobAggregationService] Cache invalidated.');
  }

  /**
   * Fetches raw normalized jobs across MongoDB ExternalJobs and active providers in parallel.
   */
  async fetchAllProviderJobs(filters = {}) {
    const cacheKey = this.getCacheKey('all_raw_jobs', {
      search: filters.search || '',
      location: filters.location || '',
    });

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const activeProviders = providerRegistry.getActiveProviders();
    const fetchPromises = activeProviders.map((provider) =>
      provider
        .fetchJobs(filters)
        .catch((err) => {
          console.warn(`[AggregatorService] Provider ${provider.name} failed:`, err.message);
          return [];
        })
    );

    // Also fetch all active verified listings saved in ExternalJob
    const externalDbPromise = ExternalJob.find({
      isFresherEligible: true,
    })
      .sort({ postedAt: -1 })
      .lean()
      .catch((err) => {
        console.warn('[AggregatorService] ExternalJob DB query error:', err.message);
        return [];
      });

    const [providerResults, externalDbJobs] = await Promise.all([
      Promise.allSettled(fetchPromises),
      externalDbPromise,
    ]);

    const combined = [];

    // Add active provider results
    for (const res of providerResults) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        combined.push(...res.value);
      }
    }

    // Add stored ExternalJob documents
    for (const doc of externalDbJobs) {
      // Avoid duplication with provider results that returned the same external ID
      const isAlreadyIncluded = combined.some(
        (c) => c._id === doc.externalId || (c.sourceJobId && c.sourceJobId === doc.sourceJobId)
      );

      if (!isAlreadyIncluded) {
        const isPostedToday = doc.postedAt
          ? Date.now() - new Date(doc.postedAt).getTime() < 24 * 60 * 60 * 1000
          : false;

        let sourceBadgeColor = 'primary';
        if (doc.source === 'Naukri') sourceBadgeColor = 'cyan';
        else if (doc.source === 'LinkedIn') sourceBadgeColor = 'purple';
        else if (doc.source === 'Indeed') sourceBadgeColor = 'primary';
        else if (doc.source === 'Internshala') sourceBadgeColor = 'warning';
        else if (doc.source === 'Wellfound') sourceBadgeColor = 'danger';
        else if (doc.source === 'Arbeitnow') sourceBadgeColor = 'cyan';
        else if (doc.source === 'Remotive') sourceBadgeColor = 'purple';

        combined.push({
          _id: doc.externalId || String(doc._id),
          sourceJobId: doc.sourceJobId || '',
          title: doc.title,
          companyName: doc.companyName,
          companyLogo: doc.companyLogo || '',
          location: doc.location,
          city: doc.city || 'India',
          workplaceType: doc.workplaceType || 'remote',
          employmentType: doc.employmentType || 'full-time',
          experienceLevel: 'entry',
          experienceRequired: doc.experienceRequired || '0 Years Required',
          isFresherEligible: doc.isFresherEligible,
          isFresherVerified: doc.isFresherVerified,
          fresherCategory: doc.fresherCategory || 'fulltime_fresher',
          fresherCategoryLabel: doc.fresherCategoryLabel || 'Full-Time Fresher IT Role',
          salary: doc.salary || 'Best in Industry',
          salaryMin: doc.salaryMin || 0,
          salaryMax: doc.salaryMax || 0,
          currency: doc.currency || 'INR',
          skills: doc.skills || [],
          description: doc.description || '',
          summary: doc.summary || (doc.description ? doc.description.substring(0, 240) : ''),
          source: doc.source,
          sourceDisplayName: `${doc.source} Partner`,
          sourceBadgeColor,
          isExternal: true,
          originalUrl: doc.originalUrl,
          postedAt: doc.postedAt || doc.createdAt,
          lastVerifiedAt: doc.lastVerifiedAt || new Date(),
          recentlyUpdatedAt: doc.recentlyUpdatedAt,
          isRecentlyUpdated: doc.isRecentlyUpdated || false,
          isNewToday: isPostedToday,
          status: doc.status || 'active',
          officialCareerSiteUrl: doc.officialCareerSiteUrl || '',
          hasPPO: doc.hasPPO !== undefined ? doc.hasPPO : (doc.employmentType === 'internship'),
          minQualification: doc.minQualification || 'B.Tech / B.E. / MCA (Student / Graduate)',
          alternativeSources: doc.alternativeSources || [],
        });
      }
    }

    // Dynamic freshness computation: ensure isNewToday is accurately computed from postedAt
    const now = Date.now();
    for (const job of combined) {
      if (job.postedAt) {
        job.isNewToday = now - new Date(job.postedAt).getTime() < 24 * 60 * 60 * 1000;
      }
    }

    // Deduplicate across providers and DB
    const deduplicated = deduplicationService.deduplicate(combined);

    // Update global index
    for (const job of deduplicated) {
      this.jobIndex.set(job._id, job);
    }

    // Cache results
    this.cache.set(cacheKey, {
      data: deduplicated,
      timestamp: Date.now(),
    });

    return deduplicated;
  }

  /**
   * Main Search & Aggregation Pipeline for Freshers
   */
  async getAggregatedJobs({
    search = '',
    location = '',
    category = 'all',
    workMode,
    employmentType,
    skills,
    source,
    fresherOnly = 'true',
    sortBy = 'newest',
    page = 1,
    limit = 12,
  } = {}) {
    const allJobs = await this.fetchAllProviderJobs({ search, location });

    const isFresherOnlyActive = fresherOnly !== 'false' && fresherOnly !== false;

    // 1. Strict Fresher Eligibility Filter
    let filtered = allJobs;
    if (isFresherOnlyActive) {
      filtered = filtered.filter((job) => job.isFresherEligible);
    }

    // 2. Keyword Search (title, company, skills, description)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((job) => {
        return (
          job.title.toLowerCase().includes(q) ||
          job.companyName.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q)) ||
          job.description.toLowerCase().includes(q)
        );
      });
    }

    // 3. Location / City Filter
    if (location && location.trim() && location.toLowerCase() !== 'all') {
      const locQ = location.trim().toLowerCase();
      filtered = filtered.filter((job) => {
        return (
          job.city.toLowerCase().includes(locQ) ||
          job.location.toLowerCase().includes(locQ)
        );
      });
    }

    // 4. Target Fresher Category Filter
    // 'fulltime_fresher' | 'internship' | 'trainee' | 'remote_entry'
    if (category && category !== 'all') {
      filtered = filtered.filter((job) => job.fresherCategory === category);
    }

    // 5. Work Mode Filter (remote, hybrid, on-site)
    if (workMode && workMode !== 'all') {
      const modes = Array.isArray(workMode)
        ? workMode
        : workMode.split(',').map((m) => m.trim().toLowerCase());
      filtered = filtered.filter((job) => modes.includes(job.workplaceType));
    }

    // 6. Employment Type Filter
    if (employmentType && employmentType !== 'all') {
      const types = Array.isArray(employmentType)
        ? employmentType
        : employmentType.split(',').map((t) => t.trim().toLowerCase());
      filtered = filtered.filter((job) => types.includes(job.employmentType));
    }

    // 7. Skills Filter
    if (skills) {
      const skillList = (Array.isArray(skills) ? skills : skills.split(','))
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      if (skillList.length > 0) {
        filtered = filtered.filter((job) =>
          skillList.some((reqSkill) =>
            job.skills.some((s) => s.toLowerCase().includes(reqSkill))
          )
        );
      }
    }

    // 8. Source Filter
    if (source && source !== 'all') {
      const srcLower = source.toLowerCase();
      filtered = filtered.filter((job) => job.source.toLowerCase() === srcLower);
    }

    // Calculate Dynamic Stats Across the Filtered Fresher Set
    const categoriesCount = {
      all: filtered.length,
      fulltime_fresher: 0,
      internship: 0,
      trainee: 0,
      remote_entry: 0,
    };

    const sourcesCount = {};
    const locationsCount = {
      Bengaluru: 0,
      Hyderabad: 0,
      Pune: 0,
      Chennai: 0,
      Mumbai: 0,
      'Delhi NCR': 0,
      Remote: 0,
    };

    let fresherVerifiedCount = 0;
    let newTodayCount = 0;

    for (const job of filtered) {
      if (categoriesCount[job.fresherCategory] !== undefined) {
        categoriesCount[job.fresherCategory]++;
      }

      sourcesCount[job.source] = (sourcesCount[job.source] || 0) + 1;

      if (locationsCount[job.city] !== undefined) {
        locationsCount[job.city]++;
      } else if (job.workplaceType === 'remote') {
        locationsCount.Remote++;
      }

      if (job.isFresherVerified) {
        fresherVerifiedCount++;
      }

      if (job.isNewToday) {
        newTodayCount++;
      }
    }

    // 9. Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'salary_high') {
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      }
      if (sortBy === 'salary_low') {
        return (a.salaryMin || 0) - (b.salaryMin || 0);
      }
      if (sortBy === 'relevance') {
        return (b.isFresherVerified ? 1 : 0) - (a.isFresherVerified ? 1 : 0);
      }
      // Default: newest posted date first
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    // 10. Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const total = filtered.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const pagedJobs = filtered.slice(startIndex, startIndex + limitNum);

    return {
      jobs: pagedJobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      stats: {
        totalFound: total,
        fresherVerifiedCount,
        newTodayCount,
        categoriesCount,
        sourcesCount,
        locationsCount,
      },
      providers: providerRegistry.getAllProvidersInfo(),
    };
  }

  /**
   * Retrieves a single fresher job listing by ID
   */
  async getJobById(id) {
    if (!id) return null;

    if (this.jobIndex.has(id)) {
      return this.jobIndex.get(id);
    }

    // Try ExternalJob by externalId
    const extJob = await ExternalJob.findOne({ externalId: id }).lean();
    if (extJob) {
      const isPostedToday = extJob.postedAt
        ? Date.now() - new Date(extJob.postedAt).getTime() < 24 * 60 * 60 * 1000
        : false;

      let sourceBadgeColor = 'primary';
      if (extJob.source === 'Naukri') sourceBadgeColor = 'cyan';
      else if (extJob.source === 'LinkedIn') sourceBadgeColor = 'purple';
      else if (extJob.source === 'Indeed') sourceBadgeColor = 'primary';
      else if (extJob.source === 'Internshala') sourceBadgeColor = 'warning';
      else if (extJob.source === 'Wellfound') sourceBadgeColor = 'danger';
      else if (extJob.source === 'Arbeitnow') sourceBadgeColor = 'cyan';
      else if (extJob.source === 'Remotive') sourceBadgeColor = 'purple';

      const normalized = {
        _id: extJob.externalId,
        sourceJobId: extJob.sourceJobId || '',
        title: extJob.title,
        companyName: extJob.companyName,
        companyLogo: extJob.companyLogo || '',
        location: extJob.location,
        city: extJob.city || 'India',
        workplaceType: extJob.workplaceType || 'remote',
        employmentType: extJob.employmentType || 'full-time',
        experienceLevel: 'entry',
        experienceRequired: extJob.experienceRequired || '0 Years Required',
        isFresherEligible: extJob.isFresherEligible,
        isFresherVerified: extJob.isFresherVerified,
        fresherCategory: extJob.fresherCategory || 'fulltime_fresher',
        fresherCategoryLabel: extJob.fresherCategoryLabel || 'Full-Time Fresher IT Role',
        salary: extJob.salary || 'Best in Industry',
        salaryMin: extJob.salaryMin || 0,
        salaryMax: extJob.salaryMax || 0,
        currency: extJob.currency || 'INR',
        skills: extJob.skills || [],
        description: extJob.description || '',
        summary: extJob.summary || (extJob.description ? extJob.description.substring(0, 240) : ''),
        source: extJob.source,
        sourceDisplayName: `${extJob.source} Partner`,
        sourceBadgeColor,
        isExternal: true,
        originalUrl: extJob.originalUrl,
        postedAt: extJob.postedAt || extJob.createdAt,
        lastVerifiedAt: extJob.lastVerifiedAt || new Date(),
        recentlyUpdatedAt: extJob.recentlyUpdatedAt,
        isRecentlyUpdated: extJob.isRecentlyUpdated || false,
        isNewToday: isPostedToday,
        status: extJob.status || 'active',
        officialCareerSiteUrl: extJob.officialCareerSiteUrl || '',
        hasPPO: extJob.hasPPO !== undefined ? extJob.hasPPO : (extJob.employmentType === 'internship'),
        minQualification: extJob.minQualification || 'B.Tech / B.E. / MCA (Student / Graduate)',
        alternativeSources: extJob.alternativeSources || [],
      };
      this.jobIndex.set(normalized._id, normalized);
      return normalized;
    }

    // Fallback: Populate active listings
    await this.fetchAllProviderJobs({});
    return this.jobIndex.get(id) || null;
  }
}

module.exports = new JobAggregationService();
