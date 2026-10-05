import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/ProtectedRoute.jsx';

// Public pages
import { LandingPage }          from './pages/public/LandingPage.jsx';
import { ProjectsPage }         from './pages/public/ProjectsPage.jsx';
import { ProjectDetailPage }    from './pages/public/ProjectDetailPage.jsx';
import { DevelopersPage }       from './pages/public/DevelopersPage.jsx';
import { DeveloperProfilePage } from './pages/shared/ProfilePage.jsx';

// Auth pages
import { LoginPage }          from './pages/auth/LoginPage.jsx';
import { RegisterPage }       from './pages/auth/RegisterPage.jsx';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage }  from './pages/auth/ResetPasswordPage.jsx';
import { VerifyEmailPage }    from './pages/auth/VerifyEmailPage.jsx';

// Protected shared pages
import { DashboardPage }     from './pages/shared/DashboardPage.jsx';
import { WorkspacePage }     from './pages/shared/WorkspacePage.jsx';
import { NotificationsPage } from './pages/shared/NotificationsPage.jsx';
import { MyProjectsPage }    from './pages/shared/MyProjectsPage.jsx';
import { MyOffersPage }      from './pages/shared/MyOffersPage.jsx';
import { EditProfilePage }   from './pages/shared/ProfilePage.jsx';
import { SettingsPage }      from './pages/shared/SettingsPage.jsx';
import { InquiriesPage, InquiryThreadPage } from './pages/shared/InquiriesPage.jsx';

// Client pages
import { PostProjectPage }   from './pages/client/PostProjectPage.jsx';
import { EditProjectPage }   from './pages/client/EditProjectPage.jsx';
import { ProjectOffersPage } from './pages/client/ProjectOffersPage.jsx';

// Admin pages
import { AdminDashboard, AdminUsersPage, AdminReportsPage } from './pages/admin/AdminDashboard.jsx';

/* ─── 404 ─────────────────────────────────────────────────────────────────── */
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="text-center px-4">
      <p className="text-7xl font-bold text-gray-200 dark:text-gray-800 mb-4">404</p>
      <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Page not found</p>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary">Go home</a>
    </div>
  </div>
);

/* ─── /profile redirect based on role ────────────────────────────────────── */
const ProfileRedirect = () => {
  const { user, isDeveloper } = useAuth();
  if (isDeveloper) return <Navigate to={`/developers/${user._id}`} replace />;
  return <EditProfilePage />;
};

/* ─── App ─────────────────────────────────────────────────────────────────── */
const App = () => (
  <Routes>
    {/* Public — no auth required, render immediately */}
    <Route path="/"                   element={<LandingPage />} />
    <Route path="/projects"           element={<ProjectsPage />} />
    <Route path="/projects/:id"       element={<ProjectDetailPage />} />
    <Route path="/developers"         element={<DevelopersPage />} />
    <Route path="/developers/:userId" element={<DeveloperProfilePage />} />
    <Route path="/verify-email"       element={<VerifyEmailPage />} />
    <Route path="/reset-password"     element={<ResetPasswordPage />} />

    {/* Auth — redirect away if already logged in */}
    <Route path="/login"           element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register"        element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />

    {/* Protected — any authenticated user */}
    <Route path="/dashboard"            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/dashboard/projects"   element={<ProtectedRoute><MyProjectsPage /></ProtectedRoute>} />
    <Route path="/dashboard/offers"     element={<ProtectedRoute><MyOffersPage /></ProtectedRoute>} />
    <Route path="/dashboard/active"     element={<ProtectedRoute><MyProjectsPage /></ProtectedRoute>} />
    <Route path="/workspace/:projectId" element={<ProtectedRoute><WorkspacePage /></ProtectedRoute>} />
    <Route path="/notifications"        element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
    <Route path="/profile"              element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
    <Route path="/profile/edit"         element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
    <Route path="/settings"             element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
    {/* Inquiries / direct messages */}
    <Route path="/inquiries"            element={<ProtectedRoute><InquiriesPage /></ProtectedRoute>} />
    <Route path="/inquiries/:id"        element={<ProtectedRoute><InquiryThreadPage /></ProtectedRoute>} />

    {/* Protected — client only */}
    <Route path="/projects/new"         element={<ProtectedRoute roles={['client']}><PostProjectPage /></ProtectedRoute>} />
    <Route path="/projects/:id/edit"    element={<ProtectedRoute roles={['client']}><EditProjectPage /></ProtectedRoute>} />
    <Route path="/projects/:id/offers"  element={<ProtectedRoute roles={['client']}><ProjectOffersPage /></ProtectedRoute>} />

    {/* Protected — admin only */}
    <Route path="/admin"              element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/users"        element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
    <Route path="/admin/reports"      element={<ProtectedRoute roles={['admin']}><AdminReportsPage /></ProtectedRoute>} />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
