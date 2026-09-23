import React from 'react';
import { Ban, CheckCircle2, XCircle, ArrowRight, DollarSign, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDatabase } from '../context/DatabaseContext';

export const CancellationsPage: React.FC = () => {
  const { cancellations, approveCancellation } = useDatabase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Cancellations & Refund Claims</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review guest cancellation reasons, calculate statutory refunds, and process bank settlements.
        </p>
      </div>

      <div className="space-y-4">
        {cancellations.map((c) => (
          <Card key={c.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">
                    Booking #{c.booking_number}
                  </span>
                  <Badge variant={c.status.toLowerCase()} dot>{c.status}</Badge>
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-base">{c.customer_name}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{c.reason}"</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Requested on: {c.requested_at?.slice(0, 16)}
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-slate-400">Claim Amount:</span>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                    ₹{Number(c.refund_amount).toLocaleString('en-IN')}
                  </div>
                </div>

                {c.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <Button variant="danger" size="sm">
                      Reject
                    </Button>
                    <Button variant="success" size="sm" onClick={() => approveCancellation(c.id)}>
                      Approve & Refund
                    </Button>
                  </div>
                )}
                {c.status === 'Approved' && (
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Refund Dispatched
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
