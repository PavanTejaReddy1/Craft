import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  MessageSquare, ListChecks, FileText, Activity, Send,
  Paperclip, CheckCircle2, RotateCcw, Clock, ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contractApi, messageApi } from '../../api/index.js';
import { useAuth }    from '../../contexts/AuthContext.jsx';
import { AppLayout }  from '../../components/layout/AppLayout.jsx';
import { Avatar }     from '../../components/ui/Avatar.jsx';
import { Badge }      from '../../components/ui/Badge.jsx';
import { Button }     from '../../components/ui/Button.jsx';
import { Modal }      from '../../components/ui/Modal.jsx';
import { Spinner }    from '../../components/ui/Spinner.jsx';
import { cn }         from '../../utils/cn.js';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/format.js';
import { MILESTONE_STATUS_LABELS } from '../../constants/index.js';

const TABS = [
  { id: 'overview',   label: 'Overview',    icon: Activity      },
  { id: 'milestones', label: 'Milestones',  icon: ListChecks    },
  { id: 'messages',   label: 'Messages',    icon: MessageSquare },
  { id: 'files',      label: 'Files',       icon: FileText      },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Workspace Page
   ═══════════════════════════════════════════════════════════════════════════ */
export const WorkspacePage = () => {
  const { projectId }               = useParams();
  const { user, isClient, isDeveloper } = useAuth();
  const [activeTab, setActiveTab]   = useState('overview');

  const { data, isLoading, error } = useQuery(
    ['contract', projectId],
    () => contractApi.getByProject(projectId).then((r) => r.data)
  );

  if (isLoading) return (
    <AppLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </AppLayout>
  );

  if (error || !data?.contract) return (
    <AppLayout>
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        Workspace not found.
      </div>
    </AppLayout>
  );

  const { contract, milestones } = data;
  const project        = contract.project;
  const completedCount = milestones?.filter((m) => m.status === 'approved').length || 0;
  const totalMilestones= milestones?.length || 0;
  const progress       = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl">

        {/* ── Header ── */}
        <div>
          {/* Breadcrumb */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>

          <div className="flex items-start justify-between gap-3">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight flex-1 min-w-0 pr-2">
              {project?.title}
            </h1>
            <Badge color={contract.status === 'active' ? 'green' : 'gray'} dot className="shrink-0 mt-0.5">
              {contract.status === 'active' ? 'Active' : contract.status}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Progress</span>
              <span>{completedCount}/{totalMilestones} milestones done</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 dark:bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="border-b border-gray-200 dark:border-white/[0.08]">
          <div className="flex overflow-x-auto scrollbar-thin -mb-px">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === id
                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        {activeTab === 'overview'   && <OverviewTab   contract={contract} milestones={milestones} />}
        {activeTab === 'milestones' && <MilestonesTab contract={contract} milestones={milestones} projectId={projectId} isClient={isClient} isDeveloper={isDeveloper} />}
        {activeTab === 'messages'   && <MessagesTab   contractId={contract._id} currentUser={user} />}
        {activeTab === 'files'      && <FilesTab      milestones={milestones} />}
      </div>
    </AppLayout>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Overview Tab
   ═══════════════════════════════════════════════════════════════════════════ */
const OverviewTab = ({ contract, milestones }) => (
  <div className="space-y-4">
    {/* Contract details + Team — stack on mobile, 2-col on lg */}
    <div className="grid sm:grid-cols-2 gap-4">
      {/* Contract */}
      <div className="card p-4 sm:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contract</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Agreed price</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(contract.agreedPrice)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Dev earns</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(contract.developerEarnings)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Started</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">{formatDate(contract.startDate)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Due</p>
            <p className="font-medium text-gray-700 dark:text-gray-300">{formatDate(contract.expectedEndDate)}</p>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="card p-4 sm:p-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Team</h3>
        {[
          { user: contract.client,    role: 'Client'    },
          { user: contract.developer, role: 'Developer' },
        ].map(({ user, role }) => (
          <div key={role} className="flex items-center gap-3">
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Milestone summary */}
    <div className="card p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Milestones</h3>
      <div className="space-y-2.5">
        {milestones?.map((m) => {
          const s = MILESTONE_STATUS_LABELS[m.status] || MILESTONE_STATUS_LABELS.pending;
          return (
            <div
              key={m._id}
              className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 dark:border-white/[0.06] last:border-0"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-gray-400 shrink-0 w-5">{m.order}.</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-gray-900 dark:text-white hidden sm:block">
                  {formatCurrency(m.amount)}
                </span>
                <Badge color={s.color}>{s.label}</Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   Milestones Tab
   ═══════════════════════════════════════════════════════════════════════════ */
const MilestonesTab = ({ contract, milestones: init, projectId, isClient, isDeveloper }) => {
  const queryClient = useQueryClient();
  const [submitModal,  setSubmitModal]  = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [revisionModal,setRevisionModal]= useState(null);
  const [note, setNote] = useState('');

  const { data } = useQuery(
    ['milestones', projectId],
    () => contractApi.getMilestones(projectId).then((r) => r.data)
  );
  const milestones = data?.milestones || init || [];

  const invalidate = () => {
    queryClient.invalidateQueries(['milestones', projectId]);
    queryClient.invalidateQueries(['contract', projectId]);
  };

  const approveMut = useMutation(
    ({ id, note }) => contractApi.approveMilestone(projectId, id, { note }),
    { onSuccess: () => { toast.success('Milestone approved!'); invalidate(); setApproveModal(null); setNote(''); },
      onError: (e) => toast.error(e?.response?.data?.message) }
  );
  const revisionMut = useMutation(
    ({ id, note }) => contractApi.requestRevision(projectId, id, { note }),
    { onSuccess: () => { toast.success('Revision requested'); invalidate(); setRevisionModal(null); setNote(''); },
      onError: (e) => toast.error(e?.response?.data?.message) }
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {milestones.map((m) => {
        const s   = MILESTONE_STATUS_LABELS[m.status] || MILESTONE_STATUS_LABELS.pending;
        const sub = m.submissions?.[m.submissions.length - 1];

        return (
          <div key={m._id} className="card p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono text-gray-400">#{m.order}</span>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</h3>
                </div>
                {m.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{m.description}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(m.amount)}</p>
                <Badge color={s.color} className="mt-1">{s.label}</Badge>
              </div>
            </div>

            <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" /> Due {formatDate(m.dueDate)}
            </p>

            {/* Latest submission */}
            {sub && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Latest submission</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{sub.message}</p>
                {sub.revisionNote && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                    Revision note: {sub.revisionNote}
                  </p>
                )}
                {sub.attachments?.map((f) => (
                  <a key={f.filename} href={f.url}
                    className="flex items-center gap-1 mt-1 text-xs text-gray-600 dark:text-gray-400 hover:underline">
                    <Paperclip className="w-3 h-3" />{f.originalName}
                  </a>
                ))}
              </div>
            )}

            {/* Actions */}
            {(isDeveloper && ['pending','in_progress','revision_requested'].includes(m.status)) ||
             (isClient && m.status === 'submitted') ? (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                {isDeveloper && (
                  <Button size="sm" variant="primary" onClick={() => setSubmitModal(m._id)}>
                    Submit Milestone
                  </Button>
                )}
                {isClient && (
                  <>
                    <Button size="sm" variant="primary" onClick={() => setApproveModal(m._id)}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setRevisionModal(m._id)}>
                      <RotateCcw className="w-3.5 h-3.5" /> Revision
                    </Button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        );
      })}

      {/* Submit milestone modal */}
      <SubmitMilestoneModal
        open={!!submitModal}
        milestoneId={submitModal}
        projectId={projectId}
        onClose={() => setSubmitModal(null)}
        onSuccess={() => { invalidate(); setSubmitModal(null); }}
      />

      {/* Approve modal */}
      <Modal open={!!approveModal} onClose={() => setApproveModal(null)} title="Approve Milestone" size="sm">
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Confirm you're satisfied with this delivery.
          </p>
          <textarea
            className="input"
            rows={3}
            placeholder="Optional approval note…"
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1"
              loading={approveMut.isLoading}
              onClick={() => approveMut.mutate({ id: approveModal, note })}
            >
              Approve
            </Button>
            <Button variant="secondary" onClick={() => setApproveModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Revision modal */}
      <Modal open={!!revisionModal} onClose={() => setRevisionModal(null)} title="Request Revision" size="sm">
        <div className="p-5 space-y-4">
          <textarea
            className="input"
            rows={4}
            placeholder="Describe what needs to be revised…"
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="danger"
              className="flex-1"
              loading={revisionMut.isLoading}
              onClick={() => revisionMut.mutate({ id: revisionModal, note })}
            >
              Request Revision
            </Button>
            <Button variant="secondary" onClick={() => setRevisionModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const SubmitMilestoneModal = ({ open, milestoneId, projectId, onClose, onSuccess }) => {
  const [message, setMessage] = useState('');
  const mutation = useMutation(
    () => {
      const fd = new FormData();
      fd.append('message', message);
      return contractApi.submitMilestone(projectId, milestoneId, fd);
    },
    {
      onSuccess: () => { toast.success('Submitted!'); onSuccess(); },
      onError:   (e) => toast.error(e?.response?.data?.message),
    }
  );

  return (
    <Modal open={open} onClose={onClose} title="Submit Milestone">
      <div className="p-5 space-y-4">
        <textarea
          className="input"
          rows={5}
          placeholder="Describe what you completed, share links, or add any notes…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex gap-3">
          <Button variant="primary" className="flex-1" loading={mutation.isLoading} onClick={() => mutation.mutate()}>
            Submit for Review
          </Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Messages Tab
   ═══════════════════════════════════════════════════════════════════════════ */
const MessagesTab = ({ contractId, currentUser }) => {
  const [text, setText]     = useState('');
  const bottomRef           = useRef(null);
  const queryClient         = useQueryClient();

  const { data, isLoading } = useQuery(
    ['messages', contractId],
    () => messageApi.get(contractId).then((r) => r.data),
    { refetchInterval: 5000 }
  );
  const messages = data?.data || [];

  const sendMutation = useMutation(
    () => {
      const fd = new FormData();
      fd.append('content', text);
      return messageApi.send(contractId, fd);
    },
    {
      onSuccess: () => {
        setText('');
        queryClient.invalidateQueries(['messages', contractId]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      },
      onError: (e) => toast.error(e?.response?.data?.message || 'Failed to send'),
    }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Height: viewport minus navbar (64px) minus mobile bottom nav (64px) minus tabs (~52px) minus header (~100px)
  // Use a flex column with explicit height so it works on all screen sizes
  return (
    <div className="card flex flex-col" style={{ height: 'min(520px, calc(100dvh - 280px))' }}>
      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-8">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === currentUser?._id || msg.sender === currentUser?._id;
            return (
              <div key={msg._id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                <Avatar
                  src={msg.sender?.avatar}
                  name={msg.sender?.name}
                  size="xs"
                  className="shrink-0 mt-1"
                />
                <div className={cn('max-w-[80%] flex flex-col', isMe && 'items-end')}>
                  <div className={cn(
                    'rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    isMe
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                  )}>
                    {msg.content}
                    {msg.attachments?.map((f) => (
                      <a key={f.filename} href={f.url}
                        className="flex items-center gap-1 mt-1 text-xs underline opacity-70">
                        <Paperclip className="w-3 h-3" />{f.originalName}
                      </a>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 mt-0.5 px-1">
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-white/[0.07] p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (text.trim()) sendMutation.mutate();
              }
            }}
            placeholder="Send a message…"
            rows={1}
            className="input flex-1 resize-none min-h-[40px] max-h-28 text-sm scrollbar-thin"
          />
          <Button
            variant="primary"
            size="sm"
            className="h-10 w-10 px-0 shrink-0"
            loading={sendMutation.isLoading}
            disabled={!text.trim()}
            onClick={() => sendMutation.mutate()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1 hidden sm:block">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Files Tab
   ═══════════════════════════════════════════════════════════════════════════ */
const FilesTab = ({ milestones }) => {
  const files = milestones?.flatMap((m) =>
    m.submissions?.flatMap((s) =>
      s.attachments?.map((f) => ({ ...f, milestone: m.title })) || []
    ) || []
  ) || [];

  if (files.length === 0) return (
    <div className="card p-12 sm:p-16 text-center text-sm text-gray-400 dark:text-gray-600">
      No files have been shared yet.
    </div>
  );

  return (
    <div className="card divide-y divide-gray-100 dark:divide-white/[0.06]">
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-3 p-3 sm:p-4">
          <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.originalName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{f.milestone}</p>
          </div>
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors shrink-0"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
};
