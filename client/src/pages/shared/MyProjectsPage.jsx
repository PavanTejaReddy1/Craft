import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlusCircle, Search, Pencil, Trash2, ExternalLink, Users, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { CardSkeleton } from '../../components/ui/Spinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { formatBudget, formatDelivery, formatRelativeTime } from '../../utils/format.js';
import { PROJECT_STATUS_LABELS } from '../../constants/index.js';
import { cn } from '../../utils/cn.js';

const STATUS_TABS = [
  { value: '',            label: 'All'         },
  { value: 'open',        label: 'Open'        },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed'   },
  { value: 'cancelled',   label: 'Cancelled'   },
];

export const MyProjectsPage = () => {
  const { isClient, isDeveloper } = useAuth();
  const [status, setStatus] = useState('');
  const [page, setPage]     = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null); // project to confirm-delete
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  const { data, isLoading } = useQuery(
    ['my-projects', status, page],
    () => projectApi.getMy({ status, page, limit: 12 }).then((r) => r.data),
    { keepPreviousData: true }
  );

  const deleteMutation = useMutation(
    (id) => projectApi.delete(id),
    {
      onSuccess: () => {
        toast.success('Project deleted');
        setDeleteTarget(null);
        queryClient.invalidateQueries(['my-projects']);
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Delete failed'),
    }
  );

  const projects = data?.data || [];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isClient ? 'My Projects' : 'Active Projects'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {data?.pagination?.total || 0} project{data?.pagination?.total !== 1 ? 's' : ''}
          </p>
        </div>
        {isClient && (
          <Link to="/projects/new" className="btn-primary gap-2">
            <PlusCircle className="w-4 h-4" /> Post a Project
          </Link>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-0.5 border-b border-gray-200 dark:border-white/[0.08] mb-6 overflow-x-auto scrollbar-thin">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
              status === tab.value
                ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Search}
          title={status ? `No ${status.replace('_', ' ')} projects` : 'No projects yet'}
          description={
            isClient
              ? 'Post your first project and start receiving offers from developers.'
              : 'You have no active projects right now. Find new projects to work on.'
          }
          action={
            isClient
              ? <Link to="/projects/new" className="btn-primary">Post a Project</Link>
              : <Link to="/projects"     className="btn-primary">Find Projects</Link>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectRow
                key={project._id}
                project={project}
                isClient={isClient}
                onEdit={() => navigate(`/projects/${project._id}/edit`)}
                onDelete={() => setDeleteTarget(project)}
              />
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination?.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {page} / {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.pagination.pages}
                className="btn-secondary disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete project?"
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You're about to delete{' '}
            <strong className="text-gray-900 dark:text-white">"{deleteTarget?.title}"</strong>.
            This cannot be undone.
          </p>
          {deleteTarget?.offerCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-lg">
              <span className="text-amber-600 text-xs mt-0.5">⚠</span>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This project has {deleteTarget.offerCount} offer{deleteTarget.offerCount !== 1 ? 's' : ''}. Deleting it will also remove all offers.
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button
              variant="danger"
              className="flex-1"
              loading={deleteMutation.isLoading}
              onClick={() => deleteMutation.mutate(deleteTarget._id)}
            >
              Delete Project
            </Button>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

/* ── Project row ─────────────────────────────────────────────────────────────── */
const dotColor = {
  open:        'bg-green-500',
  in_progress: 'bg-gray-900 dark:bg-white',
  completed:   'bg-gray-400',
  draft:       'bg-gray-300',
  cancelled:   'bg-red-400',
};

const ProjectRow = ({ project, isClient, onEdit, onDelete }) => {
  const status    = PROJECT_STATUS_LABELS[project.status] || PROJECT_STATUS_LABELS.open;
  const canEdit   = isClient && ['draft', 'open'].includes(project.status);
  const canDelete = isClient && project.status !== 'in_progress';

  const showOffers    = isClient && project.status === 'open' && project.offerCount > 0;
  const showWorkspace = project.status === 'in_progress';

  return (
    <div className="card hover:shadow-card-hover hover:border-gray-300 dark:hover:border-white/[0.15] transition-all duration-200">
      <div className="p-4 sm:p-5">
        {/* Top row — status dot + title + badge + icon actions */}
        <div className="flex items-start gap-3">
          {/* Status dot */}
          <span className={cn('block w-2 h-2 rounded-full mt-2 shrink-0', dotColor[project.status] || 'bg-gray-300')} />

          {/* Title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/projects/${project._id}`}
                className="text-sm font-semibold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors line-clamp-2 leading-snug"
              >
                {project.title}
              </Link>
              <Badge color={status.color} className="shrink-0 ml-1">{status.label}</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{project.category}</p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white text-sm">
                {formatBudget(project.budgetMin, project.budgetMax)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDelivery(project.expectedDeliveryDays)}
              </span>
              {project.offerCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.offerCount} offer{project.offerCount !== 1 ? 's' : ''}
                </span>
              )}
              <span className="text-gray-400">{formatRelativeTime(project.createdAt)}</span>
            </div>
          </div>

          {/* Icon-only actions (always visible) */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Link
              to={`/projects/${project._id}`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
              title="View"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            {canEdit && (
              <Link
                to={`/projects/${project._id}/edit`}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </Link>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary action buttons — always visible, below meta on all screens */}
        {(showOffers || showWorkspace) && (
          <div className="flex gap-2 mt-3 pl-5">
            {showWorkspace && (
              <Link
                to={`/workspace/${project._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              >
                Open Workspace
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {showOffers && (
              <Link
                to={`/projects/${project._id}/offers`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                View Offers ({project.offerCount})
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
