/**
 * BaseAdapter - Abstract base class for all job source adapters.
 * Every job provider (first-party, public feeds, partner APIs) must implement this interface.
 */
class BaseAdapter {
  constructor(name, displayName) {
    if (new.target === BaseAdapter) {
      throw new TypeError('Cannot construct BaseAdapter instances directly.');
    }
    this.name = name;
    this.displayName = displayName;
  }

  /**
   * Indicates whether required credentials / configuration are present in environment.
   * @returns {boolean}
   */
  isConfigured() {
    return true;
  }

  /**
   * Returns metadata and partnership/configuration requirements for this provider.
   * @returns {object}
   */
  getProviderInfo() {
    return {
      name: this.name,
      displayName: this.displayName,
      isConfigured: this.isConfigured(),
      type: 'external',
    };
  }

  /**
   * Fetch jobs matching query parameters.
   * Must return an array of normalized job objects.
   *
   * @param {object} params
   * @param {string} [params.search]
   * @param {string} [params.location]
   * @param {string[]} [params.workplaceType]
   * @param {string[]} [params.employmentType]
   * @param {string[]} [params.experienceLevel]
   * @param {number} [params.minSalary]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=10]
   * @returns {Promise<Array<object>>}
   */
  async fetchJobs(params) {
    throw new Error(`fetchJobs() must be implemented by adapter ${this.name}`);
  }

  /**
   * Normalize an external job object into the standard application format.
   * @param {object} raw
   * @returns {object} NormalizedJob
   */
  normalizeJob(raw) {
    throw new Error(`normalizeJob() must be implemented by adapter ${this.name}`);
  }

  /**
   * Utility to strip HTML tags and decode common entities safely
   * @param {string} str
   * @returns {string}
   */
  cleanText(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parse salary numbers from free text strings e.g. "$120,000 - $150,000" or "$45k - $60k"
   * @param {string} str
   * @returns {{ salaryMin: number, salaryMax: number, currency: string }}
   */
  parseSalary(str) {
    const defaultRes = { salaryMin: 0, salaryMax: 0, currency: 'USD' };
    if (!str || typeof str !== 'string') return defaultRes;

    let currency = 'USD';
    if (str.includes('€')) currency = 'EUR';
    else if (str.includes('£')) currency = 'GBP';
    else if (str.includes('₹')) currency = 'INR';

    // Find numbers or numbers followed by k
    const matches = str.match(/(?:[\$€£₹]\s*)?(\d+(?:[.,]\d+)?)\s*(k|K)?/g);
    if (!matches || matches.length === 0) return defaultRes;

    const nums = [];
    for (const m of matches) {
      const cleanM = m.replace(/[^\d.,kK]/g, '');
      const isK = /k/i.test(cleanM);
      const val = parseFloat(cleanM.replace(/k/i, '').replace(',', '.'));
      if (!isNaN(val) && val > 0) {
        nums.push(isK || val < 1000 ? Math.round(val * 1000) : Math.round(val));
      }
    }

    if (nums.length === 1) {
      return { salaryMin: nums[0], salaryMax: nums[0], currency };
    }
    if (nums.length >= 2) {
      const sorted = nums.sort((a, b) => a - b);
      return { salaryMin: sorted[0], salaryMax: sorted[sorted.length - 1], currency };
    }
    return defaultRes;
  }
}

module.exports = BaseAdapter;
