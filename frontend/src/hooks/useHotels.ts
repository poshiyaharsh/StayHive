import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Hotel, HotelFacility, Gallery } from '../types/database';
import { useNotification } from '../context/NotificationContext';

export interface HotelFilters {
  search?: string;
  city?: string;
  state?: string;
  is_active?: boolean;
}

export const useHotels = (filters?: HotelFilters) => {
  return useQuery<Hotel[]>({
    queryKey: ['hotels', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.city) params.append('city', filters.city);
      if (filters?.state) params.append('state', filters.state);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

      const res = await apiClient.get(`/hotels/?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useHotel = (id: number | string | undefined) => {
  return useQuery<Hotel>({
    queryKey: ['hotel', id],
    queryFn: async () => {
      if (!id) throw new Error('Hotel ID is required');
      const res = await apiClient.get(`/hotels/${id}/`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });
};

export const useCreateHotel = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (hotelData: Partial<Hotel>) => {
      const res = await apiClient.post('/hotels/', hotelData);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast('Hotel created successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Failed to create hotel.';
      showToast(msg, 'error');
    },
  });
};

export const useUpdateHotel = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<Hotel> }) => {
      const res = await apiClient.patch(`/hotels/${id}/`, data);
      return res.data?.data || res.data;
    },
    onSuccess: (data, variables) => {
      showToast('Hotel updated successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['hotel', variables.id] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update hotel.';
      showToast(msg, 'error');
    },
  });
};

export const useDeleteHotel = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await apiClient.delete(`/hotels/${id}/`);
      return res.data;
    },
    onSuccess: () => {
      showToast('Hotel deleted successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Cannot delete hotel due to active linked records.';
      showToast(msg, 'error');
    },
  });
};

export const useHotelFacilities = (hotelId: number | string | undefined) => {
  return useQuery<HotelFacility[]>({
    queryKey: ['hotel-facilities', hotelId],
    queryFn: async () => {
      if (!hotelId) return [];
      const res = await apiClient.get(`/hotels/${hotelId}/facilities/`);
      return res.data?.data || res.data || [];
    },
    enabled: !!hotelId,
  });
};

export const useHotelGallery = (hotelId: number | string | undefined) => {
  return useQuery<Gallery[]>({
    queryKey: ['hotel-gallery', hotelId],
    queryFn: async () => {
      if (!hotelId) return [];
      const res = await apiClient.get(`/hotels/${hotelId}/gallery/`);
      return res.data?.data || res.data || [];
    },
    enabled: !!hotelId,
  });
};
