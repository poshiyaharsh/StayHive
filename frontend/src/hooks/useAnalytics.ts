import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export interface AnalyticsFilterParams {
  period?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'all';
  date_from?: string;
  date_to?: string;
  hotel_id?: number | string;
}

export const analyticsApi = {
  getOverview: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/overview/', { params });
    return res.data?.data;
  },

  getBookings: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/bookings/', { params });
    return res.data?.data;
  },

  getRooms: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/rooms/', { params });
    return res.data?.data;
  },

  getFood: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/food/', { params });
    return res.data?.data;
  },

  getServices: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/services/', { params });
    return res.data?.data;
  },

  getHousekeeping: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/housekeeping/', { params });
    return res.data?.data;
  },

  getCustomers: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/customers/', { params });
    return res.data?.data;
  },

  getFeedback: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/feedback/', { params });
    return res.data?.data;
  },

  getComplaints: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/complaints/', { params });
    return res.data?.data;
  },

  getInquiries: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/inquiries/', { params });
    return res.data?.data;
  },

  getPayments: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/payments/', { params });
    return res.data?.data;
  },

  getRefunds: async (params?: AnalyticsFilterParams) => {
    const res = await apiClient.get('/analytics/refunds/', { params });
    return res.data?.data;
  },
};

export const useAnalyticsOverview = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics-overview', params],
    queryFn: () => analyticsApi.getOverview(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useBookingAnalytics = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics-bookings', params],
    queryFn: () => analyticsApi.getBookings(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useRoomAnalytics = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics-rooms', params],
    queryFn: () => analyticsApi.getRooms(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const usePaymentAnalytics = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics-payments', params],
    queryFn: () => analyticsApi.getPayments(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useFoodAnalytics = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics-food', params],
    queryFn: () => analyticsApi.getFood(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useHousekeepingAnalytics = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics-housekeeping', params],
    queryFn: () => analyticsApi.getHousekeeping(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useSupportAnalytics = (params?: AnalyticsFilterParams) => {
  return useQuery({
    queryKey: ['analytics-support', params],
    queryFn: async () => {
      const [fb, comp, inq] = await Promise.all([
        analyticsApi.getFeedback(params),
        analyticsApi.getComplaints(params),
        analyticsApi.getInquiries(params),
      ]);
      return { feedback: fb, complaints: comp, inquiries: inq };
    },
    staleTime: 1000 * 60 * 2,
  });
};
