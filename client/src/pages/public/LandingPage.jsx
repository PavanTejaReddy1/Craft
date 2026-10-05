import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowRight, Code2, Smartphone, Globe, Brain, Cloud, Database,
  Zap, BarChart2, CheckCircle2, Shield, Clock, Users, Layers,
  TestTube, Wrench, MessageSquare, ChevronRight, Star,
} from 'lucide-react';
import { projectApi, profileApi } from '../../api/index.js';
import { ProjectCard } from '../../components/cards/ProjectCard.jsx';
import { DeveloperCard } from '../../components/cards/DeveloperCard.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { LandingLayout } from '../../components/layout/AppLayout.jsx';
import { cn } from '../../utils/cn.js';

/* ─── Categories ─────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { icon: Globe,        label: 'Web Development'       },
  { icon: Smartphone,   label: 'Mobile Apps'           },
  { icon: Code2,        label: 'Full Stack'             },
  { icon: Brain,        label: 'AI / ML'                },
  { icon: Cloud,        label: 'Cloud / DevOps'         },
  { icon: Database,     label: 'Database'               },
  { icon: BarChart2,    label: 'Data Analytics'         },
  { icon: Zap,          label: 'Automation'             },
  { icon: Layers,       label: 'UI / UX Design'         },
  { icon: TestTube,     label: 'Testing / QA'           },
  { icon: Wrench,       label: 'Bug Fixing'             },
  { icon: MessageSquare,label: 'Tech Consulting'        },
];

/* ─── How it works ───────────────────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Post a Project',  desc: 'Describe what you need, set your budget, pick your tech stack.' },
  { n: '02', title: 'Receive Offers',  desc: 'Developers submit tailored proposals with timelines and prices.' },
  { n: '03', title: 'Compare & Hire',  desc: 'Review portfolios, compare proposals, choose the right person.' },
  { n: '04', title: 'Build Together',  desc: 'Work through milestones in a shared workspace with messaging.' },
];

/* ─── Testimonials ───────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Priya S.',   role: 'Founder, Shopflow',         text: 'Found an exceptional React developer in under 24 hours. The comparison tools made the decision easy.', rating: 5 },
  { name: 'Arjun M.',   role: 'Full Stack Developer',       text: 'CRAFT connects me with clients who have real projects and fair budgets. Far better than other platforms.', rating: 5 },
  { name: 'Sneha R.',   role: 'Product Manager, FinSync',   text: 'The milestone system gave us full visibility. Transparent and professional from start to finish.', rating: 5 },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */
export const LandingPage = () => {
  const { data: featuredData } = useQuery('featured-projects',
    () => projectApi.getFeatured().then((r) => r.data), { staleTime: 60000 }
  );
  const { data: developersData } = useQuery('featured-developers',
    () => profileApi.searchDevelopers({ limit: 4 }).then((r) => r.data), { staleTime: 60000 }
  );

  return (
    <LandingLayout>
      <Hero />
      <StatsBar />
      <CategoriesSection />
      <HowItWorks />
      <ForWho />
      {featuredData?.projects?.length > 0 && (
        <FeaturedProjects projects={featuredData.projects} />
      )}
      {developersData?.profiles?.length > 0 && (
        <FeaturedDevelopers profiles={developersData.profiles} />
      )}
      <Testimonials />
      <Trust />
      <FinalCTA />
    </LandingLayout>
  );
};

