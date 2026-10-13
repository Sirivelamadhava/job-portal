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

    // Definition of vetted demo companies and their lead recruiters
    const companiesSeed = [
      {
        recruiterEmail: 'recruiter@techcorp.com',
        recruiterName: 'Sarah Connor',
        companyName: 'TechCorp Solutions',
        website: 'https://techcorp.example.com',
        description: 'TechCorp is a premier enterprise software and distributed cloud architecture provider empowering global tech leaders.',
        location: 'San Francisco, CA',
        industry: 'Software & Technology',
        companySize: '51-200',
      },
      {
        recruiterEmail: 'recruiter.ai@starlight.com',
        recruiterName: 'Elena Rostova',
        companyName: 'Starlight AI',
        website: 'https://starlight.example.com',
        description: 'Building generative intelligence foundations and autonomous agents for next-generation enterprise workflows.',
        location: 'New York, NY',
        industry: 'Artificial Intelligence',
        companySize: '11-50',
      },
      {
        recruiterEmail: 'recruiter.cloud@cloudscale.com',
        recruiterName: 'Marcus Vance',
        companyName: 'CloudScale Infrastructure',
        website: 'https://cloudscale.example.com',
        description: 'Pioneering Kubernetes orchestration, edge computing networks, and modern zero-trust cloud infrastructure.',
        location: 'Seattle, WA',
        industry: 'Cloud Computing & DevOps',
        companySize: '201-500',
      },
      {
        recruiterEmail: 'recruiter.design@pixelcraft.com',
        recruiterName: 'Chloe Bennett',
        companyName: 'PixelCraft Design Labs',
        website: 'https://pixelcraft.example.com',
        description: 'Award-winning product design and digital innovation studio partnering with Silicon Valley disruptors.',
        location: 'Austin, TX',
        industry: 'Design & Creative Tech',
        companySize: '11-50',
      },
      {
        recruiterEmail: 'recruiter.fin@nexusfin.com',
        recruiterName: 'Arthur Pendelton',
        companyName: 'Nexus FinTech',
        website: 'https://nexusfin.example.com',
        description: 'High-frequency algorithmic trading engines and secure decentralized banking rails for global capital.',
        location: 'Boston, MA',
        industry: 'Financial Technology',
        companySize: '51-200',
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
          headline: `Recruiting Lead at ${item.companyName}`,
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
        await company.save();
      }

      recruiter.company = company._id;
      await recruiter.save();

      companyMap[item.companyName] = { company, recruiter };
    }

    // Clean previous jobs to ensure consistent fresh state
    await Job.deleteMany({});
    console.log('[Seed Jobs] Reset jobs collection.');

    const futureDeadline = new Date();
    futureDeadline.setDate(futureDeadline.getDate() + 45); // 45 days in future

    const jobsData = [
      {
        title: 'Senior Full-Stack Engineer (React, Node.js)',
        companyName: 'TechCorp Solutions',
        company: companyMap['TechCorp Solutions'].company._id,
        recruiter: companyMap['TechCorp Solutions'].recruiter._id,
        location: 'San Francisco, CA (or Remote)',
        workplaceType: 'remote',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salaryMin: 135000,
        salaryMax: 170000,
        currency: 'USD',
        skills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS'],
        openings: 3,
        description: 'Join our core platform engineering team to architect high-performance, fault-tolerant web applications serving millions of active users. You will lead the transition to modern micro-frontends and real-time collaborative services.',
        responsibilities: [
          'Design and maintain scalable REST and WebSocket APIs using Node.js and Express.',
          'Lead frontend architecture with React, TypeScript, and state management best practices.',
          'Collaborate with product designers and cloud engineers to ship polished features weekly.',
          'Mentor junior and mid-level engineers through detailed code reviews and architectural RFCs.',
        ],
        qualifications: [
          '5+ years of full-stack production software development experience.',
          'Deep expertise in React, JavaScript (ESNext), Node.js, and MongoDB.',
          'Proven experience with automated testing (Jest, Cypress) and CI/CD pipelines.',
          'Solid understanding of web security, CORS, authentication (JWT), and rate limiting.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 142,
        applicationsCount: 8,
      },
      {
        title: 'Staff Machine Learning Engineer (LLMs & PyTorch)',
        companyName: 'Starlight AI',
        company: companyMap['Starlight AI'].company._id,
        recruiter: companyMap['Starlight AI'].recruiter._id,
        location: 'New York, NY',
        workplaceType: 'hybrid',
        employmentType: 'full-time',
        experienceLevel: 'lead',
        salaryMin: 185000,
        salaryMax: 245000,
        currency: 'USD',
        skills: ['Python', 'PyTorch', 'Large Language Models', 'Transformers', 'CUDA', 'Docker'],
        openings: 2,
        description: 'Starlight AI is looking for an exceptional Staff Machine Learning Engineer to spearhead our retrieval-augmented generation (RAG) platform and fine-tuning pipelines on multimodal foundation models.',
        responsibilities: [
          'Train, evaluate, and optimize deep learning models with PyTorch and distributed GPU clusters.',
          'Develop low-latency inference endpoints with vLLM, TensorRT-LLM, and Triton Inference Server.',
          'Direct model alignment, RLHF, and automated synthetic evaluation pipelines.',
          'Publish benchmark results and guide long-term AI strategy across the engineering organization.',
        ],
        qualifications: [
          'MS or PhD in Computer Science, Machine Learning, or equivalent industry experience.',
          '6+ years developing and deploying machine learning systems in production.',
          'Deep mastery of transformer architectures, tokenization, embeddings, and vector databases.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 289,
        applicationsCount: 14,
      },
      {
        title: 'DevOps & Cloud Platform Engineer (Kubernetes, AWS)',
        companyName: 'CloudScale Infrastructure',
        company: companyMap['CloudScale Infrastructure'].company._id,
        recruiter: companyMap['CloudScale Infrastructure'].recruiter._id,
        location: 'Seattle, WA',
        workplaceType: 'remote',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salaryMin: 125000,
        salaryMax: 155000,
        currency: 'USD',
        skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker', 'CI/CD', 'Prometheus', 'Linux'],
        openings: 2,
        description: 'Help build and scale our multi-region Kubernetes clusters. You will automate infrastructure provisioning via Terraform and ensure our platforms maintain 99.99% uptime with robust observability.',
        responsibilities: [
          'Manage enterprise Kubernetes (EKS) clusters, ingress controllers, and service meshes.',
          'Build reusable Terraform modules for automated cloud infrastructure orchestration.',
          'Enhance monitoring, alerting, and metrics with Prometheus, Grafana, and Datadog.',
          'Participate in on-call rotations and post-mortem investigations with zero-blame culture.',
        ],
        qualifications: [
          '3+ years hands-on experience in cloud infrastructure and DevOps practices.',
          'Strong proficiency with Docker, Linux systems administration, and Bash scripting.',
          'Demonstrated expertise in Infrastructure as Code (Terraform) and AWS services.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 97,
        applicationsCount: 5,
      },
      {
        title: 'Lead Product Designer (Design Systems & UX)',
        companyName: 'PixelCraft Design Labs',
        company: companyMap['PixelCraft Design Labs'].company._id,
        recruiter: companyMap['PixelCraft Design Labs'].recruiter._id,
        location: 'Austin, TX',
        workplaceType: 'remote',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salaryMin: 120000,
        salaryMax: 160000,
        currency: 'USD',
        skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping', 'Accessibility'],
        openings: 1,
        description: 'PixelCraft is seeking a visionary Lead Product Designer to shape intuitive digital experiences. You will define our design language, establish accessible component libraries, and turn complex workflows into delightful interactions.',
        responsibilities: [
          'Own end-to-end design from research and wireframes to high-fidelity prototypes in Figma.',
          'Maintain and evolve our multi-brand design tokens and component libraries.',
          'Conduct usability testing sessions and translate customer feedback into iterative refinements.',
          'Partner closely with frontend engineering to ensure pixel-perfect, accessible execution.',
        ],
        qualifications: [
          '5+ years designing responsive web and mobile software with a public portfolio.',
          'Expertise in Figma auto-layout, interactive variants, and modern prototyping techniques.',
          'Deep understanding of WCAG 2.1 accessibility guidelines and web ergonomics.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 164,
        applicationsCount: 11,
      },
      {
        title: 'Principal Data Architect & Analytics Lead',
        companyName: 'Nexus FinTech',
        company: companyMap['Nexus FinTech'].company._id,
        recruiter: companyMap['Nexus FinTech'].recruiter._id,
        location: 'Boston, MA',
        workplaceType: 'on-site',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salaryMin: 160000,
        salaryMax: 200000,
        currency: 'USD',
        skills: ['SQL', 'Snowflake', 'Python', 'dbt', 'Data Modeling', 'Apache Spark', 'Kafka'],
        openings: 1,
        description: 'Nexus FinTech handles billions of dollars in daily transactions. We need a Principal Data Architect to design our enterprise data warehouse, streaming ETL pipelines, and real-time risk intelligence dashboards.',
        responsibilities: [
          'Architect robust data warehousing solutions on Snowflake, BigQuery, and Databricks.',
          'Build streaming ingestion pipelines using Apache Kafka and Apache Spark.',
          'Implement data governance, lineage tracking, and compliance controls (SOC 2, GDPR).',
          'Empower product managers and quantitative analysts with self-serve BI infrastructure.',
        ],
        qualifications: [
          '7+ years in enterprise data engineering and data architecture.',
          'Advanced SQL performance tuning and dimensional modeling mastery.',
          'Experience in financial services, banking, or fraud prevention domains is preferred.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 88,
        applicationsCount: 4,
      },
      {
        title: 'Frontend React Engineer (Next.js & Tailwind)',
        companyName: 'TechCorp Solutions',
        company: companyMap['TechCorp Solutions'].company._id,
        recruiter: companyMap['TechCorp Solutions'].recruiter._id,
        location: 'San Francisco, CA (or Remote)',
        workplaceType: 'remote',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salaryMin: 100000,
        salaryMax: 130000,
        currency: 'USD',
        skills: ['React.js', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Redux / Zustand', 'HTML5'],
        openings: 2,
        description: 'Build fast, responsive web interfaces with React, Next.js, and Tailwind CSS. You will craft interactive dashboards, optimize Core Web Vitals, and deliver exceptional developer experience.',
        responsibilities: [
          'Develop modern React components with Tailwind CSS and clean atomic design principles.',
          'Optimize web performance, client-side caching, and bundle size.',
          'Integrate RESTful and GraphQL backend endpoints.',
          'Participate in agile sprint planning and product refinement ceremonies.',
        ],
        qualifications: [
          '3+ years professional frontend engineering experience with modern React.',
          'Proficiency with TypeScript and modern CSS (Tailwind, PostCSS).',
          'Strong sense of UI polish, micro-interactions, and responsive layouts.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 215,
        applicationsCount: 19,
      },
      {
        title: 'Backend Go & Distributed Systems Engineer',
        companyName: 'CloudScale Infrastructure',
        company: companyMap['CloudScale Infrastructure'].company._id,
        recruiter: companyMap['CloudScale Infrastructure'].recruiter._id,
        location: 'Seattle, WA',
        workplaceType: 'hybrid',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        salaryMin: 140000,
        salaryMax: 175000,
        currency: 'USD',
        skills: ['Golang', 'gRPC', 'Distributed Systems', 'PostgreSQL', 'Redis', 'Docker'],
        openings: 2,
        description: 'Design ultra-low-latency backend microservices with Go and gRPC. You will build high-throughput telemetry collectors and distributed consensus services that process millions of events per second.',
        responsibilities: [
          'Develop concurrent services in Go with zero-allocation memory optimization.',
          'Design gRPC and Protocol Buffer API interfaces for inter-service communication.',
          'Tune PostgreSQL database schemas, indexing, and connection pooling.',
        ],
        qualifications: [
          '4+ years backend systems programming with Golang.',
          'Solid grasp of distributed systems concepts, concurrency patterns, and network protocols.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 105,
        applicationsCount: 6,
      },
      {
        title: 'Associate Software Engineer (React & Express)',
        companyName: 'TechCorp Solutions',
        company: companyMap['TechCorp Solutions'].company._id,
        recruiter: companyMap['TechCorp Solutions'].recruiter._id,
        location: 'Remote, US',
        workplaceType: 'remote',
        employmentType: 'full-time',
        experienceLevel: 'entry',
        salaryMin: 75000,
        salaryMax: 95000,
        currency: 'USD',
        skills: ['JavaScript', 'React.js', 'Node.js', 'Express', 'Git', 'MongoDB'],
        openings: 4,
        description: 'Exciting opportunity for high-potential early career developers and bootcamp graduates! Join a supportive team with dedicated mentorship, clear growth paths, and modern technologies.',
        responsibilities: [
          'Implement user interface components and bug fixes across web applications.',
          'Write clean, readable code with unit tests and clear documentation.',
          'Collaborate with senior engineers to level up full-stack engineering skills.',
        ],
        qualifications: [
          'Degree in Computer Science or accredited software bootcamp completion.',
          'Familiarity with JavaScript, React, Node.js, and Git version control.',
          'Hunger to learn, communicate transparently, and receive constructive feedback.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 340,
        applicationsCount: 42,
      },
      {
        title: 'Technical Product Manager (API Platform)',
        companyName: 'Nexus FinTech',
        company: companyMap['Nexus FinTech'].company._id,
        recruiter: companyMap['Nexus FinTech'].recruiter._id,
        location: 'Boston, MA',
        workplaceType: 'hybrid',
        employmentType: 'full-time',
        experienceLevel: 'mid',
        salaryMin: 125000,
        salaryMax: 160000,
        currency: 'USD',
        skills: ['Product Management', 'API Design', 'Agile / Scrum', 'SQL', 'FinTech', 'Roadmapping'],
        openings: 1,
        description: 'Lead the vision and execution for our developer platform and payment APIs. You will bridge engineering, compliance, and enterprise fintech customers to define roadmap priorities.',
        responsibilities: [
          'Define PRDs, user stories, and developer experience guidelines for payment APIs.',
          'Analyze customer feedback, developer adoption metrics, and API latency SLAs.',
          'Coordinate release cycles with cross-functional legal and security teams.',
        ],
        qualifications: [
          '3+ years as a Technical Product Manager for developer tools or enterprise SaaS.',
          'Ability to read API docs, write SQL queries, and speak the language of engineers.',
        ],
        deadline: futureDeadline,
        status: 'approved',
        viewsCount: 112,
        applicationsCount: 8,
      },
    ];

    await Job.insertMany(jobsData);
    console.log(`[Seed Jobs] Successfully inserted ${jobsData.length} vetted, approved jobs across ${Object.keys(companyMap).length} verified companies!`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Jobs Error] Failed:', error);
    process.exit(1);
  }
};

seedJobs();
