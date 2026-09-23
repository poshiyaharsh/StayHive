import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Customer } from '../types/database';
import { useNotification } from '../context/NotificationContext';

export interface CustomerFilters {
  city?: string;
  loyalty_tier?: string;
  search?: string;
}

export const useCustomers = (filters?: CustomerFilters) => {
  return useQuery<Customer[]>({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters?.city) searchParams.append('city', filters.city);
      if (filters?.loyalty_tier) searchParams.append('loyalty_tier', filters.loyalty_tier);
      if (filters?.search) searchParams.append('search', filters.search);

      const qs = searchParams.toString();
      const url = qs ? `/customers/?${qs}` : '/customers/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useCustomer = (id: number | string | undefined) => {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('Customer ID is required');
      const res = await apiClient.get(`/customers/${id}/`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });
};

export const useCurrentCustomer = () => {
  return useQuery<Customer>({
    queryKey: ['customer-me'],
    queryFn: async () => {
      const res = await apiClient.get('/customers/me/');
      return res.data?.data || res.data;
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, data }: { id?: number | string; data: Partial<Customer> }) => {
      const url = id ? `/customers/${id}/` : '/customers/me/';
      const res = await apiClient.patch(url, data);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast('Profile updated successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-me'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['customer', String(data.id)] });
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update customer profile.';
      showToast(msg, 'error');
    },
  });
};
