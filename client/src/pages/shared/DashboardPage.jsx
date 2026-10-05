import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight, FolderOpen, FileText, Briefcase,
  TrendingUp, Clock, PlusCircle, Search,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { projectApi, offerApi, contractApi } from '../../api/index.js';
import { AppLayout }    from '../../components/layout/AppLayout.jsx';
import { ProjectCard }  from '../../components/cards/ProjectCard.jsx';
import { CardSkeleton } from '../../components/ui/Spinner.jsx';
import { Badge }        from '../../components/ui/Badge.jsx';
import { formatCurrency, formatRelativeTime } from '../../utils/format.js';
import { OFFER_STATUS_LABELS } from '../../constants/index.js';
import { cn } from '../../utils/cn.js';

/* ── Stat card — minimal dark/white theme ─────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, to }) => {
  const card = (
    <div className="card p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{label}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {value ?? '—'}
        </p>
      </div>
    </div>
  );
  return to
    ? <Link to={to} className="block hover:shadow-card-hover transition-shadow rounded-xl">{card}</Link>
    : card;
};

/* ── Page ─────────────────────────────────────────────────────────────────── */
export const DashboardPage = () => {
  const { user, isClient } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-8">

        {/* Greeting + primary CTA */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Here's what's happening on CRAFT.
            </p>
          </div>
          {isClient ? (
            <Link to="/projects/new" className="btn-primary gap-2 self-start shrink-0">
              <PlusCircle className="w-4 h-4" />
              <span>Post a Project</span>
            </Link>
          ) : (
            <Link to="/projects" className="btn-primary gap-2 self-start shrink-0">
              <Search className="w-4 h-4" />
              <span>Find Projects</span>
            </Link>
          )}
        </div>

        {isClient ? <ClientDashboard /> : <DeveloperDashboard />}
      </div>
    </AppLayout>
  );
};

/* ── Client Dashboard ─────────────────────────────────────────────────────── */
const ClientDashboard = () => {
  const { data: projectsData, isLoading } = useQuery(
    'my-projects-dash',
    () => projectApi.getMy({ limit: 10 }).then((r) => r.data),
    { staleTime: 0 }
  );

  const projects  = projectsData?.data || [];
  const total     = projectsData?.pagination?.total || 0;
  const open      = projects.filter((p) => p.status === 'open').length;
  const active    = projects.filter((p) => p.status === 'in_progress').length;
  const completed = projects.filter((p) => p.status === 'completed').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FolderOpen} label="Total"       value={total}     to="/dashboard/projects" />
        <StatCard icon={Search}     label="Open"        value={open}                                />
        <StatCard icon={Briefcase}  label="In Progress" value={active}                              />
        <StatCard icon={TrendingUp} label="Completed"   value={completed}                           />
      </div>

      {/* Recent projects */}
      <Section
        title="Recent Projects"
        linkTo="/dashboard/projects"
        linkLabel="View all"
      >
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-3">
            <CardSkeleton /><CardSkeleton />
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-8 sm:p-10 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              No projects yet. Post your first one!
            </p>
            <Link to="/projects/new" className="btn-primary">Post a Project</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.slice(0, 4).map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};

/* ── Developer Dashboard ─────────────────────────────────────────────────── */
const DeveloperDashboard = () => {
  const { data: offersData, isLoading: offersLoading } = useQuery(
    'my-offers-dash',
    () => offerApi.getMy({ limit: 5 }).then((r) => r.data),
    { staleTime: 0 }
  );
  const { data: contractsData } = useQuery(
    'my-contracts-dash',
    () => contractApi.getMy().then((r) => r.data)
  );
  const { data: projectsData, isLoading: projectsLoading } = useQuery(
    'explore-projects-dash',
    () => projectApi.getAll({ limit: 4 }).then((r) => r.data),
    { staleTime: 30000 }
  );

  const offers    = offersData?.data || [];
  const contracts = contractsData?.contracts || [];
  const pending   = offers.filter((o) => o.status === 'pending').length;
  const accepted  = offers.filter((o) => o.status === 'accepted').length;
  const active    = contracts.filter((c) => c.status === 'active').length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FileText}   label="Offers Sent"  value={offers.length} to="/dashboard/offers" />
        <StatCard icon={Clock}      label="Pending"      value={pending}                               />
        <StatCard icon={Briefcase}  label="Active"       value={active}                                />
        <StatCard icon={TrendingUp} label="Accepted"     value={accepted}                              />
      </div>

      {/* On mobile: stack. On lg: two-column. */}
      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">

        {/* Recent offers */}
        <Section title="My Offers" linkTo="/dashboard/offers" linkLabel="View all">
          {offersLoading ? (
            <CardSkeleton />
          ) : offers.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No offers yet.</p>
              <Link to="/projects" className="btn-secondary text-sm">Find Projects</Link>
            </div>
          ) : (
            <div className="card divide-y divide-gray-100 dark:divide-white/[0.06]">
              {offers.slice(0, 5).map((offer) => {
                const s = OFFER_STATUS_LABELS[offer.status] || OFFER_STATUS_LABELS.pending;
                return (
                  <Link
                    key={offer._id}
                    to={`/projects/${offer.project?._id}`}
                    className="flex items-center gap-3 p-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {offer.project?.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRelativeTime(offer.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(offer.proposedPrice)}
                      </p>
                      <Badge color={s.color} className="mt-0.5">{s.label}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>

        {/* Explore projects */}
        <Section title="Explore Projects" linkTo="/projects" linkLabel="Browse all">
          {projectsLoading ? (
            <CardSkeleton />
          ) : (
            <div className="space-y-3">
              {projectsData?.data?.slice(0, 4).map((p) => (
                <ProjectCard key={p._id} project={p} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
};

/* ── Reusable section header ──────────────────────────────────────────────── */
const Section = ({ title, linkTo, linkLabel, children }) => (
  <div>
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
        >
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
    {children}
  </div>
);
