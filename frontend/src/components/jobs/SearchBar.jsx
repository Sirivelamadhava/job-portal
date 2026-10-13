import React, { useState } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';

const SearchBar = ({ 
  initialSearch = '', 
  initialLocation = '', 
  onSearch, 
  variant = 'default' 
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search, location });
    }
  };

  const isHero = variant === 'hero';

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full bg-white rounded-2xl border border-slate-200/90 shadow-lg ${
        isHero ? 'p-2 sm:p-2.5 shadow-indigo-100/60' : 'p-1.5 shadow-xs'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Keyword Search */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, tech stack (e.g. React, Node.js), or company"
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:bg-slate-50 transition-colors"
          />
        </div>

        {/* Separator */}
        <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

        {/* Location Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, state, or 'Remote'"
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl focus:outline-none focus:bg-slate-50 transition-colors"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary py-2.5 px-6 font-semibold shadow-md shadow-indigo-100 flex items-center justify-center space-x-2 shrink-0"
        >
          <span>Find Jobs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
