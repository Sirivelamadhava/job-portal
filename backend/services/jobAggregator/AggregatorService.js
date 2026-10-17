const Job = require('../../models/Job');
const ArbeitnowAdapter = require('./ArbeitnowAdapter');
const RemotiveAdapter = require('./RemotiveAdapter');
const LinkedInAdapter = require('./LinkedInAdapter');
const IndeedAdapter = require('./IndeedAdapter');
const NaukriAdapter = require('./NaukriAdapter');

class AggregatorService {
  constructor() {
    // Instantiate all provider adapters
    this.adapters = {
      arbeitnow: new ArbeitnowAdapter(),
      remotive: new RemotiveAdapter(),
      linkedin: new LinkedInAdapter(),
      indeed: new IndeedAdapter(),
      naukri: new NaukriAdapter(),
    };

    // In-memory cache: key -> { data, timestamp }
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 minutes cache TTL
    this.externalJobIndex = new Map(); // Global index of known external jobs by ID for detail view
  }

  /**
   * Return configuration and partnership info for all registered sources
   */
  getProvidersInfo() {
    const list = [
      {
        name: 'careersphere',
        displayName: 'CareerSphere Direct',
        isConfigured: true,
        type: 'first_party',
        description: 'Direct verified employer listings posted on CareerSphere.',
        badgeColor: 'primary',
      },
    ];

    for (const [key, adapter] of Object.entries(this.adapters)) {
      list.push(adapter.getProviderInfo());
    }

    return list;
  }

  /**
   * Generates a cache key for query parameters
   */
  getCacheKey(prefix, params) {
    const cleanParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${Array.isArray(params[k]) ? params[k].join(',') : params[k]}`)
      .join('&');
    return `${prefix}:${cleanParams}`;
  }

  /**
   * Create fingerprint for deduplication (lowercased alphanumeric string of title + company)
   */
  generateFingerprint(title, company) {
    const clean = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${clean(title)}__${clean(company)}`;
  }

