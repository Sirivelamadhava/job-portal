import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Bookmark,
  User,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Trash2,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Search,
  Loader2,
  Sparkles,
  Download,
  Eye,
  Check,
  X
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const statusConfig = {
  pending: { label: 'Pending Review', variant: 'warning' },
  reviewed: { label: 'Under Review', variant: 'info' },
  shortlisted: { label: 'Shortlisted', variant: 'primary' },
  accepted: { label: 'Offer Accepted', variant: 'success' },
  rejected: { label: 'Not Selected', variant: 'danger' },
  withdrawn: { label: 'Withdrawn', variant: 'neutral' },
};

const JobSeekerDashboard = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'saved' | 'profile'
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedTimelineApp, setSelectedTimelineApp] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    headline: user?.headline || '',
    phone: user?.phone || '',
    location: user?.location || '',
    website: user?.website || '',
    bio: user?.bio || '',
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my', {
        params: { status: statusFilter !== 'all' ? statusFilter : undefined },
      });
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/applications/saved');
      if (res.data.success) {
        setSavedJobs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchApplications(), fetchSavedJobs()]);
      setLoading(false);
    };
    loadData();
  }, [statusFilter]);

  // Synchronize profile form with user
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        headline: user.headline || '',
        phone: user.phone || '',
        location: user.location || '',
        website: user.website || '',
        bio: user.bio || '',
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleWithdraw = async (applicationId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to withdraw your application for "${jobTitle}"?`)) {
      return;
    }
    setActionLoading(applicationId);
    try {
      const res = await api.patch(`/applications/${applicationId}/withdraw`);
      if (res.data.success) {
        setMessage('Application withdrawn successfully.');
        setTimeout(() => setMessage(''), 3000);
        fetchApplications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    setActionLoading(jobId);
    try {
      const res = await api.delete(`/applications/saved/${jobId}`);
      if (res.data.success) {
        setSavedJobs((prev) => prev.filter((item) => item.job?._id !== jobId));
      }
    } catch (err) {
      alert('Failed to remove saved job.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    const cleaned = skillInput.trim();
    if (!skills.includes(cleaned)) {
      setSkills([...skills, cleaned]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage('');
    setError('');
    try {
      const res = await api.put('/auth/profile', {
        ...profileForm,
        skills,
      });
      if (res.data.success) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    setMessage('');
    setError('');

    try {
      const res = await api.post('/auth/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setMessage('Resume PDF uploaded and linked to profile successfully!');
        setTimeout(() => setMessage(''), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Filter applications by search
  const filteredApplications = applications.filter((app) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const titleMatch = app.job?.title?.toLowerCase().includes(q);
    const companyMatch = app.job?.companyName?.toLowerCase().includes(q);
    return titleMatch || companyMatch;
  });

  const backendUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Job Seeker Candidate Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {user?.headline || 'Manage your active job applications, bookmarks, and career profile'}
          </p>
        </div>

        <Link
          to="/jobs"
          className="btn-primary text-xs py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-md flex items-center space-x-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Explore Open Positions</span>
        </Link>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Total Applications</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{applications.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Submitted resumes</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">In Review / Shortlisted</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {applications.filter((a) => ['reviewed', 'shortlisted'].includes(a.status)).length}
          </div>
          <div className="text-[10px] text-indigo-600 font-medium mt-0.5">Active candidates</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Saved Bookmarks</div>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">{savedJobs.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Jobs saved for later</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400">Profile Resume</div>
          <div className="text-base font-extrabold text-emerald-600 mt-2 truncate">
            {user?.resumeUrl ? 'PDF Attached' : 'Not Uploaded'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {user?.resumeUrl ? 'Ready for 1-click apply' : 'Add resume below'}
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="card-premium rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>My Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'saved'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Jobs ({savedJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Resume</span>
          </button>
        </div>

        {/* TAB 1: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['all', 'pending', 'reviewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn'].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              {/* Search input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 mt-2">Loading applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">No applications found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {statusFilter !== 'all'
                    ? `You do not have any applications in '${statusFilter}' status.`
                    : "You haven't applied to any positions yet. Find your next opportunity!"}
                </p>
                <Link to="/jobs" className="btn-primary text-xs py-2 px-4 inline-block mt-2">
                  Browse Open Positions &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const statusInfo = statusConfig[app.status] || {
                    label: app.status,
                    variant: 'neutral',
                  };

                  return (
                    <div
                      key={app._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start space-x-3.5">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {app.job?.company?.logo ? (
                              <img
                                src={app.job.company.logo}
                                alt={app.job.companyName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-slate-500" />
                            )}
                          </div>

                          <div>
                            <Link
                              to={`/jobs/${app.job?._id}`}
                              className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {app.job?.title || 'Job Position'}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-0.5">
                              <span className="font-medium text-slate-700">
                                {app.job?.companyName}
                              </span>
                              <span>&bull;</span>
                              <span className="inline-flex items-center space-x-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{app.job?.location}</span>
                              </span>
                              <span>&bull;</span>
                              <span className="capitalize">{app.job?.workplaceType}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 self-end sm:self-center">
                          <Badge variant={statusInfo.variant} dot>
                            {statusInfo.label}
                          </Badge>

                          {app.status !== 'withdrawn' &&
                            !['accepted', 'rejected'].includes(app.status) && (
                              <button
                                onClick={() => handleWithdraw(app._id, app.job?.title)}
                                disabled={actionLoading === app._id}
                                className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
                                title="Withdraw Application"
                              >
                                Withdraw
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Application Metadata & Timeline toggle */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Applied on {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {app.resumeUrl && (
                            <a
                              href={
                                app.resumeUrl.startsWith('http')
                                  ? app.resumeUrl
                                  : `${backendUrl}${app.resumeUrl}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1 text-indigo-600 hover:underline font-medium"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Submitted Resume</span>
                            </a>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setSelectedTimelineApp(
                              selectedTimelineApp?._id === app._id ? null : app
                            )
                          }
                          className="inline-flex items-center space-x-1 text-slate-700 hover:text-indigo-600 font-semibold"
                        >
                          <span>Application Timeline ({app.statusHistory?.length || 1})</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${
                              selectedTimelineApp?._id === app._id ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Recruiter Feedback Note if available */}
                      {app.recruiterFeedback && (
                        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                          <div className="font-bold flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Feedback from Hiring Team:</span>
                          </div>
                          <p className="leading-relaxed text-indigo-800">
                            {app.recruiterFeedback}
                          </p>
                        </div>
                      )}

                      {/* Expanded Status Timeline */}
                      {selectedTimelineApp?._id === app._id && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-fadeIn">
                          <h4 className="font-bold text-slate-900">Application Progression</h4>
                          <div className="space-y-3 pl-2 border-l-2 border-indigo-200">
                            {app.statusHistory?.map((hist, idx) => (
                              <div key={idx} className="relative pl-3 space-y-0.5">
                                <div className="w-2 h-2 rounded-full bg-indigo-600 absolute -left-[17px] top-1.5 ring-4 ring-white" />
                                <div className="font-bold text-slate-800 capitalize">
                                  {hist.status}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {hist.note} &bull;{' '}
                                  {new Date(hist.changedAt).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED JOBS */}
        {activeTab === 'saved' && (
          <div className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 mb-2">Bookmarked Opportunities</h2>

            {savedJobs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No saved jobs yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the bookmark icon on any job card to save opportunities here for easy review and quick application.
                </p>
                <Link to="/jobs" className="btn-primary text-xs py-2 px-4 inline-block mt-2">
                  Find Jobs to Save &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedJobs.map((item) => {
                  const job = item.job;
                  if (!job) return null;

                  return (
                    <div
                      key={item._id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              to={`/jobs/${job._id}`}
                              className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors"
                            >
                              {job.title}
                            </Link>
                            <div className="text-xs font-semibold text-slate-600 mt-0.5">
                              {job.companyName}
                            </div>
                          </div>

                          <button
                            onClick={() => handleUnsaveJob(job._id)}
                            disabled={actionLoading === job._id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove Bookmark"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{job.location}</span>
                          </span>
                          <span>&bull;</span>
                          <span className="capitalize">{job.workplaceType}</span>
                          <span>&bull;</span>
                          <span>${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] text-slate-400">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </div>

                        <Link
                          to={`/jobs/${job._id}`}
                          className="btn-primary text-xs py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500"
                        >
                          View & Apply &rarr;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PROFILE & RESUME */}
        {activeTab === 'profile' && (
          <div className="p-6 max-w-3xl space-y-8">
            {/* Resume Upload Section */}
            <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Candidate Resume Document (PDF)</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Upload your latest resume in PDF format (up to 5MB) for instant 1-click job applications.
                  </p>
                </div>

                {user?.resumeUrl && (
                  <a
                    href={
                      user.resumeUrl.startsWith('http')
                        ? user.resumeUrl
                        : `${backendUrl}${user.resumeUrl}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs py-2 px-3 bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold flex items-center space-x-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              {user?.resumeUrl ? (
                <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Current resume: <strong>{user.resumeOriginalName || 'Resume.pdf'}</strong> (Ready for one-click applications)
                  </span>
                </div>
              ) : (
                <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  No resume attached yet. Upload a PDF below to enable seamless applications.
                </div>
              )}

              <div className="flex items-center space-x-3">
                <label className="btn-primary text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-500 cursor-pointer inline-flex items-center space-x-1.5 font-semibold">
                  {uploadingResume ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading PDF...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{user?.resumeUrl ? 'Replace PDF Resume' : 'Upload PDF Resume'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUploadResume}
                    disabled={uploadingResume}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-400">PDF documents only, max 5MB</span>
              </div>
            </div>

            {/* Candidate Information Form */}
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Candidate Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Portfolio / LinkedIn / GitHub URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bio / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of your professional background, goals, and passions..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Skills Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Technical Skills & Competencies
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type a skill (e.g. React, Node.js, Python)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(e);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="btn-secondary text-xs py-1.5 px-3 bg-slate-100 hover:bg-slate-200 font-semibold"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-indigo-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {skills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills added yet.</span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary text-xs py-2 px-6 bg-slate-900 hover:bg-slate-800 font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSeekerDashboard;
