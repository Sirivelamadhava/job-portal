import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Trash2, 
  Search, 
  Eye, 
  Layers, 
  RefreshCw,
  Loader2,
  ExternalLink 
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'recruiters' | 'all-jobs'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecruiters: 0,
    totalSeekers: 0,
    totalJobs: 0,
    pendingJobs: 0,
    approvedJobs: 0,
    totalApplications: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, recRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/jobs', {
          params: { status: activeTab === 'moderation' ? 'pending_approval' : 'all' },
        }),
        api.get('/admin/recruiters'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (jobsRes.data.success) setJobs(jobsRes.data.data);
      if (recRes.data.success) setRecruiters(recRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    setActionLoading(jobId);
    try {
      const res = await api.patch(`/admin/jobs/${jobId}/status`, { status: newStatus });
      if (res.data.success) {
        setMessage(`Job status updated to '${newStatus}'`);
        setTimeout(() => setMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Permanently remove job "${title}"?`)) return;
    setActionLoading(jobId);
    try {
      const res = await api.delete(`/admin/jobs/${jobId}`);
      if (res.data.success) {
        setMessage('Job listing deleted.');
        setTimeout(() => setMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete job.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCompanyStatus = async (companyId, newStatus) => {
    setActionLoading(companyId);
    try {
      const res = await api.patch(`/admin/recruiters/${companyId}/status`, { status: newStatus });
      if (res.data.success) {
        setMessage(`Company status updated to '${newStatus}'`);
        setTimeout(() => setMessage(''), 3000);
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Admin Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Operations & Moderation Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Signed in as <strong className="text-white">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="btn-secondary text-xs py-2 px-4 bg-slate-800 text-white border-slate-700 hover:bg-slate-700 font-semibold flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Total Users</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalUsers}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{stats.totalSeekers} job seekers</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Recruiters</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.totalRecruiters}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Verified employers</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Pending Jobs</div>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">{stats.pendingJobs}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Require review</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Live Approved Jobs</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.approvedJobs}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Public directory</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">Applications</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">{stats.totalApplications}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Candidates placed</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="card-premium rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'moderation'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Job Moderation Queue</span>
            {stats.pendingJobs > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold flex items-center justify-center">
                {stats.pendingJobs}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recruiters')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'recruiters'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Recruiter Company Approvals
          </button>

          <button
            onClick={() => setActiveTab('all-jobs')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'all-jobs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Platform Jobs
          </button>
        </div>

        {/* Tab 1: Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Pending Job Submissions Requiring Admin Approval
            </h2>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Moderation Queue is Clean</h3>
                <p className="text-xs text-slate-500">There are no pending jobs requiring review right now.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Title & Company</th>
                      <th className="py-3 px-4">Workplace & Salary</th>
                      <th className="py-3 px-4">Recruiter Author</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map((job) => (
                      <tr key={job._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4">
                          <Link to={`/jobs/${job._id}`} className="font-bold text-slate-900 hover:text-purple-600">
                            {job.title}
                          </Link>
                          <div className="text-[11px] text-slate-400">{job.companyName} &bull; {job.location}</div>
                        </td>

                        <td className="py-3.5 px-4 capitalize">
                          <div>{job.workplaceType} ({job.employmentType})</div>
                          <div className="text-[11px] text-slate-500">${Math.round(job.salaryMin/1000)}k - ${Math.round(job.salaryMax/1000)}k</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{job.recruiter?.name}</div>
                          <div className="text-[11px] text-slate-400">{job.recruiter?.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge variant="warning" dot>Pending Review</Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleUpdateJobStatus(job._id, 'approved')}
                            disabled={actionLoading === job._id}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                          >
                            Approve & Publish
                          </button>
                          <button
                            onClick={() => handleUpdateJobStatus(job._id, 'rejected')}
                            disabled={actionLoading === job._id}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recruiter Approvals */}
        {activeTab === 'recruiters' && (
          <div className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              Recruiter Organizations & Governance
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Recruiter Lead</th>
                    <th className="py-3 px-4">Industry & Location</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recruiters.map((comp) => (
                    <tr key={comp._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {comp.companyName}
                        {comp.website && (
                          <a href={comp.website} target="_blank" rel="noreferrer" className="block text-[11px] text-indigo-600 hover:underline">
                            {comp.website}
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{comp.user?.name}</div>
                        <div className="text-[11px] text-slate-400">{comp.user?.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>{comp.industry || 'Technology'}</div>
                        <div className="text-[11px] text-slate-400">{comp.location || 'United States'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            comp.status === 'approved' ? 'success' :
                            comp.status === 'suspended' ? 'danger' : 'warning'
                          }
                          dot
                        >
                          {comp.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {comp.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateCompanyStatus(comp._id, 'approved')}
                            disabled={actionLoading === comp._id}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {comp.status !== 'suspended' && (
                          <button
                            onClick={() => handleUpdateCompanyStatus(comp._id, 'suspended')}
                            disabled={actionLoading === comp._id}
                            className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: All Platform Jobs */}
        {activeTab === 'all-jobs' && (
          <div className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">
              All Job Postings Across Platform
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Title & Company</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Views / Applications</th>
                    <th className="py-3 px-4">Recruiter Author</th>
                    <th className="py-3 px-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4">
                        <Link to={`/jobs/${job._id}`} className="font-bold text-slate-900 hover:text-purple-600">
                          {job.title}
                        </Link>
                        <div className="text-[11px] text-slate-400">{job.companyName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          variant={job.status === 'approved' ? 'success' : job.status === 'closed' ? 'danger' : 'neutral'}
                        >
                          {job.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        {job.viewsCount || 0} views &bull; {job.applicationsCount || 0} apps
                      </td>

                      <td className="py-3.5 px-4">
                        {job.recruiter?.name || 'Recruiter'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteJob(job._id, job.title)}
                          disabled={actionLoading === job._id}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Remove Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
