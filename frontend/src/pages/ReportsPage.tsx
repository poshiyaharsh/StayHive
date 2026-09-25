import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, Calendar, Filter, RefreshCw, Sparkles,
  TrendingUp, DollarSign, BedDouble, Utensils, Users, AlertOctagon,
  CheckCircle2, Search, ArrowUpRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useReportData, reportApi, ReportType, ReportFilterParams } from '../hooks/useReports';

interface ReportTab {
  id: ReportType;
  label: string;
  icon: React.ElementType;
  description: string;
}

export const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('bookings');
  const [period, setPeriod] = useState<'today' | 'this_week' | 'this_month' | 'this_year' | 'all'>('this_month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const reportTabs: ReportTab[] = [
    { id: 'bookings', label: 'Bookings', icon: Calendar, description: 'Reservations, guests, nights & statuses' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, description: 'Invoices, payments, refunds & net revenue' },
    { id: 'occupancy', label: 'Occupancy', icon: BedDouble, description: 'Room statuses, cleanliness & floor rates' },
    { id: 'food', label: 'Dining & KDS', icon: Utensils, description: 'Restaurant orders, items & meal collections' },
    { id: 'services', label: 'Services', icon: Sparkles, description: 'Guest service requests & fulfillment metrics' },
    { id: 'housekeeping', label: 'Housekeeping', icon: CheckCircle2, description: 'Cleaning queue, staff roster & task audits' },
    { id: 'customers', label: 'Customers', icon: Users, description: 'Guest profiles, booking counts & lifetime spend' },
    { id: 'support', label: 'Support SLA', icon: AlertOctagon, description: 'Complaints, guest feedback & inquiry responses' },
  ];

  const filterParams: ReportFilterParams = {
    period: dateFrom || dateTo ? undefined : period,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  };

  const { data, isLoading, refetch } = useReportData(activeReport, filterParams);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await reportApi.downloadReportCsv(activeReport, filterParams);
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const summary = data?.summary || {};
  const rows = data?.rows || [];

  // Filter rows by search term
  const filteredRows = rows.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some(
      (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term)
    );
  });

  const getColumns = () => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]);
  };

  const formatHeader = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatCellValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (key.includes('amount') || key.includes('revenue') || key.includes('price') || key.includes('collected') || key.includes('refunded')) {
      if (typeof value === 'number') {
        return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" /> Operational Intelligence & Audit Logs
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hotel Analytics & Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative operational summaries, live revenue calculations, and RFC-4180 CSV export streams.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCsv}
            disabled={isLoading || isExporting}
          >
            <Download className={`w-3.5 h-3.5 mr-1.5 ${isExporting ? 'animate-bounce' : ''}`} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {reportTabs.map((tab) => {
          const isSelected = activeReport === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-white/10 hover:border-blue-400 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              <div>
                <div className="text-xs font-bold leading-tight">{tab.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Date & Search Filter Bar */}
      <Card className="p-4 bg-slate-50/60 dark:bg-slate-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Period:
            </span>
            {(['today', 'this_week', 'this_month', 'this_year', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setDateFrom('');
                  setDateTo('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  period === p && !dateFrom && !dateTo
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Custom Date Range & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              />
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      {Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(summary).map(([key, val]) => (
            <Card key={key} className="p-3.5 bg-white dark:bg-slate-900">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {formatHeader(key)}
              </div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCellValue(key, val)}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table Data View */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">Querying authoritative hotel database...</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">
              No matching records for the selected date window or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-sm text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-white/10 z-10">
                <tr>
                  {getColumns().map((col) => (
                    <th key={col} className="px-4 py-3 whitespace-nowrap">
                      {formatHeader(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {getColumns().map((col) => (
                      <td key={col} className="px-4 py-3 whitespace-nowrap">
                        {formatCellValue(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
