import { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications.unread-count'],
    queryFn: () => notificationsAPI.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData(['notifications'], (old) =>
        old ? { ...old, data: old.data.map((n) => ({ ...n, is_read: true })) } : old
      );
      queryClient.invalidateQueries({ queryKey: ['notifications.unread-count'] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications.unread-count'] });
    },
  });

  const notifications = data?.success ? (data.data.data || data.data) : [];
  const unreadCount = unreadData?.success ? unreadData.data.count : 0;

  const value = {
    notifications,
    unreadCount,
    isLoading,
    markAllRead: () => markAllReadMutation.mutate(),
    markRead: (id) => markReadMutation.mutate(id),
    deleteNotification: (id) => deleteMutation.mutate(id),
    refetch,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

