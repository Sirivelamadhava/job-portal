const BaseAdapter = require('./BaseAdapter');

/**
 * RemotiveAdapter - Integrates with the official Remotive Remote Jobs API.
 * Provider docs: https://remotive.com/api/remote-jobs
 * Authorized public feed: No API key required, public developer access for worldwide remote vacancies.
 */
class RemotiveAdapter extends BaseAdapter {
  constructor() {
    super('remotive', 'Remotive');
    this.apiUrl = 'https://remotive.com/api/remote-jobs';
    this.timeoutMs = 7000;
  }

  isConfigured() {
    return true; // Public authorized API, no secret keys required
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      isConfigured: true,
      requiresAuth: false,
      type: 'public_authorized_api',
      description: 'Worldwide remote developer and tech vacancies curated by Remotive.',
      website: 'https://remotive.com',
    };
  }

  /**
   * Fetch jobs from Remotive API
   */
  async fetchJobs({ search, location, workplaceType, employmentType, minSalary, limit = 50 } = {}) {
    try {
      const url = new URL(this.apiUrl);
      if (search && search.trim()) {
        url.searchParams.set('search', search.trim());
      }
      url.searchParams.set('limit', String(limit || 50));

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CareerSphereJobPortal/1.0 (+https://careersphere.org)',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        console.warn(`[RemotiveAdapter] HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      const rawJobs = Array.isArray(json.jobs) ? json.jobs : [];

      let normalized = rawJobs.map((raw) => this.normalizeJob(raw));

      // In-memory filter on external results matching user criteria
      if (location && location.trim()) {
        const locLower = location.trim().toLowerCase();
        normalized = normalized.filter((job) => job.location.toLowerCase().includes(locLower));
      }

      if (workplaceType && workplaceType.length > 0) {
        normalized = normalized.filter((job) => workplaceType.includes(job.workplaceType));
      }

      if (employmentType && employmentType.length > 0) {
        normalized = normalized.filter((job) => employmentType.includes(job.employmentType));
      }

      if (minSalary && minSalary > 0) {
        normalized = normalized.filter((job) => (job.salaryMax >= minSalary || job.salaryMin >= minSalary));
      }

      return normalized;
    } catch (err) {
      console.error(`[RemotiveAdapter] Fetch error: ${err.message}`);
      return []; // Return empty array so aggregation fails gracefully
    }
  }

  /**
   * Normalizes a Remotive job record to the common schema
   */
  normalizeJob(raw) {
    const id = `ext_remotive_${raw.id}`;
    const cleanDesc = this.cleanText(raw.description);
    const parsedSal = this.parseSalary(raw.salary);

    // Map job types
    let mappedEmployment = 'full-time';
    const rawType = (raw.job_type || '').toLowerCase();
    if (rawType.includes('part')) mappedEmployment = 'part-time';
    else if (rawType.includes('contract') || rawType.includes('freelance')) mappedEmployment = 'contract';
    else if (rawType.includes('intern')) mappedEmployment = 'internship';

    const skills = Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags.slice(0, 6)
      : ['Remote', 'Software'];

    const createdAt = raw.publication_date
      ? new Date(raw.publication_date)
      : new Date();

    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return {
      _id: id,
      sourceJobId: String(raw.id),
      title: raw.title || 'Untitled Remote Role',
      companyName: (raw.company_name || 'Remote Tech Partner').trim(),
      companyLogo: raw.company_logo_url || raw.company_logo || '',
      location: raw.candidate_required_location || 'Worldwide (Remote)',
      workplaceType: 'remote',
      employmentType: mappedEmployment,
      experienceLevel: 'mid',
      salaryMin: parsedSal.salaryMin,
      salaryMax: parsedSal.salaryMax,
      currency: parsedSal.currency || 'USD',
      salaryPeriod: 'yearly',
      skills,
      description: cleanDesc || 'Please view the external application URL for detailed prerequisites and application instructions.',
      responsibilities: [],
      qualifications: [],
      deadline,
      source: 'Remotive',
      sourceDisplayName: 'Remotive Feed',
      sourceBadgeColor: 'purple',
      isExternal: true,
      externalUrl: raw.url,
      applicationMethod: 'external',
      createdAt,
      viewsCount: 0,
      openings: 1,
    };
  }
}

module.exports = RemotiveAdapter;
