import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, PlusCircle, FileText,
  MessageSquare, Bell, User, Settings, Search, Briefcase,
  Users, Flag, BookOpen, Star,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import { cn } from '../../utils/cn.js';

const Item = ({ to, icon: Icon, label, badge, end = false }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07]'
      )
    }
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="flex-1 truncate">{label}</span>
    {badge > 0 && (
      <span className="ml-auto min-w-[18px] h-[18px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center px-1">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </NavLink>
);

const Divider = ({ label }) => (
  <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest select-none">
    {label}
  </p>
);

export const ClientSidebar = () => {
  const { unreadCount } = useNotifications();
  return (
    <nav className="space-y-0.5">
      <Divider label="Overview" />
      <Item to="/dashboard"          icon={LayoutDashboard} label="Dashboard" end />
      <Item to="/dashboard/projects" icon={FolderOpen}      label="My Projects" />
      <Item to="/projects/new"       icon={PlusCircle}      label="Post a Project" />
      <Divider label="Work" />
      <Item to="/dashboard/offers"  icon={FileText}   label="Offers" />
      <Item to="/dashboard/active"  icon={Briefcase}  label="Active Projects" />
      <Divider label="Communication" />
      <Item to="/inquiries"         icon={MessageSquare} label="Messages" />
      <Item to="/notifications"     icon={Bell}          label="Notifications" badge={unreadCount} />
      <Divider label="Account" />
      <Item to="/profile"           icon={User}          label="Profile" />
      <Item to="/settings"          icon={Settings}      label="Settings" />
    </nav>
  );
};

export const DeveloperSidebar = () => {
  const { unreadCount } = useNotifications();
  return (
    <nav className="space-y-0.5">
      <Divider label="Overview" />
      <Item to="/dashboard"         icon={LayoutDashboard} label="Dashboard" end />
      <Divider label="Work" />
      <Item to="/projects"          icon={Search}    label="Find Projects" />
      <Item to="/dashboard/offers"  icon={FileText}  label="My Offers" />
      <Item to="/dashboard/active"  icon={Briefcase} label="Active Projects" />
      <Divider label="Communication" />
      <Item to="/inquiries"         icon={MessageSquare} label="Messages" />
      <Item to="/notifications"     icon={Bell}          label="Notifications" badge={unreadCount} />
      <Divider label="Account" />
      <Item to="/profile"           icon={User}          label="My Profile" />
      <Item to="/settings"          icon={Settings}      label="Settings" />
    </nav>
  );
};

export const AdminSidebar = () => (
  <nav className="space-y-0.5">
    <Divider label="Platform" />
    <Item to="/admin"            icon={LayoutDashboard} label="Dashboard" end />
    <Item to="/admin/users"      icon={Users}           label="Users" />
    <Item to="/admin/projects"   icon={FolderOpen}      label="Projects" />
    <Divider label="Moderation" />
    <Item to="/admin/reports"    icon={Flag}            label="Reports" />
    <Item to="/admin/reviews"    icon={Star}            label="Reviews" />
    <Divider label="Logs" />
    <Item to="/admin/audit-logs" icon={BookOpen}        label="Audit Logs" />
  </nav>
);
