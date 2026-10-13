import React from 'react';
import { Briefcase, ShieldCheck, Zap, Users, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Our Mission & Values
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Democratizing Access to Meaningful Tech Careers
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          CareerSphere was founded on a simple principle: recruitment should be transparent, data-driven, and focused on genuine engineering capability.
        </p>
      </section>

      {/* Pillars Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-8 rounded-3xl bg-white border border-slate-200/90 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">100% Vetted Positions</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Every recruiter and vacancy goes through automated validation and administrative moderation before entering the public directory.
          </p>
        </div>

        <div className="card-premium p-8 rounded-3xl bg-white border border-slate-200/90 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Direct Recruiter Feedback</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Eliminate the resume black hole. Track real-time status changes with instant notification from hiring managers.
          </p>
        </div>

        <div className="card-premium p-8 rounded-3xl bg-white border border-slate-200/90 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Remote-First Opportunities</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Access global distributed engineering teams offering competitive equity, modern stacks, and flexible work cultures.
          </p>
        </div>
      </section>

      {/* Call to action */}
      <section className="p-10 rounded-3xl bg-slate-900 text-white text-center space-y-4 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Join the CareerSphere Community</h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Whether you're looking for your next challenge or building your dream engineering team, we're here to help.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/register" className="btn-primary py-2.5 px-6 text-xs">
            Get Started Today
          </Link>
          <Link to="/jobs" className="btn-secondary py-2.5 px-6 text-xs bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
            Browse All Vacancies
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
