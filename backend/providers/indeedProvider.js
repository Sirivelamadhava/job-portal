const jobNormalizationService = require('../services/jobNormalizationService');

/**
 * IndeedProvider - Adapter for Indeed Partner / Publisher API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * Indeed requires an approved Publisher / API Alliance contract:
 * 1. Registered Indeed Publisher Account (https://developer.indeed.com).
 * 2. Signed Publisher Services agreement.
 * 3. Publisher ID and API Key provisioned by Indeed Alliance.
 * 4. Configure INDEED_PUBLISHER_ID and INDEED_API_KEY in environment variables.
 */
class IndeedProvider {
  constructor() {
    this.name = 'Indeed';
    this.displayName = 'Indeed';
    this.type = 'partner_enterprise_api';
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
      type: this.type,
      isConfigured: this.isConfigured(),
      requiresAuth: true,
      status: this.isConfigured() ? 'active' : 'awaiting_publisher_credentials',
      description: 'Worldwide search engine for tech vacancies with entry-level job indices.',
      requirements: [
        'Indeed Publisher Alliance approval',
        'Developer Publisher ID from Indeed',
        'Environment variables: INDEED_PUBLISHER_ID, INDEED_API_KEY',
      ],
      website: 'https://developer.indeed.com',
    };
  }

  async fetchJobs(filters = {}) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      return [];
    } catch (err) {
      console.warn(`[IndeedProvider] Fetch error: ${err.message}`);
      return [];
    }
  }
}

module.exports = new IndeedProvider();
