import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Clock, User, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useDatabase } from '../context/DatabaseContext';

export const ComplaintsPage: React.FC = () => {
  const { complaints, resolveComplaint } = useDatabase();
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    await resolveComplaint(selectedComplaint.id, resolutionNotes || 'Resolved by hotel supervisor');
    setSelectedComplaint(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Guest Grievance & SLA Resolution</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track reported guest incidents, assign maintenance/front desk staff, and close SLA issues.
        </p>
      </div>

      <div className="space-y-4">
        {complaints.map((c) => (
          <Card key={c.id} className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900 dark:text-white">{c.subject}</span>
                  <Badge variant={c.priority.toLowerCase()} dot>{c.priority}</Badge>
                  <Badge variant={c.status.toLowerCase()}>{c.status}</Badge>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Category: {c.category} • Guest: {c.customer_name} • Reported: {c.created_at?.slice(0, 16)}
                </div>
              </div>

              {c.status !== 'Resolved' && (
                <Button variant="primary" size="sm" onClick={() => setSelectedComplaint(c)}>
                  Resolve Ticket
                </Button>
              )}
            </div>

            {c.resolution_notes && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-300">Resolution Log:</span>
                <p className="text-emerald-800 dark:text-emerald-400 mt-0.5">{c.resolution_notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Resolve Guest Complaint"
        subtitle={`Incident: ${selectedComplaint?.subject}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <Input
            label="Resolution Action & Corrective Notes"
            placeholder="e.g. Dispatched technician to adjust AC and offered complimentary beverage..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSelectedComplaint(null)}>Cancel</Button>
            <Button variant="success" onClick={handleResolve}>
              Mark as Resolved
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
