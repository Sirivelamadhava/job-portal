import React from 'react';
import { Filter, RotateCcw, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

const workModeOptions = [
  { id: 'remote', label: '100% Remote' },
  { id: 'hybrid', label: 'Hybrid Work' },
  { id: 'on-site', label: 'On-site Office' },
];

const categoryOptions = [
  { id: 'all', label: 'All Fresher IT Roles' },
  { id: 'fulltime_fresher', label: 'Full-time Fresher Jobs' },
  { id: 'internship', label: 'Tech Internships' },
  { id: 'trainee', label: 'Graduate Trainee (GET)' },
  { id: 'remote_entry', label: 'Remote Entry-Level' },
];

const indianTechCities = [
  { id: '', label: 'All Locations (Pan India)' },
  { id: 'Bengaluru', label: 'Bengaluru / Bangalore' },
  { id: 'Hyderabad', label: 'Hyderabad / Secunderabad' },
  { id: 'Pune', label: 'Pune' },
  { id: 'Chennai', label: 'Chennai' },
  { id: 'Delhi NCR', label: 'Delhi NCR (Noida/Gurgaon)' },
  { id: 'Mumbai', label: 'Mumbai' },
  { id: 'Remote', label: 'Pan-India Remote' },
];

const topSkills = [
  'React.js',
  'JavaScript',
  'Java',
  'Python',
  'Node.js',
  'SQL',
  'Next.js',
  'Flutter',
  'Data Structures & Algorithms',
  'Git',
];

const sourceOptions = [
  { id: 'all', label: 'All Authorized Sources' },
  { id: 'Unstop', label: 'Unstop Internships' },
  { id: 'LinkedIn', label: 'LinkedIn Jobs Feed' },
  { id: 'Naukri', label: 'Naukri India Feed' },
  { id: 'FreshersCareer', label: 'FreshersCareer Direct Verified' },
  { id: 'Indeed', label: 'Indeed Feed' },
  { id: 'Internshala', label: 'Internshala Freshers' },
];

const FilterSidebar = ({
  filters,
  onFilterChange,
  onResetFilters,
  className = '',
}) => {
  const toggleArrayFilter = (field, value) => {
    const current = filters[field] || [];
    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    onFilterChange(field, updated);
  };

  const isFresherOnly = filters.fresherOnly !== 'false' && filters.fresherOnly !== false;

  const activeFiltersCount =
    (filters.workplaceType?.length || 0) +
    (filters.category && filters.category !== 'all' ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.skills?.length || 0) +
    (filters.source && filters.source !== 'all' ? 1 : 0);

  return (
    <aside className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-6 text-slate-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Filter Fresher Jobs</h3>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline font-bold flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Strict Fresher Guarantee Switch */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-extrabold text-emerald-900">Strict 0-Exp Filter</span>
          </div>
          <input
            type="checkbox"
            checked={isFresherOnly}
            onChange={(e) => onFilterChange('fresherOnly', e.target.checked ? 'true' : 'false')}
            className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-white"
          />
        </label>
        <p className="text-[11px] text-emerald-800 leading-tight">
          Excludes any job requiring 1+ or 2+ years of prior industry experience.
        </p>
      </div>

      {/* Fresher Subcategories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Opportunity Type</span>
        </h4>
        <div className="space-y-2">
          {categoryOptions.map((cat) => {
            const isSelected = (filters.category || 'all') === cat.id;
            return (
              <label
                key={cat.id}
                className="flex items-center space-x-2.5 text-xs text-slate-600 cursor-pointer select-none hover:text-slate-900"
              >
                <input
                  type="radio"
                  name="fresherCategory"
                  checked={isSelected}
                  onChange={() => onFilterChange('category', cat.id)}
                  className="border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-white"
                />
                <span className={isSelected ? 'font-bold text-emerald-700' : ''}>
                  {cat.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Indian Tech Hub Location */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Indian Tech Hubs
        </h4>
        <div className="space-y-1.5">
          <select
            value={filters.location || ''}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {indianTechCities.map((city) => (
              <option key={city.id} value={city.id} className="bg-white text-slate-900">
                {city.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Mode */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Work Mode
        </h4>
        <div className="space-y-2">
          {workModeOptions.map((opt) => {
            const isChecked = filters.workplaceType?.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center space-x-2.5 text-xs text-slate-600 cursor-pointer select-none hover:text-slate-900"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('workplaceType', opt.id)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-white"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Skills Filters */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Key IT Skills
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {topSkills.map((skill) => {
            const isSelected = filters.skills?.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleArrayFilter('skills', skill)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200/90 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Source Platform Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Job Source</span>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">Live Feeds</span>
        </h4>
        <div className="space-y-2">
          {sourceOptions.map((opt) => {
            const isSelected = (filters.source || 'all').toLowerCase() === opt.id.toLowerCase();
            return (
              <label
                key={opt.id}
                className="flex items-center space-x-2.5 text-xs text-slate-600 cursor-pointer select-none hover:text-slate-900"
              >
                <input
                  type="radio"
                  name="jobSource"
                  checked={isSelected}
                  onChange={() => onFilterChange('source', opt.id === 'all' ? 'all' : opt.id)}
                  className="border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-white"
                />
                <span className={isSelected ? 'font-bold text-emerald-700' : ''}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
