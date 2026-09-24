import React, { useState } from 'react';
import {
  FileText, Download, Printer, CheckCircle2, CreditCard,
  Building, Calendar, User, Search, DollarSign, ArrowUpRight,
  Receipt, ShieldCheck, Clock, RefreshCw, AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import {
  useInvoices, useMyInvoices, useInvoice, usePaymentMethods,
  useCreatePayment, useBillingStats, InvoiceItem
} from '../hooks/useBilling';

export const InvoicesPage: React.FC = () => {
  const { role } = useAuth();
  const isCustomer = role === 'CUSTOMER';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<InvoiceItem | null>(null);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethodId, setPayMethodId] = useState<number>(1);
  const [txnRef, setTxnRef] = useState<string>('');

  // Queries
  const { data: allInvoices = [], isLoading: isLoadingAll, refetch: refetchAll } = useInvoices(
    !isCustomer ? { search: search || undefined } : undefined
  );
  const { data: myInvoices = [], isLoading: isLoadingMy, refetch: refetchMy } = useMyInvoices();
  const { data: billingStats } = useBillingStats();
  const { data: paymentMethods = [] } = usePaymentMethods();
  const { data: activeInvoiceDetail } = useInvoice(selectedInvoiceId);

  const createPaymentMutation = useCreatePayment();

  const invoices = isCustomer ? myInvoices : allInvoices;
  const isLoading = isCustomer ? isLoadingMy : isLoadingAll;

  // Status Filter
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.booking_number?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    return inv.status.toLowerCase().replace(/\s+/g, '_') === statusFilter.toLowerCase();
  });

  const handleOpenPayModal = (inv: InvoiceItem) => {
    setPayModalInvoice(inv);
    setPayAmount(String(inv.outstanding_balance || inv.grand_total));
    setPayMethodId(paymentMethods[0]?.id || 1);
    setTxnRef('');
  };

  const handleExecutePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice) return;

    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) return;

    await createPaymentMutation.mutateAsync({
      invoice_id: payModalInvoice.id,
      payment_method_id: payMethodId,
      amount: amt,
      transaction_id: txnRef.trim() || undefined,
    });

    setPayModalInvoice(null);
    if (!isCustomer) refetchAll();
    else refetchMy();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadgeVariant = (statusStr: string) => {
    const s = statusStr.toLowerCase();
    if (s.includes('paid') && !s.includes('partially') && !s.includes('unpaid')) return 'paid';
    if (s.includes('partially paid') || s.includes('partial')) return 'pending';
    if (s.includes('refunded')) return 'cancelled';
    if (s.includes('unpaid')) return 'unpaid';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isCustomer ? 'My Invoices & Folios' : 'Billing & GST Invoices'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isCustomer
              ? 'Review itemized accommodation charges, dining orders, and payment receipts.'
              : 'Itemized hotel folios, statutory GST compliance, and payment settlement records.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (!isCustomer ? refetchAll() : refetchMy())}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Staff KPI Metrics Dashboard */}
      {!isCustomer && billingStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Invoices</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {billingStats.invoices_today}
            </div>
            <div className="text-xs text-slate-500 mt-1">{billingStats.total_invoices} total generated</div>
          </Card>

          <Card className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Collected Today</span>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              ₹{billingStats.collected_today.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-600/80 mt-1">₹{billingStats.total_collected.toLocaleString('en-IN')} total revenue</div>
          </Card>

          <Card className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total Outstanding</span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
              ₹{billingStats.total_outstanding.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-amber-600/80 mt-1">
              {billingStats.status_counts.partially_paid} partial • {billingStats.status_counts.unpaid} unpaid
            </div>
          </Card>

          <Card className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Total Refunds</span>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
              ₹{billingStats.total_refunds.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-purple-600/80 mt-1">{billingStats.status_counts.refunded} settled cancellations</div>
          </Card>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white dark:bg-[#111827] p-2.5 px-3 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Search by invoice #, booking or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'partially_paid', label: 'Partially Paid' },
            { id: 'paid', label: 'Paid' },
            { id: 'refunded', label: 'Refunded' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all ${
                statusFilter === pill.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Invoice No</th>
                <th className="py-3.5 px-4 font-semibold">Booking ID</th>
                <th className="py-3.5 px-4 font-semibold">Guest</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Grand Total</th>
                <th className="py-3.5 px-4 font-semibold">Paid</th>
                <th className="py-3.5 px-4 font-semibold">Outstanding</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const outstandingNum = Number(inv.outstanding_balance ?? inv.grand_total);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {inv.invoice_number}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{inv.booking_number}</td>
                      <td className="py-3.5 px-4 font-medium">{inv.customer_name || 'Guest'}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">{inv.issue_date?.slice(0, 10)}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        ₹{Number(inv.grand_total).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        ₹{Number(inv.paid_amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-amber-600 dark:text-amber-400">
                        ₹{outstandingNum.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(inv.status)} dot>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedInvoiceId(inv.id)}
                          >
                            View Folio
                          </Button>
                          {outstandingNum > 0 && inv.status !== 'Refunded' && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleOpenPayModal(inv)}
                            >
                              <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Printable Folio Modal */}
      <Modal
        isOpen={!!selectedInvoiceId}
        onClose={() => setSelectedInvoiceId(null)}
        title="Official GST Tax Invoice & Folio"
        subtitle={`Invoice Ref: ${activeInvoiceDetail?.invoice_number || ''}`}
        maxWidth="3xl"
      >
        {activeInvoiceDetail && (
          <div className="space-y-6 text-sm">
            {/* Invoice Header */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <span className="font-black text-xl text-blue-600 tracking-tight">StayHive Luxury Hotels</span>
                <p className="text-xs text-slate-500 mt-1">{activeInvoiceDetail.hotel_name || 'StayHive Grand Ahmedabad'}</p>
                <p className="text-xs text-slate-400">{activeInvoiceDetail.hotel_address || 'Sindhu Bhavan Marg, Ahmedabad, Gujarat'}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">GSTIN: 24AABCS1429B1Z8</p>
              </div>
              <div className="sm:text-right space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Billed To</span>
                <div className="font-bold text-slate-900 dark:text-white">{activeInvoiceDetail.customer_name}</div>
                <div className="text-xs text-slate-400">{activeInvoiceDetail.customer_email || 'guest@example.com'}</div>
                <div className="text-xs text-slate-400">{activeInvoiceDetail.customer_phone || '+91 98220 11223'}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Stay: {activeInvoiceDetail.check_in_date} to {activeInvoiceDetail.check_out_date} ({activeInvoiceDetail.number_of_nights} Nights)
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Item & Description</th>
                    <th className="py-2.5 px-4 text-right">Charges (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  <tr>
                    <td className="py-2.5 px-4">Room & Accommodation Charges ({activeInvoiceDetail.number_of_nights} Nights)</td>
                    <td className="py-2.5 px-4 text-right font-medium">₹{Number(activeInvoiceDetail.room_charges).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4">Food & In-Room Dining</td>
                    <td className="py-2.5 px-4 text-right font-medium">₹{Number(activeInvoiceDetail.food_charges || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4">Wellness & Hotel Services</td>
                    <td className="py-2.5 px-4 text-right font-medium">₹{Number(activeInvoiceDetail.service_charges || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/40">
                    <td className="py-2.5 px-4 font-bold">Subtotal</td>
                    <td className="py-2.5 px-4 text-right font-bold">₹{Number(activeInvoiceDetail.subtotal).toLocaleString('en-IN')}</td>
                  </tr>
                  {Number(activeInvoiceDetail.discount_amount) > 0 && (
                    <tr className="text-emerald-600 dark:text-emerald-400">
                      <td className="py-2.5 px-4 font-medium">Applied Promotional Discount</td>
                      <td className="py-2.5 px-4 text-right font-medium">- ₹{Number(activeInvoiceDetail.discount_amount).toLocaleString('en-IN')}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-2.5 px-4 text-slate-500">CGST (9%)</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">₹{(Number(activeInvoiceDetail.tax_amount) / 2).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-500">SGST (9%)</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">₹{(Number(activeInvoiceDetail.tax_amount) / 2).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-blue-50/60 dark:bg-blue-950/40 font-extrabold text-sm text-slate-900 dark:text-white">
                    <td className="py-3 px-4">Total Amount Payable</td>
                    <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                      ₹{Number(activeInvoiceDetail.grand_total).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 font-semibold text-xs">
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">Amount Paid</td>
                    <td className="py-2.5 px-4 text-right text-emerald-600 dark:text-emerald-400">
                      ₹{Number(activeInvoiceDetail.paid_amount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-bold text-xs text-amber-900 dark:text-amber-200">
                    <td className="py-2.5 px-4">Outstanding Balance</td>
                    <td className="py-2.5 px-4 text-right text-amber-600 dark:text-amber-400 font-mono">
                      ₹{Number(activeInvoiceDetail.outstanding_balance || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment History inside Folio */}
            {activeInvoiceDetail.payments && activeInvoiceDetail.payments.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Settlement Transactions</span>
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Txn Reference</th>
                        <th className="py-2 px-3">Method</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {activeInvoiceDetail.payments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 px-3 font-mono">{p.transaction_id}</td>
                          <td className="py-2 px-3">{p.method_name || 'UPI'}</td>
                          <td className="py-2 px-3 text-slate-400">{p.payment_date?.slice(0, 16).replace('T', ' ')}</td>
                          <td className="py-2 px-3 text-right font-medium">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-1.5" /> Print Folio
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Download className="w-4 h-4 mr-1.5" /> Download PDF
                </Button>
              </div>

              {Number(activeInvoiceDetail.outstanding_balance) > 0 && activeInvoiceDetail.status !== 'Refunded' ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    setSelectedInvoiceId(null);
                    handleOpenPayModal(activeInvoiceDetail);
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-1.5" /> Settle Balance (₹{Number(activeInvoiceDetail.outstanding_balance).toLocaleString('en-IN')})
                </Button>
              ) : (
                <Badge variant={getStatusBadgeVariant(activeInvoiceDetail.status)} size="md">
                  {activeInvoiceDetail.status}
                </Badge>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Settlement Modal */}
      <Modal
        isOpen={!!payModalInvoice}
        onClose={() => setPayModalInvoice(null)}
        title="Record Payment Settlement"
        subtitle={`Invoice: ${payModalInvoice?.invoice_number || ''}`}
        maxWidth="md"
      >
        {payModalInvoice && (
          <form onSubmit={handleExecutePayment} className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total Invoice Amount:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{Number(payModalInvoice.grand_total).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                <span>Already Settled:</span>
                <span className="font-semibold">
                  ₹{Number(payModalInvoice.paid_amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-200 dark:border-white/10">
                <span>Remaining Outstanding:</span>
                <span className="font-mono">
                  ₹{Number(payModalInvoice.outstanding_balance || payModalInvoice.grand_total).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={Number(payModalInvoice.outstanding_balance || payModalInvoice.grand_total)}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter full or partial amount up to current outstanding.
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method *
              </label>
              <select
                value={payMethodId}
                onChange={(e) => setPayMethodId(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Transaction Reference / ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. TXN-UPI-98472918"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPayModalInvoice(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="success"
                isLoading={createPaymentMutation.isPending}
              >
                Confirm Payment (₹{Number(payAmount || 0).toLocaleString('en-IN')})
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
