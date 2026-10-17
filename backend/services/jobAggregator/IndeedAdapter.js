const BaseAdapter = require('./BaseAdapter');

/**
 * IndeedAdapter - Adapter for Indeed Partner / Publisher Job Search API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * Indeed requires an approved Publisher / API Partner Account.
 * Access requirements:
 * 1. Register as an Indeed Publisher / Partner (https://developer.indeed.com).
 * 2. Receive an assigned Publisher ID and API token from Indeed Partner Alliance.
 * 3. Agree to Indeed API Terms of Use (including redirect link attribution and click-tracking rules).
 * 4. Configure INDEED_PUBLISHER_ID & INDEED_API_KEY in backend environment variables.
 *
 * Note: Indeed explicitly forbids unauthorized scraping under its Terms of Service.
 */
class IndeedAdapter extends BaseAdapter {
  constructor() {
    super('indeed', 'Indeed');
    this.publisherId = process.env.INDEED_PUBLISHER_ID || '';
    this.apiKey = process.env.INDEED_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.publisherId && this.apiKey);
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      isConfigured: this.isConfigured(),
      requiresAuth: true,
      type: 'partner_enterprise_api',
      description: 'Global employment engine and job aggregator.',
      requirements: [
        'Indeed Partner Alliance approval',
        'Publisher Account credentials',
        'Environment variables: INDEED_PUBLISHER_ID, INDEED_API_KEY',
      ],
      website: 'https://developer.indeed.com',
    };
  }

  async fetchJobs(params) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      // Future live call with verified publisher credentials:
      // const url = `https://api.indeed.com/ads/apisearch?publisher=${this.publisherId}&q=${encodeURIComponent(params.search)}&format=json&v=2`;
      return [];
    } catch (err) {
      console.error(`[IndeedAdapter] Error: ${err.message}`);
      return [];
    }
  }

  normalizeJob(raw) {
    return {
      _id: `ext_indeed_${raw.jobkey || raw.id}`,
      sourceJobId: String(raw.jobkey || raw.id),
      title: raw.jobtitle || raw.title,
      companyName: raw.company,
      companyLogo: '',
      location: raw.formattedLocation || raw.location,
      workplaceType: 'on-site',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 0,
      salaryMax: 0,
      currency: 'USD',
      salaryPeriod: 'yearly',
      skills: [],
      description: this.cleanText(raw.snippet),
      source: 'Indeed',
      sourceDisplayName: 'Indeed Partner',
      sourceBadgeColor: 'blue',
      isExternal: true,
      externalUrl: raw.url,
      applicationMethod: 'external',
      createdAt: raw.date ? new Date(raw.date) : new Date(),
      viewsCount: 0,
      openings: 1,
    };
  }
}

module.exports = IndeedAdapter;
