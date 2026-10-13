import React from 'react';
import { Filter, RotateCcw, Check } from 'lucide-react';

const workplaceOptions = [
  { id: 'remote', label: 'Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'on-site', label: 'On-site' },
];

const employmentOptions = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
];

const experienceOptions = [
  { id: 'entry', label: 'Entry Level (0-2 yrs)' },
  { id: 'mid', label: 'Mid Level (2-5 yrs)' },
  { id: 'senior', label: 'Senior (5+ yrs)' },
  { id: 'lead', label: 'Lead / Principal' },
];

const salaryRanges = [
  { label: 'Any salary', value: 0 },
  { label: '$60,000+ / yr', value: 60000 },
  { label: '$100,000+ / yr', value: 100000 },
  { label: '$130,000+ / yr', value: 130000 },
  { label: '$160,000+ / yr', value: 160000 },
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

  const handleSalaryChange = (value) => {
    onFilterChange('minSalary', value);
  };

  const activeFiltersCount =
    (filters.workplaceType?.length || 0) +
    (filters.employmentType?.length || 0) +
    (filters.experienceLevel?.length || 0) +
    (filters.minSalary > 0 ? 1 : 0);

  return (
    <aside className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Filter Jobs</h3>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={onResetFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Workplace Type */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Workplace Type
        </h4>
        <div className="space-y-2">
          {workplaceOptions.map((opt) => {
            const isChecked = filters.workplaceType?.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-indigo-600"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('workplaceType', opt.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 transition-colors"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Employment Type */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Employment Type
        </h4>
        <div className="space-y-2">
          {employmentOptions.map((opt) => {
            const isChecked = filters.employmentType?.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-indigo-600"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('employmentType', opt.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 transition-colors"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Experience Level
        </h4>
        <div className="space-y-2">
          {experienceOptions.map((opt) => {
            const isChecked = filters.experienceLevel?.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-indigo-600"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArrayFilter('experienceLevel', opt.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 transition-colors"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Minimum Salary */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Minimum Salary
        </h4>
        <div className="space-y-2">
          {salaryRanges.map((sal) => {
            const isSelected = (filters.minSalary || 0) === sal.value;
            return (
              <label
                key={sal.value}
                className="flex items-center space-x-2.5 text-xs text-slate-700 cursor-pointer select-none hover:text-indigo-600"
              >
                <input
                  type="radio"
                  name="minSalary"
                  checked={isSelected}
                  onChange={() => handleSalaryChange(sal.value)}
                  className="border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 transition-colors"
                />
                <span className={isSelected ? 'font-bold text-indigo-700' : ''}>
                  {sal.label}
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
