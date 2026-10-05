import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-700 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  </div>
);

/**
 * ProtectedRoute — blocks access until auth state is resolved.
 * Shows a spinner while loading (max 8 s, then resolved by AuthContext safety timer).
 * Redirects to /login if unauthenticated.
 * Redirects to /dashboard if role doesn't match.
 */
export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * PublicOnlyRoute — redirects authenticated users away from auth pages.
 * While loading, renders the auth page immediately (better UX than spinner).
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Don't show spinner on login/register — just render the page.
  // If already logged in once loading resolves, redirect.
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
