import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import Home from './pages/Home';
import BrowseJobs from './pages/BrowseJobs';
import JobDetails from './pages/JobDetails';
import Companies from './pages/Companies';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

// Recruiter Module
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJob from './pages/recruiter/PostJob';
import EditJob from './pages/recruiter/EditJob';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import ManageApplicants from './pages/recruiter/ManageApplicants';


// Admin Module
import AdminDashboard from './pages/admin/AdminDashboard';

// Job Seeker Module
import JobSeekerDashboard from './pages/jobseeker/JobSeekerDashboard';


function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<BrowseJobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Job Seeker Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['job_seeker', 'admin']}>
                    <JobSeekerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Protected Routes */}
              <Route
                path="/recruiter"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/new"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <PostJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/jobs/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <EditJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/profile"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <CompanyProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recruiter/applicants"
                element={
                  <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                    <ManageApplicants />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="py-20 text-center space-y-4">
                    <h2 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h2>
                    <p className="text-sm text-slate-500">The requested page does not exist on CareerSphere.</p>
                    <Link to="/" className="btn-primary text-xs py-2 px-4">
                      Return to Home
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
