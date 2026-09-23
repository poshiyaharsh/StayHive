import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Room, RoomType, RoomAmenity, RoomStatus } from '../types/database';
import { useNotification } from '../context/NotificationContext';

export interface RoomFilters {
  hotel_id?: number | string;
  room_type_id?: number | string;
  floor?: number | string;
  status?: string;
  housekeeping_status?: string;
  search?: string;
}

export const useRoomTypes = (search?: string) => {
  return useQuery<RoomType[]>({
    queryKey: ['room-types', search],
    queryFn: async () => {
      const url = search ? `/room-types/?search=${encodeURIComponent(search)}` : '/room-types/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useRoomType = (id: number | string | undefined) => {
  return useQuery<RoomType>({
    queryKey: ['room-type', id],
    queryFn: async () => {
      if (!id) throw new Error('Room type ID is required');
      const res = await apiClient.get(`/room-types/${id}/`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });
};

export const useCreateRoomType = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: Partial<RoomType>) => {
      const res = await apiClient.post('/room-types/', payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast(`Room category '${data.type_name}' created successfully.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.errors?.type_name?.[0] || 'Failed to create room category.';
      showToast(msg, 'error');
    },
  });
};

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<RoomType> }) => {
      const res = await apiClient.patch(`/room-types/${id}/`, data);
      return res.data?.data || res.data;
    },
    onSuccess: (data, variables) => {
      showToast(`Room category updated successfully.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
      queryClient.invalidateQueries({ queryKey: ['room-type', variables.id] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update room category.';
      showToast(msg, 'error');
    },
  });
};

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await apiClient.delete(`/room-types/${id}/`);
      return res.data;
    },
    onSuccess: () => {
      showToast('Room category deleted successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Cannot delete room category because rooms are currently assigned to it.';
      showToast(msg, 'error');
    },
  });
};

export const useRooms = (filters?: RoomFilters) => {
  return useQuery<Room[]>({
    queryKey: ['rooms', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hotel_id && filters.hotel_id !== 'all') params.append('hotel_id', String(filters.hotel_id));
      if (filters?.room_type_id && filters.room_type_id !== 'all') params.append('room_type_id', String(filters.room_type_id));
      if (filters?.floor && filters.floor !== 'all') params.append('floor', String(filters.floor));
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.housekeeping_status && filters.housekeeping_status !== 'all') params.append('housekeeping_status', filters.housekeeping_status);
      if (filters?.search) params.append('search', filters.search);

      const res = await apiClient.get(`/rooms/?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useRoom = (id: number | string | undefined) => {
  return useQuery<Room>({
    queryKey: ['room', id],
    queryFn: async () => {
      if (!id) throw new Error('Room ID is required');
      const res = await apiClient.get(`/rooms/${id}/`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: {
      hotel_id: number | string;
      room_type_id: number | string;
      room_number: string;
      floor: number;
      status?: string;
      housekeeping_status?: string;
      price_per_night?: number | string;
    }) => {
      const res = await apiClient.post('/rooms/', payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast(`Room ${data.room_number} created successfully.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data?.errors?.room_number?.[0] || 'Failed to create room.';
      showToast(msg, 'error');
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number | string; data: Partial<Room> }) => {
      const res = await apiClient.patch(`/rooms/${id}/`, data);
      return res.data?.data || res.data;
    },
    onSuccess: (data, variables) => {
      showToast(`Room ${data.room_number} updated successfully.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update room.';
      showToast(msg, 'error');
    },
  });
};

export const useUpdateRoomStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, status, housekeeping }: { id: number | string; status: string; housekeeping?: string }) => {
      const payload: any = { status };
      if (housekeeping) payload.housekeeping_status = housekeeping;
      const res = await apiClient.patch(`/rooms/${id}/update_status/`, payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast(`Room ${data.room_number} status set to ${data.status} (${data.housekeeping_status}).`, 'success');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update room status.';
      showToast(msg, 'error');
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await apiClient.delete(`/rooms/${id}/`);
      return res.data;
    },
    onSuccess: () => {
      showToast('Room deleted successfully.', 'success');
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['room-types'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Cannot delete room due to active bookings or history.';
      showToast(msg, 'error');
    },
  });
};

export const useRoomAmenities = (roomId: number | string | undefined) => {
  return useQuery<RoomAmenity[]>({
    queryKey: ['room-amenities', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const res = await apiClient.get(`/rooms/${roomId}/amenities/`);
      return res.data?.data || res.data || [];
    },
    enabled: !!roomId,
  });
};
