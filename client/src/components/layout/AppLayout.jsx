import { Link } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { ClientSidebar, DeveloperSidebar, AdminSidebar } from './Sidebar.jsx';
import { MobileNav } from './MobileNav.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

/* ─── Authenticated app layout ────────────────────────────────────────────── */
export const AppLayout = ({ children }) => {
  const { isClient, isDeveloper, isAdmin } = useAuth();
  const Sidebar = isAdmin ? AdminSidebar : isClient ? ClientSidebar : DeveloperSidebar;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Fixed top navbar */}
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar — desktop only (hidden on mobile) */}
        <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-56 xl:w-60 border-r border-gray-200 dark:border-white/[0.07] bg-white dark:bg-gray-950 z-20 overflow-y-auto scrollbar-thin">
          <div className="p-4">
            <Sidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 lg:ml-56 xl:ml-60">
          {/* pb-20 on mobile gives space above the bottom nav bar */}
          <div className="container-app py-6 sm:py-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation (hidden on lg+) */}
      <MobileNav />
    </div>
  );
};

/* ─── Public layout ────────────────────────────────────────────────────────── */
export const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16">{children}</main>
    <PublicFooter />
  </div>
);

/* ─── Landing layout ───────────────────────────────────────────────────────── */
export const LandingLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <LandingFooter />
  </div>
);

/* ─── Footers ──────────────────────────────────────────────────────────────── */
const PublicFooter = () => (
  <footer className="border-t border-gray-200 dark:border-white/[0.07] bg-white dark:bg-gray-950">
    <div className="container-app py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-900 dark:bg-white flex items-center justify-center">
            <span className="text-[9px] font-black text-white dark:text-gray-900">C</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">CRAFT</span>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-500 dark:text-gray-500">
          <Link to="/projects"      className="hover:text-gray-900 dark:hover:text-white transition-colors">Explore</Link>
          <Link to="/developers"    className="hover:text-gray-900 dark:hover:text-white transition-colors">Developers</Link>
          <Link to="/#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">How it works</Link>
        </div>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} CRAFT</p>
      </div>
    </div>
  </footer>
);

const LandingFooter = () => (
  <footer className="bg-gray-950 border-t border-white/[0.07]">
    <div className="container-app py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded bg-white flex items-center justify-center">
              <span className="text-[9px] font-black text-gray-950">C</span>
            </div>
            <span className="text-sm font-semibold text-white">CRAFT</span>
          </div>
          <p className="text-xs text-gray-600">Ideas. Talent. Built.</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          {[
            { label: 'Explore Projects',  to: '/projects'              },
            { label: 'Find Developers',   to: '/developers'            },
            { label: 'How It Works',      to: '/#how-it-works'         },
            { label: 'Post a Project',    to: '/register?role=client'  },
            { label: 'Find Projects',     to: '/register?role=developer' },
          ].map(({ label, to }) => (
            <Link key={label} to={to} className="hover:text-white transition-colors">{label}</Link>
          ))}
        </div>
        <p className="text-sm text-gray-700">© {new Date().getFullYear()} CRAFT</p>
      </div>
    </div>
  </footer>
);
