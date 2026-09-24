import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useNotification } from '../context/NotificationContext';

export interface HousekeepingTaskItem {
  id: number;
  task_id: number;
  room_id: number;
  room_number: string;
  room_floor: number;
  floor_number: number;
  room_type: string;
  hotel_name: string;
  hotel_id: number;
  staff_id: number | null;
  staff_name: string | null;
  staff_department: string | null;
  task_type: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent' | string;
  status: 'Pending' | 'Assigned' | 'Scheduled' | 'Cleaning' | 'In Progress' | 'Inspection' | 'Completed' | 'Cancelled' | string;
  task_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | string;
  scheduled_time: string;
  scheduled_date: string;
  completed_at: string | null;
  completed_date: string | null;
  notes: string;
  remarks: string;
}

export interface HousekeepingRoomBoardItem {
  room_id: number;
  room_number: string;
  floor: number;
  room_type: string;
  room_status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Cleaning' | string;
  housekeeping_status: 'Clean' | 'Needs Cleaning' | 'In Progress' | 'Inspected' | string;
  is_dirty: boolean;
  is_clean: boolean;
}

export interface CreateHousekeepingTaskPayload {
  room_id: number;
  staff_id?: number | null;
  scheduled_date?: string;
  task_type?: string;
  priority?: string;
  remarks?: string;
  notes?: string;
}

export interface HousekeepingFilters {
  status?: string;
  staff_id?: number;
  room_id?: number;
  floor?: string;
  scheduled_date?: string;
}

export const useHousekeepingTasks = (filters?: HousekeepingFilters) => {
  return useQuery<HousekeepingTaskItem[]>({
    queryKey: ['housekeeping-tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.staff_id) params.append('staff_id', String(filters.staff_id));
      if (filters?.room_id) params.append('room_id', String(filters.room_id));
      if (filters?.floor && filters.floor !== 'all') params.append('floor', filters.floor);
      if (filters?.scheduled_date) params.append('scheduled_date', filters.scheduled_date);

      const res = await apiClient.get(`/housekeeping/tasks/?${params.toString()}`);
      return res.data.data || res.data;
    },
    refetchInterval: 15000,
  });
};

export const useMyHousekeepingTasks = () => {
  return useQuery<HousekeepingTaskItem[]>({
    queryKey: ['my-housekeeping-tasks'],
    queryFn: async () => {
      const res = await apiClient.get('/housekeeping/tasks/my/');
      return res.data.data || res.data;
    },
    refetchInterval: 10000,
  });
};

export const useHousekeepingTask = (id: number | string) => {
  return useQuery<HousekeepingTaskItem>({
    queryKey: ['housekeeping-tasks', id],
    queryFn: async () => {
      const res = await apiClient.get(`/housekeeping/tasks/${id}/`);
      return res.data.data || res.data;
    },
    enabled: !!id,
  });
};

export const useCreateHousekeepingTask = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: CreateHousekeepingTaskPayload) => {
      const res = await apiClient.post('/housekeeping/tasks/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-room-board'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      showToast('Housekeeping task dispatched successfully.', 'success', 'Task Created');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to dispatch housekeeping task.';
      showToast(msg, 'error', 'Error');
    },
  });
};

export const useUpdateHousekeepingTaskStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, status, staff_id, remarks }: { id: number | string; status: string; staff_id?: number; remarks?: string }) => {
      const res = await apiClient.patch(`/housekeeping/tasks/${id}/status/`, {
        status,
        staff_id,
        remarks,
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-housekeeping-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping-room-board'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['reception-room-status'] });
      
      const label = variables.status === 'completed' ? 'Room marked Clean & Sanitized' : `Task status set to ${variables.status}`;
      showToast(label, 'success', 'Task Updated');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update housekeeping task.';
      showToast(msg, 'error', 'Update Failed');
    },
  });
};

export const useHousekeepingRoomBoard = (filters?: { floor?: string; housekeeping_status?: string }) => {
  return useQuery<HousekeepingRoomBoardItem[]>({
    queryKey: ['housekeeping-room-board', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.floor && filters.floor !== 'all') params.append('floor', filters.floor);
      if (filters?.housekeeping_status && filters.housekeeping_status !== 'all') {
        params.append('housekeeping_status', filters.housekeeping_status);
      }
      const res = await apiClient.get(`/housekeeping/tasks/room-board/?${params.toString()}`);
      return res.data.data || res.data;
    },
    refetchInterval: 15000,
  });
};
