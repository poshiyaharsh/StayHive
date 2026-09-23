import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck, UserX, KeyRound, BedDouble, Search, CheckCircle2,
  Calendar, Clock, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useDatabase } from '../../context/DatabaseContext';

export const ReceptionDashboard: React.FC = () => {
  const { bookings, rooms, checkInGuest, checkOutGuest } = useDatabase();

  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<any>(null);
  const [keyCard, setKeyCard] = useState('KEY-102-A');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter confirmed bookings ready for check in
  const pendingArrivals = bookings.filter(b => b.status === 'Confirmed');
  // Filter active checked-in guests
  const checkedInGuests = bookings.filter(b => b.status === 'Checked-in');

  const handleConfirmCheckIn = async () => {
    if (!selectedBookingForCheckIn) return;
    setIsProcessing(true);
    const roomNum = selectedBookingForCheckIn.rooms?.[0]?.room_number || '101';
    await checkInGuest(selectedBookingForCheckIn.id, roomNum, keyCard);
    setIsProcessing(false);
    setSelectedBookingForCheckIn(null);
  };

  const handleQuickCheckOut = async (bookingId: number) => {
    await checkOutGuest(bookingId);
  };

  return (
    <div className="space-y-8">
      {/* Front Desk Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <KeyRound className="w-3.5 h-3.5" /> Front Desk & Concierge Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reception Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Express Check-in, digital keycard issuance, and room allocations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold">
            <span className="text-emerald-600 mr-1.5">●</span> Front Desk Live
          </div>
        </div>
      </div>

      {/* Two Panes: Today's Arrivals vs Today's Departures / In-House */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arrivals & Check-in Queue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Expected Arrivals ({pendingArrivals.length})</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ready for express guest check-in</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {pendingArrivals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                All expected guests for today have checked in!
              </div>
            ) : (
              pendingArrivals.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{b.customer_name}</span>
                      <Badge variant="confirmed">Confirmed</Badge>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Booking: <span className="font-mono">{b.booking_number}</span> • Room: {b.rooms?.[0]?.room_number || '102 (Deluxe)'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {b.check_in_date} → {b.check_out_date} ({b.total_guests} Guests)
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedBookingForCheckIn(b);
                      setKeyCard(`KEY-${b.rooms?.[0]?.room_number || '102'}-A`);
                    }}
                  >
                    Check In <KeyRound className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Currently In-House & Check-Out Queue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">In-House Guests ({checkedInGuests.length})</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active stays & checkout settlement</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {checkedInGuests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active in-house guests at this moment.
              </div>
            ) : (
              checkedInGuests.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{b.customer_name}</span>
                      <Badge variant="occupied">Checked-in</Badge>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Room <span className="font-bold text-blue-600 dark:text-blue-400">{b.rooms?.[0]?.room_number || '101'}</span> • Keycard: {b.check_in_record?.key_card_issued || 'KEY-101-A'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Departs on: {b.check_out_date}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickCheckOut(b.id)}
                  >
                    Check Out <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Check In Modal */}
      <Modal
        isOpen={!!selectedBookingForCheckIn}
        onClose={() => setSelectedBookingForCheckIn(null)}
        title="Express Guest Check-In"
        subtitle={`Booking Ref: ${selectedBookingForCheckIn?.booking_number}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-sm">
            <div className="font-bold text-blue-900 dark:text-blue-200">{selectedBookingForCheckIn?.customer_name}</div>
            <div className="text-blue-700 dark:text-blue-300 text-xs mt-1">
              Room {selectedBookingForCheckIn?.rooms?.[0]?.room_number || '102'} • {selectedBookingForCheckIn?.total_guests} Guests
            </div>
            <div className="text-blue-600 dark:text-blue-400 text-xs mt-0.5">
              Govt. ID verified via front desk scanner.
            </div>
          </div>

          <Input
            label="Digital Keycard RFID / NFC Code"
            value={keyCard}
            onChange={(e) => setKeyCard(e.target.value)}
            helperText="Tap master card or enter assigned card ID"
            leftIcon={<KeyRound className="w-4 h-4" />}
          />

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setSelectedBookingForCheckIn(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmCheckIn} isLoading={isProcessing}>
              Confirm Check-In & Issue Key
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
