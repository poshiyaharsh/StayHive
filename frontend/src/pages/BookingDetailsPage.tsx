import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, BedDouble, User, CreditCard, Sparkles, Utensils,
  ArrowLeft, CheckCircle2, Clock, ShieldCheck, FileText, Ban, Loader2, ShieldAlert
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDatabase } from '../context/DatabaseContext';
import { useBooking, useCancelBooking } from '../hooks/useBookings';

export const BookingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { bookings: contextBookings, checkInGuest, checkOutGuest } = useDatabase();
  const { data: remoteBooking, isLoading, error } = useBooking(id);
  const cancelBookingMutation = useCancelBooking();

  const booking = remoteBooking || contextBookings.find(b => String(b.id) === id);

  const handleCancel = async () => {
    if (!booking) return;
    if (window.confirm(`Are you sure you want to cancel booking ${booking.booking_number}?`)) {
      await cancelBookingMutation.mutateAsync({
        id: booking.id,
        reason: 'Guest cancelled reservation'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-sm text-slate-500">Loading reservation details from StayHive database...</p>
      </div>
    );
  }

  if (error) {
    const isForbidden = (error as any)?.response?.status === 403;
    return (
      <div className="max-w-md mx-auto my-12 text-center">
        <Card className="p-8 space-y-4 border border-rose-200 dark:border-rose-900/40">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isForbidden ? 'Access Restricted' : 'Reservation Not Found'}
          </h2>
          <p className="text-xs text-slate-500">
            {isForbidden
              ? 'You do not have authorization to view this guest folio. Only the reservation holder or staff can view this stay.'
              : 'The requested reservation reference could not be located in our records.'}
          </p>
          <Button variant="primary" onClick={() => navigate('/my-bookings')}>
            Return to My Reservations
          </Button>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-12 text-center text-slate-400">
        Booking not found.
      </div>
    );
  }

  const timelineSteps = [
    { title: 'Booking Created', desc: 'Online reservation confirmed', done: true, time: booking.created_at?.slice(0, 10) },
    { title: 'Payment Received', desc: 'Advance deposit settled', done: true, time: '2026-09-21' },
    { title: 'Room Assigned', desc: `Room ${booking.rooms?.[0]?.room_number || '101'} allocated`, done: true, time: '2026-09-22' },
    { title: 'Guest Checked In', desc: 'ID verified & digital key issued', done: booking.status === 'Checked-in' || booking.status === 'Checked-out' || booking.status === 'Completed', time: booking.check_in_date },
    { title: 'Stay & Amenities', desc: 'In-room dining & concierge active', done: booking.status === 'Checked-in' || booking.status === 'Checked-out', time: 'In Progress' },
    { title: 'Departure & Settlement', desc: 'GST invoice finalized & room released', done: booking.status === 'Checked-out' || booking.status === 'Completed', time: booking.check_out_date },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/bookings')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {booking.booking_number}
              </h1>
              <Badge variant={booking.status.toLowerCase()} dot>{booking.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{booking.hotel_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {booking.status === 'Confirmed' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => checkInGuest(booking.id, booking.rooms?.[0]?.room_number || '101', `KEY-${booking.rooms?.[0]?.room_number || '101'}-A`)}
              >
                Express Check-In
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                onClick={handleCancel}
                isLoading={cancelBookingMutation.isPending}
              >
                <Ban className="w-4 h-4 mr-1.5" /> Cancel Stay
              </Button>
            </>
          )}
          {booking.status === 'Checked-in' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkOutGuest(booking.id)}
            >
              Check Out Guest
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => navigate('/billing')}>
            <FileText className="w-4 h-4 mr-1.5" /> Invoice
          </Button>
        </div>
      </div>

      {/* Main Grid: Stay Info & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest & Stay Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <User className="w-4 h-4 text-blue-500" /> Guest Profile
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">{booking.customer_name}</div>
                <div className="text-xs text-slate-400 mt-1">{booking.customer_email || 'guest@example.com'}</div>
                <div className="text-xs text-slate-400">{booking.customer_phone || '+91 98220 11223'}</div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500">
                Total Guests: {booking.total_guests} ({booking.adults} Adults, {booking.children} Children)
              </div>
            </Card>

            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <BedDouble className="w-4 h-4 text-emerald-500" /> Room Allocation
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  Room {booking.rooms?.[0]?.room_number || '101'}
                </div>
                <div className="text-xs text-slate-400 mt-1">{booking.rooms?.[0]?.room_type || 'Deluxe King Room'}</div>
                <div className="text-xs text-slate-400">Floor {booking.rooms?.[0]?.floor || 1}</div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500">
                Keycard: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{booking.check_in_record?.key_card_issued || 'KEY-101-A'}</span>
              </div>
            </Card>
          </div>

          {/* Lifecycle Timeline */}
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Reservation Lifecycle & Audit Trail</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {timelineSteps.map((step, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      step.done
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{step.title}</span>
                      <span className="text-xs text-slate-400">{step.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Financial Summary */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Financial Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Room Charges</span>
                <span>₹{Number(booking.total_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Promotional Discount</span>
                <span>-₹{Number(booking.discount_amount).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax (GST 18%)</span>
                <span>₹{(Number(booking.net_amount) * 0.18).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between font-extrabold text-base text-slate-900 dark:text-white">
                <span>Total Payable</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ₹{(Number(booking.net_amount) * 1.18).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
            <Button variant="primary" className="w-full" onClick={() => navigate('/billing')}>
              View GST Invoice
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
