import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BedDouble, KeyRound, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDatabase } from '../context/DatabaseContext';

export const MyBookingsPage: React.FC = () => {
  const { bookings } = useDatabase();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Reservations & Stays</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Active keys, upcoming hotel itineraries, and digital receipts.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/search')}>
          Book a Room
        </Button>
      </div>

      <div className="space-y-4">
        {bookings.map((b) => (
          <Card key={b.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400">{b.booking_number}</span>
                  <Badge variant={b.status.toLowerCase()} dot>{b.status}</Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{b.hotel_name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.check_in_date} → {b.check_out_date}</span>
                  <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> Room {b.rooms?.[0]?.room_number || '101'}</span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase">Paid Total</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    ₹{Number(b.net_amount).toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${b.id}`)}>
                    View Details
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/billing')}>
                    <FileText className="w-3.5 h-3.5 mr-1" /> Invoice
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
