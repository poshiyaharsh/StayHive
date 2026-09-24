import React, { useState } from 'react';
import {
  AlertOctagon, CheckCircle2, Clock, User, ShieldAlert, Plus, Search,
  Filter, Loader2, ArrowRight, Check, X, ShieldCheck
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useDatabase } from '../context/DatabaseContext';
import {
  useComplaints,
  useMyComplaints,
  useCreateComplaint,
  useUpdateComplaintStatus,
  useResolveComplaint,
  ComplaintItem
} from '../hooks/useSupport';

export const ComplaintsPage: React.FC = () => {
  const { user, role } = useAuth();
  const { bookings } = useDatabase();
  const isCustomer = role === 'CUSTOMER';

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve Ticket Modal
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Create Complaint Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Maintenance');
  const [priority, setPriority] = useState('Medium');
  const [bookingId, setBookingId] = useState<number | ''>('');
  const [createError, setCreateError] = useState('');

  // TanStack Query Hooks
  const { data: allComplaints = [], isLoading: isAllLoading } = useComplaints({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchQuery || undefined,
  });
  const { data: myComplaints = [], isLoading: isMyLoading } = useMyComplaints();

  const createComplaintMutation = useCreateComplaint();
  const updateStatusMutation = useUpdateComplaintStatus();
  const resolveComplaintMutation = useResolveComplaint();

  const complaints: ComplaintItem[] = isCustomer ? myComplaints : allComplaints;
  const isLoading = isCustomer ? isMyLoading : isAllLoading;

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    try {
      await resolveComplaintMutation.mutateAsync({
        id: selectedComplaint.id,
        resolution: resolutionNotes || 'Resolved by hotel supervisor and verified with guest.',
      });
      setSelectedComplaint(null);
      setResolutionNotes('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve complaint');
    }
  };

  const handleStartInvestigation = async (complaintId: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: complaintId,
        status: 'in_progress',
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleCloseTicket = async (complaintId: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: complaintId,
        status: 'closed',
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close ticket');
    }
  };

  const handleCreateSubmit = async () => {
    if (!subject.trim()) {
      setCreateError('Subject is required.');
      return;
    }
    if (!description.trim()) {
      setCreateError('Please describe the issue in detail.');
      return;
    }
    setCreateError('');
    try {
      await createComplaintMutation.mutateAsync({
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
        booking_id: bookingId ? Number(bookingId) : null,
      });
      setIsCreateModalOpen(false);
      setSubject('');
      setDescription('');
      setBookingId('');
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create complaint.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isCustomer ? 'My Grievances & Support Tickets' : 'Guest Grievance & SLA Resolution'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isCustomer
              ? 'Track incident resolution, communicate with concierge, and monitor real-time SLA updates.'
              : 'Track reported guest incidents, assign maintenance/front desk staff, and close SLA issues.'}
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Report Incident
        </Button>
      </div>

      {/* Filter Tabs & Search */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'pending', 'in_progress', 'resolved', 'closed'].map((st) => (
            <Button
              key={st}
              variant={statusFilter === st ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(st)}
              className="capitalize"
            >
              {st.replace('_', ' ')}
            </Button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Complaints List */}
      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-slate-500 mt-2">Loading complaints...</p>
        </Card>
      ) : complaints.length === 0 ? (
        <Card className="p-12 text-center text-slate-400 text-sm">
          No complaints found.
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const isPending = c.status === 'Pending' || c.status === 'Open';
            const isInProgress = c.status === 'In Progress';
            const isResolved = c.status === 'Resolved';
            const isClosed = c.status === 'Closed';

            return (
              <Card key={c.id} className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-base text-slate-900 dark:text-white">
                        {c.subject}
                      </span>
                      <span className="font-mono text-xs text-slate-400">#{c.id}</span>
                      <Badge variant={c.priority?.toLowerCase() || 'medium'} dot>
                        {c.priority}
                      </Badge>
                      <Badge
                        variant={
                          isResolved
                            ? 'completed'
                            : isInProgress
                            ? 'in_progress'
                            : isClosed
                            ? 'cancelled'
                            : 'pending'
                        }
                      >
                        {c.status}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-400">
                      Category: <span className="font-semibold text-slate-600 dark:text-slate-300">{c.category}</span> •{' '}
                      Guest: <span className="font-semibold text-slate-600 dark:text-slate-300">{c.customer_name}</span> •{' '}
                      Reported: {c.created_at?.slice(0, 16)}
                      {c.booking_number && <span> • Ref: {c.booking_number}</span>}
                    </div>
                  </div>

                  {/* Staff Management Action Buttons */}
                  {!isCustomer && (
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartInvestigation(c.id)}
                          isLoading={updateStatusMutation.isPending}
                        >
                          Start Investigation
                        </Button>
                      )}
                      {(isPending || isInProgress) && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setSelectedComplaint(c)}
                        >
                          Resolve Ticket
                        </Button>
                      )}
                      {isResolved && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCloseTicket(c.id)}
                          isLoading={updateStatusMutation.isPending}
                        >
                          Close Ticket
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Complaint Description */}
                {c.description && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                    "{c.description}"
                  </p>
                )}

                {/* Resolution Notes Log */}
                {(c.resolution_notes || c.resolution) && (
                  <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolution Record
                      </span>
                      {c.resolved_at && (
                        <span className="font-normal text-[10px] text-emerald-700 dark:text-emerald-400">
                          {c.resolved_at.slice(0, 16)}
                        </span>
                      )}
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                      {c.resolution_notes || c.resolution}
                    </p>
                    {c.assigned_name && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 font-medium">
                        Resolved By: {c.assigned_name}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolve Complaint Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Resolve Guest Incident"
        subtitle={`Incident #${selectedComplaint?.id}: ${selectedComplaint?.subject}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Resolution Action & Corrective Notes"
            placeholder="e.g. Dispatched technician to adjust AC and offered complimentary breakfast beverage..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSelectedComplaint(null)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleResolve}
              isLoading={resolveComplaintMutation.isPending}
            >
              Mark as Resolved
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Complaint Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Report Incident / Grievance"
        subtitle="Our duty manager and service team are immediately dispatched to resolve in-stay issues."
        maxWidth="md"
      >
        <div className="space-y-4">
          {createError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Subject / Issue Title
            </label>
            <Input
              placeholder="e.g. Room AC cooling issue, Shower water pressure..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Category
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Amenities">Amenities</option>
                <option value="Noise Disturbance">Noise Disturbance</option>
                <option value="Dining">In-Room Dining</option>
                <option value="Billing">Billing & Reception</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Priority
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {bookings.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Associated Booking (Optional)
              </label>
              <select
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- No specific reservation --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.booking_number} ({b.hotel_name || 'StayHive'}) - {b.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Incident Description & Location Details
            </label>
            <textarea
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe what happened, your room number, and how our team can best assist you..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              isLoading={createComplaintMutation.isPending}
            >
              Submit Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
