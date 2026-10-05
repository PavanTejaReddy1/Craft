import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Paperclip, X, ChevronRight, Check } from 'lucide-react';
import { projectApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { TagInput } from '../../components/ui/TagInput.jsx';
import { PROJECT_CATEGORIES, EXPERIENCE_LEVELS, BUDGET_TYPES, POPULAR_SKILLS } from '../../constants/index.js';
import { cn } from '../../utils/cn.js';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  budgetType: z.enum(['fixed', 'hourly']),
  budgetMin: z.coerce.number().min(1, 'Min budget required'),
  budgetMax: z.coerce.number().min(1, 'Max budget required'),
  expectedDeliveryDays: z.coerce.number().min(1, 'Delivery time required'),
  experienceLevel: z.enum(['entry', 'intermediate', 'expert']),
  additionalRequirements: z.string().optional(),
  deadline: z.string().optional(),
});

const STEPS = [
  { label: 'Basics',            desc: 'Title, category, description' },
  { label: 'Requirements',      desc: 'Skills, tech, attachments'    },
  { label: 'Budget & Timeline', desc: 'Budget, delivery, deadline'   },
  { label: 'Review',            desc: 'Confirm and post'             },
];

const stepFields = [
  ['title', 'category', 'description'],
  [],
  ['budgetMin', 'budgetMax', 'expectedDeliveryDays'],
  [],
];

