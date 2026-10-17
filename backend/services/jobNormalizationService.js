const fresherEligibilityService = require('./fresherEligibilityService');

/**
 * JobNormalizationService - Standardizes diverse job data structures
 * into a single canonical Fresher IT Job contract.
 */
class JobNormalizationService {
  /**
   * Cleans HTML markup and extra whitespaces.
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
   * Detects Indian Tech hub cities or canonical locations.
   */
  detectCity(location = '') {
    const locLower = (location || '').toLowerCase();
    if (locLower.includes('bengaluru') || locLower.includes('bangalore')) return 'Bengaluru';
    if (locLower.includes('hyderabad') || locLower.includes('secunderabad')) return 'Hyderabad';
    if (locLower.includes('pune')) return 'Pune';
    if (locLower.includes('chennai') || locLower.includes('madras')) return 'Chennai';
    if (locLower.includes('mumbai') || locLower.includes('navi mumbai') || locLower.includes('thane')) return 'Mumbai';
    if (locLower.includes('delhi') || locLower.includes('noida') || locLower.includes('gurgaon') || locLower.includes('gurugram')) return 'Delhi NCR';
    if (locLower.includes('remote') || locLower.includes('work from home')) return 'Remote';
    return location || 'India';
  }

  /**
   * Normalizes a raw job object from any source.
   *
   * @param {object} raw
   * @param {string} sourceName
   * @param {boolean} isExternal
   * @returns {object} Canonical Fresher Job Object
   */
  normalize(raw, sourceName = 'CareerSphere', isExternal = false) {
    const title = (raw.title || 'Untitled IT Opportunity').trim();
    const companyName = (raw.companyName || raw.company_name || 'Independent Tech Employer').trim();
    const location = (raw.location || raw.candidate_required_location || 'India (Remote / Hybrid)').trim();
    const city = this.detectCity(location);

    const description = this.cleanText(raw.description || '');
    const summary = description.length > 250 ? `${description.substring(0, 247)}...` : description;

    // Workplace type
    let workplaceType = (raw.workplaceType || '').toLowerCase();
    if (!workplaceType) {
      if (raw.remote || location.toLowerCase().includes('remote')) {
        workplaceType = 'remote';
      } else if (location.toLowerCase().includes('hybrid')) {
        workplaceType = 'hybrid';
      } else {
        workplaceType = 'on-site';
      }
    }

    // Employment type
    let employmentType = (raw.employmentType || raw.job_type || 'full-time').toLowerCase();
    if (employmentType.includes('intern')) employmentType = 'internship';
    else if (employmentType.includes('contract')) employmentType = 'contract';
    else if (employmentType.includes('part')) employmentType = 'part-time';
    else employmentType = 'full-time';

    // Skills
    let skills = [];
    if (Array.isArray(raw.skills)) skills = raw.skills;
    else if (Array.isArray(raw.tags)) skills = raw.tags;
    else if (typeof raw.skills === 'string') skills = raw.skills.split(',').map((s) => s.trim());

    if (skills.length === 0) {
      skills = ['Software Development', 'Problem Solving'];
    }

    // Evaluate fresher eligibility
    const evaluation = fresherEligibilityService.evaluate({
      title,
      description,
      skills,
      experienceLevel: raw.experienceLevel || 'entry',
      employmentType,
    });

    const postedAt = raw.createdAt || raw.publication_date || raw.created_at
      ? new Date(raw.createdAt || raw.publication_date || (raw.created_at * 1000))
      : new Date();

    const deadline = raw.deadline
      ? new Date(raw.deadline)
      : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

    // Format salary / stipend display
    let salaryMin = Number(raw.salaryMin) || 0;
    let salaryMax = Number(raw.salaryMax) || 0;
    let currency = raw.currency || 'INR';

    let formattedSalary = 'Best in Industry';
    if (salaryMin > 0 && salaryMax > 0) {
      const sym = currency === 'INR' ? '₹' : '$';
      formattedSalary = `${sym}${salaryMin.toLocaleString()} - ${sym}${salaryMax.toLocaleString()} / yr`;
    } else if (raw.salary && typeof raw.salary === 'string') {
      formattedSalary = raw.salary;
    } else if (employmentType === 'internship') {
      formattedSalary = 'Competitive Stipend';
    }

    // Provider badge branding
    let sourceBadgeColor = 'primary';
    if (sourceName === 'Naukri') sourceBadgeColor = 'cyan';
    else if (sourceName === 'LinkedIn') sourceBadgeColor = 'blue';
    else if (sourceName === 'Indeed') sourceBadgeColor = 'purple';
    else if (sourceName === 'Internshala') sourceBadgeColor = 'amber';
    else if (sourceName === 'Wellfound') sourceBadgeColor = 'rose';
    else if (sourceName === 'Arbeitnow') sourceBadgeColor = 'cyan';
    else if (sourceName === 'Remotive') sourceBadgeColor = 'purple';

    const originalUrl = raw.externalUrl || raw.url || (isExternal ? '' : `/jobs/${raw._id}`);

    return {
      _id: String(raw._id || `ext_${sourceName.toLowerCase()}_${raw.id || raw.slug || Buffer.from(title + companyName).toString('base64').substring(0, 16)}`),
      sourceJobId: String(raw.sourceJobId || raw.id || raw.slug || raw._id || ''),
      title,
      companyName,
      companyLogo: raw.companyLogo || (raw.company && raw.company.logo) || raw.company_logo_url || '',
      location,
      city,
      workplaceType,
      employmentType,
      experienceLevel: raw.experienceLevel || 'entry',
      experienceRequired: evaluation.experienceLabel,
      isFresherEligible: evaluation.isFresherEligible,
      isFresherVerified: evaluation.confidence === 'high' || !isExternal,
      fresherCategory: evaluation.category,
      fresherCategoryLabel: evaluation.categoryLabel,
      evaluationMeta: {
        confidence: evaluation.confidence,
        positiveMatches: evaluation.positiveMatches,
        disqualifiers: evaluation.disqualifierMatches,
      },
      salary: formattedSalary,
      salaryMin,
      salaryMax,
      currency,
      skills: skills.slice(0, 8),
      description,
      summary,
      responsibilities: Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
      qualifications: Array.isArray(raw.qualifications) ? raw.qualifications : [],
      source: sourceName,
      sourceDisplayName: isExternal ? `${sourceName} Partner` : 'CareerSphere Direct',
      sourceBadgeColor,
      isExternal,
      originalUrl,
      postedAt,
      lastVerifiedAt: new Date(),
      officialCareerSiteUrl: raw.officialCareerSiteUrl || (raw.company && raw.company.website) || '',
      hasPPO: raw.hasPPO !== undefined ? raw.hasPPO : (employmentType === 'internship'),
      minQualification: raw.minQualification || 'B.Tech / B.E. / MCA (Student / Graduate)',
      viewsCount: raw.viewsCount || 0,
      openings: raw.openings || 1,
    };
  }
}


module.exports = new JobNormalizationService();
