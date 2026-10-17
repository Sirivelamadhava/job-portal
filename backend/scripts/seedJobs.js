require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const connectDB = require('../config/db');

const seedJobs = async () => {
  try {
    await connectDB();
    console.log('[Seed Jobs] Connected to database...');

    // Companies from NexHire IT Aggregator
    const companiesSeed = [
      {
        recruiterEmail: 'careers@google.co.in',
        recruiterName: 'Siddharth Rao',
        companyName: 'Google India',
        website: 'https://careers.google.com',
        description: 'Google India engineering innovation hub building world-class distributed cloud systems, Android, Search, and AI platforms.',
        location: 'Bellandur, Outer Ring Road, Bangalore, Karnataka',
        industry: 'Software & Technology',
        companySize: '500+',
      },
      {
        recruiterEmail: 'talent@flipkart.com',
        recruiterName: 'Sneha Patel',
        companyName: 'Flipkart',
        website: 'https://www.flipkartcareers.com',
        description: "India's premier e-commerce ecosystem empowering millions of shoppers with scalable distributed retail technologies.",
        location: 'Whitefield, ITPL Zone, Bangalore, Karnataka',
        industry: 'E-Commerce & Tech',
        companySize: '500+',
      },
      {
        recruiterEmail: 'campus@zeptonow.com',
        recruiterName: 'Arjun Mehta',
        companyName: 'Zepto',
        website: 'https://www.zeptonow.com/careers',
        description: 'Rapidly growing quick-commerce platform solving ultra-fast supply chain logistics with real-time distributed microservices.',
        location: 'HITEC City, Cyber Towers, Hyderabad, Telangana',
        industry: 'Quick Commerce & Logistics',
        companySize: '201-500',
      },
      {
        recruiterEmail: 'university@razorpay.com',
        recruiterName: 'Priya Iyer',
        companyName: 'Razorpay',
        website: 'https://razorpay.com/jobs',
        description: 'Fintech unicorn powering digital payments, neo-banking, and AI fraud prevention systems for millions of businesses.',
        location: 'Hinjawadi Rajiv Gandhi Infotech Park, Pune, Maharashtra',
        industry: 'FinTech & Payments',
        companySize: '500+',
      },
      {
        recruiterEmail: 'tech@zerodha.com',
        recruiterName: 'Naveen Kumar',
        companyName: 'Zerodha',
        website: 'https://zerodha.com/careers',
        description: "India's biggest stock broking and financial technology ecosystem built on open-source, high-frequency low-latency architectures.",
        location: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra',
        industry: 'Financial Technology',
        companySize: '201-500',
      },
      {
        recruiterEmail: 'careers@urbancompany.com',
        recruiterName: 'Divya Nair',
        companyName: 'Urban Company',
        website: 'https://www.urbancompany.com/careers',
        description: 'Global home services platform engineering mobile-first marketplace technologies across India, UAE, and Singapore.',
        location: 'Bellandur, Outer Ring Road, Bangalore, Karnataka',
        industry: 'Consumer Internet & Services',
        companySize: '500+',
      },
      {
        recruiterEmail: 'recruiter.blr@innovatetech.in',
        recruiterName: 'Ananya Sharma',
        companyName: 'InnovateTech India',
        website: 'https://innovatetech.in',
        description: 'InnovateTech is a high-growth Indian software product studio building enterprise cloud microservices and scalable SaaS platforms.',
        location: 'Bengaluru, Karnataka',
        industry: 'Software & Technology',
        companySize: '201-500',
      },
      {
        recruiterEmail: 'campus.hiring@cloudscale.in',
        recruiterName: 'Rajesh Varma',
        companyName: 'CloudScale Technologies',
        website: 'https://cloudscale.in',
        description: 'Leading cloud enablement, DevOps automation, and distributed systems partner for global tech leaders with centers in Hyderabad and Bengaluru.',
        location: 'Hyderabad, Telangana',
        industry: 'Cloud Computing & DevOps',
        companySize: '500+',
      },
    ];

    const companyMap = {};

    for (const item of companiesSeed) {
      let recruiter = await User.findOne({ email: item.recruiterEmail });
      if (!recruiter) {
        recruiter = new User({
          name: item.recruiterName,
          email: item.recruiterEmail,
          password: 'Password@123',
          role: 'recruiter',
          headline: `University Recruiting Lead at ${item.companyName}`,
          location: item.location,
        });
        await recruiter.save();
      }

      let company = await Company.findOne({ user: recruiter._id });
      if (!company) {
        company = new Company({
          user: recruiter._id,
          companyName: item.companyName,
          website: item.website,
          description: item.description,
          location: item.location,
          industry: item.industry,
          companySize: item.companySize,
          status: 'approved',
          approvedAt: new Date(),
        });
        await company.save();
      } else {
        company.status = 'approved';
        company.website = item.website;
        await company.save();
      }

      recruiter.company = company._id;
      await recruiter.save();

      companyMap[item.companyName] = { company, recruiter };
    }

    // Clean previous jobs to ensure fresh state
    await Job.deleteMany({});
    console.log('[Seed Jobs] Reset jobs collection for NexHire Fresher IT roles.');

    const futureDeadline = new Date();
    futureDeadline.setDate(futureDeadline.getDate() + 45);

    const fresherJobsData = [
      {
        title: 'Software Engineering Intern (Summer / Winter 2026)',
        companyName: 'Google India',
        company: companyMap['Google India'].company._id,
        recruiter: companyMap['Google India'].recruiter._id,
        location: 'Bellandur, Outer Ring Road, Bangalore, Karnataka',
        workplaceType: 'hybrid',
        employmentType: 'internship',
        experienceLevel: 'entry',
        salaryMin: 45000,
        salaryMax: 80000,
        currency: 'INR',
        salaryPeriod: 'monthly',
        skills: ['Data Structures & Algorithms', 'Python / C++', 'JavaScript', 'Problem Solving', 'Git'],
        openings: 25,
        sourcePlatform: 'Unstop',
        officialCareerSiteUrl: 'https://careers.google.com',
        hasPPO: true,
        minQualification: 'B.Tech / B.E. / MCA (Student / Graduate)',
        externalUrl: 'https://unstop.com/internships/google-software-internship-2026',
        description: `Collaborate with senior engineering mentors to design scalable backend microservices, high-performance distributed systems, and real-time APIs. Open to pre-final and final year B.Tech/BE/MCA students. Verified official internship opportunity at Google India (Bangalore). Duration: 3-6 Months. Stipend: ₹45,000 - ₹80,000 / month + PPO. High conversion rate to Full-Time Employee (PPO) based on performance. Apply directly via Unstop or explore Google India's official portal (https://careers.google.com). 🎓 Minimum Qualification: B.Tech / B.E. / MCA (Student / Graduate).`,
        responsibilities: [
          'Design, test, deploy, and maintain software solutions across distributed systems.',
          'Manage individual project priorities, deadlines, and deliverables with senior engineers.',
          'Write high-quality, production-ready code with comprehensive test coverage.',
        ],
        qualifications: [
          'B.Tech / B.E. / MCA (Student / Graduate) graduating in 2025 or 2026.',
          '0 years experience (Internship opportunity).',
          'Solid fundamentals in Data Structures, Algorithms, and System Design.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 1250,
        applicationsCount: 84,
      },
      {
        title: 'Frontend Developer Intern (React / Next.js)',
        companyName: 'Flipkart',
        company: companyMap['Flipkart'].company._id,
        recruiter: companyMap['Flipkart'].recruiter._id,
        location: 'Whitefield, ITPL Zone, Bangalore, Karnataka',
        workplaceType: 'hybrid',
        employmentType: 'internship',
        experienceLevel: 'entry',
        salaryMin: 35000,
        salaryMax: 60000,
        currency: 'INR',
        salaryPeriod: 'monthly',
        skills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit'],
        openings: 18,
        sourcePlatform: 'LinkedIn',
        officialCareerSiteUrl: 'https://www.flipkartcareers.com',
        hasPPO: true,
        minQualification: 'B.Tech / B.E. / MCA (Student / Graduate)',
        externalUrl: 'https://www.linkedin.com/jobs/view/flipkart-frontend-intern-2026',
        description: `Build pixel-perfect, responsive web interfaces and design system components. Work with UX designers and backend engineers to craft fluid user journeys. Verified official internship opportunity at Flipkart (Bangalore). Duration: 3-6 Months. Stipend: ₹35,000 - ₹60,000 / month + PPO. High conversion rate to Full-Time Employee (PPO) based on performance. Apply directly via LinkedIn or explore Flipkart's official portal (https://www.flipkartcareers.com). 🎓 Minimum Qualification: B.Tech / B.E. / MCA (Student / Graduate).`,
        responsibilities: [
          'Develop reusable components in React.js and Next.js for high-traffic customer portals.',
          'Optimize web performance, Core Web Vitals, and responsive layouts.',
          'Work alongside product managers and designers in an Agile sprint environment.',
        ],
        qualifications: [
          'B.Tech / B.E. / MCA (Student / Graduate) graduating in 2024, 2025, or 2026.',
          '0 years experience required.',
          'Strong command of JavaScript ES6+, React.js, and CSS architectures.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 890,
        applicationsCount: 62,
      },
      {
        title: 'Backend Engineering Intern (Node.js / Go)',
        companyName: 'Zepto',
        company: companyMap['Zepto'].company._id,
        recruiter: companyMap['Zepto'].recruiter._id,
        location: 'HITEC City, Cyber Towers, Hyderabad, Telangana',
        workplaceType: 'on-site',
        employmentType: 'internship',
        experienceLevel: 'entry',
        salaryMin: 35000,
        salaryMax: 65000,
        currency: 'INR',
        salaryPeriod: 'monthly',
        skills: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs'],
        openings: 15,
        sourcePlatform: 'Naukri',
        officialCareerSiteUrl: 'https://www.zeptonow.com/careers',
        hasPPO: true,
        minQualification: 'B.Tech / B.E. / MCA (Student / Graduate)',
        externalUrl: 'https://www.naukri.com/job-listings-zepto-backend-intern-2026',
        description: `Develop resilient server-side services, write optimized database queries, implement authentication protocols, and assist in API benchmarking. Verified official internship opportunity at Zepto (Hyderabad). Duration: 3-6 Months. Stipend: ₹35,000 - ₹65,000 / month + PPO. High conversion rate to Full-Time Employee (PPO) based on performance. Apply directly via Naukri or explore Zepto's official portal (https://www.zeptonow.com/careers). 🎓 Minimum Qualification: B.Tech / B.E. / MCA (Student / Graduate).`,
        responsibilities: [
          'Author high-throughput microservices using Node.js, Express, and PostgreSQL.',
          'Implement Redis caching layers and message queuing patterns.',
          'Write database migrations and query performance benchmarks.',
        ],
        qualifications: [
          'B.Tech / B.E. / MCA (Student / Graduate) with strong interest in backend architectures.',
          '0 years experience (Freshers welcome).',
          'Good knowledge of RESTful API design principles and SQL databases.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 940,
        applicationsCount: 71,
      },
      {
        title: 'Data Science & GenAI Intern',
        companyName: 'Razorpay',
        company: companyMap['Razorpay'].company._id,
        recruiter: companyMap['Razorpay'].recruiter._id,
        location: 'Hinjawadi Rajiv Gandhi Infotech Park, Pune, Maharashtra',
        workplaceType: 'hybrid',
        employmentType: 'internship',
        experienceLevel: 'entry',
        salaryMin: 40000,
        salaryMax: 75000,
        currency: 'INR',
        salaryPeriod: 'monthly',
        skills: ['Python', 'Pandas', 'Scikit-Learn', 'PyTorch', 'LLMs & Prompt Engineering'],
        openings: 10,
        sourcePlatform: 'Unstop',
        officialCareerSiteUrl: 'https://razorpay.com/jobs',
        hasPPO: true,
        minQualification: 'B.Tech / B.E. / MCA (Student / Graduate)',
        externalUrl: 'https://unstop.com/internships/razorpay-genai-intern-2026',
        description: `Train machine learning models, analyze user behavioral telemetry, fine-tune open-source LLMs, and build intelligent recommendation pipelines. Verified official internship opportunity at Razorpay (Pune). Duration: 3-6 Months. Stipend: ₹40,000 - ₹75,000 / month + PPO. High conversion rate to Full-Time Employee (PPO) based on performance. Apply directly via Unstop or explore Razorpay's official portal (https://razorpay.com/jobs). 🎓 Minimum Qualification: B.Tech / B.E. / MCA (Student / Graduate).`,
        responsibilities: [
          'Conduct exploratory data analysis and feature engineering on transactional datasets.',
          'Assist in training machine learning models and evaluating inference latency.',
          'Build experimental prompt pipelines and retrieval-augmented generation (RAG) prototypes.',
        ],
        qualifications: [
          'B.Tech / B.E. / MCA (Student / Graduate) in CS, Data Science, or AI.',
          '0 years experience (Fresher internship role).',
          'Proficiency with Python, Pandas, and deep learning frameworks (PyTorch or TensorFlow).',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 820,
        applicationsCount: 58,
      },
      {
        title: 'Full Stack Developer Intern',
        companyName: 'Zerodha',
        company: companyMap['Zerodha'].company._id,
        recruiter: companyMap['Zerodha'].recruiter._id,
        location: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra',
        workplaceType: 'on-site',
        employmentType: 'internship',
        experienceLevel: 'entry',
        salaryMin: 40000,
        salaryMax: 70000,
        currency: 'INR',
        salaryPeriod: 'monthly',
        skills: ['React.js', 'Go / Python', 'PostgreSQL', 'Redis', 'Docker'],
        openings: 8,
        sourcePlatform: 'LinkedIn',
        officialCareerSiteUrl: 'https://zerodha.com/careers',
        hasPPO: true,
        minQualification: 'B.Tech / B.E. / MCA (Student / Graduate)',
        externalUrl: 'https://www.linkedin.com/jobs/view/zerodha-fullstack-intern-2026',
        description: `End-to-end web product development. Deliver frontend screens, implement backend controllers, and integrate third-party payment and messaging SDKs. Verified official internship opportunity at Zerodha (Mumbai). Duration: 3-6 Months. Stipend: ₹40,000 - ₹70,000 / month + PPO. High conversion rate to Full-Time Employee (PPO) based on performance. Apply directly via LinkedIn or explore Zerodha's official portal (https://zerodha.com/careers). 🎓 Minimum Qualification: B.Tech / B.E. / MCA (Student / Graduate).`,
        responsibilities: [
          'Build accessible, lightning-fast financial trading interfaces.',
          'Develop REST APIs and WebSockets connections with Go or Python.',
          'Collaborate on open-source packages and developer toolchains.',
        ],
        qualifications: [
          'B.Tech / B.E. / MCA (Student / Graduate) graduating in 2025/2026.',
          '0 years experience required.',
          'Strong problem solving and software architecture fundamentals.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 710,
        applicationsCount: 52,
      },
      {
        title: 'Mobile App Developer Intern (Flutter / React Native)',
        companyName: 'Urban Company',
        company: companyMap['Urban Company'].company._id,
        recruiter: companyMap['Urban Company'].recruiter._id,
        location: 'Bellandur, Outer Ring Road, Bangalore, Karnataka',
        workplaceType: 'hybrid',
        employmentType: 'internship',
        experienceLevel: 'entry',
        salaryMin: 35000,
        salaryMax: 60000,
        currency: 'INR',
        salaryPeriod: 'monthly',
        skills: ['Flutter', 'React Native', 'Dart', 'Mobile UI', 'State Management'],
        openings: 12,
        sourcePlatform: 'Naukri',
        officialCareerSiteUrl: 'https://www.urbancompany.com/careers',
        hasPPO: true,
        minQualification: 'B.Tech / B.E. / MCA (Student / Graduate)',
        externalUrl: 'https://www.naukri.com/job-listings-urbancompany-mobile-intern-2026',
        description: `Develop cross-platform mobile apps for Android and iOS. Focus on native performance, offline caching, push notifications, and seamless checkout flows. Verified official internship opportunity at Urban Company (Bangalore). Duration: 3-6 Months. Stipend: ₹35,000 - ₹60,000 / month + PPO. High conversion rate to Full-Time Employee (PPO) based on performance. Apply directly via Naukri or explore Urban Company's official portal (https://www.urbancompany.com/careers). 🎓 Minimum Qualification: B.Tech / B.E. / MCA (Student / Graduate).`,
        responsibilities: [
          'Build customer and partner-facing mobile views using Flutter or React Native.',
          'Ensure seamless animations, low memory overhead, and smooth gesture transitions.',
          'Integrate native camera, location, and push notification APIs.',
        ],
        qualifications: [
          'B.Tech / B.E. / MCA (Student / Graduate) graduating in 2025 or 2026.',
          '0 years experience (Fresher role).',
          'Familiarity with mobile app lifecycles and modern state management.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 650,
        applicationsCount: 41,
      },
    ];

    for (const jobItem of fresherJobsData) {
      const job = new Job(jobItem);
      await job.save();
    }

    console.log(`[Seed Jobs] Successfully seeded ${fresherJobsData.length} NexHire Fresher IT jobs!`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Jobs] Error:', error);
    process.exit(1);
  }
};

seedJobs();