  /**
   * Fetch external jobs from all configured third-party adapters in parallel
   */
  async fetchExternalJobs(filters) {
    const cacheKey = this.getCacheKey('external_jobs', {
      search: filters.search || '',
      location: filters.location || '',
      workplaceType: filters.workplaceType || [],
      employmentType: filters.employmentType || [],
      minSalary: filters.minSalary || 0,
      source: filters.source || 'all',
    });

    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const adapterPromises = [];

    // Filter which adapters to run based on requested source
    const targetSource = (filters.source || 'all').toLowerCase();

    for (const [key, adapter] of Object.entries(this.adapters)) {
      // If user selected a specific external provider, only query that one
      if (targetSource !== 'all' && targetSource !== 'external' && targetSource !== key) {
        continue;
      }

      if (adapter.isConfigured()) {
        adapterPromises.push(
          adapter
            .fetchJobs(filters)
            .then((jobs) => ({ name: key, jobs }))
            .catch((err) => {
              console.warn(`[AggregatorService] Failed fetching from ${key}:`, err.message);
              return { name: key, jobs: [] };
            })
        );
      }
    }

    const results = await Promise.allSettled(adapterPromises);
    const aggregatedExternal = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && Array.isArray(result.value.jobs)) {
        for (const job of result.value.jobs) {
          aggregatedExternal.push(job);
          // Store in external job index for fast retrieval by ID
          this.externalJobIndex.set(job._id, job);
        }
      }
    }

    // Save to cache
    this.cache.set(cacheKey, {
      data: aggregatedExternal,
      timestamp: Date.now(),
    });

    return aggregatedExternal;
  }

  /**
   * Normalize first-party MongoDB Job model document
   */
  normalizeInternalJob(mongoJob) {
    const raw = mongoJob.toObject ? mongoJob.toObject() : mongoJob;
    return {
      _id: String(raw._id),
      sourceJobId: String(raw._id),
      title: raw.title,
      company: raw.company,
      companyName: raw.companyName,
      companyLogo: raw.companyLogo || (raw.company && raw.company.logo) || '',
      location: raw.location,
      workplaceType: raw.workplaceType || 'remote',
      employmentType: raw.employmentType || 'full-time',
      experienceLevel: raw.experienceLevel || 'mid',
      salaryMin: raw.salaryMin || 0,
      salaryMax: raw.salaryMax || 0,
      currency: raw.currency || 'USD',
      salaryPeriod: raw.salaryPeriod || 'yearly',
      skills: Array.isArray(raw.skills) ? raw.skills : [],
      openings: raw.openings || 1,
      description: raw.description,
      responsibilities: raw.responsibilities || [],
      qualifications: raw.qualifications || [],
      deadline: raw.deadline,
      source: 'CareerSphere',
      sourceDisplayName: 'CareerSphere Direct',
      sourceBadgeColor: 'primary',
      isExternal: false,
      externalUrl: raw.externalUrl || '',
      applicationMethod: raw.applicationMethod || 'platform',
      viewsCount: raw.viewsCount || 0,
      applicationsCount: raw.applicationsCount || 0,
      createdAt: raw.createdAt,
    };
  }

  /**
   * Unified Aggregation Pipeline
   * Queries MongoDB + External Adapters in parallel, deduplicates, filters, sorts, and paginates.
   */
  async getAggregatedJobs({
    search = '',
    location = '',
    workplaceType,
    employmentType,
    experienceLevel,
    minSalary = 0,
    skills,
    source = 'all',
    sort = 'newest',
    page = 1,
    limit = 9,
  }) {
    const workplaceList = Array.isArray(workplaceType)
      ? workplaceType
      : workplaceType
      ? workplaceType.split(',').map((t) => t.trim())
      : [];

    const employmentList = Array.isArray(employmentType)
      ? employmentType
      : employmentType
      ? employmentType.split(',').map((t) => t.trim())
      : [];

    const experienceList = Array.isArray(experienceLevel)
      ? experienceLevel
      : experienceLevel
      ? experienceLevel.split(',').map((l) => l.trim())
      : [];

    const minSalNum = Number(minSalary) || 0;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));

    const sourceLower = (source || 'all').toLowerCase();
    const shouldFetchInternal = sourceLower === 'all' || sourceLower === 'careersphere' || sourceLower === 'direct';
    const shouldFetchExternal = sourceLower !== 'careersphere' && sourceLower !== 'direct';

    // 1. Fetch First-Party MongoDB Jobs
    let internalPromise = Promise.resolve([]);
    if (shouldFetchInternal) {
      const query = {
        status: 'approved',
        deadline: { $gte: new Date() },
      };

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { title: regex },
          { companyName: regex },
          { skills: { $in: [regex] } },
          { location: regex },
          { description: regex },
        ];
      }

      if (location && location.trim()) {
        query.location = new RegExp(location.trim(), 'i');
      }

      if (workplaceList.length > 0) {
        query.workplaceType = { $in: workplaceList };
      }

      if (employmentList.length > 0) {
        query.employmentType = { $in: employmentList };
      }

      if (experienceList.length > 0) {
        query.experienceLevel = { $in: experienceList };
      }

      if (minSalNum > 0) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { salaryMax: { $gte: minSalNum } },
            { salaryMin: { $gte: minSalNum } },
          ],
        });
      }

      if (skills) {
        const skillList = Array.isArray(skills)
          ? skills
          : skills.split(',').map((s) => new RegExp(s.trim(), 'i'));
        query.skills = { $in: skillList };
      }

      internalPromise = Job.find(query)
        .populate('company', 'companyName logo website location industry companySize')
        .sort({ createdAt: -1 })
        .lean()
        .then((jobs) => jobs.map((j) => this.normalizeInternalJob(j)))
        .catch((err) => {
          console.error('[AggregatorService] MongoDB query failed:', err.message);
          return [];
        });
    }

    // 2. Fetch External Jobs (if enabled)
    let externalPromise = Promise.resolve([]);
    if (shouldFetchExternal) {
      externalPromise = this.fetchExternalJobs({
        search,
        location,
        workplaceType: workplaceList,
        employmentType: employmentList,
        experienceLevel: experienceList,
        minSalary: minSalNum,
        source: sourceLower,
      });
    }

    // Wait for both concurrently
    const [internalJobs, externalJobs] = await Promise.all([internalPromise, externalPromise]);

    // 3. Deduplication Logic
    // Seen fingerprints: if an external job has identical normalized title + company name as an internal direct post,
    // prioritize the first-party employer post.
    const seenFingerprints = new Set();
    const deduplicated = [];

    // Internal direct postings have highest priority
    for (const job of internalJobs) {
      const fp = this.generateFingerprint(job.title, job.companyName);
      seenFingerprints.add(fp);
      deduplicated.push(job);
    }

    // Add external postings that are not duplicates
    for (const job of externalJobs) {
      const fp = this.generateFingerprint(job.title, job.companyName);
      if (!seenFingerprints.has(fp)) {
        seenFingerprints.add(fp);
        deduplicated.push(job);
      }
    }

    // 4. Source Breakdown Stats
    const bySource = {
      CareerSphere: 0,
      Arbeitnow: 0,
      Remotive: 0,
      LinkedIn: 0,
      Indeed: 0,
      Naukri: 0,
    };

    for (const job of deduplicated) {
      if (bySource[job.source] !== undefined) {
        bySource[job.source]++;
      } else {
        bySource[job.source] = 1;
      }
    }

    // 5. Unified Sorting
    deduplicated.sort((a, b) => {
      if (sort === 'salary_high') {
        return (b.salaryMax || 0) - (a.salaryMax || 0);
      }
      if (sort === 'salary_low') {
        return (a.salaryMin || 0) - (b.salaryMin || 0);
      }
      if (sort === 'popular') {
        return (b.viewsCount || 0) - (a.viewsCount || 0);
      }
      // Default: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 6. Pagination Slice
    const total = deduplicated.length;
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const pagedJobs = deduplicated.slice(startIndex, startIndex + limitNum);

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
        firstPartyCount: internalJobs.length,
        externalCount: deduplicated.length - internalJobs.length,
        bySource,
      },
    };
  }

  /**
   * Find external job by its ID in the active index
   */
  getExternalJobById(id) {
    return this.externalJobIndex.get(id) || null;
  }
}

// Singleton instance
const aggregatorServiceInstance = new AggregatorService();
module.exports = aggregatorServiceInstance;
