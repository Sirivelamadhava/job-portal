import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  User, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  Menu, 
  X,
  Zap,
  ChevronDown 
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'recruiter') return '/recruiter';
    return '/dashboard';
  };

  const displayName = user?.name || 'Madhava';
  const roleLabel = role === 'admin' ? 'ADMIN' : (role === 'recruiter' ? 'RECRUITER' : 'JOB SEEKER');

  return (
    <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/90 text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-6 sm:space-x-8">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  Freshers<span className="text-emerald-600">Career</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                  v2.0
                </span>
              </div>
            </Link>

            {/* Nav capsules */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/jobs"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 flex items-center space-x-1.5 shadow-2xs hover:bg-emerald-100 transition-all"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>Explore Jobs</span>
              </Link>

              <Link
                to={getDashboardPath()}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 transition-colors rounded-lg hover:bg-slate-100"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/companies"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
              >
                Companies
              </Link>
            </div>
          </div>

          {/* Right User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* User capsule: [JOB SEEKER] Madhava -> */}
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-full py-1 px-3 shadow-2xs">
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                  {isAuthenticated ? roleLabel : 'JOB SEEKER'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {displayName}
                </span>
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                    title="Sign In"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200"
          >
            Explore Jobs
          </Link>

          <Link
            to={getDashboardPath()}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Dashboard
          </Link>

          <Link
            to="/companies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Companies
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="px-3 py-1 text-xs text-slate-500">
                Signed in as <span className="font-bold text-slate-900">{displayName}</span> ({roleLabel})
              </div>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 flex space-x-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-bold bg-slate-100 text-slate-800 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-1/2 text-center py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
