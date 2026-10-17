const jobNormalizationService = require('../services/jobNormalizationService');

/**
 * InternshalaProvider - Adapter for Internshala Fresher IT Jobs & Internships API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * Internshala operates a dedicated portal for Indian college graduates & freshers.
 * 1. Internshala Partner / Institution API access agreement.
 * 2. Developer feed credentials or OAuth token from Internshala for Employers.
 * 3. Configure INTERNSHALA_API_KEY in backend environment variables.
 *
 * Scraping Internshala is prohibited. Clean adapter ensures compliance.
 */
class InternshalaProvider {
  constructor() {
    this.name = 'Internshala';
    this.displayName = 'Internshala Freshers';
    this.type = 'partner_enterprise_api';
    this.apiKey = process.env.INTERNSHALA_API_KEY || '';
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
      description: "India's largest fresher IT internship and entry-level graduate placement network.",
      requirements: [
        'Internshala Partner Agreement',
        'Developer API key from Internshala Developer Relations',
        'Environment variable: INTERNSHALA_API_KEY',
      ],
      website: 'https://internshala.com',
    };
  }

  async fetchJobs(filters = {}) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      return [];
    } catch (err) {
      console.warn(`[InternshalaProvider] Fetch error: ${err.message}`);
      return [];
    }
  }
}

module.exports = new InternshalaProvider();
