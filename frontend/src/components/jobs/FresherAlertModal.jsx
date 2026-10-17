import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  Briefcase, 
  MapPin, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AVAILABLE_ROLES = [
  'Software Developer',
  'Frontend Developer',
  'React.js Developer',
  'Backend Developer',
  'Python Developer',
  'Java Developer',
  'QA Tester / QA Trainee',
  'Data Analyst Fresher',
  'Graduate Engineer Trainee',
  'Associate Software Engineer',
];

const AVAILABLE_LOCATIONS = [
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Mumbai',
  'Delhi NCR',
  'Remote',
];

const AVAILABLE_MODES = [
  { id: 'remote', label: '100% Remote' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'on-site', label: 'On-site Office' },
];

const AVAILABLE_CATEGORIES = [
  { id: 'fulltime_fresher', label: 'Full-Time Fresher' },
  { id: 'internship', label: 'Tech Internships' },
  { id: 'trainee', label: 'Graduate Trainee (GET)' },
  { id: 'remote_entry', label: 'Remote Entry-Level' },
];

const FresherAlertModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [email, setEmail] = useState(user?.email || '');
  const [selectedRoles, setSelectedRoles] = useState([
    'Software Developer',
    'Frontend Developer',
    'React.js Developer',
  ]);
  const [selectedLocations, setSelectedLocations] = useState(['Bengaluru', 'Hyderabad', 'Remote']);
  const [selectedModes, setSelectedModes] = useState(['remote', 'hybrid', 'on-site']);
  const [selectedCategories, setSelectedCategories] = useState([
    'fulltime_fresher',
    'internship',
    'trainee',
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      if (list.length > 1) {
        setList(list.filter((i) => i !== item));
      }
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/jobs/aggregated/alerts', {
        email: email.trim(),
        name: user?.name || 'Fresher Candidate',
        roles: selectedRoles,
        preferredLocations: selectedLocations,
        workModes: selectedModes,
        categories: selectedCategories,
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set up daily alerts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden relative text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-100 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Daily 6:00 AM IST Notifications</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            Subscribe to Fresher IT Job Alerts
          </h3>
          <p className="text-xs text-emerald-50 mt-1">
            Get genuine entry-level openings and internships from LinkedIn, Naukri, Indeed, and partner feeds delivered right to your inbox every morning.
          </p>
        </div>

        {/* Content Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Subscription Active!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              We'll scan all configured job providers daily and email you verified 0-experience IT jobs every morning at <strong>6:00 AM IST</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Your Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field text-xs py-2.5"
              />
            </div>

            {/* Target IT Roles */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Target Roles (Select at least 1)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {AVAILABLE_ROLES.map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <button
                      type="button"
                      key={role}
                      onClick={() => toggleItem(selectedRoles, setSelectedRoles, role)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferred Locations */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferred Indian IT Hubs & Remote</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocations.includes(loc);
                  return (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => toggleItem(selectedLocations, setSelectedLocations, loc)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Mode & Opportunity Type */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Work Mode</label>
                <div className="space-y-1">
                  {AVAILABLE_MODES.map((mode) => (
                    <label key={mode.id} className="flex items-center space-x-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedModes.includes(mode.id)}
                        onChange={() => toggleItem(selectedModes, setSelectedModes, mode.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <span>{mode.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Opportunity Type</label>
                <div className="space-y-1">
                  {AVAILABLE_CATEGORIES.map((cat) => (
                    <label key={cat.id} className="flex items-center space-x-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => toggleItem(selectedCategories, setSelectedCategories, cat.id)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2 px-5 text-xs font-bold inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Activating Alert...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Get Daily Fresher Alerts</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FresherAlertModal;
