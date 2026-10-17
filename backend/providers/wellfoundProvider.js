const jobNormalizationService = require('../services/jobNormalizationService');

/**
 * WellfoundProvider - Adapter for Wellfound (formerly AngelList Talent) API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * Wellfound provides startup developer and entry-level engineering vacancies:
 * 1. Wellfound Recruiter / Partner API license (https://wellfound.com).
 * 2. Developer Bearer Token provisioned for authorized application integration.
 * 3. Configure WELLFOUND_API_KEY in backend environment variables.
 */
class WellfoundProvider {
  constructor() {
    this.name = 'Wellfound';
    this.displayName = 'Wellfound Startups';
    this.type = 'partner_enterprise_api';
    this.apiKey = process.env.WELLFOUND_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      type: this.type,
      isConfigured: this.isConfigured(),
      requiresAuth: true,
      status: this.isConfigured() ? 'active' : 'awaiting_partner_credentials',
      description: 'Global startup tech hub featuring high-growth entry-level software roles.',
      requirements: [
        'Wellfound Developer Partner license',
        'Developer API key',
        'Environment variable: WELLFOUND_API_KEY',
      ],
      website: 'https://wellfound.com',
    };
  }

  async fetchJobs(filters = {}) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      return [];
    } catch (err) {
      console.warn(`[WellfoundProvider] Fetch error: ${err.message}`);
      return [];
    }
  }
}

module.exports = new WellfoundProvider();
