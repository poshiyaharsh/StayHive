import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, BedDouble, KeyRound, ArrowRight, ShieldCheck, FileText, Ban, Loader2, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDatabase } from '../context/DatabaseContext';
import { useMyBookings, useCancelBooking } from '../hooks/useBookings';

export const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { bookings: contextBookings } = useDatabase();
  const { data: myBookings, isLoading } = useMyBookings();
  const cancelBookingMutation = useCancelBooking();

  const displayBookings = myBookings !== undefined ? myBookings : contextBookings;

  const handleCancel = async (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this reservation? A refund request will be initiated.')) {
      await cancelBookingMutation.mutateAsync({
        id: bookingId,
        reason: 'Guest cancelled reservation online'
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Reservations & Stays</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Active keys, upcoming hotel itineraries, and digital receipts.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/booking')}>
          Book a Room
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-slate-500 mt-3">Loading your StayHive reservations...</p>
        </Card>
      ) : displayBookings.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
            <BedDouble className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Reservations Found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You do not have any active or past reservations yet. Discover our luxury heritage properties today!
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/booking')}>
            Explore & Book a Stay
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayBookings.map((b) => (
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
                    {b.status === 'Confirmed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={() => handleCancel(b.id)}
                        isLoading={cancelBookingMutation.isPending}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => navigate('/billing')}>
                      <FileText className="w-3.5 h-3.5 mr-1" /> Invoice
                    </Button>
                    {(b.status === 'Checked-out' || b.status === 'Completed') && (
                      <Button variant="primary" size="sm" onClick={() => navigate('/feedback')}>
                        <Star className="w-3.5 h-3.5 mr-1 fill-amber-400 text-amber-400" /> Rate Stay
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
