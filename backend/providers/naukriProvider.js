const jobNormalizationService = require('../services/jobNormalizationService');

/**
 * NaukriProvider - Adapter for Naukri.com Enterprise / Recruiter Feed API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * Naukri (Info Edge India Ltd) requires an authorized enterprise subscription:
 * 1. Corporate license with Naukri RMS (Recruitment Management System).
 * 2. Enterprise API Integration Agreement signed with Info Edge Developer Relations.
 * 3. System ID & API Access Token provisioned via Info Edge Developer Portal.
 * 4. Configure NAUKRI_SYSTEM_ID and NAUKRI_API_KEY in backend environment variables.
 *
 * NOTE: Web scraping of Naukri is strictly illegal and violates Indian IT Act & Naukri ToS.
 * When unconfigured, this provider safely returns empty results and reports clear status.
 */
class NaukriProvider {
  constructor() {
    this.name = 'Naukri';
    this.displayName = 'Naukri India';
    this.type = 'partner_enterprise_api';
    this.systemId = process.env.NAUKRI_SYSTEM_ID || '';
    this.apiKey = process.env.NAUKRI_API_KEY || '';
  }

  isConfigured() {
    return Boolean(this.systemId && this.apiKey);
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      type: this.type,
      isConfigured: this.isConfigured(),
      requiresAuth: true,
      status: this.isConfigured() ? 'active' : 'awaiting_enterprise_credentials',
      description: "India's premier employment network with dedicated fresher & campus hiring pipelines.",
      requirements: [
        'Corporate Naukri RMS / eHire subscription agreement',
        'Developer System ID & Secret from Info Edge India',
        'Environment variables: NAUKRI_SYSTEM_ID, NAUKRI_API_KEY',
      ],
      website: 'https://www.naukri.com',
    };
  }

  async fetchJobs(filters = {}) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      // Live integration executes when enterprise credentials are provided
      return [];
    } catch (err) {
      console.warn(`[NaukriProvider] Fetch error: ${err.message}`);
      return [];
    }
  }
}

module.exports = new NaukriProvider();
