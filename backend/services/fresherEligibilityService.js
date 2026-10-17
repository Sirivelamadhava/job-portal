/**
 * FresherEligibilityService - Strict 0-Experience Rule Engine for IT Vacancies.
 *
 * Implements strict multi-factor evaluation to ensure ONLY genuine entry-level
 * positions suitable for candidates with ZERO professional experience are presented.
 */
class FresherEligibilityService {
  constructor() {
    // Definitive positive fresher indicators
    this.positiveFresherTerms = [
      /\bfresher\b/i,
      /\bfreshers\b/i,
      /\bentry[- ]level\b/i,
      /\b0\s*(?:-|to)\s*1\s*(?:yr|yrs|year|years)\b/i,
      /\b0\s*(?:yr|yrs|year|years)\s*(?:experience|exp)?\b/i,
      /\bzero\s*(?:years?|experience)\b/i,
      /\bno\s*experience\s*(?:required|needed)\b/i,
      /\bgraduate\s*trainee\b/i,
      /\bgraduate\s*engineer\s*trainee\b/i,
      /\bget\b/i,
      /\btrainee\s*(?:software|engineer|developer|programmer)\b/i,
      /\bassociate\s*(?:software|engineer|developer|consultant)\b/i,
      /\bcampus\s*(?:hiring|recruitment|drive)\b/i,
      /\brecent\s*graduates?\b/i,
      /\bcollege\s*graduates?\b/i,
      /\b2024\s*(?:batch|passout|graduates?)\b/i,
      /\b2025\s*(?:batch|passout|graduates?)\b/i,
      /\b2026\s*(?:batch|passout|graduates?)\b/i,
      /\bintern(?:ship)?\b/i,
      /\bapprentice(?:ship)?\b/i,
    ];

    // IT / Software domain keywords (ensures we filter out non-IT jobs)
    this.itKeywords = [
      /\bsoftware\b/i,
      /\bdeveloper\b/i,
      /\bengineer\b/i,
      /\bfrontend\b/i,
      /\bbackend\b/i,
      /\bfull[- ]stack\b/i,
      /\bweb\s*developer\b/i,
      /\bprogramming\b/i,
      /\bcoding\b/i,
      /\bqa\b/i,
      /\btester\b/i,
      /\btesting\b/i,
      /\bquality\s*assurance\b/i,
      /\bdevops\b/i,
      /\bcloud\b/i,
      /\bdata\s*(?:analyst|engineer|science)\b/i,
      /\bit\s*support\b/i,
      /\btechnical\s*support\b/i,
      /\bdatabase\b/i,
      /\breact(?:\.js)?\b/i,
      /\bnode(?:\.js)?\b/i,
      /\bpython\b/i,
      /\bjava\b/i,
      /\bjavascript\b/i,
      /\btypescript\b/i,
      /\bc\+\+\b/i,
      /\bspring\s*boot\b/i,
      /\bsql\b/i,
    ];

    // Strict disqualifiers for candidates with zero experience
    this.strictDisqualifiers = [
      /\b[2-9]\s*\+?\s*(?:yr|yrs|year|years)(?:\s*of)?\s*(?:experience|exp|industry\s*exp)\b/i,
      /\b(?:two|three|four|five|six|seven|eight|nine|ten)\s*\+?\s*years?\b/i,
      /\b1\s*\+?\s*(?:yr|yrs|year|years)(?:\s*of)?\s*(?:mandatory|minimum|required|proven)\s*experience\b/i,
      /\bminimum\s*(?:of\s*)?[1-9]\s*(?:yr|yrs|year|years)\b/i,
      /\bat\s*least\s*[1-9]\s*(?:yr|yrs|year|years)\b/i,
      /\bsenior\b/i,
      /\blead\b/i,
      /\bprincipal\b/i,
      /\bstaff\s*(?:engineer|developer)\b/i,
      /\barchitect\b/i,
      /\bmanager\b/i,
      /\bdirector\b/i,
      /\bmid[- ]level\b/i,
    ];
  }

