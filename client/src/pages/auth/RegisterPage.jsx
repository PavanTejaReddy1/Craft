import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Briefcase, Code2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { cn } from '../../utils/cn.js';

const schema = z.object({
  name:     z.string().min(2, 'Min 2 characters').max(100),
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role:     z.enum(['client', 'developer'], { required_error: 'Select a role' }),
});

const ROLES = [
  { value: 'client',    icon: Briefcase, title: "I'm a Client",    desc: 'Post projects, hire developers' },
  { value: 'developer', icon: Code2,     title: "I'm a Developer", desc: 'Find projects, get hired'       },
];

export const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || '';
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — dark panel */}
      <div className="hidden lg:flex flex-col justify-between w-[400px] shrink-0 bg-gray-950 p-10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
            <span className="text-[11px] font-black text-gray-950">C</span>
          </div>
          <span className="text-sm font-semibold text-white">CRAFT</span>
        </Link>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white leading-tight">Join CRAFT</h2>
          {[
            'Post technology projects in minutes',
            'Access 1,800+ skilled developers',
            'Milestone-based project management',
            'Verified profiles and honest reviews',
          ].map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-white/60" />
              </div>
              <span className="text-sm text-white/40">{item}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-700">© {new Date().getFullYear()} CRAFT</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                <span className="text-[11px] font-black text-white">C</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">CRAFT</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an account</h1>
          <p className="text-sm text-gray-500 mb-8">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-gray-900 hover:underline underline-offset-2">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Role selector */}
            <div className="space-y-2">
              <label className="label">I'm joining as <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(({ value, icon: Icon, title, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value, { shouldValidate: true })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all duration-150',
                      selectedRole === value
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 mb-2', selectedRole === value ? 'text-gray-900' : 'text-gray-400')} />
                    <p className={cn('text-sm font-medium', selectedRole === value ? 'text-gray-900' : 'text-gray-700')}>{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
              {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}
              <input type="hidden" {...register('role')} />
            </div>

            <Input label="Full name" placeholder="Alex Johnson" error={errors.name?.message} required {...register('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />

            <div className="space-y-1.5">
              <label className="label">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <p className="text-xs text-gray-400">
              By signing up you agree to our Terms of Service and Privacy Policy.
            </p>

            <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
