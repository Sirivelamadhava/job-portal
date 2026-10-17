/**
 * DeduplicationService - Intelligently identifies and groups duplicate job postings
 * across multiple platforms while preserving direct links to all original sources.
 */
class DeduplicationService {
  /**
   * Generates a normalized canonical fingerprint for cross-platform matching.
   */
  generateFingerprint(job) {
    const clean = (s) => (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

    const title = clean(job.title)
      .replace(/fresher/g, '')
      .replace(/junior/g, '')
      .replace(/entrylevel/g, '')
      .replace(/trainee/g, '')
      .replace(/engineer/g, 'developer');

    const company = clean(job.companyName)
      .replace(/pvt/g, '')
      .replace(/ltd/g, '')
      .replace(/technologies/g, '')
      .replace(/solutions/g, '')
      .replace(/corp/g, '');

    const location = clean(job.city || job.location)
      .replace(/india/g, '');

    return `${title}__${company}__${location}`;
  }

  /**
   * Deduplicates a list of normalized job listings.
   * If a duplicate is identified, groups it with the primary listing
   * and appends to `alternativeSources`.
   *
   * @param {Array<object>} jobs
   * @returns {Array<object>} Deduplicated jobs list
   */
  deduplicate(jobs = []) {
    const fingerprintMap = new Map();
    const urlSet = new Set();
    const result = [];

    for (const job of jobs) {
      // 1. Strict exact URL match check
      if (job.originalUrl && urlSet.has(job.originalUrl)) {
        continue;
      }
      if (job.originalUrl) {
        urlSet.add(job.originalUrl);
      }

      // 2. Structural fingerprint check
      const fp = this.generateFingerprint(job);
      
      if (fingerprintMap.has(fp)) {
        const existingJob = fingerprintMap.get(fp);

        // Group as alternative source
        if (!existingJob.alternativeSources) {
          existingJob.alternativeSources = [];
        }

        // Avoid adding duplicate alternative source buttons
        const alreadyHasSource = existingJob.alternativeSources.some(
          (alt) => alt.source === job.source
        );

        if (!alreadyHasSource && existingJob.source !== job.source) {
          existingJob.alternativeSources.push({
            source: job.source,
            sourceDisplayName: job.sourceDisplayName,
            sourceBadgeColor: job.sourceBadgeColor,
            originalUrl: job.originalUrl,
            postedAt: job.postedAt,
          });
        }
      } else {
        // Initialize alternativeSources array
        job.alternativeSources = [];
        fingerprintMap.set(fp, job);
        result.push(job);
      }
    }

    return result;
  }
}

module.exports = new DeduplicationService();
