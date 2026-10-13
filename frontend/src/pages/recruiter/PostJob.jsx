import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  X,
  Calendar,
  Layers,
  Sparkles 
} from 'lucide-react';
import api from '../../services/api';

const workplaceTypes = [
  { id: 'remote', label: 'Remote', desc: 'Work from anywhere' },
  { id: 'hybrid', label: 'Hybrid', desc: 'Mix of office and remote' },
  { id: 'on-site', label: 'On-site', desc: 'Physical office location' },
];

const employmentTypes = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'internship', label: 'Internship' },
];

const experienceLevels = [
  { id: 'entry', label: 'Entry Level (0-2 yrs)' },
  { id: 'mid', label: 'Mid Level (2-5 yrs)' },
  { id: 'senior', label: 'Senior Level (5+ yrs)' },
  { id: 'lead', label: 'Lead / Principal' },
  { id: 'executive', label: 'Executive' },
];

const PostJob = () => {
  const navigate = useNavigate();
  const { user, company } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    location: company?.location || 'San Francisco, CA',
    workplaceType: 'remote',
    employmentType: 'full-time',
    experienceLevel: 'mid',
    salaryMin: 90000,
    salaryMax: 130000,
    openings: 1,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    applicationMethod: 'platform',
    externalUrl: '',
    description: '',
  });

  const [skills, setSkills] = useState(['React.js', 'Node.js', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');

  const [responsibilities, setResponsibilities] = useState([
    'Design and develop high-throughput, reliable software components.',
    'Collaborate closely with cross-functional product and design teams.',
  ]);
  const [respInput, setRespInput] = useState('');

  const [qualifications, setQualifications] = useState([
    'Demonstrated track record with modern full-stack web technologies.',
    'Strong analytical problem-solving and proactive communication skills.',
  ]);
  const [qualInput, setQualInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddResponsibility = (e) => {
    e.preventDefault();
    if (respInput.trim()) {
      setResponsibilities([...responsibilities, respInput.trim()]);
      setRespInput('');
    }
  };

  const handleRemoveResponsibility = (index) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleAddQualification = (e) => {
    e.preventDefault();
    if (qualInput.trim()) {
      setQualifications([...qualifications, qualInput.trim()]);
      setQualInput('');
    }
  };

  const handleRemoveQualification = (index) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (statusChoice) => {
    if (!formData.title.trim()) {
      setError('Please provide a job title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a detailed job description.');
      return;
    }
    if (skills.length === 0) {
      setError('Please specify at least one required skill.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      skills,
      responsibilities,
      qualifications,
      status: statusChoice, // 'draft' or 'pending_approval'
    };

    try {
      const res = await api.post('/jobs', payload);
      if (res.data.success) {
        navigate('/recruiter', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit job posting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/recruiter"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recruiter Dashboard</span>
        </Link>
        <span className="text-xs text-slate-400">
          Posting for: <strong className="text-slate-800">{company?.companyName || 'Your Company'}</strong>
        </span>
      </div>

      {/* Form Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
        <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vacancy Creation Wizard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Post a New Position
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Provide complete details to attract qualified candidates. Submissions are reviewed by platform admins before publication.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-800 text-xs font-semibold animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Job Creation Form */}
      <div className="card-premium p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Role Title & Location
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Full-Stack Engineer (React, Node.js)"
                className="w-full text-sm p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary Location *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="San Francisco, CA or Remote"
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Openings Count
              </label>
              <input
                type="number"
                name="openings"
                min="1"
                value={formData.openings}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Workplace Type Pills */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Workplace Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {workplaceTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, workplaceType: type.id })}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    formData.workplaceType === type.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 capitalize">{type.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Compensation & Logistics */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Compensation & Requirements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
              >
                {employmentTypes.map((et) => (
                  <option key={et.id} value={et.id}>{et.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize"
              >
                {experienceLevels.map((el) => (
                  <option key={el.id} value={el.id}>{el.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Min Salary (USD/yr)
              </label>
              <input
                type="number"
                name="salaryMin"
                step="5000"
                value={formData.salaryMin}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Max Salary (USD/yr)
              </label>
              <input
                type="number"
                name="salaryMax"
                step="5000"
                value={formData.salaryMax}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Application Method
              </label>
              <select
                name="applicationMethod"
                value={formData.applicationMethod}
                onChange={handleChange}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="platform">CareerSphere One-Click Portal</option>
                <option value="external">External Company Portal URL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Skills Builder */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Required Tech Stack & Skills
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add skill (e.g. React.js, GraphQL, Docker, PyTorch)..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
            />
            <button
              onClick={handleAddSkill}
              className="btn-secondary text-xs px-4 py-2 font-semibold"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-400 hover:text-indigo-600 focus:outline-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Section 4: Description */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Role Description & Objectives
          </h2>

          <div>
            <textarea
              rows="6"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the mission, team structure, and overall responsibilities of this opening..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            ></textarea>
          </div>
        </div>

        {/* Section 5: Responsibilities Bullet Points */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            5. Key Responsibilities
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={respInput}
              onChange={(e) => setRespInput(e.target.value)}
              placeholder="Add specific responsibility..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddResponsibility(e)}
            />
            <button
              onClick={handleAddResponsibility}
              className="btn-secondary text-xs px-4 py-2 font-semibold"
            >
              Add Item
            </button>
          </div>

          <ul className="space-y-2 pt-1">
            {responsibilities.map((resp, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
              >
                <span>{resp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveResponsibility(i)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 6: Qualifications Bullet Points */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            6. Requirements & Qualifications
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={qualInput}
              onChange={(e) => setQualInput(e.target.value)}
              placeholder="Add requirement or qualification..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAddQualification(e)}
            />
            <button
              onClick={handleAddQualification}
              className="btn-secondary text-xs px-4 py-2 font-semibold"
            >
              Add Item
            </button>
          </div>

          <ul className="space-y-2 pt-1">
            {qualifications.map((qual, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
              >
                <span>{qual}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveQualification(i)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Submission Actions */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('draft')}
            className="w-full sm:w-auto btn-secondary text-xs py-2.5 px-6 font-semibold"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit('pending_approval')}
            className="w-full sm:w-auto btn-primary text-xs py-2.5 px-6 font-bold shadow-md shadow-indigo-100 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting vacancy...</span>
              </>
            ) : (
              <span>Submit for Admin Approval &rarr;</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
