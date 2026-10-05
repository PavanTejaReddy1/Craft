import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Github, Linkedin, Globe, Edit2, Camera, MapPin,
  CheckCircle2, ExternalLink, MessageSquare, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { profileApi, inquiryApi } from '../../api/index.js';
import { useAuth }      from '../../contexts/AuthContext.jsx';
import { AppLayout }    from '../../components/layout/AppLayout.jsx';
import { PublicLayout } from '../../components/layout/AppLayout.jsx';
import { Avatar }       from '../../components/ui/Avatar.jsx';
import { Badge }        from '../../components/ui/Badge.jsx';
import { Button }       from '../../components/ui/Button.jsx';
import { StarRating }   from '../../components/ui/StarRating.jsx';
import { Modal }        from '../../components/ui/Modal.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { TagInput }     from '../../components/ui/TagInput.jsx';
import { Spinner }      from '../../components/ui/Spinner.jsx';
import { formatDate, formatRelativeTime } from '../../utils/format.js';
import { AVAILABILITY_LABELS, POPULAR_SKILLS } from '../../constants/index.js';
import { cn } from '../../utils/cn.js';
import { useForm } from 'react-hook-form';

/* ═══════════════════════════════════════════════════════════════════════════
   Public Developer Profile
   ═══════════════════════════════════════════════════════════════════════════ */
