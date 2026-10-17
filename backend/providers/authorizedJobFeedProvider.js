const jobNormalizationService = require('../services/jobNormalizationService');

/**
 * AuthorizedJobFeedProvider - Integrates genuine, authorized public REST job feeds.
 * Connects to live endpoints (Arbeitnow & Remotive) with strict timeouts and error fallbacks.
 */
class AuthorizedJobFeedProvider {
  constructor() {
    this.name = 'AuthorizedFeeds';
    this.displayName = 'Global Tech Partner Feeds';
    this.type = 'public_authorized_api';
    this.timeoutMs = 7000;
  }

  isConfigured() {
    return true;
  }

  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      type: this.type,
      isConfigured: true,
      requiresAuth: false,
      status: 'active',
      description: 'Live verified authorized developer REST feeds from Arbeitnow & Remotive.',
      website: 'https://www.arbeitnow.com/api/job-board-api',
    };
  }

  /**
   * Fetch jobs from Arbeitnow feed
   */
  async fetchArbeitnowJobs(page = 1) {
    try {
      const res = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${page}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FresherITJobAggregator/1.0 (+https://careersphere.org)',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!res.ok) {
        console.warn(`[ArbeitnowFeed] HTTP ${res.status}: ${res.statusText}`);
        return [];
      }

      const json = await res.json();
      const rawJobs = Array.isArray(json.data) ? json.data : [];

      return rawJobs.map((raw) =>
        jobNormalizationService.normalize(raw, 'Arbeitnow', true)
      );
    } catch (err) {
      console.warn(`[ArbeitnowFeed] Error: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetch jobs from Remotive feed
   */
  async fetchRemotiveJobs(search = '') {
    try {
      const url = new URL('https://remotive.com/api/remote-jobs');
      url.searchParams.set('limit', '60');
      if (search && search.trim()) {
        url.searchParams.set('search', search.trim());
      } else {
        url.searchParams.set('category', 'software-dev');
      }

      const res = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'FresherITJobAggregator/1.0 (+https://careersphere.org)',
        },
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!res.ok) {
        console.warn(`[RemotiveFeed] HTTP ${res.status}: ${res.statusText}`);
        return [];
      }

      const json = await res.json();
      const rawJobs = Array.isArray(json.jobs) ? json.jobs : [];

      return rawJobs.map((raw) =>
        jobNormalizationService.normalize(raw, 'Remotive', true)
      );
    } catch (err) {
      console.warn(`[RemotiveFeed] Error: ${err.message}`);
      return [];
    }
  }

  /**
   * Combined fetch from all active authorized feeds
   */
  async fetchJobs(filters = {}) {
    const promises = [
      this.fetchArbeitnowJobs(1),
      this.fetchRemotiveJobs(filters.search || ''),
    ];

    const results = await Promise.allSettled(promises);
    const combined = [];

    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        combined.push(...res.value);
      }
    }

    return combined;
  }
}

module.exports = new AuthorizedJobFeedProvider();
