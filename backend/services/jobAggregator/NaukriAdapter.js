const BaseAdapter = require('./BaseAdapter');

/**
 * NaukriAdapter - Adapter for Naukri Enterprise Recruiter / Job Feed API.
 *
 * ACCESS & PARTNERSHIP PREREQUISITES:
 * Naukri (Info Edge India Ltd) does not offer a public consumer search API.
 * Access requirements:
 * 1. Active corporate Naukri RMS (Recruitment Management System) or eHire enterprise subscription.
 * 2. Enterprise API Integration agreement with Info Edge India.
 * 3. System ID & API Access Token provisioned via Info Edge Developer Support.
 * 4. Configure NAUKRI_SYSTEM_ID & NAUKRI_API_KEY in environment variables.
 *
 * In accordance with Indian IT laws and Naukri Terms of Use:
 * Scraping Naukri.com is strictly illegal and subject to IP blocks / legal action.
 * This adapter cleanly isolates the interface and returns an empty result when unconfigured.
 */
class NaukriAdapter extends BaseAdapter {
  constructor() {
    super('naukri', 'Naukri');
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
      isConfigured: this.isConfigured(),
      requiresAuth: true,
      type: 'partner_enterprise_api',
      description: "India's largest employment network and candidate marketplace.",
      requirements: [
        'Naukri RMS / Enterprise subscription agreement',
        'Developer System ID & Secret from Info Edge',
        'Environment variables: NAUKRI_SYSTEM_ID, NAUKRI_API_KEY',
      ],
      website: 'https://www.naukri.com',
    };
  }

  async fetchJobs(params) {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      // Future live call with verified enterprise credentials:
      return [];
    } catch (err) {
      console.error(`[NaukriAdapter] Error: ${err.message}`);
      return [];
    }
  }

  normalizeJob(raw) {
    return {
      _id: `ext_naukri_${raw.jobId || raw.id}`,
      sourceJobId: String(raw.jobId || raw.id),
      title: raw.title,
      companyName: raw.companyName,
      companyLogo: '',
      location: raw.city || 'India',
      workplaceType: 'on-site',
      employmentType: 'full-time',
      experienceLevel: 'mid',
      salaryMin: 0,
      salaryMax: 0,
      currency: 'INR',
      salaryPeriod: 'yearly',
      skills: raw.keySkills || [],
      description: this.cleanText(raw.jobDescription),
      source: 'Naukri',
      sourceDisplayName: 'Naukri Partner',
      sourceBadgeColor: 'blue',
      isExternal: true,
      externalUrl: raw.jdURL || raw.url,
      applicationMethod: 'external',
      createdAt: raw.postDate ? new Date(raw.postDate) : new Date(),
      viewsCount: 0,
      openings: 1,
    };
  }
}

module.exports = NaukriAdapter;
