import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useNotification } from '../context/NotificationContext';

export interface ServiceItem {
  id: number;
  service_id: number;
  hotel_id: number;
  hotel_name: string;
  name: string;
  service_name: string;
  category: string;
  price: string | number;
  duration_minutes: number;
  is_available: boolean;
  is_active: boolean;
  description: string;
}

export interface ServiceRequestItem {
  id: number;
  request_id: number;
  booking_id: number;
  booking_number: string;
  service_id: number;
  service_name: string;
  service_price: string | number;
  service_category: string;
  service?: {
    service_id: number;
    service_name: string;
    price: number;
  };
  customer?: {
    customer_id: number;
    name: string;
  };
  customer_name: string;
  staff_id: number | null;
  staff_name: string | null;
  requested_at: string;
  request_date: string;
  status: string;
  request_status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | string;
  notes: string;
  remarks: string;
}

export interface CreateServiceRequestPayload {
  booking_id: number;
  service_id: number;
  remarks?: string;
  notes?: string;
}

export interface ServiceFilters {
  is_active?: boolean;
  search?: string;
  category?: string;
  hotel_id?: number;
}

export interface ServiceRequestFilters {
  status?: string;
  booking_id?: number;
  service_id?: number;
}

export const useServices = (filters?: ServiceFilters) => {
  return useQuery<ServiceItem[]>({
    queryKey: ['services', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.hotel_id) params.append('hotel_id', String(filters.hotel_id));

      const res = await apiClient.get(`/services/?${params.toString()}`);
      return res.data.data || res.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useService = (id: number | string) => {
  return useQuery<ServiceItem>({
    queryKey: ['services', id],
    queryFn: async () => {
      const res = await apiClient.get(`/services/${id}/`);
      return res.data.data || res.data;
    },
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: Partial<ServiceItem>) => {
      const res = await apiClient.post('/services/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      showToast('Hotel service added successfully.', 'success', 'Service Created');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create service.';
      showToast(msg, 'error', 'Error');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<ServiceItem> }) => {
      const res = await apiClient.patch(`/services/${id}/`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      showToast('Service updated successfully.', 'success', 'Service Updated');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update service.';
      showToast(msg, 'error', 'Error');
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await apiClient.delete(`/services/${id}/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      showToast('Service deleted successfully.', 'success', 'Service Deleted');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete service.';
      showToast(msg, 'error', 'Error');
    },
  });
};

export const useServiceRequests = (filters?: ServiceRequestFilters) => {
  return useQuery<ServiceRequestItem[]>({
    queryKey: ['service-requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.booking_id) params.append('booking_id', String(filters.booking_id));
      if (filters?.service_id) params.append('service_id', String(filters.service_id));

      const res = await apiClient.get(`/service-requests/?${params.toString()}`);
      return res.data.data || res.data;
    },
    refetchInterval: 15000,
  });
};

export const useMyServiceRequests = () => {
  return useQuery<ServiceRequestItem[]>({
    queryKey: ['my-service-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/service-requests/my/');
      return res.data.data || res.data;
    },
    refetchInterval: 15000,
  });
};

export const useCreateServiceRequest = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: CreateServiceRequestPayload) => {
      const res = await apiClient.post('/service-requests/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      showToast('Your service request has been received by front desk.', 'success', 'Request Confirmed');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to submit service request.';
      showToast(msg, 'error', 'Request Failed');
    },
  });
};

export const useUpdateServiceRequestStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, status, staff_id }: { id: number | string; status: string; staff_id?: number }) => {
      const res = await apiClient.patch(`/service-requests/${id}/status/`, {
        status,
        staff_id,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-service-requests'] });
      showToast('Service request status updated.', 'success', 'Status Updated');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update request status.';
      showToast(msg, 'error', 'Update Failed');
    },
  });
};

export const useCancelServiceRequest = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await apiClient.patch(`/service-requests/${id}/cancel/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-service-requests'] });
      showToast('Service request cancelled.', 'success', 'Cancelled');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to cancel request.';
      showToast(msg, 'error', 'Error');
    },
  });
};
