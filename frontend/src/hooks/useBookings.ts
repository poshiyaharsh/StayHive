import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Booking, AvailabilityResponse, OfferPackage } from '../types/database';
import { useNotification } from '../context/NotificationContext';

export interface AvailabilityParams {
  hotel_id?: number | string;
  room_type_id?: number | string;
  check_in_date?: string;
  check_out_date?: string;
  guests?: number;
}

export interface BookingFilters {
  status?: string;
  hotel_id?: number | string;
  customer_id?: number | string;
  search?: string;
}

export interface CreateBookingPayload {
  hotel_id: number;
  room_type_id?: number;
  room_id?: number;
  check_in_date: string;
  check_out_date: string;
  total_guests: number;
  adults?: number;
  children?: number;
  offer_code?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  special_notes?: string;
}

export const useAvailability = (params: AvailabilityParams) => {
  return useQuery<AvailabilityResponse>({
    queryKey: ['availability', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.hotel_id) searchParams.append('hotel_id', String(params.hotel_id));
      if (params.room_type_id) searchParams.append('room_type_id', String(params.room_type_id));
      if (params.check_in_date) searchParams.append('check_in_date', params.check_in_date);
      if (params.check_out_date) searchParams.append('check_out_date', params.check_out_date);
      if (params.guests) searchParams.append('guests', String(params.guests));

      const res = await apiClient.get(`/bookings/availability/?${searchParams.toString()}`);
      return res.data?.data || res.data;
    },
    enabled: Boolean(params.check_in_date && params.check_out_date),
  });
};

export const useBookings = (filters?: BookingFilters) => {
  return useQuery<Booking[]>({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (filters?.status) searchParams.append('status', filters.status);
      if (filters?.hotel_id) searchParams.append('hotel_id', String(filters.hotel_id));
      if (filters?.customer_id) searchParams.append('customer_id', String(filters.customer_id));
      if (filters?.search) searchParams.append('search', filters.search);

      const qs = searchParams.toString();
      const url = qs ? `/bookings/?${qs}` : '/bookings/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useMyBookings = () => {
  return useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await apiClient.get('/bookings/my/');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useBooking = (id: number | string | undefined) => {
  return useQuery<Booking>({
    queryKey: ['booking', id],
    queryFn: async () => {
      if (!id) throw new Error('Booking ID is required');
      const res = await apiClient.get(`/bookings/${id}/`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const res = await apiClient.post('/bookings/', payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast(
        `Reservation confirmed! Booking Ref: ${data.booking_number}`,
        'success',
        'Reservation Confirmed'
      );
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.total_guests?.[0] ||
        err.response?.data?.errors?.check_in_date?.[0] ||
        err.response?.data?.errors?.check_out_date?.[0] ||
        'Reservation request failed. Please check room availability.';
      showToast(msg, 'error');
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: number | string; reason?: string }) => {
      const res = await apiClient.post(`/bookings/${id}/cancel/`, { reason });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast('Booking cancelled and refund process initiated.', 'info', 'Reservation Cancelled');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', String(data.booking_id)] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to cancel reservation.';
      showToast(msg, 'error');
    },
  });
};

export const useCheckInBooking = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, keyCard, notes }: { id: number | string; keyCard?: string; notes?: string }) => {
      const res = await apiClient.post(`/bookings/${id}/check_in/`, {
        key_card_issued: keyCard,
        notes: notes || 'Checked-in via reception desk'
      });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast(`Guest checked in successfully. Keycard issued.`, 'success', 'Check-In Complete');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', String(data.id)] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Check-in failed.';
      showToast(msg, 'error');
    },
  });
};

export const useCheckOutBooking = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await apiClient.post(`/bookings/${id}/check_out/`);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast('Guest checked out. Housekeeping task dispatched.', 'success', 'Check-Out Complete');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', String(data.id)] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Check-out failed.';
      showToast(msg, 'error');
    },
  });
};

export const useOffers = (hotel_id?: number | string) => {
  return useQuery<OfferPackage[]>({
    queryKey: ['offers', hotel_id],
    queryFn: async () => {
      const url = hotel_id ? `/offers/?hotel_id=${hotel_id}` : '/offers/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useValidateOffer = () => {
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ code, amount }: { code: string; amount: number }) => {
      const res = await apiClient.post('/offers/validate_code/', { code, amount });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      showToast(`Promo '${data.code}' applied: ${data.discount_percentage}% OFF!`, 'success');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Invalid or expired offer coupon.';
      showToast(msg, 'error');
    },
  });
};
