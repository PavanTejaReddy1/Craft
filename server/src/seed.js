/**
 * CRAFT — Seed Script
 * Run: node src/seed.js
 *
 * Creates:
 *   • 1 admin
 *   • 5 clients  (with profiles)
 *   • 8 developers (with full profiles, portfolio, experience)
 *   • 12 projects  (across categories, various statuses)
 *   • 18 offers    (multiple offers per project)
 *   • 2 active contracts (with milestones)
 *   • Reviews for completed work
 *   • Notifications
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

import User           from './models/User.js';
import ClientProfile  from './models/ClientProfile.js';
import DeveloperProfile from './models/DeveloperProfile.js';
import Project        from './models/Project.js';
import Offer          from './models/Offer.js';
import Contract       from './models/Contract.js';
import Milestone      from './models/Milestone.js';
import Review         from './models/Review.js';
import Notification   from './models/Notification.js';

// ─── helpers ──────────────────────────────────────────────────────────────────
const daysFromNow = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };
const daysAgo     = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const RAW_PASSWORD = 'password123'; // model pre-save hook will hash this

// ─── raw data ──────────────────────────────────────────────────────────────────

const CLIENTS_DATA = [
  { name: 'Rahul Sharma',  email: 'rahul@craftdemo.com',   company: 'TechVentures India',  industry: 'E-commerce',       bio: 'Building the next generation of online retail tools for Indian SMBs.' },
  { name: 'Sneha Patel',   email: 'sneha@craftdemo.com',   company: 'FinSync Technologies', industry: 'FinTech',          bio: 'We build financial management tools for small businesses across South Asia.' },
  { name: 'Arjun Mehta',   email: 'arjun@craftdemo.com',   company: 'HealthBridge',         industry: 'Healthcare',       bio: 'Digital health platform connecting patients with specialists in tier-2 cities.' },
  { name: 'Priya Nair',    email: 'priya@craftdemo.com',   company: null,                   industry: 'EdTech',           bio: 'Independent product manager building an online tutoring marketplace.' },
  { name: 'Vikram Singh',  email: 'vikram@craftdemo.com',  company: 'LogiTrack Solutions',  industry: 'Logistics & SaaS', bio: 'Building SaaS tools for last-mile delivery optimization.' },
];

const DEVELOPERS_DATA = [
  {
    name: 'Kiran Rao',      email: 'kiran@craftdemo.com',
    headline: 'Full Stack Developer · React · Node.js · PostgreSQL',
    bio: 'Senior full-stack developer with 6 years of experience building scalable web applications. Specialized in React, Node.js, and cloud infrastructure. Have shipped products for 30+ clients.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST API', 'GraphQL'],
    technologies: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'Redis', 'AWS', 'Docker'],
    hourlyRate: 2500, rating: 4.9, completedProjects: 24,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'available',
    portfolio: [
      { title: 'Multi-vendor E-commerce Platform', description: 'Built a full-featured marketplace with vendor management, order tracking, and payment integration for 10,000+ daily users.', technologies: ['React', 'Node.js', 'PostgreSQL'] },
      { title: 'Real-time Analytics Dashboard', description: 'Live dashboard for a fintech startup processing 1M+ events/day using WebSockets and Redis.', technologies: ['React', 'Redis', 'WebSockets'] },
    ],
    experience: [{ title: 'Senior Software Engineer', company: 'Flipkart', startDate: daysAgo(730), isCurrent: false, endDate: daysAgo(180) }],
  },
  {
    name: 'Anjali Verma',   email: 'anjali@craftdemo.com',
    headline: 'Mobile App Developer · Flutter · React Native',
    bio: 'Mobile specialist with 5 years building cross-platform apps. Published 12 apps on Play Store and App Store. Expert in Flutter and React Native with beautiful, performant UIs.',
    skills: ['Flutter', 'React Native', 'Dart', 'Firebase', 'UI/UX'],
    technologies: ['Flutter', 'React Native', 'Firebase', 'Supabase', 'Redux'],
    hourlyRate: 2000, rating: 4.8, completedProjects: 18,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'available',
    portfolio: [
      { title: 'Food Delivery App', description: 'End-to-end food delivery app with real-time order tracking and payment gateway integration.', technologies: ['Flutter', 'Firebase'] },
      { title: 'Fitness Tracking App', description: 'Health tracker with wearable device integration and AI-powered workout suggestions.', technologies: ['React Native', 'Redux'] },
    ],
    experience: [{ title: 'Mobile Developer', company: 'Swiggy', startDate: daysAgo(900), isCurrent: false, endDate: daysAgo(200) }],
  },
  {
    name: 'Rohan Desai',    email: 'rohan@craftdemo.com',
    headline: 'Backend Engineer · Python · FastAPI · Machine Learning',
    bio: 'Backend and ML engineer specializing in high-performance APIs and data pipelines. Built ML-powered features processing millions of records daily. Strong in Python, FastAPI, and AWS.',
    skills: ['Python', 'FastAPI', 'Machine Learning', 'Data Analytics', 'REST API'],
    technologies: ['Python', 'FastAPI', 'TensorFlow', 'PostgreSQL', 'AWS', 'Docker', 'Redis'],
    hourlyRate: 2800, rating: 4.7, completedProjects: 15,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'available',
    portfolio: [
      { title: 'Recommendation Engine', description: 'Built a product recommendation engine that increased conversion by 35% for an e-commerce client.', technologies: ['Python', 'TensorFlow', 'PostgreSQL'] },
    ],
    experience: [{ title: 'ML Engineer', company: 'Razorpay', startDate: daysAgo(600), isCurrent: false, endDate: daysAgo(90) }],
  },
  {
    name: 'Meera Krishnan',  email: 'meera@craftdemo.com',
    headline: 'UI/UX Designer & Frontend Developer · Figma · React',
    bio: 'Product designer who also codes. I bridge the gap between design and development — delivering pixel-perfect, accessible interfaces with Figma designs and React implementation.',
    skills: ['UI/UX', 'React', 'Figma', 'TypeScript', 'Tailwind CSS'],
    technologies: ['Figma', 'React', 'Tailwind CSS', 'Framer Motion', 'Storybook'],
    hourlyRate: 1800, rating: 4.9, completedProjects: 21,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'available',
    portfolio: [
      { title: 'SaaS Dashboard Redesign', description: 'Complete redesign of a B2B SaaS product increasing user retention by 40%.', technologies: ['Figma', 'React', 'Tailwind CSS'] },
    ],
    experience: [{ title: 'Product Designer', company: 'Freshworks', startDate: daysAgo(800), isCurrent: false, endDate: daysAgo(150) }],
  },
  {
    name: 'Siddharth Kumar',  email: 'siddharth@craftdemo.com',
    headline: 'DevOps & Cloud Engineer · AWS · Kubernetes · Terraform',
    bio: 'Cloud infrastructure specialist with 7 years managing large-scale deployments. Expert in AWS, GCP, Kubernetes, and CI/CD pipelines. Helped 20+ startups scale from 0 to production.',
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Cloud / DevOps'],
    technologies: ['AWS', 'GCP', 'Kubernetes', 'Docker', 'Terraform', 'GitHub Actions', 'Prometheus'],
    hourlyRate: 3000, rating: 4.8, completedProjects: 19,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'busy',
    portfolio: [
      { title: 'Zero-downtime Migration to K8s', description: 'Migrated a monolithic app serving 500K users to microservices on Kubernetes with zero downtime.', technologies: ['Kubernetes', 'AWS', 'Terraform'] },
    ],
    experience: [{ title: 'Senior DevOps Engineer', company: 'Atlassian', startDate: daysAgo(1000), isCurrent: false, endDate: daysAgo(300) }],
  },
  {
    name: 'Pooja Iyer',      email: 'pooja@craftdemo.com',
    headline: 'Full Stack Developer · Vue.js · Laravel · MySQL',
    bio: 'Full-stack developer focused on clean, maintainable code. Built 15+ SaaS products from scratch using Vue.js and Laravel. Strong at database design and performance optimization.',
    skills: ['Vue.js', 'Laravel', 'PHP', 'MySQL', 'REST API'],
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis', 'AWS S3', 'Docker'],
    hourlyRate: 1600, rating: 4.6, completedProjects: 15,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'available',
    portfolio: [
      { title: 'CRM for Real Estate', description: 'Custom CRM with lead management, automated follow-ups and reporting for a 50-agent real estate firm.', technologies: ['Vue.js', 'Laravel', 'MySQL'] },
    ],
    experience: [{ title: 'Full Stack Developer', company: 'Zoho', startDate: daysAgo(700), isCurrent: false, endDate: daysAgo(100) }],
  },
  {
    name: 'Amit Tiwari',     email: 'amit@craftdemo.com',
    headline: 'Android Developer · Kotlin · Jetpack Compose',
    bio: 'Specialist Android developer with 5 years building native apps. Deep expertise in Kotlin, Jetpack Compose, and Android architecture patterns. Published apps with 100K+ downloads.',
    skills: ['Android', 'Kotlin', 'Jetpack Compose', 'Firebase', 'REST API'],
    technologies: ['Kotlin', 'Jetpack Compose', 'Firebase', 'Room', 'Retrofit', 'Hilt'],
    hourlyRate: 1900, rating: 4.7, completedProjects: 12,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'available',
    portfolio: [
      { title: 'Banking App Redesign', description: 'Redesigned core banking app for a regional bank with Jetpack Compose, reducing crash rate by 70%.', technologies: ['Kotlin', 'Jetpack Compose', 'Hilt'] },
    ],
    experience: [{ title: 'Android Developer', company: 'Paytm', startDate: daysAgo(850), isCurrent: false, endDate: daysAgo(50) }],
  },
  {
    name: 'Lakshmi Subramanian', email: 'lakshmi@craftdemo.com',
    headline: 'Data Engineer · Python · Spark · Databricks',
    bio: 'Data engineer specializing in building robust data pipelines and analytics infrastructure. Experience with petabyte-scale data processing at top tech companies.',
    skills: ['Data Analytics', 'Python', 'Apache Spark', 'SQL', 'Machine Learning'],
    technologies: ['Python', 'Apache Spark', 'Databricks', 'Snowflake', 'dbt', 'Airflow', 'AWS'],
    hourlyRate: 2600, rating: 4.8, completedProjects: 11,
    githubUrl: 'https://github.com', linkedinUrl: 'https://linkedin.com',
    availability: 'available',
    portfolio: [
      { title: 'Real-time Data Pipeline', description: 'Built streaming data pipeline processing 50M events/day for a logistics company.', technologies: ['Apache Spark', 'Databricks', 'Python'] },
    ],
    experience: [{ title: 'Data Engineer', company: 'Ola', startDate: daysAgo(650), isCurrent: true }],
  },
];

const PROJECTS_DATA = [
  {
    title: 'Build a Multi-vendor E-commerce Platform',
    description: 'We need a production-ready multi-vendor e-commerce platform similar to Amazon/Flipkart. The platform should support multiple sellers, product listings, shopping cart, checkout with payment gateway, order management, and an admin dashboard for marketplace management.\n\nKey features:\n- Vendor registration and approval workflow\n- Product catalog with categories and search\n- Shopping cart and wishlist\n- Razorpay/Stripe payment integration\n- Order tracking with email notifications\n- Seller dashboard with analytics\n- Admin panel for moderation\n- Mobile-responsive design',
    category: 'Full Stack Development',
    skills: ['React', 'Node.js', 'MongoDB', 'REST API'],
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Razorpay', 'AWS S3'],
    budgetMin: 80000, budgetMax: 120000,
    expectedDeliveryDays: 60, experienceLevel: 'expert', status: 'open',
    clientIndex: 0, offerCount: 4, isFeatured: true,
  },
  {
    title: 'Flutter Fitness & Health Tracking App',
    description: 'Looking for an experienced Flutter developer to build a comprehensive fitness tracking mobile app for iOS and Android.\n\nFeatures needed:\n- User onboarding and profile setup (age, weight, goals)\n- Workout logging with exercise library (200+ exercises)\n- Custom workout builder\n- Progress charts and analytics\n- Step counter integration with device sensors\n- Nutrition tracking with calorie calculator\n- Wearable device sync (Fitbit, Apple Watch)\n- Social features — share workouts, follow friends\n- Push notifications for reminders',
    category: 'Mobile App Development',
    skills: ['Flutter', 'Firebase', 'UI/UX'],
    technologies: ['Flutter', 'Firebase', 'Dart'],
    budgetMin: 50000, budgetMax: 75000,
    expectedDeliveryDays: 45, experienceLevel: 'intermediate', status: 'open',
    clientIndex: 1, offerCount: 3, isFeatured: true,
  },
  {
    title: 'AI-powered Customer Support Chatbot',
    description: 'We need a sophisticated AI chatbot to handle customer support for our SaaS product. The chatbot should integrate with our existing helpdesk and automatically resolve 60%+ of support tickets.\n\nRequirements:\n- Natural language understanding using GPT-4/Claude API\n- Integration with Zendesk/Freshdesk\n- Knowledge base ingestion (PDFs, FAQs, documentation)\n- Escalation to human agents when confidence is low\n- Analytics dashboard for conversation insights\n- Multi-language support (English, Hindi, Tamil)\n- REST API for embedding in our web app and mobile app',
    category: 'AI / Machine Learning',
    skills: ['Python', 'Machine Learning', 'REST API'],
    technologies: ['Python', 'FastAPI', 'OpenAI', 'PostgreSQL', 'Redis'],
    budgetMin: 60000, budgetMax: 90000,
    expectedDeliveryDays: 40, experienceLevel: 'expert', status: 'open',
    clientIndex: 2, offerCount: 5, isFeatured: true,
  },
  {
    title: 'React Native Telemedicine App',
    description: 'Building a telemedicine platform connecting patients with doctors for video consultations, prescription management, and health records.\n\nFeatures:\n- Video/audio consultations (WebRTC)\n- Doctor profile and availability management\n- Appointment booking and calendar sync\n- E-prescription generation (PDF)\n- Medical records storage with encryption\n- In-app payments (Razorpay)\n- Push notifications for appointment reminders\n- HIPAA-compliant data handling',
    category: 'Mobile App Development',
    skills: ['React Native', 'Firebase', 'REST API', 'UI/UX'],
    technologies: ['React Native', 'Node.js', 'Firebase', 'WebRTC', 'PostgreSQL'],
    budgetMin: 90000, budgetMax: 140000,
    expectedDeliveryDays: 75, experienceLevel: 'expert', status: 'open',
    clientIndex: 2, offerCount: 2, isFeatured: false,
  },
  {
    title: 'SaaS Dashboard UI Design + Frontend Implementation',
    description: 'We have a backend API ready and need a senior designer-developer to design and implement a beautiful, data-rich dashboard for our logistics SaaS product.\n\nWork includes:\n- Figma design system (components, colors, typography)\n- Main dashboard with KPIs and charts (Recharts/D3)\n- 8 secondary pages (reports, settings, team, etc.)\n- Responsive design (mobile + desktop)\n- Dark mode support\n- Onboarding flow for new users\n- Performance optimization (Core Web Vitals)',
    category: 'UI/UX Design',
    skills: ['React', 'Figma', 'TypeScript', 'UI/UX'],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Figma', 'Recharts'],
    budgetMin: 40000, budgetMax: 65000,
    expectedDeliveryDays: 35, experienceLevel: 'intermediate', status: 'open',
    clientIndex: 4, offerCount: 6, isFeatured: false,
  },
  {
    title: 'Kubernetes + AWS Infrastructure Setup',
    description: 'Our startup is growing fast and we need a DevOps expert to set up production-grade infrastructure.\n\nScope:\n- AWS EKS cluster setup (multi-AZ, auto-scaling)\n- CI/CD pipeline with GitHub Actions\n- Infrastructure as code using Terraform\n- Monitoring with Prometheus + Grafana\n- Log aggregation with ELK stack\n- Database backups and disaster recovery\n- Security hardening and compliance (SOC2 prep)\n- Documentation and team training',
    category: 'Cloud / DevOps',
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    technologies: ['AWS', 'Kubernetes', 'Terraform', 'GitHub Actions', 'Prometheus'],
    budgetMin: 55000, budgetMax: 80000,
    expectedDeliveryDays: 30, experienceLevel: 'expert', status: 'open',
    clientIndex: 0, offerCount: 3, isFeatured: false,
  },
  {
    title: 'Data Pipeline & Analytics Dashboard for Retail Chain',
    description: 'We operate 45 retail stores and need a centralized data platform for business intelligence.\n\nDeliverables:\n- ETL pipelines pulling data from 5 POS systems\n- Central data warehouse (Snowflake/BigQuery)\n- Real-time sales analytics dashboard\n- Inventory optimization models\n- Demand forecasting using ML\n- Automated weekly/monthly reports\n- Role-based access for managers',
    category: 'Data Analytics',
    skills: ['Python', 'Data Analytics', 'SQL', 'Machine Learning'],
    technologies: ['Python', 'Apache Spark', 'Snowflake', 'dbt', 'Tableau', 'Airflow'],
    budgetMin: 70000, budgetMax: 100000,
    expectedDeliveryDays: 50, experienceLevel: 'expert', status: 'open',
    clientIndex: 1, offerCount: 2, isFeatured: false,
  },
  {
    title: 'WordPress to Next.js Migration + Performance Optimization',
    description: 'Our marketing website runs on WordPress and is extremely slow (PageSpeed: 34). We want to migrate to Next.js with a headless CMS.\n\nWork:\n- Migrate all pages and blog posts (~200 pages)\n- Implement new design in Next.js (design provided)\n- Integrate with Contentful as headless CMS\n- SEO optimization (structured data, meta tags, sitemap)\n- Target: PageSpeed 90+\n- CDN setup (Cloudflare)\n- Analytics integration (GA4, Hotjar)',
    category: 'Web Development',
    skills: ['React', 'Next.js', 'TypeScript', 'SEO'],
    technologies: ['Next.js', 'TypeScript', 'Contentful', 'Tailwind CSS', 'Cloudflare'],
    budgetMin: 30000, budgetMax: 50000,
    expectedDeliveryDays: 25, experienceLevel: 'intermediate', status: 'open',
    clientIndex: 3, offerCount: 4, isFeatured: false,
  },
  {
    title: 'Automated Invoice & Accounting Automation',
    description: 'We manually process 500+ invoices per month. Need automation to reduce this to near zero manual work.\n\nScope:\n- Email parsing to extract invoice data (OCR + AI)\n- Integration with Tally and QuickBooks\n- Automated GST calculations and filing\n- Vendor payment scheduling\n- Approval workflows with notifications\n- Discrepancy detection and alerts\n- Reporting and audit trail',
    category: 'Automation',
    skills: ['Python', 'REST API', 'Machine Learning'],
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Celery', 'Redis', 'Docker'],
    budgetMin: 35000, budgetMax: 55000,
    expectedDeliveryDays: 30, experienceLevel: 'intermediate', status: 'open',
    clientIndex: 1, offerCount: 1, isFeatured: false,
  },
  {
    title: 'Android Banking App — UI Modernization',
    description: 'Our existing Android banking app has outdated UI built with old XML layouts. We need a complete UI modernization using Jetpack Compose.\n\nScope:\n- Migrate all screens from XML to Jetpack Compose\n- Implement new design system (provided in Figma)\n- Improve app startup time by 50%\n- Add biometric authentication\n- Implement dynamic theming\n- Accessibility improvements (WCAG 2.1 AA)\n- Unit and UI tests for critical flows',
    category: 'Mobile App Development',
    skills: ['Android', 'Kotlin', 'Jetpack Compose'],
    technologies: ['Kotlin', 'Jetpack Compose', 'Hilt', 'Room', 'Retrofit'],
    budgetMin: 40000, budgetMax: 60000,
    expectedDeliveryDays: 35, experienceLevel: 'intermediate', status: 'open',
    clientIndex: 2, offerCount: 2, isFeatured: false,
  },
  {
    title: 'Online EdTech Platform — Student & Teacher Portals',
    description: 'Building a full-featured online tutoring platform connecting K-12 students with tutors.\n\nFeatures:\n- Student and teacher registration/profiles\n- Subject-wise tutor search and filters\n- Session booking and calendar management\n- Video class integration (Zoom/Daily.co SDK)\n- Progress tracking and assignments\n- Payment with escrow (classes released after completion)\n- Review system for tutors\n- Parent dashboard for monitoring\n- Mobile-responsive web app',
    category: 'Full Stack Development',
    skills: ['React', 'Node.js', 'PostgreSQL', 'REST API'],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Zoom SDK', 'Razorpay', 'Redis'],
    budgetMin: 75000, budgetMax: 110000,
    expectedDeliveryDays: 65, experienceLevel: 'expert', status: 'open',
    clientIndex: 3, offerCount: 3, isFeatured: true,
  },
  {
    title: 'Bug Fixes & Performance Audit — Node.js API',
    description: 'Our Node.js REST API has several known bugs and performance issues that need to be addressed urgently.\n\nIssues to fix:\n- Memory leaks causing server crashes every 6-8 hours\n- N+1 query problems causing slow response times (>3s)\n- Race conditions in payment processing\n- JWT token not invalidating on logout\n- File upload size not being validated server-side\n\nDeliverables:\n- Root cause analysis document\n- All bugs fixed with tests\n- Performance report (before/after)\n- Code review and recommendations',
    category: 'Bug Fixing',
    skills: ['Node.js', 'PostgreSQL', 'REST API'],
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'Redis'],
    budgetMin: 15000, budgetMax: 25000,
    expectedDeliveryDays: 10, experienceLevel: 'intermediate', status: 'open',
    clientIndex: 4, offerCount: 5, isFeatured: false,
  },
];

// ─── seed ──────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Wipe existing seed data ──────────────────────────────────────────────
    const existingUsers = await User.find({ email: { $regex: '@craftdemo.com' } }).select('_id');
    const userIds = existingUsers.map(u => u._id);

    await Promise.all([
      User.deleteMany({ email: { $regex: '@craftdemo.com' } }),
      ClientProfile.deleteMany({ user: { $in: userIds } }),
      DeveloperProfile.deleteMany({ user: { $in: userIds } }),
      Project.deleteMany({ client: { $in: userIds } }),
      Offer.deleteMany({ developer: { $in: userIds } }),
      Contract.deleteMany({ $or: [{ client: { $in: userIds } }, { developer: { $in: userIds } }] }),
      Milestone.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // Drop stale indexes that may cause duplicate key errors
    try {
      await mongoose.connection.collection('notifications').dropIndex('notificationId_1');
    } catch (_) { /* index may not exist — fine */ }
    console.log('🧹 Cleared existing seed data');

    // ── Admin ────────────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'CRAFT Admin',
      email: 'admin@craftdemo.com',
      password: RAW_PASSWORD,
      role: 'admin',
      isEmailVerified: true,
      isVerified: true,
    });
    console.log('👤 Admin created');

    // ── Clients ──────────────────────────────────────────────────────────────
    const clientUsers = await Promise.all(
      CLIENTS_DATA.map((c) =>
        User.create({
          name: c.name, email: c.email, password: RAW_PASSWORD,
          role: 'client', isEmailVerified: true, isVerified: true,
        })
      )
    );

    await Promise.all(
      CLIENTS_DATA.map((c, i) =>
        ClientProfile.create({
          user: clientUsers[i]._id,
          companyName: c.company,
          industry: c.industry,
          bio: c.bio,
          totalProjectsPosted: 0,
          completedProjects: Math.floor(Math.random() * 5),
          totalSpent: Math.floor(Math.random() * 200000),
          averageRating: Number((4 + Math.random()).toFixed(1)),
          totalReviews: Math.floor(Math.random() * 10),
        })
      )
    );
    console.log(`👥 ${clientUsers.length} clients created`);

    // ── Developers ───────────────────────────────────────────────────────────
    const devUsers = await Promise.all(
      DEVELOPERS_DATA.map((d) =>
        User.create({
          name: d.name, email: d.email, password: RAW_PASSWORD,
          role: 'developer', isEmailVerified: true, isVerified: true,
        })
      )
    );

    await Promise.all(
      DEVELOPERS_DATA.map((d, i) =>
        DeveloperProfile.create({
          user: devUsers[i]._id,
          headline: d.headline,
          bio: d.bio,
          skills: d.skills,
          technologies: d.technologies,
          hourlyRate: d.hourlyRate,
          availability: d.availability,
          githubUrl: d.githubUrl,
          linkedinUrl: d.linkedinUrl,
          completedProjects: d.completedProjects,
          averageRating: d.rating,
          totalReviews: Math.floor(d.completedProjects * 0.8),
          totalEarnings: d.completedProjects * d.hourlyRate * 30,
          portfolio: d.portfolio,
          experience: d.experience,
          profileCompleteness: 90,
        })
      )
    );
    console.log(`💻 ${devUsers.length} developers created`);

    // ── Projects ─────────────────────────────────────────────────────────────
    const projects = await Promise.all(
      PROJECTS_DATA.map((p, i) =>
        Project.create({
          title: p.title,
          description: p.description,
          category: p.category,
          skills: p.skills,
          technologies: p.technologies,
          budgetType: 'fixed',
          budgetMin: p.budgetMin,
          budgetMax: p.budgetMax,
          expectedDeliveryDays: p.expectedDeliveryDays,
          experienceLevel: p.experienceLevel,
          status: p.status,
          client: clientUsers[p.clientIndex]._id,
          offerCount: p.offerCount,
          isFeatured: p.isFeatured ?? false,
          views: Math.floor(Math.random() * 200) + 20,
          createdAt: daysAgo(Math.floor(Math.random() * 14)),
        })
      )
    );
    console.log(`📋 ${projects.length} projects created`);

    // ── Offers ───────────────────────────────────────────────────────────────
    // Add 2-4 offers to each of the first 6 projects from different developers
    const offerPairs = [
      // [projectIndex, devIndex, price, days, shortlisted]
      [0, 0, 95000, 55, true],
      [0, 2, 88000, 60, false],
      [0, 5, 105000, 50, false],
      [1, 1, 60000, 40, true],
      [1, 3, 55000, 45, false],
      [2, 2, 75000, 35, true],
      [2, 0, 85000, 38, false],
      [2, 7, 70000, 42, false],
      [3, 1, 110000, 70, true],
      [3, 3, 120000, 65, false],
      [4, 3, 50000, 30, true],
      [4, 0, 58000, 28, false],
      [5, 4, 65000, 28, true],
      [5, 2, 72000, 32, false],
      [6, 7, 80000, 45, true],
      [7, 0, 35000, 22, true],
      [7, 5, 42000, 20, false],
      [10, 0, 90000, 60, true],
    ];

    const proposals = [
      'I have extensive experience building similar platforms and have shipped 3 multi-vendor marketplaces in the past 2 years. I can start immediately and deliver a production-ready solution within the timeline. My approach would be to start with a solid data model, then build the API layer, followed by the frontend. I\'ll provide daily updates and weekly demos.',
      'Having worked on similar projects, I understand the complexity involved. I\'ll use a microservices approach for scalability, implement proper caching strategies from day one, and ensure the system can handle 10x the expected load. I\'ve attached a detailed technical proposal outlining my architecture decisions.',
      'I specialize exactly in this type of work. In my last project, I achieved 99.9% uptime for a platform with 50K daily users. I can bring the same rigor to your project. I will dedicate full-time hours and maintain transparent communication throughout. Happy to jump on a call to discuss technical details.',
      'This is right in my wheelhouse. I\'ve built 5 similar applications in the last 3 years and can deliver this efficiently. My proposal includes a phased delivery with working milestones every 2 weeks so you can track progress. The technologies I\'ll use are production-tested and I\'ll write comprehensive tests throughout development.',
    ];

    await Promise.all(
      offerPairs.map(([pi, di, price, days, shortlisted], idx) =>
        Offer.create({
          project: projects[pi]._id,
          developer: devUsers[di]._id,
          proposedPrice: price,
          deliveryDays: days,
          coverLetter: proposals[idx % proposals.length],
          isShortlisted: shortlisted,
          status: 'pending',
          milestones: [
            { title: 'Project Setup & Architecture', amount: Math.round(price * 0.2), dueInDays: Math.round(days * 0.2), order: 1 },
            { title: 'Core Feature Development',    amount: Math.round(price * 0.5), dueInDays: Math.round(days * 0.6), order: 2 },
            { title: 'Testing & Final Delivery',    amount: Math.round(price * 0.3), dueInDays: days,                   order: 3 },
          ],
          createdAt: daysAgo(Math.floor(Math.random() * 7)),
        })
      )
    );
    console.log(`💼 ${offerPairs.length} offers created`);

    // ── One Active Contract (project 0, dev 0) ────────────────────────────────
    const acceptedOffer = await Offer.findOneAndUpdate(
      { project: projects[0]._id, developer: devUsers[0]._id },
      { status: 'accepted', acceptedAt: daysAgo(10) },
      { new: true }
    );

    await Offer.updateMany(
      { project: projects[0]._id, developer: { $ne: devUsers[0]._id } },
      { status: 'closed' }
    );

    await Project.findByIdAndUpdate(projects[0]._id, {
      status: 'in_progress',
      acceptedOffer: acceptedOffer._id,
      assignedDeveloper: devUsers[0]._id,
    });

    const contract1 = await Contract.create({
      project: projects[0]._id,
      offer: acceptedOffer._id,
      client: clientUsers[0]._id,
      developer: devUsers[0]._id,
      agreedPrice: acceptedOffer.proposedPrice,
      deliveryDays: acceptedOffer.deliveryDays,
      startDate: daysAgo(10),
      expectedEndDate: daysFromNow(45),
      platformFee: Math.round(acceptedOffer.proposedPrice * 0.1),
      developerEarnings: Math.round(acceptedOffer.proposedPrice * 0.9),
      status: 'active',
      termsAcceptedByClient: true,
      termsAcceptedByDeveloper: true,
    });

    await Milestone.insertMany([
      {
        contract: contract1._id, project: projects[0]._id,
        title: 'Project Setup & Architecture',
        description: 'Database schema, API structure, project scaffolding, and CI/CD pipeline.',
        amount: Math.round(acceptedOffer.proposedPrice * 0.2),
        dueDate: daysAgo(3), order: 1, status: 'approved',
        approvedAt: daysAgo(2),
      },
      {
        contract: contract1._id, project: projects[0]._id,
        title: 'Core Feature Development',
        description: 'Vendor management, product catalog, shopping cart, and checkout flow.',
        amount: Math.round(acceptedOffer.proposedPrice * 0.5),
        dueDate: daysFromNow(20), order: 2, status: 'in_progress',
      },
      {
        contract: contract1._id, project: projects[0]._id,
        title: 'Testing & Final Delivery',
        description: 'E2E testing, performance optimization, deployment, and documentation.',
        amount: Math.round(acceptedOffer.proposedPrice * 0.3),
        dueDate: daysFromNow(45), order: 3, status: 'pending',
      },
    ]);
    console.log('📑 Contract 1 created (active — project 0)');

    // ── One Completed Contract (project 7, dev 0) ─────────────────────────────
    const completedOffer = await Offer.findOneAndUpdate(
      { project: projects[7]._id, developer: devUsers[0]._id },
      { status: 'accepted', acceptedAt: daysAgo(35) },
      { new: true }
    );

    await Project.findByIdAndUpdate(projects[7]._id, {
      status: 'completed',
      acceptedOffer: completedOffer?._id,
      assignedDeveloper: devUsers[0]._id,
      completedAt: daysAgo(5),
    });

    const contract2 = await Contract.create({
      project: projects[7]._id,
      offer: completedOffer?._id,
      client: clientUsers[3]._id,
      developer: devUsers[0]._id,
      agreedPrice: 35000,
      deliveryDays: 22,
      startDate: daysAgo(35),
      expectedEndDate: daysAgo(13),
      actualEndDate: daysAgo(5),
      platformFee: 3500,
      developerEarnings: 31500,
      status: 'completed',
      termsAcceptedByClient: true,
      termsAcceptedByDeveloper: true,
    });

    // Reviews for completed contract
    await Review.create({
      project: projects[7]._id,
      contract: contract2._id,
      reviewer: clientUsers[3]._id,
      reviewee: devUsers[0]._id,
      rating: 5,
      comment: 'Kiran did an exceptional job on our Next.js migration. Delivered ahead of schedule, communicated proactively, and the final PageSpeed score went from 34 to 94. Highly recommend and will definitely hire again for our next project.',
      reviewType: 'client_to_developer',
    });

    await Review.create({
      project: projects[7]._id,
      contract: contract2._id,
      reviewer: devUsers[0]._id,
      reviewee: clientUsers[3]._id,
      rating: 5,
      comment: 'Priya was a pleasure to work with. Clear requirements, prompt feedback, and reasonable expectations. The project had well-defined scope which made delivery smooth. Would gladly work with her again.',
      reviewType: 'developer_to_client',
    });

    // Update developer stats
    await DeveloperProfile.findOneAndUpdate(
      { user: devUsers[0]._id },
      { $inc: { completedProjects: 1, totalEarnings: 31500 } }
    );
    await ClientProfile.findOneAndUpdate(
      { user: clientUsers[3]._id },
      { $inc: { completedProjects: 1, totalSpent: 35000 } }
    );
    console.log('✅ Contract 2 created (completed — project 7 with reviews)');

    // ── Notifications ────────────────────────────────────────────────────────
    await Notification.insertMany([
      {
        recipient: clientUsers[0]._id,
        type: 'new_offer',
        title: 'New offer received',
        message: 'Kiran Rao submitted an offer of ₹95,000 on "Multi-vendor E-commerce Platform"',
        link: `/projects/${projects[0]._id}/offers`,
        isRead: false,
      },
      {
        recipient: clientUsers[0]._id,
        type: 'new_offer',
        title: 'New offer received',
        message: 'Rohan Desai submitted an offer of ₹88,000 on "Multi-vendor E-commerce Platform"',
        link: `/projects/${projects[0]._id}/offers`,
        isRead: true,
      },
      {
        recipient: devUsers[0]._id,
        type: 'milestone_approved',
        title: 'Milestone approved!',
        message: '"Project Setup & Architecture" was approved on "Multi-vendor E-commerce Platform"',
        link: `/workspace/${projects[0]._id}`,
        isRead: false,
      },
      {
        recipient: clientUsers[1]._id,
        type: 'new_offer',
        title: 'New offer received',
        message: 'Anjali Verma submitted an offer on "Flutter Fitness & Health Tracking App"',
        link: `/projects/${projects[1]._id}/offers`,
        isRead: false,
      },
    ]);
    console.log('🔔 Notifications created');

    // ─── Summary ──────────────────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ CRAFT seed data created successfully!\n');
    console.log('📧 Login credentials (password: password123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Admin:      admin@craftdemo.com');
    console.log('👤 Clients:    rahul@craftdemo.com | sneha@craftdemo.com | arjun@craftdemo.com');
    console.log('              priya@craftdemo.com | vikram@craftdemo.com');
    console.log('💻 Developers: kiran@craftdemo.com | anjali@craftdemo.com | rohan@craftdemo.com');
    console.log('              meera@craftdemo.com | siddharth@craftdemo.com | pooja@craftdemo.com');
    console.log('              amit@craftdemo.com  | lakshmi@craftdemo.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
