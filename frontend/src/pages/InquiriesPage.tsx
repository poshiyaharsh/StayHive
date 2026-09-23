import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, Send, CheckCircle2, User, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useDatabase } from '../context/DatabaseContext';

export const InquiriesPage: React.FC = () => {
  const { inquiries, replyInquiry } = useDatabase();
  const [selectedInquiryId, setSelectedInquiryId] = useState<number>(inquiries[0]?.id || 1);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const selectedInquiry = inquiries.find(i => i.id === selectedInquiryId) || inquiries[0];

  const handleReply = async () => {
    if (!replyText.trim() || !selectedInquiry) return;
    setIsSending(true);
    await replyInquiry(selectedInquiry.id, replyText);
    setIsSending(false);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Inquiries Helpdesk</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Modern 2-pane helpdesk inbox for corporate event queries, banquet requests, and concierge questions.
        </p>
      </div>

      {/* 2-Pane Helpdesk Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Inquiry List */}
        <Card className="lg:col-span-5 p-2 divide-y divide-slate-100 dark:divide-white/5 max-h-[600px] overflow-y-auto">
          {inquiries.map((inq) => {
            const isSelected = selectedInquiry?.id === inq.id;
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
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{inq.customer_name}</span>
                  <Badge variant={inq.status === 'New' ? 'pending' : 'completed'} size="sm">
                    {inq.status}
                  </Badge>
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                  {inq.subject}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{inq.message}</p>
                <div className="text-[10px] text-slate-400 mt-2">{inq.created_at?.slice(0, 16)}</div>
              </button>
            );
          })}
        </Card>

        {/* Right Pane: Selected Inquiry Conversation */}
        <Card className="lg:col-span-7 p-6 space-y-6">
          {selectedInquiry ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{selectedInquiry.subject}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedInquiry.customer_name}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {selectedInquiry.email}</span>
                    {selectedInquiry.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedInquiry.phone}</span>}
                  </div>
                </div>
                <Badge variant={selectedInquiry.status === 'New' ? 'pending' : 'completed'}>
                  {selectedInquiry.status}
                </Badge>
              </div>

              {/* Inquiry Message Body */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                "{selectedInquiry.message}"
              </div>

              {/* Response thread if already responded */}
              {selectedInquiry.response && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm space-y-1">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Staff Response:</div>
                  <p className="text-emerald-800 dark:text-emerald-200">{selectedInquiry.response}</p>
                </div>
              )}

              {/* Reply Box */}
              <div className="space-y-3 pt-2">
                <Input
                  label="Draft Response to Guest"
                  placeholder="Type official reply (will be dispatched to guest's email)..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button variant="primary" onClick={handleReply} isLoading={isSending}>
                    <Send className="w-4 h-4 mr-1.5" /> Send Official Response
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm">Select an inquiry to view details.</div>
          )}
        </Card>
      </div>
    </div>
  );
};
