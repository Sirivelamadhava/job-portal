import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Globe,
  Sparkles,
  Zap,
  Bookmark
} from 'lucide-react';

// Format Indian stipend/salary matching screenshot
const formatStipendDisplay = (job) => {
  const min = job.salaryMin;
  const max = job.salaryMax;
  const curr = job.currency || 'INR';

  if (min && max) {
    const sym = curr === 'INR' ? '₹' : '$';
    const period = job.employmentType === 'internship' || min < 100000 ? '/ month' : '/ year';
    return `${sym}${min.toLocaleString('en-IN')} - ${sym}${max.toLocaleString('en-IN')} ${period}`;
  }
  if (job.salary && typeof job.salary === 'string') {
    return job.salary;
  }
  if (job.employmentType === 'internship') {
    return '₹35,000 - ₹65,000 / month';
  }
  return '₹5,00,000 - ₹8,50,000 / year';
};

const JobCard = ({ job }) => {
  if (!job) return null;

  const sourceName = (job.sourcePlatform || job.source || 'FreshersCareer').trim();
  const sourceLower = sourceName.toLowerCase();

  const isInternship = job.fresherCategory === 'internship' || job.employmentType === 'internship';
  const hasPPO = job.hasPPO !== undefined ? job.hasPPO : isInternship;
  const minQual = job.minQualification || 'B.Tech / B.E. / MCA (Student / Graduate)';
  const careerSiteUrl = job.officialCareerSiteUrl || job.company?.website || (job.isExternal ? job.originalUrl : `https://${job.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/careers`);

  const rawUrl = (job.originalUrl || job.externalUrl || '').trim();
  const applyUrl = rawUrl.startsWith('http') ? rawUrl : `/jobs/${job._id}`;

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 p-5 sm:p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative">
      <div className="space-y-3.5">
        {/* Top Header: Title & Badges Grid */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <Link
            to={`/jobs/${job._id}`}
            className="text-slate-900 font-extrabold text-base sm:text-lg leading-snug group-hover:text-emerald-600 transition-colors flex-1"
          >
            {job.title}
          </Link>

          {/* Badges Column */}
          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <div className="flex items-center space-x-1.5">
              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <span>💻 IT</span>
              </span>
              <span className="bg-violet-50 text-violet-700 border border-violet-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <span>🎓 {isInternship ? 'Internship' : 'Full-Time'}</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                <GraduationCap className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[170px] sm:max-w-none">{minQual}</span>
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Provider Badge */}
              {sourceLower === 'unstop' ? (
                <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Zap className="w-2.5 h-2.5 fill-purple-600 text-purple-600" />
                  <span>UNSTOP</span>
                </span>
              ) : sourceLower === 'linkedin' ? (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Briefcase className="w-2.5 h-2.5" />
                  <span>LINKEDIN</span>
                </span>
              ) : sourceLower === 'naukri' ? (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Briefcase className="w-2.5 h-2.5" />
                  <span>NAUKRI</span>
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md flex items-center space-x-1">
                  <Briefcase className="w-2.5 h-2.5" />
                  <span>{sourceName.toUpperCase()}</span>
                </span>
              )}

              {/* Status Badge */}
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center space-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>ACTIVE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Company Name & Official Career Site Link */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center space-x-1.5 text-sm font-bold text-slate-900">
            <Bookmark className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
            <span>{job.companyName}</span>
          </div>

          {careerSiteUrl && (
            <a
              href={careerSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 px-2.5 py-0.5 rounded-full transition-colors"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Official Company Career Site</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>

        {/* Location & Tags Line */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[280px]">{job.location}</span>
          </div>
          <span className="text-slate-500 flex items-center space-x-1">
            <Briefcase className="w-3 h-3 text-slate-400" />
            <span>{job.employmentType}</span>
          </span>
          <span className="text-slate-500 font-medium">
            {job.experienceLevel || 'entry-level'}
          </span>
        </div>

        {/* Eligibility Text */}
        <div className="flex items-center space-x-1 text-xs text-emerald-700 font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{minQual}</span>
        </div>

        {/* Description Paragraph */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 sm:line-clamp-4 font-normal">
          {job.description || job.summary}
        </p>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.skills?.slice(0, 6).map((skill, index) => (
            <span
              key={index}
              className="bg-slate-100 text-slate-700 border border-slate-200/90 rounded-lg px-2.5 py-1 text-[11px] font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        {/* Salary / Stipend */}
        <div>
          <div className="text-emerald-700 font-black text-base sm:text-lg tracking-tight">
            {formatStipendDisplay(job)}
          </div>
          {hasPPO && (
            <div className="text-emerald-600 text-xs font-bold mt-0.5">
              + PPO
            </div>
          )}
        </div>

        {/* Action Buttons Column */}
        <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
          {careerSiteUrl && (
            <a
              href={careerSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 px-3 py-1 rounded-full transition-colors self-end"
            >
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Company Career Site</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {/* Primary Apply on [Source] button */}
            <a
              href={applyUrl}
              target={rawUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className={`text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs inline-flex items-center justify-center space-x-1.5 text-white transition-all ${
                sourceLower === 'unstop'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/20'
                  : sourceLower === 'linkedin'
                  ? 'bg-[#0a66c2] hover:bg-[#004182] shadow-blue-600/20'
                  : sourceLower === 'naukri'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Apply on {sourceName}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>

            {/* Details Link */}
            <Link
              to={`/jobs/${job._id}`}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs py-2 px-3 rounded-xl font-semibold transition-colors"
            >
              Details
            </Link>

            {/* Quick Apply Link */}
            <Link
              to={`/jobs/${job._id}`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2 px-3 rounded-xl font-bold transition-colors shadow-xs"
            >
              Apply
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
