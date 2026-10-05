import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../../api/index.js';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-xl font-bold text-gray-900 mb-10">CRAFT</Link>

        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm mb-6">If that email exists, we've sent a reset link. Check your inbox.</p>
            <Link to="/login" className="btn-secondary w-full text-center">Back to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
            <p className="text-gray-500 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} required
                {...register('email', { required: 'Email required' })} />
              <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">Send reset link</Button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-brand-600 hover:underline">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
