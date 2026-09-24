import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useNotification } from '../context/NotificationContext';

export interface PaymentItem {
  id: number;
  invoice_id: number;
  invoice_number?: string;
  booking_id?: number;
  booking_number?: string;
  customer_name?: string;
  payment_method_id: number;
  method_name: string;
  transaction_id: string;
  amount: string | number;
  status: string;
  payment_date: string;
}

export interface PaymentMethodItem {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface InvoiceItem {
  id: number;
  invoice_number: string;
  booking_id: number;
  booking_number: string;
  issue_date: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  hotel_name?: string;
  hotel_address?: string;
  hotel_city?: string;
  hotel_contact?: string;
  check_in_date?: string;
  check_out_date?: string;
  number_of_nights: number;
  room_charges: string | number;
  food_charges: string | number;
  service_charges: string | number;
  subtotal: string | number;
  discount_amount: string | number;
  tax_amount: string | number;
  grand_total: string | number;
  status: string;
  paid_amount: string | number;
  outstanding_balance: string | number;
  payments: PaymentItem[];
}

export interface RefundItem {
  id: number;
  cancellation_id: number;
  booking_id?: number;
  booking_number?: string;
  customer_name?: string;
  payment_id: number;
  transaction_id?: string;
  amount: string | number;
  status: string;
  processed_by?: number | null;
  staff_name?: string | null;
  processed_at: string;
  bank_reference?: string;
}

export interface CancellationItem {
  id: number;
  booking_id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  staff_id?: number | null;
  staff_name?: string | null;
  reason: string;
  requested_at: string;
  refund_applicable: boolean;
  refund_amount: string | number;
  status: string;
  refunds: RefundItem[];
}

export interface BillingStats {
  invoices_today: number;
  total_invoices: number;
  collected_today: number;
  total_collected: number;
  total_outstanding: number;
  total_refunds: number;
  status_counts: {
    paid: number;
    partially_paid: number;
    unpaid: number;
    refunded: number;
    partially_refunded: number;
  };
}

export interface InvoiceFilters {
  status?: string;
  search?: string;
  booking_id?: number;
  customer_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface CreatePaymentPayload {
  invoice_id: number;
  payment_method_id: number;
  amount: number | string;
  transaction_id?: string;
}

// -------------------------------------------------------------
// INVOICE HOOKS
// -------------------------------------------------------------

export const useInvoices = (filters?: InvoiceFilters) => {
  return useQuery<InvoiceItem[]>({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.booking_id) params.append('booking_id', String(filters.booking_id));
      if (filters?.customer_id) params.append('customer_id', String(filters.customer_id));
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const res = await apiClient.get(`/invoices/?${params.toString()}`);
      return res.data?.data || [];
    },
    staleTime: 30000,
  });
};

export const useInvoice = (id: number | null | undefined) => {
  return useQuery<InvoiceItem>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      if (!id) throw new Error('Invoice ID required');
      const res = await apiClient.get(`/invoices/${id}/`);
      return res.data?.data;
    },
    enabled: !!id,
  });
};

export const useMyInvoices = () => {
  return useQuery<InvoiceItem[]>({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const res = await apiClient.get('/invoices/my/');
      return res.data?.data || [];
    },
    staleTime: 30000,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: { booking_id: number; force_recalculate?: boolean }) => {
      const res = await apiClient.post('/invoices/', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      showToast(`Invoice #${data.invoice_number} created.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to create invoice.', 'error');
    },
  });
};

export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const res = await apiClient.post(`/invoices/${invoiceId}/generate/`);
      return res.data?.data;
    },
    onSuccess: (data) => {
      showToast(`Invoice #${data.invoice_number} recalculated.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to recalculate invoice.', 'error');
    },
  });
};

// -------------------------------------------------------------
// PAYMENT HOOKS
// -------------------------------------------------------------

export const usePaymentMethods = () => {
  return useQuery<PaymentMethodItem[]>({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const res = await apiClient.get('/payment-methods/');
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePayments = (invoiceId?: number) => {
  return useQuery<PaymentItem[]>({
    queryKey: ['payments', invoiceId],
    queryFn: async () => {
      const url = invoiceId ? `/payments/?invoice_id=${invoiceId}` : '/payments/';
      const res = await apiClient.get(url);
      return res.data?.data || [];
    },
    staleTime: 30000,
  });
};

export const useInvoicePayments = (invoiceId: number | null | undefined) => {
  return useQuery<PaymentItem[]>({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];
      const res = await apiClient.get(`/invoices/${invoiceId}/payments/`);
      return res.data?.data || [];
    },
    enabled: !!invoiceId,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: CreatePaymentPayload) => {
      const res = await apiClient.post('/payments/', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      showToast(`Payment of ₹${Number(data.amount).toLocaleString('en-IN')} recorded successfully.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', data.invoice_id] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Payment processing failed.', 'error');
    },
  });
};

// -------------------------------------------------------------
// CANCELLATION & REFUND HOOKS
// -------------------------------------------------------------

export const useCancellationRequests = (status?: string) => {
  return useQuery<CancellationItem[]>({
    queryKey: ['cancellations', status],
    queryFn: async () => {
      const url = status ? `/cancellation-requests/?status=${status}` : '/cancellation-requests/';
      const res = await apiClient.get(url);
      return res.data?.data || [];
    },
    staleTime: 30000,
  });
};

export const useCreateCancellationRequest = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: { booking_id: number; reason: string }) => {
      const res = await apiClient.post('/cancellation-requests/', payload);
      return res.data?.data;
    },
    onSuccess: () => {
      showToast('Cancellation request submitted for review.', 'success');
      queryClient.invalidateQueries({ queryKey: ['cancellations'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to submit cancellation.', 'error');
    },
  });
};

export const useProcessCancellation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'approve' | 'reject' }) => {
      const res = await apiClient.post(`/cancellation-requests/${id}/${action}/`);
      return res.data?.data;
    },
    onSuccess: (_, vars) => {
      showToast(`Cancellation request ${vars.action === 'approve' ? 'approved' : 'rejected'}.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['cancellations'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to process cancellation.', 'error');
    },
  });
};

export const useRefunds = () => {
  return useQuery<RefundItem[]>({
    queryKey: ['refunds'],
    queryFn: async () => {
      const res = await apiClient.get('/refunds/');
      return res.data?.data || [];
    },
    staleTime: 30000,
  });
};

export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: { cancellation_id: number; payment_id?: number; amount?: number; reason?: string }) => {
      const res = await apiClient.post('/refunds/', payload);
      return res.data?.data;
    },
    onSuccess: (data) => {
      showToast(`Refund of ₹${Number(data.amount).toLocaleString('en-IN')} issued successfully.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['cancellations'] });
      queryClient.invalidateQueries({ queryKey: ['billing-stats'] });
    },
    onError: (err: any) => {
      showToast(err?.response?.data?.message || 'Failed to process refund.', 'error');
    },
  });
};

// -------------------------------------------------------------
// BILLING DASHBOARD STATS
// -------------------------------------------------------------

export const useBillingStats = () => {
  return useQuery<BillingStats>({
    queryKey: ['billing-stats'],
    queryFn: async () => {
      const res = await apiClient.get('/invoices/stats/');
      return res.data?.data;
    },
    staleTime: 30000,
  });
};
