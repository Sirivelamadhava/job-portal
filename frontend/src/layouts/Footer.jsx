import React from 'react';
import { Briefcase, Heart, Shield, Code, Server, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Freshers<span className="text-emerald-600">Career</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                  v2.0
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time Fresher IT Job Aggregator connecting zero-experience engineering graduates with verified opportunities across India.
            </p>
          </div>

          {/* Job Seekers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">For Freshers</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><Link to="/jobs" className="hover:text-emerald-600">Browse 0-Exp Jobs</Link></li>
              <li><Link to="/jobs?category=internship" className="hover:text-emerald-600">Tech Internships & PPO</Link></li>
              <li><Link to="/jobs?category=trainee" className="hover:text-emerald-600">Graduate Engineer Trainee</Link></li>
              <li><Link to="/jobs?workplaceType=Remote" className="hover:text-emerald-600">Remote Entry-Level</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">For Employers</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><Link to="/recruiter/jobs/new" className="hover:text-emerald-600">Post a Fresher Opening</Link></li>
              <li><Link to="/recruiter" className="hover:text-emerald-600">Recruiter Dashboard</Link></li>
              <li><Link to="/recruiter/manage-applicants" className="hover:text-emerald-600">Applicant Pipeline</Link></li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform Architecture</h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                <Code className="w-3 h-3 text-indigo-600" />
                <span>React 19</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                <Server className="w-3 h-3 text-emerald-600" />
                <span>Express</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                <Database className="w-3 h-3 text-amber-600" />
                <span>MongoDB</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Zero-Exp Verified</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>&copy; {new Date().getFullYear()} FreshersCareer v2.0. All rights reserved.</span>
          <span>Verified multi-platform IT job aggregator for Indian campus graduates and freshers.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
