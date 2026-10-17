const internalJobsProvider = require('./internalJobsProvider');
const authorizedJobFeedProvider = require('./authorizedJobFeedProvider');
const naukriProvider = require('./naukriProvider');
const linkedinProvider = require('./linkedinProvider');
const indeedProvider = require('./indeedProvider');
const internshalaProvider = require('./internshalaProvider');
const wellfoundProvider = require('./wellfoundProvider');

/**
 * ProviderRegistry - Central registry for all job providers,
 * managing activation status, partner metadata, and provider discovery.
 */
class ProviderRegistry {
  constructor() {
    this.providers = [
      internalJobsProvider,
      authorizedJobFeedProvider,
      naukriProvider,
      linkedinProvider,
      indeedProvider,
      internshalaProvider,
      wellfoundProvider,
    ];
  }

  /**
   * Returns metadata and active/pending status for all providers.
   */
  getAllProvidersInfo() {
    return this.providers.map((p) => p.getProviderInfo());
  }

  /**
   * Returns all active/configured providers.
   */
  getActiveProviders() {
    return this.providers.filter((p) => p.isConfigured());
  }

  /**
   * Get provider by exact name.
   */
  getProviderByName(name) {
    if (!name) return null;
    return (
      this.providers.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      ) || null
    );
  }
}

module.exports = new ProviderRegistry();
