import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ThemeToggle } from '../../components/ui/ThemeToggle.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { cn } from '../../utils/cn.js';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string().min(1, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const TABS = ['Account', 'Appearance', 'Password', 'Notifications'];

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('Account');
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-white/[0.08] mb-6 overflow-x-auto scrollbar-thin">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                activeTab === tab
                  ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Account'       && <AccountSettings user={user} />}
        {activeTab === 'Appearance'    && <AppearanceSettings />}
        {activeTab === 'Password'      && <PasswordSettings />}
        {activeTab === 'Notifications' && <NotifSettings />}
      </div>
    </AppLayout>
  );
};

/* ── Account ──────────────────────────────────────────────────────────────── */
const AccountSettings = ({ user }) => (
  <div className="space-y-4">
    <div className="card p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Account Information</h2>
      <Row label="Name"  value={user?.name} />
      <Row label="Email" value={user?.email}>
        {user?.isEmailVerified
          ? <span className="badge-green text-xs ml-2">Verified</span>
          : <span className="badge-yellow text-xs ml-2">Unverified</span>}
      </Row>
      <Row label="Role" value={<span className="capitalize">{user?.role}</span>} />
    </div>

    <div className="card p-5">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Danger Zone</h2>
      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">These actions are irreversible.</p>
      <Button variant="danger" size="sm">Deactivate Account</Button>
    </div>
  </div>
);

const Row = ({ label, value, children }) => (
  <div className="flex items-center justify-between py-1">
    <p className="text-xs text-gray-500 dark:text-gray-500 w-24 shrink-0">{label}</p>
    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
      {value}{children}
    </div>
  </div>
);

/* ── Appearance ───────────────────────────────────────────────────────────── */
const AppearanceSettings = () => {
  const { theme, isDark, toggle } = useTheme();

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Theme</h2>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-5">
          Choose how CRAFT looks on this device.
        </p>

        {/* Toggle row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isDark ? 'Dark mode' : 'Light mode'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              {isDark ? 'Using dark background' : 'Using light background'}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {/* Light */}
          <button
            onClick={() => isDark && toggle()}
            className={cn(
              'relative rounded-xl border-2 p-3 text-left transition-all',
              !isDark
                ? 'border-gray-900 dark:border-white'
                : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15]'
            )}
          >
            {/* Preview */}
            <div className="w-full h-16 rounded-lg bg-white border border-gray-100 mb-3 overflow-hidden">
              <div className="h-3 bg-gray-100 rounded-t-lg" />
              <div className="p-2 space-y-1.5">
                <div className="h-1.5 bg-gray-200 rounded w-3/4" />
                <div className="h-1.5 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">Light</p>
            {!isDark && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l2.5 2.5L8 3" />
                </svg>
              </span>
            )}
          </button>

          {/* Dark */}
          <button
            onClick={() => !isDark && toggle()}
            className={cn(
              'relative rounded-xl border-2 p-3 text-left transition-all',
              isDark
                ? 'border-gray-900 dark:border-white'
                : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15]'
            )}
          >
            {/* Preview */}
            <div className="w-full h-16 rounded-lg bg-gray-900 border border-white/10 mb-3 overflow-hidden">
              <div className="h-3 bg-gray-800 rounded-t-lg" />
              <div className="p-2 space-y-1.5">
                <div className="h-1.5 bg-gray-700 rounded w-3/4" />
                <div className="h-1.5 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-900 dark:text-white">Dark</p>
            {isDark && (
              <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-gray-900" fill="none" viewBox="0 0 10 10" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 5l2.5 2.5L8 3" />
                </svg>
              </span>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
          Preference saved automatically.
        </p>
      </div>
    </div>
  );
};

/* ── Password ─────────────────────────────────────────────────────────────── */
const PasswordSettings = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed');
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>

      <div className="space-y-1.5">
        <label className="label">Current password</label>
        <div className="relative">
          <input type={showCurrent ? 'text' : 'password'}
            className={cn('input pr-10', errors.currentPassword && 'input-error')}
            {...register('currentPassword')} />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.currentPassword && <p className="text-xs text-red-600">{errors.currentPassword.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="label">New password</label>
        <div className="relative">
          <input type={showNew ? 'text' : 'password'}
            className={cn('input pr-10', errors.newPassword && 'input-error')}
            {...register('newPassword')} />
          <button type="button" onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.newPassword && <p className="text-xs text-red-600">{errors.newPassword.message}</p>}
      </div>

      <Input label="Confirm new password" type="password"
        error={errors.confirmPassword?.message} {...register('confirmPassword')} />

      <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
        Update Password
      </Button>
    </form>
  );
};

/* ── Notifications ────────────────────────────────────────────────────────── */
const NotifSettings = () => (
  <div className="card p-6 space-y-3">
    <h2 className="font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Email notification settings will be configurable here in a future update.
    </p>
  </div>
);