/* ─── Hero ───────────────────────────────────────────────────────────────── */
const Hero = () => (
  <section className="relative bg-gray-950 min-h-screen flex flex-col justify-center overflow-hidden">
    {/* Subtle grid */}
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    />
    {/* Very subtle glow — one, centered, white */}
    <div
      aria-hidden
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-[0.04] blur-[120px] bg-white pointer-events-none"
    />

    <div className="relative container-app pt-32 pb-28 text-center">
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-white/50 text-xs font-medium mb-10 tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
        Technology project marketplace
      </div>

      {/* Headline */}
      <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-white leading-[0.93] tracking-tight mb-7">
        Ideas.{' '}
        <br className="sm:hidden" />
        Talent.{' '}
        <br />
        <span className="text-white/40">Built.</span>
      </h1>

      {/* Sub */}
      <p className="text-base sm:text-lg text-white/40 max-w-xl mx-auto mb-10 leading-relaxed font-light">
        Post your technology project, discover skilled developers,
        compare proposals, and get the right work done.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/register?role=client"
          className="btn-dark-primary text-sm px-6 py-3 gap-2 group"
        >
          Post a Project
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link to="/projects" className="btn-dark-secondary text-sm px-6 py-3">
          Browse Projects
        </Link>
      </div>

      {/* Social proof row */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-white/25 text-sm">
        <div className="flex -space-x-2">
          {['P','A','S','K','R'].map((l, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-gray-950 bg-gray-700 flex items-center justify-center text-xs font-semibold text-white/70"
            >
              {l}
            </div>
          ))}
        </div>
        <span>Trusted by <strong className="text-white/50 font-medium">4,200+</strong> users</span>
        <span className="hidden sm:block w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-3.5 h-3.5 fill-white/50 text-white/50" />
          ))}
          <span className="ml-1.5 text-white/40 font-medium">4.9 / 5</span>
        </div>
      </div>
    </div>

    {/* Bottom fade */}
    <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />
  </section>
);

/* ─── Stats bar ──────────────────────────────────────────────────────────── */
const STATS = [
  { value: '2,400+', label: 'Projects posted'    },
  { value: '1,800+', label: 'Skilled developers' },
  { value: '₹4.2Cr+', label: 'Work completed'   },
  { value: '4.9 / 5', label: 'Average rating'   },
];

