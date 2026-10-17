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
  ExternalLink,
  Clock,
  Radio,
  Sparkles,
  Zap,
  Globe,
  Database,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'sync-status' | 'recruiters' | 'all-jobs'
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
  const [syncTelemetry, setSyncTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, recRes, syncRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/jobs', {
          params: { status: activeTab === 'moderation' ? 'pending_approval' : 'all' },
        }),
        api.get('/admin/recruiters'),
        api.get('/admin/sync-status').catch(() => ({ data: { success: false } })),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (jobsRes.data?.success) setJobs(jobsRes.data.data);
      if (recRes.data?.success) setRecruiters(recRes.data.data);
      if (syncRes.data?.success) setSyncTelemetry(syncRes.data.data);
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

  const handleTriggerManualSync = async () => {
    setActionLoading('syncing');
    try {
      const res = await api.post('/admin/sync-now');
      if (res.data.success) {
        setMessage(res.data.data?.summary || 'Fresher IT job sync completed successfully.');
        setTimeout(() => setMessage(''), 5000);
        // Refresh telemetry
        const syncRes = await api.get('/admin/sync-status');
        if (syncRes.data.success) setSyncTelemetry(syncRes.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Manual synchronization failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Not yet recorded';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' IST';
  };

  return (
    <div className="space-y-8 py-6">
      {/* Admin Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-purple-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Operations & Moderation Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Governance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Signed in as <strong className="text-white">{user?.name}</strong> ({user?.email}) &bull; Scheduled Daily Job Engine (6:00 AM IST)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchAdminData}
            className="btn-secondary text-xs py-2 px-4 bg-slate-800 text-white border-slate-700 hover:bg-slate-700 font-semibold flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
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
          <div className="text-[11px] font-semibold text-slate-400">Internal Jobs</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.approvedJobs}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">FreshersCareer Direct</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">External Synced</div>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">{syncTelemetry?.totalActiveExternalJobs || 0}</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">0-Exp Verified</div>
        </div>

        <div className="card-premium p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-400">New Today</div>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">{syncTelemetry?.totalNewToday || 0}</div>
          <div className="text-[10px] text-teal-600 font-semibold mt-0.5">Discovered &lt; 24h</div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="card-premium rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center gap-2 text-xs font-semibold">
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
            onClick={() => setActiveTab('sync-status')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === 'sync-status'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span>Fresher IT Job Sync & Telemetry</span>
            <span className="px-1.5 py-0.2 rounded-md bg-purple-800 text-[10px] text-purple-200">6 AM IST</span>
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

        {/* Tab: Sync Status & Telemetry */}
        {activeTab === 'sync-status' && (
          <div className="p-6 space-y-6">
            {/* Header with trigger button */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Scheduled Daily Fresher Discovery Engine (Asia/Kolkata)</span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  Automated Job Aggregation & Verification Monitor
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl">
                  Automatically queries configured job sources every morning at <strong>6:00 AM IST</strong>. 
                  Applies zero-experience filters, checks original source URLs, deduplicates records, and updates job availability.
                </p>
              </div>

              <button
                onClick={handleTriggerManualSync}
                disabled={actionLoading === 'syncing' || syncTelemetry?.isSyncRunning}
                className="btn-primary py-2.5 px-5 text-xs font-bold shadow-md bg-indigo-500 hover:bg-indigo-600 text-white inline-flex items-center space-x-2 shrink-0 disabled:opacity-50"
              >
                {actionLoading === 'syncing' || syncTelemetry?.isSyncRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Sync Jobs Now</span>
                  </>
                )}
              </button>
            </div>

            {/* Sync Timing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Last Successful Sync</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">
                  {formatDateTime(syncTelemetry?.lastSuccessfulSyncTime)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Status: Operational</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Next Scheduled Sync</span>
                <span className="text-sm font-bold text-indigo-700 mt-1 block">
                  {formatDateTime(syncTelemetry?.nextScheduledSyncTime)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Daily at 6:00 AM IST</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">New Jobs Found (Last Run)</span>
                <span className="text-2xl font-black text-emerald-600 mt-0.5 block">
                  {syncTelemetry?.lastSync?.metrics?.newJobsFound ?? 0}
                </span>
                <span className="text-[10px] text-slate-500 block">Genuine 0-exp listings added</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 block">Disqualified (Strict Filter)</span>
                <span className="text-2xl font-black text-rose-600 mt-0.5 block">
                  {syncTelemetry?.lastSync?.metrics?.fresherDisqualified ?? 0}
                </span>
                <span className="text-[10px] text-rose-500 font-semibold block">Required 1+ yrs experience</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            {syncTelemetry?.lastSync && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Last Sync Run Audit Summary ({syncTelemetry.lastSync.triggerType})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50">
                    <div className="text-xs text-slate-400 font-medium">Total Analyzed</div>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">{syncTelemetry.lastSync.metrics.totalFetched}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50">
                    <div className="text-xs text-emerald-600 font-medium">New Discovered</div>
                    <div className="text-base font-extrabold text-emerald-700 mt-0.5">{syncTelemetry.lastSync.metrics.newJobsFound}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50">
                    <div className="text-xs text-blue-600 font-medium">Verified / Refreshed</div>
                    <div className="text-base font-extrabold text-blue-700 mt-0.5">{syncTelemetry.lastSync.metrics.existingUpdated}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50">
                    <div className="text-xs text-amber-600 font-medium">Duplicates Merged</div>
                    <div className="text-base font-extrabold text-amber-700 mt-0.5">{syncTelemetry.lastSync.metrics.duplicatesSkipped}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50">
                    <div className="text-xs text-purple-600 font-medium">Expired Flagged</div>
                    <div className="text-base font-extrabold text-purple-700 mt-0.5">{syncTelemetry.lastSync.metrics.expiredFlagged}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error alerts if any */}
            {syncTelemetry?.lastSync?.syncErrors && syncTelemetry.lastSync.syncErrors.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Sync Notices / Errors Requiring Attention:</span>
                </div>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
                  {syncTelemetry.lastSync.syncErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Provider Integration Status Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Configured Job Source Adapters & Integration Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {syncTelemetry?.providers?.map((provider) => {
                  const isActive = provider.status === 'active';
                  return (
                    <div
                      key={provider.name}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1.5">
                            <span>{provider.displayName}</span>
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isActive ? 'Active Feed' : 'Awaiting Partner Key'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                          {provider.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 capitalize">{provider.type?.replace(/_/g, ' ')}</span>
                        {provider.website && (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline flex items-center space-x-0.5 font-semibold"
                          >
                            <span>Docs</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Sync Audit History Table */}
            {syncTelemetry?.recentLogs && syncTelemetry.recentLogs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Recent Synchronization Audit History
                </h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-4">Timestamp</th>
                        <th className="py-2.5 px-4">Trigger</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">New Jobs</th>
                        <th className="py-2.5 px-4">Updated</th>
                        <th className="py-2.5 px-4">Disqualified (Exp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {syncTelemetry.recentLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4 font-medium text-slate-700">
                            {formatDateTime(log.syncStartedAt || log.createdAt)}
                          </td>
                          <td className="py-2.5 px-4 capitalize">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {log.triggerType?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                log.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : log.status === 'partial'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-emerald-600">
                            +{log.metrics?.newJobsFound || 0}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {log.metrics?.existingUpdated || 0}
                          </td>
                          <td className="py-2.5 px-4 text-slate-400">
                            {log.metrics?.fresherDisqualified || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

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
                        <div className="text-[11px] text-slate-400">{comp.location || 'India'}</div>
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
