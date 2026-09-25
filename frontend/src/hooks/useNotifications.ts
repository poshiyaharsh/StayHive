import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  unread_count: number;
  total_count?: number;
}

export const notificationApi = {
  getNotifications: async (params?: { page?: number; is_read?: boolean; page_size?: number }): Promise<NotificationResponse> => {
    const res = await apiClient.get('/notifications/', { params });
    const data = res.data?.data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.notifications)) {
        return {
          notifications: data.notifications,
          unread_count: data.unread_count ?? 0,
        };
      }
      if (Array.isArray(data)) {
        return {
          notifications: data,
          unread_count: data.filter((n: NotificationItem) => !n.is_read).length,
        };
      }
    }
    // DRF pagination fallback
    if (res.data?.results && Array.isArray(res.data.results)) {
      return {
        notifications: res.data.results,
        unread_count: res.data.results.filter((n: NotificationItem) => !n.is_read).length,
        total_count: res.data.count,
      };
    }
    return { notifications: [], unread_count: 0 };
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get('/notifications/unread-count/');
    return res.data?.count ?? 0;
  },

  getUnread: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get('/notifications/unread/');
    return res.data?.data || [];
  },

  markRead: async (id: number): Promise<NotificationItem> => {
    const res = await apiClient.patch(`/notifications/${id}/read/`);
    return res.data?.data;
  },

  markAllRead: async (): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.patch('/notifications/read-all/');
    return res.data;
  },
};

export const useNotifications = (params?: { page?: number; is_read?: boolean }) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationApi.getNotifications(params),
    refetchInterval: 15000, // poll every 15s for live notifications
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationApi.getUnreadCount,
    refetchInterval: 10000,
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: notificationApi.getUnread,
    refetchInterval: 15000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};
