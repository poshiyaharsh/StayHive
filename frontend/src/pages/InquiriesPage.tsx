import React, { useState } from 'react';
import {
  HelpCircle, Mail, Phone, Send, CheckCircle2, User, Clock,
  Plus, Search, Filter, Loader2, Sparkles, MessageSquare
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import {
  useInquiries,
  useMyInquiries,
  useCreateInquiry,
  useReplyInquiry,
  InquiryItem
} from '../hooks/useSupport';

export const InquiriesPage: React.FC = () => {
  const { user, role } = useAuth();
  const isCustomer = role === 'CUSTOMER';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Submit Inquiry Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [name, setName] = useState(user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  // TanStack Query Hooks
  const { data: allInquiries = [], isLoading: isAllLoading } = useInquiries({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });
  const { data: myInquiries = [], isLoading: isMyLoading } = useMyInquiries();

  const createInquiryMutation = useCreateInquiry();
  const replyInquiryMutation = useReplyInquiry();

  const inquiries: InquiryItem[] = isCustomer ? myInquiries : allInquiries;
  const isLoading = isCustomer ? isMyLoading : isAllLoading;

  // Selected Inquiry
  const selectedInquiry =
    inquiries.find((i) => i.id === selectedInquiryId) || inquiries[0] || null;

  const handleReply = async () => {
    if (!replyText.trim() || !selectedInquiry) return;
    try {
      await replyInquiryMutation.mutateAsync({
        id: selectedInquiry.id,
        response: replyText.trim(),
      });
      setReplyText('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send response');
    }
  };

  const handleCreateSubmit = async () => {
    if (!name.trim()) {
      setSubmitError('Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setSubmitError('Please provide a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setSubmitError('Subject is required.');
      return;
    }
    if (!message.trim()) {
      setSubmitError('Message is required.');
      return;
    }
    setSubmitError('');
    try {
      await createInquiryMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      setIsSubmitModalOpen(false);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to submit inquiry.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isCustomer ? 'Concierge & Event Inquiries' : 'Customer Inquiries Helpdesk'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isCustomer
              ? 'Send direct inquiries for corporate retreats, private dining, airport chauffeur, and bespoke experiences.'
              : 'Modern 2-pane helpdesk inbox for corporate event queries, banquet requests, and concierge questions.'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Submit New Inquiry
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'new', 'responded', 'closed'].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="capitalize"
            >
              {st}
            </Button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* 2-Pane Helpdesk Layout */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-slate-500 mt-2">Loading inquiries inbox...</p>
        </Card>
      ) : inquiries.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 text-sm">
          No inquiries found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Inquiry List */}
          <Card className="lg:col-span-5 p-2 divide-y divide-slate-100 dark:divide-white/5 max-h-[650px] overflow-y-auto">
            {inquiries.map((inq) => {
              const isSelected = selectedInquiry?.id === inq.id;
              const isNew = inq.status === 'New' || inq.status === 'Pending';

              return (
                <button
                  key={inq.id}
                  onClick={() => setSelectedInquiryId(inq.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {inq.customer_name || inq.name}
                    </span>
                    <Badge variant={isNew ? 'pending' : 'completed'} size="sm">
                      {inq.status}
                    </Badge>
                  </div>

                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                    {inq.subject}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{inq.message}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span>{inq.created_at?.slice(0, 16)}</span>
                    {inq.customer_id ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Verified Member</span>
                    ) : (
                      <span className="text-slate-400 italic">Public Guest</span>
                    )}
                  </div>
                </button>
              );
            })}
          </Card>

          {/* Right Pane: Selected Inquiry Conversation Thread */}
          <Card className="lg:col-span-7 p-6 space-y-6">
            {selectedInquiry ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedInquiry.subject}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5" /> {selectedInquiry.customer_name || selectedInquiry.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {selectedInquiry.email}
                      </span>
                      {selectedInquiry.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {selectedInquiry.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={selectedInquiry.status === 'New' || selectedInquiry.status === 'Pending' ? 'pending' : 'completed'}>
                    {selectedInquiry.status}
                  </Badge>
                </div>

                {/* Inquiry Message Body */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  "{selectedInquiry.message}"
                </div>

                {/* Response Thread if Responded */}
                {selectedInquiry.response && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Official Management Response
                      </span>
                      {selectedInquiry.responded_at && (
                        <span className="font-normal text-[10px] text-emerald-700 dark:text-emerald-400">
                          {selectedInquiry.responded_at.slice(0, 16)}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-200 mt-1">
                      {selectedInquiry.response}
                    </p>
                    {selectedInquiry.assigned_name && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                        Dispatched By: {selectedInquiry.assigned_name}
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Reply Box (Only for Staff / Admins) */}
                {!isCustomer && (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Draft Response to Guest
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Type official reply (will be dispatched to guest's email and saved to file)..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        onClick={handleReply}
                        isLoading={replyInquiryMutation.isPending}
                      >
                        <Send className="w-4 h-4 mr-1.5" /> Send Official Response
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 text-sm">
                Select an inquiry to view details.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Submit Inquiry Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Concierge Inquiry"
        subtitle="Our team is dedicated to curating bespoke hotel, event, and dining experiences."
        maxWidth="md"
      >
        <div className="space-y-4">
          {submitError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Your Full Name
              </label>
              <Input
                placeholder="Rahul Shah"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Contact Phone (Optional)
            </label>
            <Input
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Subject
            </label>
            <Input
              placeholder="e.g. Wedding banquet packages, Airport luxury transfer..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Inquiry Details & Questions
            </label>
            <textarea
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Please provide dates, number of guests, or special requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              isLoading={createInquiryMutation.isPending}
            >
              Submit Inquiry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
