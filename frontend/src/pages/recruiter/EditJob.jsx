import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  MapPin, 
  ArrowLeft, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles 
} from 'lucide-react';
import api from '../../services/api';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [responsibilities, setResponsibilities] = useState([]);
  const [respInput, setRespInput] = useState('');
  const [qualifications, setQualifications] = useState([]);
  const [qualInput, setQualInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.data.success) {
          const j = res.data.data.job;
          setFormData({
            title: j.title,
            location: j.location,
            workplaceType: j.workplaceType,
            employmentType: j.employmentType,
            experienceLevel: j.experienceLevel,
            salaryMin: j.salaryMin,
            salaryMax: j.salaryMax,
            openings: j.openings,
            deadline: new Date(j.deadline).toISOString().split('T')[0],
            applicationMethod: j.applicationMethod,
            externalUrl: j.externalUrl || '',
            description: j.description,
            status: j.status,
          });
          setSkills(j.skills || []);
          setResponsibilities(j.responsibilities || []);
          setQualifications(j.qualifications || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (s) => setSkills(skills.filter((x) => x !== s));

  const handleAddResponsibility = (e) => {
    e.preventDefault();
    if (respInput.trim()) {
      setResponsibilities([...responsibilities, respInput.trim()]);
      setRespInput('');
    }
  };

  const handleRemoveResponsibility = (idx) =>
    setResponsibilities(responsibilities.filter((_, i) => i !== idx));

  const handleAddQualification = (e) => {
    e.preventDefault();
    if (qualInput.trim()) {
      setQualifications([...qualifications, qualInput.trim()]);
      setQualInput('');
    }
  };

  const handleRemoveQualification = (idx) =>
    setQualifications(qualifications.filter((_, i) => i !== idx));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...formData,
      skills,
      responsibilities,
      qualifications,
    };

    try {
      const res = await api.put(`/jobs/${id}`, payload);
      if (res.data.success) {
        navigate('/recruiter');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job vacancy.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 mt-2 font-medium">Loading position for editing...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="py-12 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-xs text-slate-600">Could not find job posting.</p>
        <Link to="/recruiter" className="btn-secondary text-xs py-1.5 px-3">Return to Dashboard</Link>
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
          <span>Back to Recruiter Dashboard</span>
        </Link>
        <span className="text-xs text-slate-400">
          Editing: <strong className="text-slate-800">{formData.title}</strong>
        </span>
      </div>

      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Job Opening</h1>
        <p className="text-xs text-slate-500">Update parameters, description, or requirements.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="card-premium p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Workplace Type
            </label>
            <select
              name="workplaceType"
              value={formData.workplaceType}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
            >
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Min Salary (USD)
            </label>
            <input
              type="number"
              name="salaryMin"
              value={formData.salaryMin}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Max Salary (USD)
            </label>
            <input
              type="number"
              name="salaryMax"
              value={formData.salaryMax}
              onChange={handleChange}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Job Description
          </label>
          <textarea
            rows="5"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Required Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skill tag..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
            />
            <button onClick={handleAddSkill} className="btn-secondary text-xs px-4 py-2 font-semibold">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 flex items-center space-x-1">
                <span>{s}</span>
                <button type="button" onClick={() => handleRemoveSkill(s)}><X className="w-3.5 h-3.5 ml-1" /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <Link to="/recruiter" className="btn-secondary text-xs py-2.5 px-5">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2.5 px-6 font-bold shadow-md shadow-indigo-100 flex items-center space-x-1.5"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{saving ? 'Saving...' : 'Save Job Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