export const PostProjectPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [files, setFiles] = useState([]);

  const {
    register, handleSubmit, trigger, watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { budgetType: 'fixed', experienceLevel: 'intermediate' },
  });

  const watchAll = watch();

  const goNext = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));
  const addFiles   = (e) => {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const onSubmit = async (data) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== '') fd.append(k, v);
      });
      skills.forEach((s) => fd.append('skills', s));
      technologies.forEach((t) => fd.append('technologies', t));
      files.forEach((f) => fd.append('attachments', f));

      const res = await projectApi.create(fd);
      toast.success('Project posted!');
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post project');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Post a Project</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Describe what you need and receive offers from skilled developers.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-start gap-2 mb-8 overflow-x-auto pb-1 scrollbar-thin">
          {STEPS.map((s, i) => {
            const done    = i < step;
            const current = i === step;
            return (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                    done    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950' :
                    current ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-950 ring-4 ring-gray-200 dark:ring-gray-700' :
                              'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  )}>
                    {done ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={cn(
                    'text-xs font-medium whitespace-nowrap hidden sm:block',
                    current ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-px min-w-[24px] mt-[-12px] transition-colors',
                    done ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card p-6 space-y-5">

            {/* ── Step 0: Basics ── */}
            {step === 0 && (
              <>
                <Input
                  label="Project title"
                  placeholder="e.g. Build an e-commerce platform with React and Node.js"
                  error={errors.title?.message}
                  required
                  {...register('title')}
                />
                <Select label="Category" error={errors.category?.message} required {...register('category')}>
                  <option value="">Select a category</option>
                  {PROJECT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
                <Textarea
                  label="Project description"
                  rows={6}
                  placeholder="Describe your project in detail — what needs to be built, what it does, and what the final result should look like."
                  error={errors.description?.message}
                  hint="Detailed descriptions attract better developers."
                  required
                  {...register('description')}
                />
              </>
            )}

            {/* ── Step 1: Requirements ── */}
            {step === 1 && (
              <>
                <TagInput
                  label="Required skills"
                  value={skills}
                  onChange={setSkills}
                  placeholder="Type a skill and press Enter…"
                  suggestions={POPULAR_SKILLS}
                />
                <TagInput
                  label="Technologies"
                  value={technologies}
                  onChange={setTechnologies}
                  placeholder="Type a technology and press Enter…"
                  suggestions={POPULAR_SKILLS}
                />
                <Select label="Experience level required" {...register('experienceLevel')}>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </Select>
                <Textarea
                  label="Additional requirements (optional)"
                  rows={3}
                  placeholder="Any specific frameworks, standards, deliverables, or notes for developers…"
                  {...register('additionalRequirements')}
                />

                {/* Attachments */}
                <div className="space-y-2">
                  <p className="label">Attachments <span className="text-gray-400 font-normal">(optional, max 5)</span></p>
                  <label className="flex items-center gap-2.5 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Click to attach files (PDF, images, docs — max 10 MB each)</span>
                    <input type="file" multiple className="hidden" onChange={addFiles} />
                  </label>
                  {files.length > 0 && (
                    <ul className="space-y-1.5 mt-2">
                      {files.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-xs text-gray-400 shrink-0">
                            {(f.size / 1024).toFixed(0)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="ml-1 text-gray-400 hover:text-red-500 transition-colors text-xs px-1.5 py-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950"
                            title="Remove file"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {/* ── Step 2: Budget & Timeline ── */}
            {step === 2 && (
              <>
                <Select label="Budget type" {...register('budgetType')}>
                  {BUDGET_TYPES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Minimum budget (₹)"
                    type="number"
                    placeholder="30000"
                    error={errors.budgetMin?.message}
                    required
                    {...register('budgetMin')}
                  />
                  <Input
                    label="Maximum budget (₹)"
                    type="number"
                    placeholder="60000"
                    error={errors.budgetMax?.message}
                    required
                    {...register('budgetMax')}
                  />
                </div>
                <Input
                  label="Expected delivery time (days)"
                  type="number"
                  placeholder="30"
                  hint="How many days from project start to completion?"
                  error={errors.expectedDeliveryDays?.message}
                  required
                  {...register('expectedDeliveryDays')}
                />
                <Input
                  label="Hard deadline (optional)"
                  type="date"
                  {...register('deadline')}
                />
              </>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Review before posting</p>

                <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                  <Row label="Title"      value={watchAll.title} />
                  <Row label="Category"   value={watchAll.category} />
                  <Row
                    label="Budget"
                    value={
                      watchAll.budgetMin && watchAll.budgetMax
                        ? `₹${Number(watchAll.budgetMin).toLocaleString('en-IN')} – ₹${Number(watchAll.budgetMax).toLocaleString('en-IN')}`
                        : '—'
                    }
                  />
                  <Row label="Delivery"   value={watchAll.expectedDeliveryDays ? `${watchAll.expectedDeliveryDays} days` : '—'} />
                  <Row
                    label="Experience"
                    value={EXPERIENCE_LEVELS.find((l) => l.value === watchAll.experienceLevel)?.label}
                  />
                  {skills.length > 0 && (
                    <div className="py-3 flex items-start gap-4">
                      <p className="text-xs text-gray-500 dark:text-gray-500 w-28 shrink-0 mt-0.5">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((s) => (
                          <span key={s} className="badge-gray">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {technologies.length > 0 && (
                    <div className="py-3 flex items-start gap-4">
                      <p className="text-xs text-gray-500 dark:text-gray-500 w-28 shrink-0 mt-0.5">Technologies</p>
                      <div className="flex flex-wrap gap-1.5">
                        {technologies.map((t) => (
                          <span key={t} className="badge-gray">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {files.length > 0 && (
                    <Row label="Attachments" value={`${files.length} file${files.length > 1 ? 's' : ''}`} />
                  )}
                </div>

                <div className="flex items-start gap-2.5 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/[0.08] rounded-xl">
                  <Check className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your project will be immediately visible to all developers on CRAFT.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step navigation */}
          <div className="flex items-center justify-between mt-5">
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              disabled={step === 0}
            >
              Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" variant="primary" onClick={goNext}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Post Project
              </Button>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

/* ── Review row helper ── */
const Row = ({ label, value }) => (
  <div className="py-3 flex items-start justify-between gap-4">
    <p className="text-xs text-gray-500 dark:text-gray-500 w-28 shrink-0">{label}</p>
    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 text-right">{value || '—'}</p>
  </div>
);
