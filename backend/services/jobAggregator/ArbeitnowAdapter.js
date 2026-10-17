const BaseAdapter = require('./BaseAdapter');

/**
 * ArbeitnowAdapter - Integrates with the official, free Arbeitnow Job Board API.
 * Provider docs: https://www.arbeitnow.com/api/job-board-api
 * Authorized public feed: No API key required, public developer access for tech/remote jobs.
 */
class ArbeitnowAdapter extends BaseAdapter {
  constructor() {
    super('arbeitnow', 'Arbeitnow');
    this.apiUrl = 'https://www.arbeitnow.com/api/job-board-api';
    this.timeoutMs = 7000;
  }

  isConfigured() {
    return true; // Public authorized API, no secret credentials needed
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      isConfigured: true,
      requiresAuth: false,
      type: 'public_authorized_api',
      description: 'Global & European tech job feed with verified company openings.',
      website: 'https://www.arbeitnow.com',
    };
  }

  /**
   * Fetch jobs from Arbeitnow API
   */
  async fetchJobs({ search, location, workplaceType, employmentType, minSalary, page = 1 } = {}) {
    try {
      const targetPage = Math.max(1, parseInt(page, 10) || 1);
      const url = `${this.apiUrl}?page=${targetPage}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CareerSphereJobPortal/1.0 (+https://careersphere.org)',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!response.ok) {
        console.warn(`[ArbeitnowAdapter] HTTP ${response.status}: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      const rawJobs = Array.isArray(json.data) ? json.data : [];

      // Normalize all retrieved jobs
      let normalized = rawJobs.map((raw) => this.normalizeJob(raw));

      // In-memory filter on external results matching user criteria
      if (search && search.trim()) {
        const queryLower = search.trim().toLowerCase();
        normalized = normalized.filter((job) => {
          return (
            job.title.toLowerCase().includes(queryLower) ||
            job.companyName.toLowerCase().includes(queryLower) ||
            job.skills.some((s) => s.toLowerCase().includes(queryLower)) ||
            job.description.toLowerCase().includes(queryLower)
          );
        });
      }

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

      return normalized;
    } catch (err) {
      console.error(`[ArbeitnowAdapter] Fetch error: ${err.message}`);
      return []; // Return empty array so aggregation fails gracefully
    }
  }

  /**
   * Normalizes an Arbeitnow job record to the common schema
   */
  normalizeJob(raw) {
    const slug = raw.slug || Buffer.from(raw.url || raw.title).toString('base64').substring(0, 20);
    const id = `ext_arbeitnow_${slug}`;

    const isRemote = Boolean(raw.remote);
    const locationStr = isRemote && !raw.location ? 'Remote' : (raw.location || 'Remote');

    // Clean description: get text and first 250 characters for card preview
    const cleanDesc = this.cleanText(raw.description);

    // Map job types
    let mappedEmployment = 'full-time';
    const rawTypes = Array.isArray(raw.job_types) ? raw.job_types.join(' ').toLowerCase() : '';
    if (rawTypes.includes('part') || rawTypes.includes('teilzeit')) mappedEmployment = 'part-time';
    else if (rawTypes.includes('contract') || rawTypes.includes('freelance')) mappedEmployment = 'contract';
    else if (rawTypes.includes('intern') || rawTypes.includes('praktikum')) mappedEmployment = 'internship';

    // Skills / tags
    const skills = Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags.slice(0, 6)
      : ['Software', 'Technology'];

    const createdAt = raw.created_at
      ? new Date(raw.created_at * 1000)
      : new Date();

    const deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30-day window

    return {
      _id: id,
      sourceJobId: slug,
      title: raw.title || 'Untitled Position',
      companyName: raw.company_name || 'Independent Tech Partner',
      companyLogo: '',
      location: locationStr,
      workplaceType: isRemote ? 'remote' : 'on-site',
      employmentType: mappedEmployment,
      experienceLevel: 'mid',
      salaryMin: 0,
      salaryMax: 0,
      currency: 'EUR',
      salaryPeriod: 'yearly',
      skills,
      description: cleanDesc || 'Please visit the external application link for the complete job description and duties.',
      responsibilities: [],
      qualifications: [],
      deadline,
      source: 'Arbeitnow',
      sourceDisplayName: 'Arbeitnow Partner',
      sourceBadgeColor: 'cyan',
      isExternal: true,
      externalUrl: raw.url,
      applicationMethod: 'external',
      createdAt,
      viewsCount: 0,
      openings: 1,
    };
  }
}

module.exports = ArbeitnowAdapter;
