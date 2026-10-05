import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid email or password');
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
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Ideas.<br />Talent.<br />Built.
          </h2>
          <p className="text-sm text-white/30 leading-relaxed">
            The technology project marketplace. Post a project, find developers, build something great.
          </p>
        </div>
        <p className="text-xs text-gray-700">© {new Date().getFullYear()} CRAFT</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
                <span className="text-[11px] font-black text-white">C</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">CRAFT</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gray-900 hover:underline underline-offset-2">
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="label">Password <span className="text-red-500">*</span></label>
                <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="primary" loading={isSubmitting} className="w-full mt-1">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
