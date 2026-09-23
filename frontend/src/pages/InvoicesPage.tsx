import React, { useState } from 'react';
import {
  FileText, Download, Printer, CheckCircle2, CreditCard,
  Building, Calendar, User, Search
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useDatabase } from '../context/DatabaseContext';

export const InvoicesPage: React.FC = () => {
  const { invoices, payInvoice } = useDatabase();
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.booking_number?.toLowerCase().includes(search.toLowerCase())
  );

  const handlePay = async (invoiceId: number, amount: number) => {
    await payInvoice(invoiceId, 1, amount);
    if (selectedInvoice && selectedInvoice.id === invoiceId) {
      setSelectedInvoice((prev: any) => prev ? { ...prev, status: 'Paid' } : null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Billing & GST Invoices</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Itemized hotel folios, statutory GST compliance, and payment settlement records.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-[#111827] p-3 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm max-w-md">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="Search by invoice # or guest name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Invoice No</th>
                <th className="py-3.5 px-4 font-semibold">Booking ID</th>
                <th className="py-3.5 px-4 font-semibold">Guest</th>
                <th className="py-3.5 px-4 font-semibold">Date</th>
                <th className="py-3.5 px-4 font-semibold">Subtotal</th>
                <th className="py-3.5 px-4 font-semibold">GST (18%)</th>
                <th className="py-3.5 px-4 font-semibold">Grand Total</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs">{inv.booking_number}</td>
                  <td className="py-3.5 px-4 font-medium">{inv.customer_name || 'Guest'}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">{inv.issue_date?.slice(0, 10)}</td>
                  <td className="py-3.5 px-4">₹{Number(inv.subtotal).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-slate-400">₹{Number(inv.tax_amount).toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                    ₹{Number(inv.grand_total).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={inv.status.toLowerCase()} dot>{inv.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(inv)}>
                      View Folio
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Official GST Tax Invoice"
        subtitle={`Invoice Ref: ${selectedInvoice?.invoice_number}`}
        maxWidth="2xl"
      >
        {selectedInvoice && (
          <div className="space-y-6 text-sm">
            {/* Invoice Header */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row justify-between gap-6">
              <div>
                <span className="font-black text-xl text-blue-600 tracking-tight">StayHive Luxury Hotels</span>
                <p className="text-xs text-slate-500 mt-1">{selectedInvoice.hotel_name || 'StayHive Grand Ahmedabad'}</p>
                <p className="text-xs text-slate-400">{selectedInvoice.hotel_address || 'Sindhu Bhavan Marg, Ahmedabad, Gujarat'}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">GSTIN: 24AABCS1429B1Z8</p>
              </div>
              <div className="sm:text-right space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Billed To</span>
                <div className="font-bold text-slate-900 dark:text-white">{selectedInvoice.customer_name}</div>
                <div className="text-xs text-slate-400">{selectedInvoice.customer_email || 'guest@example.com'}</div>
                <div className="text-xs text-slate-400">{selectedInvoice.customer_phone || '+91 98220 11223'}</div>
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
                    <td className="py-2.5 px-4">Room & Accommodation Charges</td>
                    <td className="py-2.5 px-4 text-right font-medium">₹{Number(selectedInvoice.room_charges).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4">Food & In-Room Dining</td>
                    <td className="py-2.5 px-4 text-right font-medium">₹{Number(selectedInvoice.food_charges || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4">Wellness & Hotel Services</td>
                    <td className="py-2.5 px-4 text-right font-medium">₹{Number(selectedInvoice.service_charges || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/40">
                    <td className="py-2.5 px-4 font-bold">Subtotal</td>
                    <td className="py-2.5 px-4 text-right font-bold">₹{Number(selectedInvoice.subtotal).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-500">CGST (9%)</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">₹{(Number(selectedInvoice.tax_amount) / 2).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 text-slate-500">SGST (9%)</td>
                    <td className="py-2.5 px-4 text-right text-slate-500">₹{(Number(selectedInvoice.tax_amount) / 2).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-blue-50/60 dark:bg-blue-950/40 font-extrabold text-sm text-slate-900 dark:text-white">
                    <td className="py-3 px-4">Total Amount Payable</td>
                    <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">
                      ₹{Number(selectedInvoice.grand_total).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

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

              {selectedInvoice.status !== 'Paid' ? (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handlePay(selectedInvoice.id, selectedInvoice.grand_total)}
                >
                  <CreditCard className="w-4 h-4 mr-1.5" /> Record Settlement (₹{Number(selectedInvoice.grand_total).toLocaleString('en-IN')})
                </Button>
              ) : (
                <Badge variant="paid" size="md">Payment Settled</Badge>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
