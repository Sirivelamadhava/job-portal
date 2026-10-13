require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
const connectDB = require('../config/db');

const seedInitialAccounts = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB for seeding initialization...');

    // 1. Check or create System Administrator
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@careersphere.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = new User({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        headline: 'Platform Operations & Moderation',
      });
      await admin.save();
      console.log(`[Seed] Created System Admin: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`[Seed] System Admin account already exists: ${adminEmail}`);
    }

    // 2. Check or create Demo Recruiter
    const recruiterEmail = 'recruiter@techcorp.com';
    let recruiter = await User.findOne({ email: recruiterEmail });
    if (!recruiter) {
      recruiter = new User({
        name: 'Sarah Connor',
        email: recruiterEmail,
        password: 'Password@123',
        role: 'recruiter',
        headline: 'Senior Tech Talent Lead at TechCorp Solutions',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
      });
      await recruiter.save();

      const company = new Company({
        user: recruiter._id,
        companyName: 'TechCorp Solutions',
        website: 'https://techcorp.example.com',
        description: 'TechCorp is a leading pioneer in cloud distributed infrastructure and AI engineering solutions.',
        location: 'San Francisco, CA',
        industry: 'Software & Technology',
        companySize: '51-200',
        status: 'approved', // Pre-approved for convenience
        approvedAt: new Date(),
        approvedBy: admin._id,
      });
      await company.save();

      recruiter.company = company._id;
      await recruiter.save();
      console.log(`[Seed] Created Demo Recruiter: ${recruiterEmail} (password: Password@123) with Company 'TechCorp Solutions'`);
    } else {
      console.log(`[Seed] Demo Recruiter already exists: ${recruiterEmail}`);
    }

    // 3. Check or create Demo Job Seeker
    const seekerEmail = 'seeker@example.com';
    let seeker = await User.findOne({ email: seekerEmail });
    if (!seeker) {
      seeker = new User({
        name: 'Alex Rivera',
        email: seekerEmail,
        password: 'Password@123',
        role: 'job_seeker',
        headline: 'Full Stack Software Engineer | React, Node.js, TypeScript',
        bio: 'Passionate developer with 4 years of experience building modern web apps, high-throughput REST APIs, and responsive UIs.',
        location: 'Austin, TX',
        skills: ['React.js', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'Docker'],
        resumeUrl: '/uploads/resumes/alex-rivera-resume.pdf',
        resumeOriginalName: 'Alex_Rivera_CV.pdf',
        resumeUploadedAt: new Date(),
      });
      await seeker.save();
      console.log(`[Seed] Created Demo Job Seeker: ${seekerEmail} (password: Password@123)`);
    } else {
      seeker.resumeUrl = '/uploads/resumes/alex-rivera-resume.pdf';
      seeker.resumeOriginalName = 'Alex_Rivera_CV.pdf';
      seeker.resumeUploadedAt = new Date();
      await seeker.save();
      console.log(`[Seed] Updated Demo Job Seeker resume: ${seekerEmail}`);
    }

    console.log('[Seed] Seeding process completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed accounts:', error);
    process.exit(1);
  }
};

seedInitialAccounts();
