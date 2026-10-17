import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
  MapPin,
  ExternalLink,
  Bell
} from 'lucide-react';
import SearchBar from '../components/jobs/SearchBar';
import FilterSidebar from '../components/jobs/FilterSidebar';
import JobCard from '../components/ui/JobCard';
import JobCardSkeleton from '../components/ui/JobCardSkeleton';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import FresherAlertModal from '../components/jobs/FresherAlertModal';
import api from '../services/api';

const categoryTabs = [
  { id: 'all', label: 'All Fresher IT Roles' },
  { id: 'fulltime_fresher', label: 'Full-time Fresher Jobs' },
  { id: 'internship', label: 'Tech Internships' },
  { id: 'trainee', label: 'Graduate Trainee (GET)' },
  { id: 'remote_entry', label: 'Remote Entry-Level' },
];

const indianHubs = [
  { id: '', label: 'All India' },
  { id: 'Bengaluru', label: 'Bengaluru' },
  { id: 'Hyderabad', label: 'Hyderabad' },
  { id: 'Pune', label: 'Pune' },
  { id: 'Chennai', label: 'Chennai' },
  { id: 'Delhi NCR', label: 'Delhi NCR' },
  { id: 'Mumbai', label: 'Mumbai' },
  { id: 'Remote', label: 'Remote' },
];

const BrowseJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter State initialized from URL query parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || 'all',
    workplaceType: searchParams.get('workplaceType') ? searchParams.get('workplaceType').split(',') : [],
    skills: searchParams.get('skills') ? searchParams.get('skills').split(',') : [],
    fresherOnly: searchParams.get('fresherOnly') || 'true',
    source: searchParams.get('source') || 'all',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [showProvidersModal, setShowProvidersModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL search params
  const updateURLParams = useCallback((newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.category && newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.workplaceType?.length) params.set('workplaceType', newFilters.workplaceType.join(','));
    if (newFilters.skills?.length) params.set('skills', newFilters.skills.join(','));
    if (newFilters.fresherOnly !== 'true') params.set('fresherOnly', newFilters.fresherOnly);
    if (newFilters.source && newFilters.source !== 'all') params.set('source', newFilters.source);
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.page > 1) params.set('page', newFilters.page.toString());

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch fresher jobs from real-time aggregator endpoint
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: filters.page,
        limit: 12,
        sortBy: filters.sort,
        fresherOnly: filters.fresherOnly,
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.category && filters.category !== 'all' && { category: filters.category }),
        ...(filters.workplaceType?.length && { workMode: filters.workplaceType.join(',') }),
        ...(filters.skills?.length && { skills: filters.skills.join(',') }),
        ...(filters.source && filters.source !== 'all' && { source: filters.source }),
      };

      const res = await api.get('/jobs/aggregated', { params: queryParams });
      if (res.data.success) {
        setJobs(res.data.data);
        setPagination(res.data.pagination || { total: res.data.data.length, page: 1, totalPages: 1 });
        if (res.data.pagination?.stats) {
          setStats(res.data.pagination.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching aggregated fresher jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch provider status transparency
  useEffect(() => {
    api.get('/jobs/aggregated/providers')
      .then((res) => {
        if (res.data.success) {
          setProviders(res.data.data);
        }
      })
      .catch((e) => console.warn('Could not fetch providers info:', e));
  }, []);

  useEffect(() => {
    fetchJobs();
    updateURLParams(filters);
  }, [fetchJobs, filters, updateURLParams]);

  // Search submission
  const handleSearch = ({ search, location }) => {
    setFilters((prev) => ({
      ...prev,
      search,
      location,
      page: 1,
    }));
  };

  // Filter sidebar change
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: 1,
    }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      location: '',
      category: 'all',
      workplaceType: [],
      skills: [],
      fresherOnly: 'true',
      source: 'all',
      sort: 'newest',
      page: 1,
    });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 py-6">
      {/* 1. Hero Banner: Strict 0-Exp Fresher Aggregator */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 text-slate-900 space-y-5 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strict 0-Years Work Experience Guarantee</span>
            </span>
            <button
              onClick={() => setShowAlertModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 transition-colors shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Daily Alerts (6 AM IST)</span>
            </button>
            <button
              onClick={() => setShowProvidersModal(true)}
              className="inline-flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-800 underline font-semibold"
            >
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>Provider Feeds Transparency</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Find Your First IT Job — All in One Place
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Discover entry-level IT jobs, tech internships, and graduate trainee opportunities from multiple job platforms, exclusively tailored for candidates with zero professional experience.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl relative z-10 pt-1">
          <SearchBar
            initialSearch={filters.search}
            initialLocation={filters.location}
            onSearch={handleSearch}
          />
        </div>

        {/* Indian Tech Hub Quick Selector */}
        <div className="flex flex-wrap items-center gap-2 pt-1 relative z-10 text-xs">
          <span className="text-slate-500 font-medium">Top Hubs:</span>
          {indianHubs.map((hub) => (
            <button
              key={hub.id}
              onClick={() => handleFilterChange('location', hub.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                (filters.location || '') === hub.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
              }`}
            >
              {hub.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Category Switcher Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categoryTabs.map((tab) => {
          const isActive = (filters.category || 'all') === tab.id;
          const count = stats?.categoriesCount ? stats.categoriesCount[tab.id] : null;

          return (
            <button
              key={tab.id}
              onClick={() => handleFilterChange('category', tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {count !== null && count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Main Content Grid: Filter Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Controls: Counter & Sorting */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {loading ? 'Aggregating live fresher openings...' : `Found ${pagination.total} Verified 0-Exp IT Positions`}
                </span>
                {!loading && stats && stats.sourcesCount && (
                  <span className="text-[11px] text-slate-500 hidden md:inline">
                    (Aggregated across {Object.keys(stats.sourcesCount).length} active sources)
                  </span>
                )}
              </div>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="newest">Recently Posted</option>
                  <option value="relevance">Highest Fresher Relevance</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="salary_low">Lowest Salary</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(filters.search || filters.location || filters.category !== 'all' || filters.workplaceType?.length > 0 || filters.skills?.length > 0 || (filters.source && filters.source !== 'all')) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-500 mr-1">Active filters:</span>
              
              {filters.category !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  <span>Type: {categoryTabs.find(t => t.id === filters.category)?.label}</span>
                  <button onClick={() => handleFilterChange('category', 'all')}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}

              {filters.location && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span>Location: "{filters.location}"</span>
                  <button onClick={() => handleFilterChange('location', '')}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}

              {filters.search && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span>Keyword: "{filters.search}"</span>
                  <button onClick={() => handleFilterChange('search', '')}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}

              {filters.source && filters.source !== 'all' && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                  <span>Source: {filters.source}</span>
                  <button onClick={() => handleFilterChange('source', 'all')}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}

              {filters.skills?.map((sk) => (
                <span key={sk} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">
                  <span>Skill: {sk}</span>
                  <button onClick={() => handleFilterChange('skills', filters.skills.filter(x => x !== sk))}><X className="w-3 h-3 ml-1" /></button>
                </span>
              ))}

              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Mobile Filter Drawer */}
          {mobileFilterOpen && (
            <div className="lg:hidden p-4 bg-white rounded-2xl border border-slate-200 shadow-md">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>
          )}

          {/* Job Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <JobCardSkeleton key={n} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No matching 0-experience IT jobs found"
              description="No vacancies currently meet all your exact search criteria. Try removing specific skill or location filters to see more fresher opportunities."
              onAction={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && jobs.length > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* 4. Provider Transparency Modal */}
      {showProvidersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative max-h-[85vh] overflow-y-auto text-slate-900">
            <button
              onClick={() => setShowProvidersModal(false)}
              className="absolute right-5 top-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Transparency & Ethics</span>
              <h3 className="text-xl font-bold text-slate-900">Job Source Integrations & Live Feeds</h3>
              <p className="text-xs text-slate-500">
                FreshersCareer strictly adheres to authorized developer APIs and job feeds. We never scrape websites or invent mock data.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {providers.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.displayName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.isConfigured 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.isConfigured ? 'Live & Operational' : 'Awaiting Enterprise Partner Credentials'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{p.description}</p>
                  {p.requirements && (
                    <div className="text-[10px] text-slate-500 pt-1 space-y-0.5">
                      <span className="font-semibold block text-slate-700">Access Requirements:</span>
                      {p.requirements.map((req, rIdx) => (
                        <div key={rIdx}>&bull; {req}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowProvidersModal(false)}
                className="btn-primary text-xs py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Candidate Daily Fresher IT Job Alerts Modal */}
      <FresherAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
};

export default BrowseJobs;
