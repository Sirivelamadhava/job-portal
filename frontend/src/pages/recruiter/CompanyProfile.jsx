import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import api from '../../services/api';

const industries = [
  'Software & Technology',
  'Artificial Intelligence',
  'Cloud Computing & DevOps',
  'Design & Creative Tech',
  'Financial Technology',
  'Healthcare & Biotech',
  'E-Commerce & Retail',
];

const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];

const CompanyProfile = () => {
  const { user } = useAuth();

  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    description: '',
    location: '',
    industry: 'Software & Technology',
    companySize: '11-50',
    logo: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await api.get('/companies/my/profile');
        if (res.data.success) {
          const comp = res.data.data;
          setCompany(comp);
          setFormData({
            companyName: comp.companyName || '',
            website: comp.website || '',
            description: comp.description || '',
            location: comp.location || '',
            industry: comp.industry || 'Software & Technology',
            companySize: comp.companySize || '11-50',
            logo: comp.logo || '',
          });
          if (comp.logo) setLogoPreview(comp.logo);
        }
      } catch (err) {
        console.error('Error fetching company profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));

    // Upload immediately
    const form = new FormData();
    form.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = await api.post('/companies/my/logo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setFormData((prev) => ({ ...prev, logo: res.data.data.logoUrl }));
        setMessage('Logo uploaded successfully.');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await api.put('/companies/my/profile', formData);
      if (res.data.success) {
        setCompany(res.data.data);
        setMessage('Company profile updated successfully.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save company profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading employer profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/recruiter"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 capitalize">
          Status: {company?.status || 'Active'}
        </span>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Company Profile & Branding</h1>
        <p className="text-xs text-slate-500">
          Manage your organization details, brand presence, and public recruitment profile.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-premium p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        {/* Logo Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 block">Company Logo</span>
            <p className="text-[11px] text-slate-400">Square PNG, WEBP, or SVG recommended. Max 3MB.</p>
            <label className="btn-secondary text-xs py-1.5 px-3.5 inline-flex items-center space-x-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoSelect} />
            </label>
          </div>
        </div>

        {/* Company Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Official Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://company.example.com"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Industry
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Company Size
            </label>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {companySizes.map((sz) => (
                <option key={sz} value={sz}>{sz} employees</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Headquarters / Primary Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="San Francisco, CA"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            About the Company
          </label>
          <textarea
            rows="5"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Tell candidates about your company mission, culture, and products..."
            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          ></textarea>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md shadow-indigo-100 flex items-center space-x-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{saving ? 'Saving...' : 'Save Company Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
