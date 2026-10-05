import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Search, FileText, Bell, User, Briefcase,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import { cn } from '../../utils/cn.js';

/**
 * MobileNav — fixed bottom navigation bar shown only on mobile/tablet (< lg).
 * Gives access to the 5 most important destinations without the sidebar.
 */
export const MobileNav = () => {
  const { isClient, isDeveloper, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  if (isAdmin) return null; // admin uses desktop only

  const clientItems = [
    { to: '/dashboard',          icon: LayoutDashboard, label: 'Home'       },
    { to: '/dashboard/projects', icon: Briefcase,       label: 'Projects'   },
    { to: '/projects/new',       icon: Search,          label: 'Post'       },
    { to: '/notifications',      icon: Bell,            label: 'Alerts', badge: unreadCount },
    { to: '/profile',            icon: User,            label: 'Profile'    },
  ];

  const developerItems = [
    { to: '/dashboard',         icon: LayoutDashboard, label: 'Home'      },
    { to: '/projects',          icon: Search,          label: 'Browse'    },
    { to: '/dashboard/offers',  icon: FileText,        label: 'Offers'    },
    { to: '/notifications',     icon: Bell,            label: 'Alerts', badge: unreadCount },
    { to: '/profile',           icon: User,            label: 'Profile'   },
  ];

  const items = isClient ? clientItems : developerItems;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-white/[0.08] safe-area-bottom">
      <div className="flex items-stretch h-16">
        {items.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors relative',
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span>{label}</span>
                {isActive && (
                  <span className="absolute top-0 inset-x-4 h-0.5 bg-gray-900 dark:bg-white rounded-b-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
