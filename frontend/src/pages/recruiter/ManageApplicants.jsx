import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  MessageSquare,
  Loader2,
  X
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const statusConfig = {
  pending: { label: 'Pending Review', variant: 'warning' },
  reviewed: { label: 'Reviewed', variant: 'info' },
  shortlisted: { label: 'Shortlisted', variant: 'primary' },
  accepted: { label: 'Offer Extended / Hired', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  withdrawn: { label: 'Candidate Withdrew', variant: 'neutral' },
};

const ManageApplicants = () => {
  const [searchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'all';

  const [applications, setApplications] = useState([]);
  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  // Modals
  const [viewingCoverLetter, setViewingCoverLetter] = useState(null);
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [newStatus, setNewStatus] = useState('reviewed');
  const [feedbackNote, setFeedbackNote] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/my/jobs');
      if (res.data.success) {
        setRecruiterJobs(res.data.data.jobs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/recruiter', {
        params: {
          jobId: selectedJobId !== 'all' ? selectedJobId : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchTerm || undefined,
        },
      });
      if (res.data.success) {
        setApplications(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId, selectedStatus, searchTerm]);

  const handleOpenStatusModal = (app) => {
    setStatusModalApp(app);
    setNewStatus(app.status === 'pending' ? 'reviewed' : app.status);
    setFeedbackNote(app.recruiterFeedback || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusModalApp) return;

    setActionLoading(statusModalApp._id);
    try {
      const res = await api.patch(`/applications/${statusModalApp._id}/status`, {
        status: newStatus,
        recruiterFeedback: feedbackNote,
        note: `Recruiter updated status to ${newStatus}`,
      });

      if (res.data.success) {
        setMessage(`Candidate status updated to '${newStatus}' successfully!`);
        setTimeout(() => setMessage(''), 3000);
        setStatusModalApp(null);
        fetchApplications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update candidate status.');
    } finally {
      setActionLoading(null);
    }
  };

  const backendUrl = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

  return (
    <div className="space-y-8 py-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/recruiter"
            className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Recruiter Dashboard</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Applicant Tracking & Candidate Pipeline
          </h1>
          <p className="text-xs text-slate-500">
            Review applicant qualifications, resumes, and manage interview progressions
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter Dropdown */}
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Job Vacancies ({recruiterJobs.length})</option>
            {recruiterJobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} ({job.applicationsCount || 0} applicants)
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Application Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Under Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted / Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, email, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Candidate Pipeline Cards / Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-2">Loading candidate pipeline...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No applicants found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {selectedStatus !== 'all' || selectedJobId !== 'all' || searchTerm
              ? 'No candidate applications match the selected filter criteria.'
              : 'As candidates submit applications for your job openings, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusInfo = statusConfig[app.status] || {
              label: app.status,
              variant: 'neutral',
            };

            return (
              <div
                key={app._id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-xs space-y-4"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Candidate Info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                      {app.applicant?.name?.charAt(0) || 'C'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {app.applicant?.name || 'Applicant'}
                        </h3>
                        <Badge variant={statusInfo.variant} dot>
                          {statusInfo.label}
                        </Badge>
                      </div>

                      {app.applicant?.headline && (
                        <p className="text-xs text-slate-600 font-medium">
                          {app.applicant.headline}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        {app.applicant?.email && (
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{app.applicant.email}</span>
                          </span>
                        )}
                        {app.applicant?.phone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{app.applicant.phone}</span>
                          </span>
                        )}
                        {app.applicant?.location && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{app.applicant.location}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions / Status changer */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                    {/* View Resume PDF */}
                    {app.resumeUrl && (
                      <a
                        href={
                          app.resumeUrl.startsWith('http')
                            ? app.resumeUrl
                            : `${backendUrl}${app.resumeUrl}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-2 px-3 bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold flex items-center space-x-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF Resume</span>
                      </a>
                    )}

                    {/* Cover Note button */}
                    {app.coverLetter && (
                      <button
                        onClick={() => setViewingCoverLetter(app)}
                        className="btn-secondary text-xs py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold flex items-center space-x-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Cover Note</span>
                      </button>
                    )}

                    {/* Update Status Button */}
                    <button
                      onClick={() => handleOpenStatusModal(app)}
                      className="btn-primary text-xs py-2 px-4 bg-slate-900 hover:bg-slate-800 font-semibold shadow-xs flex items-center space-x-1.5"
                    >
                      <span>Update Status</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Candidate Applied Job & Skills */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <span className="text-slate-400">Position Applied:</span>
                    <strong className="text-slate-800">{app.job?.title}</strong>
                    <span>&bull;</span>
                    <span className="text-slate-400">
                      Submitted on {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {app.applicant?.skills && app.applicant.skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-slate-400 mr-1">Skills:</span>
                      {app.applicant.skills.slice(0, 5).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback Note Display */}
                {app.recruiterFeedback && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-0.5">
                    <span className="font-bold">Candidate Evaluation / Note:</span>
                    <p className="text-amber-800">{app.recruiterFeedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cover Letter Modal */}
      {viewingCoverLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={() => setViewingCoverLetter(null)}
              className="absolute right-5 top-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900">
              Candidate Cover Note & Pitch
            </h3>
            <p className="text-xs text-slate-500">
              From <strong>{viewingCoverLetter.applicant?.name}</strong> for{' '}
              <strong>{viewingCoverLetter.job?.title}</strong>
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
              {viewingCoverLetter.coverLetter}
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingCoverLetter(null)}
                className="btn-primary text-xs py-2 px-4"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Changer Modal */}
      {statusModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              onClick={() => setStatusModalApp(null)}
              className="absolute right-5 top-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Update Candidate Stage
              </h3>
              <p className="text-xs text-slate-500">
                Updating application status for <strong>{statusModalApp.applicant?.name}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate Pipeline Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="accepted">Accepted / Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Candidate Feedback / Internal Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Completed initial phone screen, scheduling technical round on Friday..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusModalApp(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === statusModalApp._id}
                  className="btn-primary text-xs py-2 px-5 bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  {actionLoading === statusModalApp._id && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Save Status Change</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageApplicants;
