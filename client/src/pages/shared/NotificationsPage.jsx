import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { notificationApi } from '../../api/index.js';
import { AppLayout } from '../../components/layout/AppLayout.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { formatRelativeTime } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const notifColors = {
  new_offer: 'bg-brand-100 text-brand-600',
  offer_accepted: 'bg-green-100 text-green-600',
  offer_rejected: 'bg-gray-100 text-gray-500',
  new_message: 'bg-blue-100 text-blue-600',
  project_assigned: 'bg-green-100 text-green-600',
  milestone_submitted: 'bg-yellow-100 text-yellow-600',
  milestone_approved: 'bg-green-100 text-green-600',
  revision_requested: 'bg-red-100 text-red-600',
  project_completed: 'bg-brand-100 text-brand-600',
  new_review: 'bg-yellow-100 text-yellow-600',
  default: 'bg-gray-100 text-gray-500',
};

export const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['notifications-page'],
    () => notificationApi.get({ limit: 50 }).then((r) => r.data)
  );

  const markAllRead = useMutation(() => notificationApi.markAllRead(), {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications-page']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const markRead = useMutation((id) => notificationApi.markRead(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications-page']);
      queryClient.invalidateQueries(['notifications']);
    },
  });

  const deleteNotif = useMutation((id) => notificationApi.delete(id), {
    onSuccess: () => queryClient.invalidateQueries(['notifications-page']),
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              loading={markAllRead.isLoading}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="All caught up"
            description="No notifications yet. They'll appear here when there's activity on your projects."
          />
        ) : (
          <div className="card divide-y divide-gray-100">
            {notifications.map((n) => {
              const colorClass = notifColors[n.type] || notifColors.default;
              return (
                <div
                  key={n._id}
                  className={cn('flex items-start gap-4 p-4 transition-colors', !n.isRead && 'bg-brand-50/40')}
                  onClick={() => !n.isRead && markRead.mutate(n._id)}
                >
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-sm', colorClass)}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', n.isRead ? 'text-gray-700' : 'font-semibold text-gray-900')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatRelativeTime(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-brand-600 rounded-full" />
                    )}
                    {n.link && (
                      <Link to={n.link} className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition-colors" onClick={(e) => e.stopPropagation()}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n._id); }}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
