import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import Badge from './Badge';

// Helper to format salary values concisely ($135,000 -> $135k)
const formatSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return 'Competitive';
  const formatNum = (num) => {
    if (!num) return '';
    return num >= 1000 ? `$${Math.round(num / 1000)}k` : `$${num}`;
  };
  if (min && max) return `${formatNum(min)} - ${formatNum(max)} / yr`;
  if (min) return `From ${formatNum(min)} / yr`;
  return `Up to ${formatNum(max)} / yr`;
};

// Helper to format relative time
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const JobCard = ({ job }) => {
  if (!job) return null;

  const workplaceVariant = 
    job.workplaceType === 'remote' ? 'success' :
    job.workplaceType === 'hybrid' ? 'cyan' : 'neutral';

  const experienceVariant =
    job.experienceLevel === 'senior' || job.experienceLevel === 'lead' ? 'purple' :
    job.experienceLevel === 'entry' ? 'primary' : 'neutral';

  return (
    <div className="card-premium p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div className="space-y-4">
        {/* Header: Company Logo & Basic Meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {job.companyLogo ? (
                <img 
                  src={job.companyLogo} 
                  alt={job.companyName} 
                  className="w-full h-full object-contain rounded-xl p-1"
                />
              ) : (
                <span>{job.companyName?.charAt(0) || 'C'}</span>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{job.companyName}</span>
              </h4>
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[180px]">{job.location}</span>
              </div>
            </div>
          </div>

          <Badge variant={workplaceVariant} size="xs" dot>
            {job.workplaceType}
          </Badge>
        </div>

        {/* Job Title */}
        <div>
          <Link
            to={`/jobs/${job._id}`}
            className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 flex items-center justify-between"
          >
            <span>{job.title}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
          </Link>
          <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
            {job.description}
          </p>
        </div>

        {/* Badges: Experience, Employment */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Badge variant={experienceVariant} size="xs">
            {job.experienceLevel} level
          </Badge>
          <Badge variant="neutral" size="xs">
            {job.employmentType}
          </Badge>
          {job.openings > 1 && (
            <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
              {job.openings} openings
            </span>
          )}
        </div>

        {/* Skills Tag Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {job.skills?.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/60"
            >
              {skill}
            </span>
          ))}
          {job.skills?.length > 3 && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 text-slate-400">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer: Salary & View Action */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Estimated Salary</span>
          <span className="text-sm font-bold text-slate-900 flex items-center space-x-1">
            <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{timeAgo(job.createdAt)}</span>
          </span>
          <Link
            to={`/jobs/${job._id}`}
            className="btn-primary text-xs py-1.5 px-3 shadow-xs"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
