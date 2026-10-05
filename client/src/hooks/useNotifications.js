import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationApi } from '../api/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export const useNotifications = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery(
    ['notifications'],
    () => notificationApi.get({ limit: 20 }).then((r) => r.data),
    {
      enabled: isAuthenticated,
      refetchInterval: 30000, // poll every 30s
      staleTime: 15000,
    }
  );

  const markRead = useMutation((id) => notificationApi.markRead(id), {
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllRead = useMutation(() => notificationApi.markAllRead(), {
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    total: data?.total || 0,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  };
};
