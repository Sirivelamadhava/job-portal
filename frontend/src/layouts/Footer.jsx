import React from 'react';
import { Briefcase, Heart, Shield, Code, Server, Database } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Career<span className="text-indigo-600">Sphere</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Modern full-stack job platform connecting high-growth companies with skilled professionals worldwide.
            </p>
          </div>

          {/* Job Seekers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">For Job Seekers</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><Link to="/" className="hover:text-indigo-600">Browse Jobs</Link></li>
              <li><Link to="/register" className="hover:text-indigo-600">Upload Resume</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Job Alerts</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Application Status</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">For Employers</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><Link to="/register" className="hover:text-indigo-600">Post a Job Opening</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Talent Search</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Recruiter Dashboard</Link></li>
              <li><Link to="/login" className="hover:text-indigo-600">Hiring Pipeline</Link></li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform Stack</h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                <Code className="w-3 h-3 text-indigo-500" />
                <span>React 19</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                <Server className="w-3 h-3 text-emerald-500" />
                <span>Express</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                <Database className="w-3 h-3 text-amber-500" />
                <span>MongoDB</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                <Shield className="w-3 h-3 text-purple-500" />
                <span>JWT RBAC</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>&copy; {new Date().getFullYear()} CareerSphere. All rights reserved.</span>
          <span>Designed with production-grade security, authentication, and role authorization.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