export const DeveloperProfilePage = () => {
  const { userId } = useParams();
  const { user: me, isAuthenticated, isClient } = useAuth();
  const isOwn = me?._id === userId;
  const [contactOpen, setContactOpen] = useState(false);

  const { data, isLoading } = useQuery(
    ['developer-profile', userId],
    () => profileApi.getDeveloper(userId).then((r) => r.data)
  );

  if (isLoading) return (
    <PublicLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </PublicLayout>
  );

  if (!data?.profile) return (
    <PublicLayout>
      <div className="text-center py-20">
        <p className="text-gray-500">Developer profile not found.</p>
        <Link to="/developers" className="btn-secondary mt-4 inline-flex">Browse Developers</Link>
      </div>
    </PublicLayout>
  );

  const { profile, reviews } = data;
  const user         = profile.user;
  const availability = AVAILABILITY_LABELS[profile.availability] || AVAILABILITY_LABELS.available;
  const Layout       = isOwn ? AppLayout : PublicLayout;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-4">
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <div className="card p-6 text-center">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <Avatar src={user?.avatar} name={user?.name} size="2xl" verified={user?.isVerified} />
              </div>

              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
              {profile.headline && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-snug">{profile.headline}</p>
              )}

              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                <Badge color={availability.color} dot>{availability.label}</Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <StarRating rating={profile.averageRating} showValue />
                <span className="text-xs text-gray-400">({profile.totalReviews})</span>
              </div>

              {/* Location */}
              {profile.location?.city && (
                <p className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location.city}
                  {profile.location.country ? `, ${profile.location.country}` : ''}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-white/[0.06]">
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.completedProjects}</p>
                  <p className="text-xs text-gray-400">Projects</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{profile.totalReviews}</p>
                  <p className="text-xs text-gray-400">Reviews</p>
                </div>
              </div>

              {/* Hourly rate */}
              {profile.hourlyRate > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                  <p className="text-xs text-gray-400 mb-0.5">Hourly rate</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{profile.hourlyRate.toLocaleString('en-IN')}
                    <span className="text-sm font-normal text-gray-400"> / hr</span>
                  </p>
                </div>
              )}

              {/* Social links */}
              {(profile.githubUrl || profile.linkedinUrl || profile.websiteUrl) && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 space-y-2">
                {isOwn ? (
                  <Link to="/profile/edit" className="btn-secondary w-full text-sm gap-2">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </Link>
                ) : isAuthenticated && isClient ? (
                  <>
                    <button
                      onClick={() => setContactOpen(true)}
                      className="btn-primary w-full text-sm gap-2"
                    >
                      <MessageSquare className="w-4 h-4" /> Contact Developer
                    </button>
                    <Link to="/projects/new" className="btn-secondary w-full text-sm block text-center">
                      Post a Project
                    </Link>
                  </>
                ) : !isAuthenticated ? (
                  <Link to="/register?role=client" className="btn-primary w-full text-sm block text-center">
                    Sign up to Contact
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => <span key={s} className="badge-gray">{s}</span>)}
                </div>
              </div>
            )}

            {/* Technologies */}
            {profile.technologies?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Technologies</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.technologies.map((t) => <span key={t} className="badge-gray">{t}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* ── Main content ── */}
          <div className="space-y-5">
            {/* About */}
            {profile.bio && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">About</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Portfolio */}
            {profile.portfolio?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Portfolio</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.portfolio.map((item) => (
                    <div key={item._id}
                      className="border border-gray-200 dark:border-white/[0.08] rounded-xl p-4 hover:border-gray-300 dark:hover:border-white/[0.15] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</h3>
                        {(item.projectUrl || item.repoUrl) && (
                          <a href={item.projectUrl || item.repoUrl} target="_blank" rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors shrink-0">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                      )}
                      {item.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {item.technologies.map((t) => <span key={t} className="badge-gray text-[11px]">{t}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile.experience?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Experience</h2>
                <div className="space-y-4">
                  {profile.experience.map((exp) => (
                    <div key={exp._id} className="flex gap-4">
                      <div className="w-2 h-2 rounded-full bg-gray-400 mt-2 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{exp.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div key={edu._id}>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{edu.degree}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                      {edu.fieldOfStudy && <p className="text-xs text-gray-400">{edu.fieldOfStudy}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {edu.startYear} — {edu.endYear || 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews?.length > 0 && (
              <div className="card p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Reviews <span className="font-normal text-gray-400">({reviews.length})</span>
                </h2>
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review._id}
                      className="pb-5 border-b border-gray-100 dark:border-white/[0.06] last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer?.name}</p>
                            <p className="text-xs text-gray-400">{review.project?.title}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <StarRating rating={review.rating} size="xs" />
                          <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(review.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact modal */}
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        developer={{ _id: userId, name: user?.name, avatar: user?.avatar }}
      />
    </Layout>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Contact / Inquiry Modal
   ═══════════════════════════════════════════════════════════════════════════ */
const ContactModal = ({ open, onClose, developer }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const mutation = useMutation(
    (data) => inquiryApi.send({ developerId: developer._id, ...data }),
    {
      onSuccess: (res) => {
        toast.success(`Message sent to ${developer.name}!`);
        reset();
        onClose();
        navigate(`/inquiries/${res.data.inquiry._id}`);
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Failed to send message'),
    }
  );

  return (
    <Modal open={open} onClose={onClose} title={`Contact ${developer.name}`} size="md">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
        {/* Developer preview */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-white/[0.06]">
          <Avatar src={developer.avatar} name={developer.name} size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{developer.name}</p>
            <p className="text-xs text-gray-400">Developer on CRAFT</p>
          </div>
        </div>

        <Input
          label="Subject (optional)"
          placeholder="e.g. Interested in hiring you for a React project"
          {...register('subject')}
        />

        <Textarea
          label="Message"
          rows={5}
          placeholder={`Hi ${developer.name ?? 'there'},\n\nI came across your profile and I'm interested in discussing a project with you...`}
          error={errors.message?.message}
          required
          {...register('message', {
            required: 'Message is required',
            minLength: { value: 10, message: 'Min 10 characters' },
          })}
        />

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Your message starts a private conversation. The developer will be notified.
        </p>

        <div className="flex gap-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            loading={mutation.isLoading}
            className="flex-1 gap-2"
          >
            <Send className="w-4 h-4" /> Send Message
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   Edit Profile Page
   ═══════════════════════════════════════════════════════════════════════════ */
export const EditProfilePage = () => {
  const { user, isDeveloper, isClient, updateUser } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery(
    ['my-profile'],
    () => isDeveloper
      ? profileApi.getMyDeveloper().then((r) => r.data.profile)
      : profileApi.getMyClient().then((r) => r.data.profile)
  );

  if (profileQuery.isLoading) return (
    <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Edit Profile</h1>
        {isDeveloper && profileQuery.data && (
          <DeveloperEditForm
            profile={profileQuery.data}
            onSuccess={() => queryClient.invalidateQueries(['my-profile'])}
          />
        )}
        {isClient && profileQuery.data && (
          <ClientEditForm
            profile={profileQuery.data}
            onSuccess={() => queryClient.invalidateQueries(['my-profile'])}
          />
        )}
      </div>
    </AppLayout>
  );
};

/* ─── Developer edit form ─────────────────────────────────────────────────── */
const DeveloperEditForm = ({ profile, onSuccess }) => {
  const [skills, setSkills]             = useState(profile.skills || []);
  const [technologies, setTechnologies] = useState(profile.technologies || []);
  const queryClient = useQueryClient();
  const avatarRef   = useRef(null);
  const { updateUser } = useAuth();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      headline:     profile.headline     || '',
      bio:          profile.bio          || '',
      hourlyRate:   profile.hourlyRate   || '',
      availability: profile.availability || 'available',
      githubUrl:    profile.githubUrl    || '',
      linkedinUrl:  profile.linkedinUrl  || '',
      websiteUrl:   profile.websiteUrl   || '',
    },
  });

  const mutation = useMutation(
    (data) => profileApi.updateDeveloper({ ...data, skills, technologies }),
    {
      onSuccess: () => { toast.success('Profile updated!'); onSuccess(); },
      onError: (e) => toast.error(e?.response?.data?.message || 'Update failed'),
    }
  );

  const avatarMutation = useMutation(
    (file) => { const fd = new FormData(); fd.append('avatar', file); return profileApi.uploadAvatar(fd); },
    {
      onSuccess: (data) => {
        updateUser({ avatar: data.data.avatar });
        toast.success('Photo updated!');
        queryClient.invalidateQueries(['my-profile']);
      },
    }
  );

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
      <div className="card p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <Avatar src={profile.user?.avatar} name={profile.user?.name} size="xl" />
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => avatarRef.current?.click()}>
              <Camera className="w-4 h-4" /> Change photo
            </Button>
            <input ref={avatarRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && avatarMutation.mutate(e.target.files[0])} />
            <p className="text-xs text-gray-400 mt-1.5">JPG, PNG up to 10 MB</p>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Basic Info</h2>
        <Input label="Professional headline"
          placeholder="e.g. Full Stack Developer · React · Node.js"
          {...register('headline')} />
        <Textarea label="About you" rows={5}
          placeholder="Describe your experience, specialties, and what you enjoy building..."
          {...register('bio')} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Hourly rate (₹)" type="number" placeholder="e.g. 2000" {...register('hourlyRate')} />
          <Select label="Availability" {...register('availability')}>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="not_available">Not Available</option>
          </Select>
        </div>
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Skills & Technologies</h2>
        <TagInput label="Skills" value={skills} onChange={setSkills}
          placeholder="Add skills…" suggestions={POPULAR_SKILLS} />
        <TagInput label="Technologies" value={technologies} onChange={setTechnologies}
          placeholder="Add technologies…" suggestions={POPULAR_SKILLS} />
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Links</h2>
        <Input label="GitHub URL"       placeholder="https://github.com/username"      {...register('githubUrl')} />
        <Input label="LinkedIn URL"     placeholder="https://linkedin.com/in/username" {...register('linkedinUrl')} />
        <Input label="Personal website" placeholder="https://yourwebsite.com"          {...register('websiteUrl')} />
      </div>

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
        Save Profile
      </Button>
    </form>
  );
};

/* ─── Client edit form ──────────────────────────────────────────────────────── */
const ClientEditForm = ({ profile, onSuccess }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      companyName: profile.companyName || '',
      industry:    profile.industry    || '',
      bio:         profile.bio         || '',
      websiteUrl:  profile.websiteUrl  || '',
      linkedinUrl: profile.linkedinUrl || '',
    },
  });

  const mutation = useMutation(
    (data) => profileApi.updateClient(data),
    {
      onSuccess: () => { toast.success('Profile updated!'); onSuccess(); },
      onError: (e) => toast.error(e?.response?.data?.message || 'Update failed'),
    }
  );

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Client Profile</h2>
        <Input label="Company / Organization (optional)"
          placeholder="e.g. Acme Technologies" {...register('companyName')} />
        <Input label="Industry"
          placeholder="e.g. E-commerce, Healthcare, FinTech" {...register('industry')} />
        <Textarea label="About" rows={4}
          placeholder="Tell developers about yourself or your organization..." {...register('bio')} />
        <Input label="Website"  placeholder="https://yourcompany.com"          {...register('websiteUrl')} />
        <Input label="LinkedIn" placeholder="https://linkedin.com/company/..." {...register('linkedinUrl')} />
      </div>
      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
        Save Profile
      </Button>
    </form>
  );
};
