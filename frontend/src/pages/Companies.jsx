import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Users, 
  Search, 
  ExternalLink, 
  Briefcase,
  ShieldCheck 
} from 'lucide-react';
import api from '../services/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await api.get('/companies', {
          params: { ...(search && { search }) },
        });
        if (res.data.success) {
          setCompanies(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [search]);

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-4">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Verified Employers</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1">Discover Top Tech Companies</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Explore company cultures, active engineering teams, and open vacancies.
          </p>
        </div>

        {/* Company Search Bar */}
        <div className="max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name, industry, or city..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white text-slate-900 rounded-xl focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card-premium p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
              <div className="h-3 w-full bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company._id}
              className="card-premium p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center text-indigo-700 font-extrabold text-xl shadow-xs group-hover:scale-105 transition-transform">
                    {company.companyName.charAt(0)}
                  </div>
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Verified</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {company.companyName}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span>{company.industry || 'Technology'}</span>
                    <span>&bull;</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{company.location || 'United States'}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {company.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-semibold text-indigo-600">
                  {company.activeJobsCount || 1} Open Opportunities
                </div>
                <Link
                  to={`/jobs?search=${encodeURIComponent(company.companyName)}`}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  View Openings
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
