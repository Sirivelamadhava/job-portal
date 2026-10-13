import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Briefcase 
} from 'lucide-react';
import SearchBar from '../components/jobs/SearchBar';
import FilterSidebar from '../components/jobs/FilterSidebar';
import JobCard from '../components/ui/JobCard';
import JobCardSkeleton from '../components/ui/JobCardSkeleton';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import api from '../services/api';

const BrowseJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter State initialized from URL query parameters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    workplaceType: searchParams.get('workplaceType') ? searchParams.get('workplaceType').split(',') : [],
    employmentType: searchParams.get('employmentType') ? searchParams.get('employmentType').split(',') : [],
    experienceLevel: searchParams.get('experienceLevel') ? searchParams.get('experienceLevel').split(',') : [],
    minSalary: Number(searchParams.get('minSalary')) || 0,
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL search params
  const updateURLParams = useCallback((newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.location) params.set('location', newFilters.location);
    if (newFilters.workplaceType?.length) params.set('workplaceType', newFilters.workplaceType.join(','));
    if (newFilters.employmentType?.length) params.set('employmentType', newFilters.employmentType.join(','));
    if (newFilters.experienceLevel?.length) params.set('experienceLevel', newFilters.experienceLevel.join(','));
    if (newFilters.minSalary > 0) params.set('minSalary', newFilters.minSalary.toString());
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.page > 1) params.set('page', newFilters.page.toString());

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch jobs from backend API
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: filters.page,
        limit: 9,
        sort: filters.sort,
        ...(filters.search && { search: filters.search }),
        ...(filters.location && { location: filters.location }),
        ...(filters.workplaceType?.length && { workplaceType: filters.workplaceType.join(',') }),
        ...(filters.employmentType?.length && { employmentType: filters.employmentType.join(',') }),
        ...(filters.experienceLevel?.length && { experienceLevel: filters.experienceLevel.join(',') }),
        ...(filters.minSalary > 0 && { minSalary: filters.minSalary }),
      };

      const res = await api.get('/jobs', { params: queryParams });
      if (res.data.success) {
        setJobs(res.data.data);
        setPagination(res.data.pagination || { total: res.data.data.length, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchJobs();
    updateURLParams(filters);
  }, [fetchJobs, filters, updateURLParams]);

  // Handler for search form submission
  const handleSearch = ({ search, location }) => {
    setFilters((prev) => ({
      ...prev,
      search,
      location,
      page: 1,
    }));
  };

  // Handler for filter sidebar changes
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
      workplaceType: [],
      employmentType: [],
      experienceLevel: [],
      minSalary: 0,
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
      {/* Top Search Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-4 shadow-sm">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Browse Open Positions</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Filter through tech vacancies vetted by our engineering team.
          </p>
        </div>
        <div className="max-w-3xl">
          <SearchBar
            initialSearch={filters.search}
            initialLocation={filters.location}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
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
          {/* Header Controls: Result Count & Sorting */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden btn-secondary text-xs px-3 py-1.5 flex items-center space-x-1.5"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
              <span className="text-xs font-semibold text-slate-700">
                {loading ? 'Searching...' : `Found ${pagination.total} opportunities`}
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="newest">Most Recent</option>
                  <option value="salary_high">Highest Salary</option>
                  <option value="salary_low">Lowest Salary</option>
                  <option value="popular">Most Viewed</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(filters.search || filters.location || filters.workplaceType?.length > 0 || filters.employmentType?.length > 0 || filters.experienceLevel?.length > 0 || filters.minSalary > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span>Keyword: "{filters.search}"</span>
                  <button onClick={() => handleFilterChange('search', '')}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
              {filters.location && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span>Location: "{filters.location}"</span>
                  <button onClick={() => handleFilterChange('location', '')}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
              {filters.workplaceType?.map((wt) => (
                <span key={wt} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="capitalize">{wt}</span>
                  <button onClick={() => handleFilterChange('workplaceType', filters.workplaceType.filter(x => x !== wt))}><X className="w-3 h-3 ml-1" /></button>
                </span>
              ))}
              {filters.employmentType?.map((et) => (
                <span key={et} className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="capitalize">{et}</span>
                  <button onClick={() => handleFilterChange('employmentType', filters.employmentType.filter(x => x !== et))}><X className="w-3 h-3 ml-1" /></button>
                </span>
              ))}
              {filters.minSalary > 0 && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span>${filters.minSalary / 1000}k+/yr</span>
                  <button onClick={() => handleFilterChange('minSalary', 0)}><X className="w-3 h-3 ml-1" /></button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline ml-1"
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
              title="No matching job postings found"
              description="We couldn't find any approved positions matching your selected filters. Try broadening your criteria or reset all filters."
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
    </div>
  );
};

export default BrowseJobs;
