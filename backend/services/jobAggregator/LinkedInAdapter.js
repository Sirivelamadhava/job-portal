const BaseAdapter = require('./BaseAdapter');

/**
 * LinkedInAdapter - Adapter for LinkedIn Talent Solutions / Job Search API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * LinkedIn does not offer an open public job search REST API.
 * Access requires:
 * 1. An active LinkedIn Talent Solutions enterprise contract.
 * 2. Registration in the LinkedIn Developer Portal (https://developer.linkedin.com).
 * 3. LinkedIn approval for the "Job Search" or "Talent Hub / Recruiter System Connect (RSC)" partner product.
 * 4. OAuth 2.0 Client ID & Client Secret configured in environment variables.
 *
 * In accordance with our security, terms-of-service, and anti-scraping policy:
 * Scraping LinkedIn is strictly prohibited. If credentials are not configured,
 * this adapter reports unconfigured status and returns an empty list gracefully.
 */
class LinkedInAdapter extends BaseAdapter {
  constructor() {
    super('linkedin', 'LinkedIn');
    this.clientId = process.env.LINKEDIN_CLIENT_ID || '';
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret);
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      isConfigured: this.isConfigured(),
      requiresAuth: true,
      type: 'partner_enterprise_api',
      description: 'Global business and employment platform.',
      requirements: [
        'LinkedIn Talent Solutions Partner Agreement',
        'LinkedIn Developer Portal App with Job Search permission',
        'Environment variables: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET',
      ],
      website: 'https://developer.linkedin.com',
    };
  }

  async fetchJobs(params) {
    if (!this.isConfigured()) {
      // Clean, non-crashing fallback as per specifications
      return [];
    }

    try {
      // Future live implementation with valid authorized partner token
      // e.g. await fetch('https://api.linkedin.com/v2/jobSearch?...', { headers: { Authorization: `Bearer ${accessToken}` } })
      return [];
    } catch (err) {
      console.error(`[LinkedInAdapter] Error: ${err.message}`);
      return [];
    }
  }

  normalizeJob(raw) {
    return {
      _id: `ext_linkedin_${raw.id}`,
      sourceJobId: String(raw.id),
      title: raw.title,
      companyName: raw.companyName,
      companyLogo: raw.companyLogo || '',
      location: raw.location || 'Remote',
      workplaceType: 'hybrid',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 0,
      salaryMax: 0,
      currency: 'USD',
      salaryPeriod: 'yearly',
      skills: raw.skills || [],
      description: raw.description,
      source: 'LinkedIn',
      sourceDisplayName: 'LinkedIn Partner',
      sourceBadgeColor: 'blue',
      isExternal: true,
      externalUrl: raw.jobPostingUrl || raw.url,
      applicationMethod: 'external',
      createdAt: new Date(),
      viewsCount: 0,
      openings: 1,
    };
  }
}

module.exports = LinkedInAdapter;