const StatsBar = () => (
  <section className="bg-gray-950 pb-16">
    <div className="container-app">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden">
        {STATS.map(({ value, label }) => (
          <div key={label} className="px-8 py-8 text-center bg-white/[0.02]">
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-white/30">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Categories ─────────────────────────────────────────────────────────── */
const CategoriesSection = () => (
  <section className="bg-white py-24">
    <div className="container-app">
      <SectionHeader
        label="Categories"
        title="Every technology, one marketplace."
        sub="From web apps to AI pipelines — post any kind of technology project."
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mt-12">
        {CATEGORIES.map(({ icon: Icon, label }) => (
          <Link
            key={label}
            to={`/projects?category=${encodeURIComponent(label)}`}
            className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-center"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 leading-tight transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

/* ─── How it works ───────────────────────────────────────────────────────── */
const HowItWorks = () => (
  <section id="how-it-works" className="bg-gray-50 py-24">
    <div className="container-app">
      <SectionHeader
        label="Process"
        title="How CRAFT works."
        sub="Four transparent steps from idea to delivered product."
      />
      <div className="mt-14 grid md:grid-cols-4 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-5 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px bg-gray-200" aria-hidden />
        {STEPS.map(({ n, title, desc }) => (
          <div key={n} className="flex flex-col items-center text-center">
            <div className="relative w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-mono text-xs font-bold mb-5 z-10 shrink-0">
              {n}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── For who ────────────────────────────────────────────────────────────── */
const ForWho = () => (
  <section className="bg-white py-24">
    <div className="container-app">
      <SectionHeader
        label="Built for both sides"
        title="One platform, two experiences."
      />
      <div className="mt-12 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {/* Clients — dark card */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-950 p-8 border border-white/[0.07]">
          <div
            aria-hidden
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] bg-white/[0.04] pointer-events-none"
          />
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">For Clients</p>
          <h3 className="text-xl font-bold text-white mb-3 leading-snug">
            Turn your idea<br />into a real product
          </h3>
          <p className="text-sm text-white/40 mb-7 leading-relaxed">
            Post once, receive competitive offers from verified developers.
            Compare skills and portfolios to find the right fit.
          </p>
          <ul className="space-y-2.5 mb-8">
            {['Post any technology project','Receive tailored proposals','Compare developer profiles','Milestone-based delivery','Dedicated project workspace'].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-white/60">
                <CheckCircle2 className="w-4 h-4 text-white/30 shrink-0" />{item}
              </li>
            ))}
          </ul>
          <Link to="/register?role=client" className="btn-dark-primary text-sm px-5 py-2.5 gap-2 group inline-flex">
            Post a Project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Developers — light card */}
        <div className="relative overflow-hidden rounded-2xl bg-gray-50 p-8 border border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">For Developers</p>
          <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
            Find projects that<br />match your skills
          </h3>
          <p className="text-sm text-gray-500 mb-7 leading-relaxed">
            Browse real technology projects, submit focused proposals,
            and build a reputation that attracts better opportunities.
          </p>
          <ul className="space-y-2.5 mb-8">
            {['Browse technology projects','Submit targeted proposals','Showcase your portfolio','Build your reputation','Get paid securely'].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-gray-400 shrink-0" />{item}
              </li>
            ))}
          </ul>
          <Link to="/register?role=developer" className="btn-primary text-sm px-5 py-2.5 gap-2 group inline-flex">
            Find Projects
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Featured projects ──────────────────────────────────────────────────── */
const FeaturedProjects = ({ projects }) => (
  <section className="bg-gray-50 py-24">
    <div className="container-app">
      <div className="flex items-end justify-between mb-10">
        <SectionHeader label="Open Now" title="Featured projects." inline />
        <Link to="/projects" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group">
          View all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.slice(0, 6).map(p => <ProjectCard key={p._id} project={p} showClient />)}
      </div>
    </div>
  </section>
);

/* ─── Featured developers ────────────────────────────────────────────────── */
const FeaturedDevelopers = ({ profiles }) => (
  <section className="bg-white py-24">
    <div className="container-app">
      <div className="flex items-end justify-between mb-10">
        <SectionHeader label="Top Talent" title="Meet the developers." inline />
        <Link to="/developers" className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group">
          View all <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.slice(0, 4).map(p => <DeveloperCard key={p._id} developer={p} user={p.user} />)}
      </div>
    </div>
  </section>
);

/* ─── Testimonials ───────────────────────────────────────────────────────── */
const Testimonials = () => (
  <section className="bg-gray-50 py-24">
    <div className="container-app">
      <SectionHeader
        label="Reviews"
        title="What people say."
        sub="Real reviews from completed projects."
      />
      <div className="mt-12 grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {TESTIMONIALS.map(({ name, role, text, rating }) => (
          <div key={name} className="card p-6 flex flex-col gap-4">
            {/* Stars */}
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={cn('w-4 h-4', i <= rating ? 'fill-gray-900 text-gray-900' : 'fill-gray-200 text-gray-200')} />
              ))}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed flex-1">"{text}"</p>
            <div className="flex items-center gap-2.5 pt-3 border-t border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                {name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-400">{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Trust ──────────────────────────────────────────────────────────────── */
const Trust = () => (
  <section className="bg-white py-20">
    <div className="container-app">
      <div className="grid sm:grid-cols-3 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
        {[
          { icon: Shield, title: 'Verified Profiles',  desc: 'Identity and skill verification before participating in the marketplace.' },
          { icon: Star,   title: 'Honest Reviews',     desc: 'Reviews only from completed projects. No fabricated metrics.' },
          { icon: Clock,  title: 'Milestone Tracking', desc: 'Clear milestones with defined deliverables, approvals, and revisions.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white flex flex-col items-center text-center p-10 gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Final CTA ──────────────────────────────────────────────────────────── */
const FinalCTA = () => (
  <section className="bg-gray-950 py-32 relative overflow-hidden">
    {/* Grid */}
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.025]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
        backgroundSize: '64px 64px',
      }}
    />
    <div className="relative container-app text-center">
      <h2 className="text-5xl sm:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
        Ready to build<br />
        <span className="text-white/30">something great?</span>
      </h2>
      <p className="text-white/35 text-base max-w-md mx-auto mb-12 leading-relaxed">
        Join thousands of clients and developers building technology together on CRAFT.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/register?role=client" className="btn-dark-primary text-sm px-8 py-3.5 gap-2 group">
          Post a Project
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link to="/register?role=developer" className="btn-dark-secondary text-sm px-8 py-3.5">
          Find Projects
        </Link>
      </div>
      <p className="mt-8 text-sm text-white/20">Free to join. No credit card required.</p>
    </div>
  </section>
);

/* ─── Reusable section header ────────────────────────────────────────────── */
const SectionHeader = ({ label, title, sub, inline = false }) => (
  <div className={inline ? '' : 'text-center'}>
    {label && (
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
    )}
    <h2 className="text-3xl font-bold text-gray-900 leading-tight">{title}</h2>
    {sub && <p className="text-gray-500 mt-3 max-w-lg mx-auto text-sm leading-relaxed">{sub}</p>}
  </div>
);
