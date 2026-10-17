import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Code, 
  Cpu, 
  Cloud, 
  Palette, 
  Compass, 
  Database,
  ArrowUpRight
} from 'lucide-react';
import SearchBar from '../components/jobs/SearchBar';
import JobCard from '../components/ui/JobCard';
import JobCardSkeleton from '../components/ui/JobCardSkeleton';
import api from '../services/api';

const iconMap = {
  Code,
  Cpu,
  Cloud,
  Palette,
  Compass,
  Database,
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [jobsRes, catRes, compRes] = await Promise.all([
          api.get('/jobs/featured'),
          api.get('/jobs/categories'),
          api.get('/companies?limit=4'),
        ]);

        if (jobsRes.data.success) setFeaturedJobs(jobsRes.data.data);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (compRes.data.success) setCompanies(compRes.data.data);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleHeroSearch = ({ search, location }) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-20 py-8">
      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4 pb-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-Time 0-Years Work Experience IT Job Aggregator</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
          Find Your First IT Job — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">All in One Place</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Discover entry-level IT jobs and fresher opportunities from multiple job platforms.
        </p>

        {/* Hero Search Bar */}
        <div className="pt-2 max-w-3xl mx-auto">
          <SearchBar onSearch={handleHeroSearch} variant="hero" />
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Popular Fresher Searches:</span>
          {['Software Developer Fresher', 'Junior React.js', 'Associate Software Engineer', 'Graduate Trainee (GET)', 'QA Tester Fresher', 'Python Developer Fresher'].map((tag, idx) => (
            <button
              key={idx}
              onClick={() => handleHeroSearch({ search: tag, location: '' })}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-2xs font-medium"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Platform Telemetry Metrics */}
      <section className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-center">
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">1,500+</div>
            <div className="text-xs font-medium text-slate-500">Verified Vacancies</div>
          </div>
          <div className="space-y-1 sm:border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">450+</div>
            <div className="text-xs font-medium text-slate-500">Vetted Tech Companies</div>
          </div>
          <div className="space-y-1 border-r border-slate-100 last:border-none">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">98%</div>
            <div className="text-xs font-medium text-slate-500">Application Response Rate</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">$140k</div>
            <div className="text-xs font-medium text-slate-500">Average Tech Base Salary</div>
          </div>
        </div>
      </section>

      {/* 3. Popular Job Categories */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Explore by Category</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Browse high-growth roles in trending sectors</p>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>Browse All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Briefcase;
            return (
              <div
                key={cat.id}
                onClick={() => handleHeroSearch({ search: cat.name, location: '' })}
                className="card-premium p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white text-indigo-600 flex items-center justify-center transition-colors shadow-2xs">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{cat.openingsCount} Openings</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Featured Job Openings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Handpicked by our team</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Job Openings</h2>
          </div>
          <Link
            to="/jobs"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <JobCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* 5. How It Works Section */}
      <section className="card-premium p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Streamlined Hiring Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How FreshersCareer Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A transparent and efficient path for candidates and hiring managers alike.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-lg flex items-center justify-center mx-auto sm:mx-0 shadow-2xs">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">Create & Verify Profile</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign up as a Job Seeker or Recruiter. Upload your verified PDF resume, add technical skills, or verify your company profile.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 font-extrabold text-lg flex items-center justify-center mx-auto sm:mx-0 shadow-2xs">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Explore & Match Fast</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter by salary range, experience level, and workplace preference. One-click apply with duplicate application prevention.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 font-extrabold text-lg flex items-center justify-center mx-auto sm:mx-0 shadow-2xs">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Track & Get Hired</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time application status updates from "Reviewed" to "Shortlisted" and "Accepted". Transparent communication throughout.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Top Companies Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Top Companies Hiring Now</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Discover verified companies with high employee satisfaction</p>
          </div>
          <Link
            to="/companies"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
          >
            <span>View All Companies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {companies.map((comp) => (
            <Link
              key={comp._id}
              to={`/companies`}
              className="card-premium p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-800 font-bold text-lg group-hover:scale-105 transition-transform">
                  {comp.companyName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {comp.companyName}
                  </h3>
                  <p className="text-xs text-slate-500">{comp.industry}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{comp.location || 'United States'}</span>
                <span className="font-semibold text-indigo-600">{comp.activeJobsCount || 1} open jobs</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Dual Call to Action */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-4 shadow-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">For Candidates</span>
          <h3 className="text-2xl font-bold leading-tight">Ready to take the next leap in your career?</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create your profile, upload your resume in PDF format, and receive direct interviews from verified hiring managers.
          </p>
          <div className="pt-2">
            <Link to="/register" className="btn-primary bg-indigo-500 hover:bg-indigo-600 text-xs py-2.5 px-5">
              <span>Sign Up as Candidate</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-slate-900 space-y-4 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">For Employers</span>
          <h3 className="text-2xl font-bold leading-tight">Hiring elite software engineers & designers?</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Post vacancies, manage candidates in a streamlined pipeline, and discover talent actively seeking your tech stack.
          </p>
          <div className="pt-2">
            <Link to="/register" className="btn-secondary text-xs py-2.5 px-5 font-semibold">
              <span>Post a Job Opening</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
