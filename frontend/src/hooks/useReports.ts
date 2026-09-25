import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';

export type ReportType =
  | 'bookings'
  | 'revenue'
  | 'occupancy'
  | 'food'
  | 'services'
  | 'housekeeping'
  | 'customers'
  | 'support';

export interface ReportFilterParams {
  period?: 'today' | 'this_week' | 'this_month' | 'this_year' | 'all';
  date_from?: string;
  date_to?: string;
  hotel_id?: number | string;
}

export interface ReportResponse {
  report_name: string;
  generated_at: string;
  filters_applied?: Record<string, any>;
  summary: Record<string, any>;
  rows: Record<string, any>[];
  total_records?: number;
}

export const reportApi = {
  getReport: async (type: ReportType, params?: ReportFilterParams): Promise<ReportResponse> => {
    const res = await apiClient.get(`/reports/${type}/`, { params });
    return res.data?.data || res.data;
  },

  downloadReportCsv: async (type: ReportType, params?: ReportFilterParams, filename?: string) => {
    const res = await apiClient.get(`/reports/${type}/`, {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `stayhive_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export const useReportData = (type: ReportType, params?: ReportFilterParams) => {
  return useQuery({
    queryKey: ['report', type, params],
    queryFn: () => reportApi.getReport(type, params),
    staleTime: 1000 * 60 * 3,
  });
};
