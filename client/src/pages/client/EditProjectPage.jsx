import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { TagInput } from '../../components/ui/TagInput.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { PROJECT_CATEGORIES, EXPERIENCE_LEVELS, POPULAR_SKILLS } from '../../constants/index.js';

const schema = z.object({
  title:                 z.string().min(10, 'Min 10 characters').max(200),
  description:           z.string().min(50, 'Min 50 characters'),
  category:              z.string().min(1, 'Required'),
  budgetMin:             z.coerce.number().min(1, 'Required'),
  budgetMax:             z.coerce.number().min(1, 'Required'),
  expectedDeliveryDays:  z.coerce.number().min(1, 'Required'),
  experienceLevel:       z.enum(['entry', 'intermediate', 'expert']),
  additionalRequirements: z.string().optional(),
  deadline:              z.string().optional(),
});

export const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skills, setSkills]             = useState([]);
  const [technologies, setTechnologies] = useState([]);

  const { data, isLoading } = useQuery(
    ['project', id],
    () => projectApi.getById(id).then((r) => r.data)
  );

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  // Pre-fill form once project loads
  useEffect(() => {
    if (data?.project) {
      const p = data.project;
      reset({
        title:                 p.title,
        description:           p.description,
        category:              p.category,
        budgetMin:             p.budgetMin,
        budgetMax:             p.budgetMax,
        expectedDeliveryDays:  p.expectedDeliveryDays,
        experienceLevel:       p.experienceLevel,
        additionalRequirements: p.additionalRequirements || '',
        deadline: p.deadline ? p.deadline.split('T')[0] : '',
      });
      setSkills(p.skills || []);
      setTechnologies(p.technologies || []);
    }
  }, [data, reset]);

  const mutation = useMutation(
    (body) => projectApi.update(id, body),
    {
      onSuccess: () => {
        toast.success('Project updated');
        navigate(`/projects/${id}`);
      },
      onError: (err) => toast.error(err?.response?.data?.message || 'Update failed'),
    }
  );

  const onSubmit = (formData) => {
    mutation.mutate({ ...formData, skills, technologies });
  };

  if (isLoading) return (
    <AppLayout>
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Projects
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Project</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your project details. Only open and draft projects can be edited.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="card p-6 space-y-5">
            <Input
              label="Project title"
              error={errors.title?.message}
              required
              {...register('title')}
            />
            <Select label="Category" error={errors.category?.message} required {...register('category')}>
              <option value="">Select a category</option>
              {PROJECT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Textarea
              label="Project description"
              rows={6}
              error={errors.description?.message}
              required
              {...register('description')}
            />
            <TagInput
              label="Required skills"
              value={skills}
              onChange={setSkills}
              placeholder="Add skills…"
              suggestions={POPULAR_SKILLS}
            />
            <TagInput
              label="Technologies"
              value={technologies}
              onChange={setTechnologies}
              placeholder="Add technologies…"
              suggestions={POPULAR_SKILLS}
            />
            <Select label="Experience level" {...register('experienceLevel')}>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min budget (₹)"
                type="number"
                error={errors.budgetMin?.message}
                required
                {...register('budgetMin')}
              />
              <Input
                label="Max budget (₹)"
                type="number"
                error={errors.budgetMax?.message}
                required
                {...register('budgetMax')}
              />
            </div>
            <Input
              label="Delivery (days)"
              type="number"
              error={errors.expectedDeliveryDays?.message}
              required
              {...register('expectedDeliveryDays')}
            />
            <Input label="Deadline (optional)" type="date" {...register('deadline')} />
            <Textarea
              label="Additional requirements (optional)"
              rows={3}
              {...register('additionalRequirements')}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/projects/${id}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
