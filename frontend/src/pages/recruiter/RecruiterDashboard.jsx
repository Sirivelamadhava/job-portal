import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  PlusCircle, 
  Building, 
  Users, 
  Eye, 
  Edit3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ExternalLink,
  Loader2
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const RecruiterDashboard = () => {
  const { user, company } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    drafts: 0,
    closed: 0,
    totalViews: 0,
    totalApplications: 0,
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchRecruiterJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/jobs/my/jobs', {
        params: {
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(search && { search }),
        },
      });
      if (res.data.success) {
        setJobs(res.data.data.jobs);
        setStats(res.data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
  }, [statusFilter, search]);

  const handleToggleStatus = async (jobId) => {
    setActionLoading(jobId);
    try {
      const res = await api.patch(`/jobs/${jobId}/toggle-status`);
      if (res.data.success) {
        setMessage(res.data.message);
        setTimeout(() => setMessage(''), 3000);
        fetchRecruiterJobs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle job status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }
    setActionLoading(jobId);
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        setMessage('Job posting deleted successfully.');
        setTimeout(() => setMessage(''), 3000);
        fetchRecruiterJobs();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" dot>Active / Published</Badge>;
      case 'pending_approval':
        return <Badge variant="warning" dot>Pending Review</Badge>;
      case 'draft':
        return <Badge variant="neutral">Draft</Badge>;
      case 'closed':
        return <Badge variant="danger">Closed</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-300">
            <Building className="w-4 h-4" />
            <span>Employer Talent Headquarters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {company?.companyName || 'Your Company'} Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Signed in as <strong className="text-white">{user?.name}</strong> &bull; Company Status:{' '}
            <span className="capitalize font-bold text-emerald-400">{company?.status || 'Active'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/recruiter/applicants"
            className="btn-secondary text-xs py-2.5 px-4 bg-indigo-900/60 text-indigo-200 border-indigo-700/60 hover:bg-indigo-800 font-semibold flex items-center space-x-1.5"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Candidate Pipeline ({stats.totalApplications || 0})</span>
          </Link>
          <Link
            to="/recruiter/profile"
            className="btn-secondary text-xs py-2.5 px-4 bg-slate-800 text-white border-slate-700 hover:bg-slate-700 font-semibold"
          >
            Company Profile
          </Link>
          <Link
            to="/recruiter/jobs/new"
            className="btn-primary text-xs py-2.5 px-5 shadow-md shadow-indigo-500/20 font-bold flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </Link>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-premium p-5 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-400">Total Postings</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across all statuses</div>
        </div>

        <div className="card-premium p-5 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-400">Active Openings</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1">{stats.active}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Visible on public search</div>
        </div>

        <div className="card-premium p-5 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-400">Pending Admin Review</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 mt-1">{stats.pending}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Awaiting moderation</div>
        </div>

        <div className="card-premium p-5 rounded-2xl bg-white border border-slate-200">
          <div className="text-xs font-medium text-slate-400">Total Applicants</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 mt-1">{stats.totalApplications}</div>
          <div className="text-[11px] text-slate-500 mt-1">{stats.totalViews} position views</div>
        </div>
      </div>

      {/* Job Postings Section */}
      <div className="card-premium rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs space-y-4">
        {/* Filter Tabs & Search Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'approved', label: 'Active' },
              { id: 'pending_approval', label: 'Pending Review' },
              { id: 'draft', label: 'Drafts' },
              { id: 'closed', label: 'Closed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Jobs Table */}
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2 font-medium">Loading your job postings...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No job vacancies found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {statusFilter !== 'all'
                ? `You don't have any jobs with status '${statusFilter}'.`
                : 'You have not posted any jobs yet. Create your first opening to attract top talent!'}
            </p>
            <div className="pt-2">
              <Link to="/recruiter/jobs/new" className="btn-primary text-xs py-2 px-4">
                Post a Job Opening
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Job Title & Meta</th>
                  <th className="py-3 px-4">Type & Workplace</th>
                  <th className="py-3 px-4">Salary Range</th>
                  <th className="py-3 px-4">Views / Applicants</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 hover:text-indigo-600">
                        <Link to={`/jobs/${job._id}`}>{job.title}</Link>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {job.location} &bull; Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 capitalize">
                      <span className="font-medium text-slate-700">{job.employmentType}</span>
                      <div className="text-[11px] text-slate-400">{job.workplaceType}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      ${Math.round(job.salaryMin / 1000)}k - ${Math.round(job.salaryMax / 1000)}k
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        to={`/recruiter/applicants?jobId=${job._id}`}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline block"
                      >
                        {job.applicationsCount || 0} applicants
                      </Link>
                      <div className="text-[11px] text-slate-400">{job.viewsCount || 0} views</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(job.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <Link
                          to={`/recruiter/jobs/${job._id}/edit`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Job"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>

                        {/* Close / Reopen Toggle */}
                        {job.status !== 'draft' && job.status !== 'pending_approval' && (
                          <button
                            onClick={() => handleToggleStatus(job._id)}
                            disabled={actionLoading === job._id}
                            className={`p-1.5 rounded-lg transition-colors ${
                              job.status === 'closed'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={job.status === 'closed' ? 'Reopen Vacancy' : 'Close Vacancy'}
                          >
                            {job.status === 'closed' ? (
                              <ToggleLeft className="w-4 h-4" />
                            ) : (
                              <ToggleRight className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          disabled={actionLoading === job._id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
