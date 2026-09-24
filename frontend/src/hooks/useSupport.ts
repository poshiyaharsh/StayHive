import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';

// ============================================================
// 1. API SERVICES
// ============================================================

export interface FeedbackItem {
  id: number;
  booking_id: number;
  booking_number?: string;
  customer_id: number;
  customer_name: string;
  customer_avatar?: string;
  hotel_id: number;
  hotel_name: string;
  rating: number;
  cleanliness_rating?: number;
  service_rating?: number;
  comments?: string;
  comment?: string;
  staff_response?: string;
  created_at: string;
  feedback_date?: string;
}

export interface FeedbackSummary {
  total_feedback: number;
  average_rating: number;
  rating_distribution: {
    [key: string]: number;
  };
}

export interface ComplaintItem {
  id: number;
  complaint_id?: number;
  customer_id: number;
  customer_name: string;
  customer_email?: string;
  booking_id?: number;
  booking_number?: string;
  subject: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: number;
  assigned_name?: string;
  resolved_by?: string;
  resolution_notes?: string;
  resolution?: string;
  created_at: string;
  complaint_date?: string;
  resolved_at?: string;
}

export interface InquiryItem {
  id: number;
  inquiry_id?: number;
  customer_id?: number | null;
  customer_name: string;
  name?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  assigned_to?: number | null;
  assigned_name?: string;
  responded_by?: string;
  response?: string;
  created_at: string;
  inquiry_date?: string;
  responded_at?: string;
}

export interface SupportSummary {
  feedback: {
    total: number;
    average_rating: number;
  };
  complaints: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    closed: number;
    rejected?: number;
  };
  inquiries: {
    total: number;
    pending: number;
    in_progress: number;
    responded: number;
    closed: number;
  };
}

export const feedbackApi = {
  getFeedback: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/feedback/', { params });
    return res.data?.data || [];
  },
  getMyFeedback: async () => {
    const res = await apiClient.get('/feedback/my/');
    return res.data?.data || [];
  },
  getSummary: async (): Promise<FeedbackSummary> => {
    const res = await apiClient.get('/feedback/summary/');
    return res.data?.data || { total_feedback: 0, average_rating: 0, rating_distribution: {} };
  },
  createFeedback: async (payload: { booking_id: number; rating: number; comment?: string; comments?: string; cleanliness_rating?: number; service_rating?: number }) => {
    const res = await apiClient.post('/feedback/', payload);
    return res.data?.data;
  },
  replyFeedback: async (id: number, response: string) => {
    const res = await apiClient.post(`/feedback/${id}/reply/`, { response });
    return res.data?.data;
  },
};

export const complaintApi = {
  getComplaints: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/complaints/', { params });
    return res.data?.data || [];
  },
  getMyComplaints: async () => {
    const res = await apiClient.get('/complaints/my/');
    return res.data?.data || [];
  },
  getComplaint: async (id: number) => {
    const res = await apiClient.get(`/complaints/${id}/`);
    return res.data?.data;
  },
  createComplaint: async (payload: { subject: string; description: string; booking_id?: number | null; category?: string; priority?: string }) => {
    const res = await apiClient.post('/complaints/', payload);
    return res.data?.data;
  },
  updateStatus: async (id: number, status: string, resolution?: string) => {
    const res = await apiClient.patch(`/complaints/${id}/status/`, { status, resolution });
    return res.data?.data;
  },
  resolveComplaint: async (id: number, resolution: string) => {
    const res = await apiClient.post(`/complaints/${id}/resolve/`, { resolution });
    return res.data?.data;
  },
};

export const inquiryApi = {
  getInquiries: async (params?: Record<string, any>) => {
    const res = await apiClient.get('/inquiries/', { params });
    return res.data?.data || [];
  },
  getMyInquiries: async () => {
    const res = await apiClient.get('/inquiries/my/');
    return res.data?.data || [];
  },
  getInquiry: async (id: number) => {
    const res = await apiClient.get(`/inquiries/${id}/`);
    return res.data?.data;
  },
  createInquiry: async (payload: { name?: string; customer_name?: string; email: string; phone?: string; subject: string; message: string }) => {
    const res = await apiClient.post('/inquiries/', payload);
    return res.data?.data;
  },
  replyInquiry: async (id: number, response: string) => {
    const res = await apiClient.post(`/inquiries/${id}/reply/`, { response });
    return res.data?.data;
  },
};

export const supportApi = {
  getSummary: async (): Promise<SupportSummary> => {
    const res = await apiClient.get('/support/summary/');
    return res.data?.data;
  },
};

// ============================================================
// 2. TANSTACK QUERY HOOKS
// ============================================================

// Feedback Hooks
export function useFeedback(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['feedback', filters],
    queryFn: () => feedbackApi.getFeedback(filters),
  });
}

export function useMyFeedback() {
  return useQuery({
    queryKey: ['feedback', 'my'],
    queryFn: feedbackApi.getMyFeedback,
  });
}

export function useFeedbackSummary() {
  return useQuery({
    queryKey: ['feedback', 'summary'],
    queryFn: feedbackApi.getSummary,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: feedbackApi.createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'summary'] });
    },
  });
}

export function useReplyFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      feedbackApi.replyFeedback(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'summary'] });
    },
  });
}

// Complaint Hooks
export function useComplaints(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['complaints', filters],
    queryFn: () => complaintApi.getComplaints(filters),
  });
}

export function useMyComplaints() {
  return useQuery({
    queryKey: ['complaints', 'my'],
    queryFn: complaintApi.getMyComplaints,
  });
}

export function useComplaint(id: number | null) {
  return useQuery({
    queryKey: ['complaints', id],
    queryFn: () => (id ? complaintApi.getComplaint(id) : null),
    enabled: !!id,
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complaintApi.createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'summary'] });
    },
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolution }: { id: number; status: string; resolution?: string }) =>
      complaintApi.updateStatus(id, status, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'summary'] });
    },
  });
}

export function useResolveComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolution }: { id: number; resolution: string }) =>
      complaintApi.resolveComplaint(id, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'summary'] });
    },
  });
}

// Inquiry Hooks
export function useInquiries(filters?: Record<string, any>) {
  return useQuery({
    queryKey: ['inquiries', filters],
    queryFn: () => inquiryApi.getInquiries(filters),
  });
}

export function useMyInquiries() {
  return useQuery({
    queryKey: ['inquiries', 'my'],
    queryFn: inquiryApi.getMyInquiries,
  });
}

export function useInquiry(id: number | null) {
  return useQuery({
    queryKey: ['inquiries', id],
    queryFn: () => (id ? inquiryApi.getInquiry(id) : null),
    enabled: !!id,
  });
}

export function useCreateInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: inquiryApi.createInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'summary'] });
    },
  });
}

export function useReplyInquiry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, response }: { id: number; response: string }) =>
      inquiryApi.replyInquiry(id, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'summary'] });
    },
  });
}

// Consolidated Support Summary Hook
export function useSupportSummary() {
  return useQuery({
    queryKey: ['support', 'summary'],
    queryFn: supportApi.getSummary,
  });
}
