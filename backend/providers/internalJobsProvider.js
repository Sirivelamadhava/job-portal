const Job = require('../models/Job');
require('../models/Company');
const jobNormalizationService = require('../services/jobNormalizationService');

/**
 * InternalJobsProvider - Retrieves direct verified employer postings from MongoDB.
 */
class InternalJobsProvider {
  constructor() {
    this.name = 'CareerSphere';
    this.displayName = 'CareerSphere Direct';
    this.type = 'first_party';
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
      description: 'Direct first-party IT job vacancies posted by verified recruiters on CareerSphere.',
      website: 'https://careersphere.org',
    };
  }

  async fetchJobs(filters = {}) {
    try {
      const query = {
        status: 'approved',
        deadline: { $gte: new Date() },
      };

      if (filters.search && filters.search.trim()) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [
          { title: regex },
          { companyName: regex },
          { skills: { $in: [regex] } },
          { location: regex },
          { description: regex },
        ];
      }

      if (filters.location && filters.location.trim()) {
        query.location = new RegExp(filters.location.trim(), 'i');
      }

      if (filters.workMode) {
        const modes = Array.isArray(filters.workMode) ? filters.workMode : [filters.workMode];
        query.workplaceType = { $in: modes };
      }

      if (filters.employmentType) {
        const types = Array.isArray(filters.employmentType) ? filters.employmentType : [filters.employmentType];
        query.employmentType = { $in: types };
      }

      const mongoJobs = await Job.find(query)
        .populate('company', 'companyName logo website location industry companySize')
        .sort({ createdAt: -1 })
        .lean();

      return mongoJobs.map((raw) =>
        jobNormalizationService.normalize(raw, raw.sourcePlatform || 'NexHire', false)
      );
    } catch (err) {

      console.error('[InternalJobsProvider] Error retrieving jobs:', err.message);
      return [];
    }
  }
}

module.exports = new InternalJobsProvider();
