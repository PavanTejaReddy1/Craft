import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Clock, DollarSign, Users, Calendar, Paperclip, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectApi, offerApi } from '../../api/index.js';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Avatar } from '../../components/ui/Avatar.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Textarea, Input } from '../../components/ui/Input.jsx';
import { TagInput } from '../../components/ui/TagInput.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { PublicLayout } from '../../components/layout/AppLayout.jsx';
import { formatBudget, formatDate, formatDelivery, formatRelativeTime } from '../../utils/format.js';
import { PROJECT_STATUS_LABELS, EXPERIENCE_LEVELS, POPULAR_SKILLS } from '../../constants/index.js';
import { useForm } from 'react-hook-form';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isDeveloper, isClient } = useAuth();
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(
    ['project', id],
    () => projectApi.getById(id).then((r) => r.data)
  );

  if (isLoading) return (
    <PublicLayout>
      <div className="container-app py-20 flex justify-center"><Spinner size="lg" /></div>
    </PublicLayout>
  );

  if (error || !data?.project) return (
    <PublicLayout>
      <div className="container-app py-20 text-center">
        <p className="text-gray-500">Project not found.</p>
        <Link to="/projects" className="btn-secondary mt-4">Browse Projects</Link>
      </div>
    </PublicLayout>
  );

  const { project, myOffer } = data;
  const status = PROJECT_STATUS_LABELS[project.status] || PROJECT_STATUS_LABELS.open;

  return (
    <PublicLayout>
      <div className="container-app py-8 max-w-5xl">
        {/* Back */}
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to projects
        </Link>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main */}
          <div className="space-y-6">
            {/* Header card */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">{project.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">{project.category}</p>
                </div>
                <Badge color={status.color} dot>{status.label}</Badge>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Budget</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatBudget(project.budgetMin, project.budgetMax)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Delivery</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatDelivery(project.expectedDeliveryDays)}</p>
                </div>
                {project.deadline && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deadline</p>
                    <p className="font-semibold text-gray-900 text-sm">{formatDate(project.deadline)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 mb-1">Offers</p>
                  <p className="font-semibold text-gray-900 text-sm">{project.offerCount}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Project Description</h2>
              <div className="prose prose-sm text-gray-700 max-w-none whitespace-pre-wrap leading-relaxed">
                {project.description}
              </div>
            </div>

            {/* Requirements */}
            {project.additionalRequirements && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Additional Requirements</h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{project.additionalRequirements}</p>
              </div>
            )}

            {/* Skills & Technologies */}
            <div className="card p-6 space-y-4">
              {project.skills?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((s) => <span key={s} className="badge-gray">{s}</span>)}
                  </div>
                </div>
              )}
              {project.technologies?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-3">Technologies</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t) => <span key={t} className="badge-brand">{t}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Attachments */}
            {project.attachments?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Attachments</h2>
                <div className="space-y-2">
                  {project.attachments.map((file) => (
                    <a key={file._id} href={file.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{file.originalName}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="card p-5">
              {!isAuthenticated ? (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Sign in to submit an offer</p>
                  <Link to="/login" state={{ from: { pathname: `/projects/${id}` } }} className="btn-primary w-full text-center">
                    Sign in to Apply
                  </Link>
                </div>
              ) : isDeveloper && project.status === 'open' ? (
                myOffer ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-900">Offer submitted</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-4">
                      {formatRelativeTime(myOffer.createdAt)} · ₹{myOffer.proposedPrice?.toLocaleString('en-IN')}
                    </p>
                    <Badge color={myOffer.status === 'accepted' ? 'green' : myOffer.status === 'pending' ? 'yellow' : 'gray'}>
                      {myOffer.status}
                    </Badge>
                  </div>
                ) : (
                  <button onClick={() => setOfferModalOpen(true)} className="btn-primary w-full">
                    Submit an Offer
                  </button>
                )
              ) : isClient ? (
                project.client?._id === user._id ? (
                  <Link to={`/projects/${id}/offers`} className="btn-secondary w-full text-center block">
                    View Offers ({project.offerCount})
                  </Link>
                ) : null
              ) : null}
            </div>

            {/* Experience level */}
            <div className="card p-5">
              <p className="text-xs text-gray-500 mb-1">Experience required</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {EXPERIENCE_LEVELS.find((l) => l.value === project.experienceLevel)?.label || project.experienceLevel}
              </p>
            </div>

            {/* Client info */}
            {project.client && (
              <div className="card p-5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Posted by</p>
                <Link to={`/clients/${project.client._id}`} className="flex items-center gap-3 group">
                  <Avatar src={project.client.avatar} name={project.client.name} size="md" verified={project.client.isVerified} />
                  <div>
                    <p className="font-medium text-sm text-gray-900 group-hover:text-brand-600 transition-colors">
                      {project.client.name}
                    </p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(project.createdAt)}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Offer Modal */}
      <OfferModal
        open={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        projectId={id}
        projectBudget={{ min: project.budgetMin, max: project.budgetMax }}
        onSuccess={() => {
          setOfferModalOpen(false);
          queryClient.invalidateQueries(['project', id]);
        }}
      />
    </PublicLayout>
  );
};

const OfferModal = ({ open, onClose, projectId, projectBudget, onSuccess }) => {
  const [milestones, setMilestones] = useState([{ title: '', amount: '', dueInDays: '' }]);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const mutation = useMutation(
    (data) => offerApi.submit({ ...data, projectId }),
    {
      onSuccess: () => {
        toast.success('Offer submitted!');
        onSuccess();
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to submit offer'),
    }
  );

  const onSubmit = (data) => {
    const validMilestones = milestones.filter((m) => m.title && m.amount && m.dueInDays);
    mutation.mutate({ ...data, milestones: validMilestones.map((m, i) => ({ ...m, order: i + 1, amount: Number(m.amount), dueInDays: Number(m.dueInDays) })) });
  };

  const addMilestone = () => setMilestones([...milestones, { title: '', amount: '', dueInDays: '' }]);
  const removeMilestone = (i) => setMilestones(milestones.filter((_, idx) => idx !== i));
  const updateMilestone = (i, field, value) => {
    const updated = [...milestones];
    updated[i][field] = value;
    setMilestones(updated);
  };

  return (
    <Modal open={open} onClose={onClose} title="Submit an Offer" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Your price (₹)"
            type="number"
            placeholder={`${projectBudget.min}–${projectBudget.max}`}
            error={errors.proposedPrice?.message}
            required
            {...register('proposedPrice', { required: 'Price required', min: { value: 1, message: 'Must be > 0' } })}
          />
          <Input
            label="Delivery (days)"
            type="number"
            placeholder="e.g. 30"
            error={errors.deliveryDays?.message}
            required
            {...register('deliveryDays', { required: 'Delivery required', min: { value: 1, message: 'Must be > 0' } })}
          />
        </div>

        <Textarea
          label="Your proposal"
          rows={6}
          placeholder="Describe your approach, relevant experience, and why you're the best fit..."
          error={errors.coverLetter?.message}
          required
          {...register('coverLetter', { required: 'Proposal required', minLength: { value: 100, message: 'Min 100 characters' } })}
        />

        {/* Milestones */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Milestones (optional)</p>
            <button type="button" onClick={addMilestone} className="text-xs text-brand-600 hover:underline">+ Add milestone</button>
          </div>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_90px_auto] gap-2 items-end">
                <input placeholder="Milestone title" value={m.title}
                  onChange={(e) => updateMilestone(i, 'title', e.target.value)} className="input text-sm" />
                <input placeholder="₹ Amount" type="number" value={m.amount}
                  onChange={(e) => updateMilestone(i, 'amount', e.target.value)} className="input text-sm" />
                <input placeholder="Days" type="number" value={m.dueInDays}
                  onChange={(e) => updateMilestone(i, 'dueInDays', e.target.value)} className="input text-sm" />
                {milestones.length > 1 && (
                  <button type="button" onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600 p-1">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Textarea
          label="Additional notes (optional)"
          rows={2}
          placeholder="Any questions, clarifications, or other information..."
          {...register('additionalNotes')}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1">Submit Offer</Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};
