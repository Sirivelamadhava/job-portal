# CareerSphere — Full Stack MERN Job Portal

An enterprise-grade, modern, and responsive Job Portal Web Application built with the **MERN** stack (MongoDB, Express.js, React.js with Vite, Node.js) and styled with **Tailwind CSS**.

---

## 1. Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │          React 19 + Vite Client          │
                      │   (Tailwind CSS, React Router, Axios)    │
                      └────────────────────┬─────────────────────┘
                                           │
                                  HTTP / JSON (REST)
                             (JWT Bearer Token in Header)
                                           │
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │          Express.js 4 REST API           │
                      │  Helmet, CORS, Rate Limit, Multer, Zod   │
                      └────────────────────┬─────────────────────┘
                                           │
                                    Mongoose ODM
                                           │
                                           ▼
                      ┌──────────────────────────────────────────┐
                      │          MongoDB Persistent DB           │
                      │   Users, Jobs, Applications, Companies   │
                      └──────────────────────────────────────────┘
```

### Three-Tier Role-Based Access Control (RBAC)
1. **Job Seeker**: Discover jobs, advanced filtering, upload PDF resumes, submit applications with duplicate prevention, track statuses, withdraw applications.
2. **Recruiter**: Manage company profile, post vacancies with salary/skills/experience, manage applicants, update application stages, review candidate resumes.
3. **Platform Admin**: Supervise platform, approve/reject recruiters, moderate job postings before public listing, suspend violating accounts, inspect telemetry.

---

## 2. Directory Structure

```text
job-portal/
├── frontend/                     # React + Vite client
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/           # Reusable UI components (Buttons, Badges, Modals, etc.)
│   │   ├── context/              # Authentication & Global state contexts
│   │   ├── hooks/                # Custom React hooks
│   │   ├── layouts/              # Page wrappers (Navbar, Footer, Sidebar layouts)
│   │   ├── pages/                # Public, Seeker, Recruiter, Admin pages
│   │   ├── services/             # Axios API client & endpoints
│   │   ├── utils/                # Formatting, date helpers, constants
│   │   ├── App.jsx               # Root application router & view
│   │   ├── main.jsx              # React DOM entry point
│   │   └── index.css             # Tailwind CSS directives & theme extensions
│   ├── .env                      # Frontend environment configuration
│   ├── .env.example              # Frontend environment example
│   ├── tailwind.config.js        # Tailwind CSS theme configuration
│   ├── postcss.config.js         # PostCSS configuration
│   └── package.json              # Frontend dependencies & scripts
│
├── backend/                      # Node.js + Express REST API
│   ├── config/                   # Database (db.js) and third-party configuration
│   ├── controllers/              # Business logic handlers
│   ├── middleware/               # Auth (JWT), RBAC, ErrorHandler, Multer uploads
│   ├── models/                   # Mongoose schemas (User, Job, Application, Company)
│   ├── routes/                   # RESTful API route definitions
│   ├── services/                 # Shared data services & queries
│   ├── utils/                    # ApiError, ApiResponse, token utilities
│   ├── validators/               # Input validation rules
│   ├── uploads/                  # Local media storage (resumes/ & logos/)
│   ├── .env                      # Backend environment variables
│   ├── .env.example              # Backend environment template
│   ├── server.js                 # Express server bootstrap & middleware pipeline
│   └── package.json              # Backend dependencies & scripts
│
├── .gitignore                    # Git exclusions
├── package.json                  # Workspace orchestrator
└── README.md                     # Documentation
```

---

## 3. Prerequisites

- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0+ running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

---

## 4. Environment Configuration

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/job_portal
JWT_SECRET=job_portal_super_secret_jwt_key_2025_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=5
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Installation & Setup

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Run the Application

In **Terminal 1** (Backend):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

In **Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:5173
```

Alternatively, from the root directory:
```bash
npm run backend   # Starts backend
npm run frontend  # Starts frontend
```

---

## 6. API Endpoints Initialized (Phase 1)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | API Welcome message & docs link | No |
| `GET` | `/api/health` | Service health, MongoDB status, uptime | No |

---

## 7. Implementation Roadmap

- [x] **Phase 1**: Project Initialization, Folder Structure, Tailwind CSS Setup, MongoDB Connection & Diagnostics.
- [ ] **Phase 2**: Database Models (User, Job, Application, Company), JWT Auth, Role-Based Authorization & Input Validation.
- [ ] **Phase 3**: Public Interface (Landing page, Job Search & Filtering, Job Details, UI Components).
- [ ] **Phase 4**: Recruiter Module (Company Profiles, Job Posting/Editing, Admin Approval Workflow).
- [ ] **Phase 5**: Application System (PDF Resume Uploads, Duplicate Application Guard, Recruiter Review Pipeline).
- [ ] **Phase 6**: Role Dashboards (Job Seeker, Recruiter, Admin Dashboards & Platform Telemetry).
- [ ] **Phase 7**: Validation, Security Hardening, Rate Limiting, Loading Skeletons & Responsive Polish.
- [ ] **Phase 8**: End-to-End User Flow Testing & Deployment Preparation.
