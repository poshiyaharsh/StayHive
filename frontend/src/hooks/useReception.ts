import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useNotification } from '../context/NotificationContext';

export interface ReceptionArrival {
  id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  id_proof_type: string;
  id_proof_number: string;
  hotel_id: number;
  hotel_name: string;
  room_id: number | null;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_guests: number;
  adults: number;
  children: number;
  total_amount: string | number;
  net_amount: string | number;
  status: string;
  created_at: string;
}

export interface ReceptionDeparture {
  id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  hotel_id: number;
  hotel_name: string;
  room_id: number | null;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in: string | null;
  key_card_issued: string | null;
  total_guests: number;
  net_amount: string | number;
  status: string;
}

export interface ReceptionActiveStay {
  id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  hotel_id: number;
  hotel_name: string;
  room_id: number | null;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  actual_check_in: string | null;
  checked_in_by: string;
  key_card_issued: string | null;
  total_guests: number;
  adults: number;
  children: number;
  net_amount: string | number;
  status: string;
}

export interface RoomStatusItem {
  id: number;
  hotel_id: number;
  hotel_name: string;
  room_number: string;
  floor: number;
  status: string;
  housekeeping_status: string;
  price_per_night: string | number;
  room_type_id: number;
  room_type_name: string;
  capacity: number;
  current_occupant: string | null;
  active_booking_id: number | null;
  expected_checkout: string | null;
}

export interface ReceptionDashboardStats {
  today_arrivals_count: number;
  today_departures_count: number;
  in_house_count: number;
  available_rooms_count: number;
  occupied_rooms_count: number;
  cleaning_rooms_count: number;
  maintenance_rooms_count: number;
  pending_checkins: number;
  pending_checkouts: number;
  today_arrivals: ReceptionArrival[];
  today_departures: ReceptionDeparture[];
  recent_bookings: any[];
}

export interface ReceptionCancellation {
  id: number;
  booking_id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  room_number: string | null;
  reason: string;
  requested_at: string;
  refund_applicable: boolean;
  refund_amount: string | number;
  status: string;
}

export interface CheckInPayload {
  booking_id: number;
  key_card_issued?: string;
  remarks?: string;
}

export interface CheckOutPayload {
  booking_id: number;
  remarks?: string;
}

// -------------------------------------------------------------
// Hooks
// -------------------------------------------------------------

export const useReceptionDashboard = (hotelId?: number | string) => {
  return useQuery<ReceptionDashboardStats>({
    queryKey: ['reception-dashboard', hotelId],
    queryFn: async () => {
      const url = hotelId ? `/reception/dashboard/?hotel_id=${hotelId}` : '/reception/dashboard/';
      const res = await apiClient.get(url);
      return res.data?.data || res.data;
    },
    refetchInterval: 30000, // Poll front desk every 30s
  });
};

export const useArrivals = (hotelId?: number | string) => {
  return useQuery<ReceptionArrival[]>({
    queryKey: ['arrivals', hotelId],
    queryFn: async () => {
      const url = hotelId ? `/reception/arrivals/?hotel_id=${hotelId}` : '/reception/arrivals/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useDepartures = (hotelId?: number | string) => {
  return useQuery<ReceptionDeparture[]>({
    queryKey: ['departures', hotelId],
    queryFn: async () => {
      const url = hotelId ? `/reception/departures/?hotel_id=${hotelId}` : '/reception/departures/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useActiveStays = (hotelId?: number | string) => {
  return useQuery<ReceptionActiveStay[]>({
    queryKey: ['active-stays', hotelId],
    queryFn: async () => {
      const url = hotelId ? `/reception/active-stays/?hotel_id=${hotelId}` : '/reception/active-stays/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useRoomStatusBoard = (filters?: { hotel_id?: number | string; status?: string; floor?: string | number }) => {
  return useQuery<RoomStatusItem[]>({
    queryKey: ['room-status-board', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.hotel_id) params.append('hotel_id', String(filters.hotel_id));
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.floor && filters.floor !== 'all') params.append('floor', String(filters.floor));

      const qs = params.toString();
      const url = qs ? `/reception/room-status/?${qs}` : '/reception/room-status/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useReceptionSearch = (filters: {
  q?: string;
  status?: string;
  hotel_id?: number | string;
  arrivals_today?: boolean;
  departures_today?: boolean;
}) => {
  return useQuery<any[]>({
    queryKey: ['reception-search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.hotel_id) params.append('hotel_id', String(filters.hotel_id));
      if (filters.arrivals_today) params.append('arrivals_today', 'true');
      if (filters.departures_today) params.append('departures_today', 'true');

      const res = await apiClient.get(`/reception/search/?${params.toString()}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: Boolean(filters.q || filters.status || filters.arrivals_today || filters.departures_today),
  });
};

export const useReceptionCancellations = () => {
  return useQuery<ReceptionCancellation[]>({
    queryKey: ['reception-cancellations'],
    queryFn: async () => {
      const res = await apiClient.get('/reception/cancellation-requests/');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: CheckInPayload) => {
      const res = await apiClient.post('/reception/check-in/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      const roomNum = data.data?.room_number || 'assigned room';
      const keyCard = data.data?.key_card_issued || 'Standard Keycard';
      showToast(
        `Guest checked into Room ${roomNum}. Keycard ${keyCard} active.`,
        'success',
        'Check-In Complete'
      );
      queryClient.invalidateQueries({ queryKey: ['reception-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['arrivals'] });
      queryClient.invalidateQueries({ queryKey: ['departures'] });
      queryClient.invalidateQueries({ queryKey: ['active-stays'] });
      queryClient.invalidateQueries({ queryKey: ['room-status-board'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Check-in failed. Please verify booking status.';
      showToast(msg, 'error', 'Check-In Error');
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: CheckOutPayload) => {
      const res = await apiClient.post('/reception/check-out/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      const roomNum = data.data?.room_number || 'Room';
      showToast(
        `Room ${roomNum} checked out. Housekeeping task dispatched (Needs Cleaning).`,
        'success',
        'Check-Out Complete'
      );
      queryClient.invalidateQueries({ queryKey: ['reception-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['arrivals'] });
      queryClient.invalidateQueries({ queryKey: ['departures'] });
      queryClient.invalidateQueries({ queryKey: ['active-stays'] });
      queryClient.invalidateQueries({ queryKey: ['room-status-board'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Check-out failed. Please verify booking status.';
      showToast(msg, 'error', 'Check-Out Error');
    },
  });
};
