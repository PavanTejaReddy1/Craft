import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../../api/index.js';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';

const schema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed. The link may have expired.');
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Invalid reset link.</p>
        <Link to="/forgot-password" className="btn-secondary">Request a new link</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-xl font-bold text-gray-900 mb-10">CRAFT</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set new password</h1>
        <p className="text-gray-500 text-sm mb-8">Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="label">New password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} className={`input pr-10 ${errors.password ? 'input-error' : ''}`} {...register('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
          </div>
          <Input label="Confirm password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">Reset Password</Button>
        </form>
      </div>
    </div>
  );
};
