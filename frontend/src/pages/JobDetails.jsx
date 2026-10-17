import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  Users, 
  Globe, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  Share2, 
  Bookmark, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  Upload,
  FileText,
  X
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import JobCard from '../components/ui/JobCard';
import api from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [selectedResumeFile, setSelectedResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [applySuccessMessage, setApplySuccessMessage] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          setJob(res.data.data.job);
          setSimilarJobs(res.data.data.similarJobs || []);
        }

        if (isAuthenticated) {
          try {
            const checkRes = await api.get(`/applications/check/${id}`);
            if (checkRes.data.success) {
              setSaved(checkRes.data.data.isSaved);
              setHasApplied(checkRes.data.data.hasApplied);
              setExistingApplication(checkRes.data.data.application);
            }
          } catch (e) {
            console.warn('Could not check application status:', e);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Job vacancy not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, isAuthenticated]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    setSavingBookmark(true);
    try {
      if (saved) {
        await api.delete(`/applications/saved/${id}`);
        setSaved(false);
      } else {
        await api.post(`/applications/saved/${id}`);
        setSaved(true);
      }
    } catch (err) {
      alert('Failed to update bookmark.');
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (role === 'recruiter') {
      alert('Recruiter accounts cannot submit candidate applications.');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!useProfileResume && !selectedResumeFile) {
      alert('Please select a PDF resume file from your device.');
      return;
    }

    setSubmittingApp(true);
    try {
      const formData = new FormData();
      if (coverLetter.trim()) {
        formData.append('coverLetter', coverLetter.trim());
      }

      if (selectedResumeFile) {
        formData.append('resume', selectedResumeFile);
      } else if (user?.resumeUrl) {
        formData.append('resumeUrl', user.resumeUrl);
        formData.append('resumeOriginalName', user.resumeOriginalName || 'Resume.pdf');
      } else {
        formData.append('resumeUrl', '/uploads/resumes/alex-rivera-resume.pdf');
        formData.append('resumeOriginalName', 'Alex_Rivera_CV.pdf');
      }

      const res = await api.post(`/applications/apply/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setHasApplied(true);
        setExistingApplication(res.data.data);
        setApplySuccessMessage('Your application was successfully sent to the hiring team!');
        setTimeout(() => {
          setIsApplyModalOpen(false);
          setApplySuccessMessage('');
        }, 2500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading position details...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{error || 'Job not found'}</h2>
        <p className="text-xs text-slate-500">This listing may have expired or been removed.</p>
        <Link to="/jobs" className="btn-primary text-xs py-2 px-4">
          &larr; Back to Job Directory
        </Link>
      </div>
    );
  }

  const formatSalary = (min, max, currency) => {
    if (!min && !max) return 'Competitive compensation package';
    const f = (n) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
    if (min && max) return `${f(min)} - ${f(max)} / year`;
    if (min) return `From ${f(min)} / year`;
    return `Up to ${f(max)} / year`;
  };

  const deadlineFormatted = new Date(job.deadline).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link to="/jobs" className="inline-flex items-center space-x-1 hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Openings</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
            title="Copy Job Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied Link!' : 'Share'}</span>
          </button>

          <button
            onClick={handleToggleBookmark}
            disabled={savingBookmark}
            className={`p-2 rounded-xl border transition-colors flex items-center space-x-1.5 text-xs font-semibold ${
              saved
                ? 'bg-amber-50 border-amber-300 text-amber-700'
                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
            }`}
            title={saved ? 'Job is Saved' : 'Save Job'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="card-premium p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center text-xl sm:text-2xl font-black text-indigo-700 shrink-0 overflow-hidden shadow-xs">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.companyName} className="w-full h-full object-cover" />
              ) : (
                job.companyName.charAt(0)
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                {/* Source Badge */}
                <Badge 
                  variant={
                    job.source === 'Naukri' ? 'cyan' :
                    job.source === 'LinkedIn' ? 'purple' :
                    job.source === 'Indeed' ? 'primary' :
                    job.source === 'Internshala' ? 'warning' :
                    job.source === 'Wellfound' ? 'danger' :
                    job.source === 'Arbeitnow' ? 'cyan' : 
                    job.source === 'Remotive' ? 'purple' : 
                    job.source === 'FreshersCareer' || job.source === 'CareerSphere' ? 'primary' : 'neutral'
                  } 
                  size="xs"
                  className="font-bold"
                >
                  Source: {job.source || 'FreshersCareer Direct'}
                </Badge>

                {/* Freshness Labels */}
                {job.status === 'closed' || job.status === 'expired' ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    <span>Closed / Expired</span>
                  </span>
                ) : job.isNewToday ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                    <span>⚡ New Today</span>
                  </span>
                ) : null}

                {job.isRecentlyUpdated && job.status !== 'closed' && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    <span>🔄 Recently Updated</span>
                  </span>
                )}

                {/* Last Verified Timestamp */}
                <span className="inline-flex items-center space-x-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Last Verified: {job.lastVerifiedAt ? new Date(job.lastVerifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'}</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                <span className="font-bold text-slate-800 flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.companyName}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.location}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Posted {new Date(job.postedAt || job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button & Provider Notice */}
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            {job.status === 'closed' || job.status === 'expired' ? (
              <div className="space-y-1 text-right">
                <button
                  disabled
                  className="py-3 px-8 text-sm font-bold rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed w-full sm:w-auto"
                >
                  Application Closed or Expired
                </button>
                <p className="text-[11px] text-rose-500 max-w-xs">
                  This vacancy is no longer accepting new applicants on the source platform.
                </p>
              </div>
            ) : job.isExternal ? (
              (job.originalUrl || job.externalUrl) ? (
                <div className="space-y-2 text-right">
                  <a
                    href={job.originalUrl || job.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-3 px-8 text-sm font-bold shadow-md shadow-indigo-100 text-center inline-flex items-center justify-center space-x-2 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                  >
                    <span>Apply on {job.source || 'Original Portal'}</span>
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                    You are applying through the original job provider. Application requirements and availability are controlled by that provider.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-right">
                  <button
                    disabled
                    className="py-3 px-8 text-sm font-bold rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed w-full sm:w-auto"
                  >
                    Application Link Unavailable
                  </button>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    The external provider has not provided a direct listing URL.
                  </p>
                </div>
              )
            ) : hasApplied ? (
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Application Submitted</span>
                </div>
                <Link
                  to="/dashboard"
                  className="btn-secondary text-xs py-2.5 px-4 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Track in Dashboard &rarr;
                </Link>
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="btn-primary py-3 px-8 text-sm font-bold shadow-md shadow-indigo-100 text-center"
              >
                {isAuthenticated ? 'Apply for this Position' : 'Sign in to Apply'}
              </button>
            )}
          </div>
        </div>


        {/* Quick Highlights Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Workplace Type</span>
            <span className="text-xs font-bold text-slate-800 capitalize mt-0.5 block">{job.workplaceType}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Opportunity Type</span>
            <span className="text-xs font-bold text-slate-800 capitalize mt-0.5 block">{job.fresherCategoryLabel || job.employmentType}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Experience Requirement</span>
            <span className="text-xs font-bold text-emerald-700 mt-0.5 block">{job.experienceRequired || '0 Years (Fresher Eligible)'}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-400 block font-medium">Compensation / Stipend</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5 block">
              {job.salary || formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Job Details vs Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Job Description & Specifics) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview & Description */}
          <section className="card-premium p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">About the Role</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </section>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className="card-premium p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Qualifications & Requirements */}
          {job.qualifications && job.qualifications.length > 0 && (
            <section className="card-premium p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Qualifications & Requirements</h2>
              <ul className="space-y-2.5">
                {job.qualifications.map((qual, i) => (
                  <li key={i} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills Required */}
          <section className="card-premium p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Required Skills & Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills?.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Company Snapshot & Logistics) */}
        <div className="space-y-6">
          {/* Logistics Summary */}
          <div className="card-premium p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Job Summary</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Listing Source:</span>
                <span className="font-bold text-emerald-700">{job.source || 'FreshersCareer Direct'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Total Openings:</span>
                <span className="font-bold text-slate-800">{job.openings || 1}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Application Deadline:</span>
                <span className="font-bold text-slate-800">{deadlineFormatted}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-400">Application Method:</span>
                <span className="font-bold text-indigo-600 capitalize">
                  {job.isExternal ? 'External Redirect' : `${job.applicationMethod || 'platform'} Portal`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Job Views:</span>
                <span className="font-bold text-slate-800">{job.viewsCount || 0} views</span>
              </div>
            </div>
            {job.isExternal && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <span>Verified authorized feed from <strong>{job.source}</strong>. Applying redirects to the official partner application page.</span>
              </div>
            )}
          </div>

          {/* Company Profile Snapshot */}
          <div className="card-premium p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">About the Employer</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
                  {job.company?.logo ? (
                    <img src={job.company.logo} alt={job.companyName} className="w-full h-full object-cover" />
                  ) : (
                    job.companyName.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{job.companyName}</h4>
                  <p className="text-[11px] text-slate-500">{job.company?.industry || 'Technology & Innovation'}</p>
                </div>
              </div>

              {job.company?.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {job.company.description}
                </p>
              )}

              {job.company?.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-600 font-semibold inline-flex items-center space-x-1 hover:underline"
                >
                  <span>Visit Organization Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Openings */}
      {similarJobs.length > 0 && (
        <section className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-slate-900">Similar Positions You May Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarJobs.slice(0, 3).map((sJob) => (
              <JobCard key={sJob._id} job={sJob} />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative">
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute right-5 top-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <Badge variant="primary">FreshersCareer Fast Apply</Badge>
              <h2 className="text-xl font-bold text-slate-900">
                Apply for {job.title}
              </h2>
              <p className="text-xs text-slate-500">
                Submitting your candidacy to <strong>{job.companyName}</strong>
              </p>
            </div>

            {applySuccessMessage ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-base font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-xs text-slate-600">{applySuccessMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-5">
                {/* Resume Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-800">
                    Candidate Resume (PDF) *
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs cursor-pointer p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                      <input
                        type="radio"
                        name="resumeSource"
                        checked={useProfileResume}
                        onChange={() => {
                          setUseProfileResume(true);
                          setSelectedResumeFile(null);
                        }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 font-medium">
                        {user?.resumeUrl
                          ? `Use saved profile resume (${user.resumeOriginalName || 'Resume.pdf'})`
                          : 'Use FreshersCareer standard demo resume (Alex_Rivera_CV.pdf)'}
                      </span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs cursor-pointer p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                      <input
                        type="radio"
                        name="resumeSource"
                        checked={!useProfileResume}
                        onChange={() => setUseProfileResume(false)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-slate-700 font-medium">
                        Upload custom PDF file from device
                      </span>
                    </label>

                    {!useProfileResume && (
                      <div className="pt-2 pl-6">
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => setSelectedResumeFile(e.target.files[0])}
                          className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Cover Note */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-800">
                    Cover Note / Message to Hiring Team (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Highlight why your skills make you a strong fit for this vacancy..."
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="btn-primary text-xs py-2 px-6 bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-xs flex items-center space-x-1.5"
                  >
                    {submittingApp && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
