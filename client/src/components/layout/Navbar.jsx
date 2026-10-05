import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import { ThemeToggleIcon } from '../ui/ThemeToggle.jsx';
import { cn } from '../../utils/cn.js';

export const Navbar = () => {
  const { user, isAuthenticated, isClient, isDeveloper, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!isLanding) { setScrolled(true); return; }
    setScrolled(window.scrollY > 50);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding, location.pathname]);

  // On landing: transparent until scrolled → goes dark. Everywhere else: always dark.
  const solidDark = !isLanding || scrolled;

  const navBg = solidDark
    ? 'bg-gray-950/95 backdrop-blur-md border-b border-white/[0.07]'
    : 'bg-transparent border-b border-transparent';

  const linkCls = solidDark
    ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
    : 'text-white/60 hover:text-white hover:bg-white/[0.06]';

  const activeCls = 'text-white bg-white/[0.08]';
  const logoText  = 'text-white';

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    return '/dashboard';
  };

  return (
    <header className={cn('fixed top-0 inset-x-0 z-50 transition-all duration-300', navBg)}>
      <nav className="container-app">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
              <span className="text-[11px] font-black text-gray-950 tracking-tighter">C</span>
            </div>
            <span className={cn('text-[15px] font-semibold tracking-tight', logoText)}>CRAFT</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { to: '/projects',   label: 'Explore Projects' },
              { to: '/developers', label: 'Find Developers'  },
              { to: '/#how-it-works', label: 'How It Works'  },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn('px-3.5 py-2 text-sm font-medium rounded-lg transition-colors', isActive ? activeCls : linkCls)
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                {/* Bell */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-white text-gray-950 text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                  >
                    <Avatar src={user.avatar} name={user.name} size="xs" />
                    <span className="hidden sm:block text-sm font-medium text-gray-300 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-white/[0.1] rounded-xl shadow-modal z-20 py-1 animate-fade-in">
                        <div className="px-3.5 py-3 border-b border-white/[0.07]">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <DropItem to={getDashboardLink()} icon={LayoutDashboard} label="Dashboard" onClick={() => setUserMenuOpen(false)} />
                          {isClient && <DropItem to="/projects/new" icon={Briefcase} label="Post a Project" onClick={() => setUserMenuOpen(false)} />}
                          <DropItem to="/profile"  icon={User}     label="Profile"   onClick={() => setUserMenuOpen(false)} />
                          <DropItem to="/settings" icon={Settings} label="Settings"  onClick={() => setUserMenuOpen(false)} />
                        </div>
                        <div className="border-t border-white/[0.07] pt-1">
                          <button
                            onClick={() => { setUserMenuOpen(false); logout(); }}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-400 hover:bg-white/[0.05] hover:text-red-300 transition-colors rounded-lg"
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="hidden sm:block px-3.5 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-white text-gray-950 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Theme toggle */}
            <ThemeToggleIcon />

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/[0.07] py-3 space-y-0.5 animate-slide-down">
            {[
              { to: '/projects',   label: 'Explore Projects' },
              { to: '/developers', label: 'Find Developers'  },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                {label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-3">
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium text-gray-300 border border-white/[0.12] hover:bg-white/[0.06] transition-colors">Sign in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold bg-white text-gray-950 hover:bg-gray-100 transition-colors">Get started</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

const DropItem = ({ to, icon: Icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors rounded-lg mx-1"
  >
    <Icon className="w-4 h-4 text-gray-500" />
    {label}
  </Link>
);
