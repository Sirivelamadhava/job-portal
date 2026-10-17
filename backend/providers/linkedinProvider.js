const jobNormalizationService = require('../services/jobNormalizationService');

/**
 * LinkedInProvider - Adapter for LinkedIn Talent Solutions / Job Search API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * LinkedIn restricts job search data to approved enterprise developer partners:
 * 1. LinkedIn Talent Solutions Partner agreement.
 * 2. Enterprise app registered on LinkedIn Developer Portal (https://developer.linkedin.com).
 * 3. Approved permission scopes: `r_talent_hub` or `r_jobs`.
 * 4. OAuth 2.0 Client credentials: LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.
 *
 * NOTE: LinkedIn strictly bans unauthorized scrapers. Access must be via official API.
 */
class LinkedInProvider {
  constructor() {
    this.name = 'LinkedIn';
    this.displayName = 'LinkedIn Jobs';
    this.type = 'partner_enterprise_api';
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
      type: this.type,
      isConfigured: this.isConfigured(),
      requiresAuth: true,
      status: this.isConfigured() ? 'active' : 'awaiting_partner_credentials',
      description: 'Global professional network with verified corporate fresher & graduate openings.',
      requirements: [
        'LinkedIn Talent Solutions Partner Agreement',
        'Developer Portal App with Job Search scope',
        'Environment variables: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET',
      ],
      website: 'https://developer.linkedin.com',
    };
  }

  async fetchJobs(filters = {}) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      return [];
    } catch (err) {
      console.warn(`[LinkedInProvider] Fetch error: ${err.message}`);
      return [];
    }
  }
}

module.exports = new LinkedInProvider();