  /**
   * Evaluate whether a job listing qualifies as a strictly eligible Fresher IT opportunity.
   *
   * @param {object} job
   * @param {string} job.title
   * @param {string} [job.description]
   * @param {string[]} [job.skills]
   * @param {string} [job.experienceLevel]
   * @param {string} [job.employmentType]
   * @returns {object} Evaluation report
   */
  evaluate(job) {
    const title = (job.title || '').trim();
    const description = (job.description || '').trim();
    const combinedText = `${title} ${description} ${(job.skills || []).join(' ')}`;

    const positiveMatches = [];
    const disqualifierMatches = [];

    // 1. Check for strict disqualifiers
    for (const pattern of this.strictDisqualifiers) {
      const match = combinedText.match(pattern);
      if (match) {
        disqualifierMatches.push(match[0]);
      }
    }

    // Explicit Seniority flags in model
    if (['senior', 'lead', 'executive'].includes(job.experienceLevel)) {
      disqualifierMatches.push(`experienceLevel: ${job.experienceLevel}`);
    }

    // 2. Check for positive fresher indicators
    for (const pattern of this.positiveFresherTerms) {
      const match = combinedText.match(pattern);
      if (match) {
        positiveMatches.push(match[0]);
      }
    }

    // Model explicitly marked entry
    if (job.experienceLevel === 'entry' || job.experienceLevel === 'intern') {
      positiveMatches.push(`experienceLevel: ${job.experienceLevel}`);
    }

    // 3. Check IT domain relevance
    let isITJob = false;
    for (const pattern of this.itKeywords) {
      if (pattern.test(title) || pattern.test(combinedText)) {
        isITJob = true;
        break;
      }
    }

    // Strict disqualification rule:
    // If disqualifying experience terms exist (e.g. "3+ years required"), it is NOT a fresher job,
    // even if the word "Junior" was casually in the title.
    const isDisqualified = disqualifierMatches.length > 0;

    // A job is fresher-eligible if:
    // - It is within the IT/Tech domain
    // - It has at least one confirmed positive indicator
    // - It has ZERO disqualifying mid/senior/multi-year experience demands
    const isFresherEligible = isITJob && !isDisqualified && positiveMatches.length > 0;

    // Determine subcategory
    const category = this.categorizeJob(title, combinedText, job.employmentType);

    // Human-readable experience label
    let experienceLabel = '0 Years (Fresher Eligible)';
    if (category.id === 'internship') {
      experienceLabel = '0 Years (Internship)';
    } else if (category.id === 'trainee') {
      experienceLabel = '0 Years (Trainee / GET)';
    }

    return {
      isFresherEligible,
      isITJob,
      isDisqualified,
      confidence: positiveMatches.length >= 2 ? 'high' : positiveMatches.length === 1 ? 'medium' : 'low',
      category: category.id,
      categoryLabel: category.label,
      experienceLabel,
      positiveMatches: Array.from(new Set(positiveMatches)),
      disqualifierMatches: Array.from(new Set(disqualifierMatches)),
    };
  }

  /**
   * Classify into the 4 target subcategories:
   * 1. fulltime_fresher (Full-time Fresher IT Jobs)
   * 2. internship (Internship Opportunities)
   * 3. trainee (Graduate Trainee Jobs)
   * 4. remote_entry (Remote Entry-Level IT Jobs)
   */
  categorizeJob(title, text, employmentType = 'full-time') {
    const isRemote = /\bremote\b/i.test(title) || /\bremote\b/i.test(text);
    const isIntern = /\bintern(?:ship)?\b/i.test(title) || employmentType === 'internship';
    const isTrainee = /\btrainee\b/i.test(title) || /\bget\b/i.test(title) || /\bapprentice\b/i.test(title);

    if (isIntern) {
      return { id: 'internship', label: 'Tech Internship' };
    }
    if (isTrainee) {
      return { id: 'trainee', label: 'Graduate Trainee / GET' };
    }
    if (isRemote) {
      return { id: 'remote_entry', label: 'Remote Entry-Level' };
    }
    return { id: 'fulltime_fresher', label: 'Full-Time Fresher' };
  }
}

module.exports = new FresherEligibilityService();
