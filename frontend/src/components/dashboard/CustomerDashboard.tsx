import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hotel, BedDouble, Calendar, KeyRound, Utensils, Sparkles,
  FileText, Clock, ArrowRight, ShieldCheck, Tag, Coffee
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { useMyServiceRequests } from '../../hooks/useServices';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { bookings, foodOrders, offers } = useDatabase();
  const { data: myServiceRequests = [] } = useMyServiceRequests();
  const navigate = useNavigate();

  // Find user's active or upcoming booking
  const activeBooking = bookings.find(b => b.status === 'Checked-in') || bookings[0];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> StayHive Gold Member Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.first_name || 'Rahul'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your in-stay amenities, dining, digital keycards and reservations.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/search')}>
          Book Another Stay <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>

      {/* Hero Active Stay Card with Digital Keycard */}
      {activeBooking && (
        <Card className="overflow-hidden border-2 border-blue-500/20 bg-gradient-to-br from-blue-900/10 via-white to-indigo-900/10 dark:from-slate-900 dark:via-[#111827] dark:to-blue-950/30 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Badge variant={activeBooking.status} dot>{activeBooking.status}</Badge>
                <span className="text-xs text-slate-400 font-mono">Ref: {activeBooking.booking_number}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {activeBooking.hotel_name || 'StayHive Grand Ahmedabad'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {activeBooking.check_in_date} → {activeBooking.check_out_date}
                </span>
                <span className="flex items-center gap-1.5">
                  <BedDouble className="w-4 h-4 text-emerald-500" />
                  Room {activeBooking.rooms?.[0]?.room_number || '101'} (Deluxe King)
                </span>
              </div>
            </div>

            {/* Digital Key Pill */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Digital Keycard Active</span>
                <div className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                  {activeBooking.check_in_record?.key_card_issued || 'KEY-101-A'}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Tap door sensor to enter
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="secondary" size="sm" onClick={() => navigate('/restaurant')} className="justify-start">
              <Utensils className="w-4 h-4 text-orange-500 mr-2" />
              Order Food
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/services')} className="justify-start">
              <Sparkles className="w-4 h-4 text-blue-500 mr-2" />
              Request Spa
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/billing')} className="justify-start">
              <FileText className="w-4 h-4 text-emerald-500 mr-2" />
              View Invoice
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/my-bookings')} className="justify-start">
              <Calendar className="w-4 h-4 text-purple-500 mr-2" />
              Stay Details
            </Button>
          </div>
        </Card>
      )}

      {/* Grid: Live Food Orders + Active Promos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Dining Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Coffee className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">In-Room Dining Orders</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/restaurant')}>
              Menu <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {foodOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No orders yet. Craving something delicious? Order from the kitchen!
              </div>
            ) : (
              foodOrders.slice(0, 3).map((o) => (
                <div key={o.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Order #{o.id}</div>
                    <div className="text-xs text-slate-400">Total: ₹{o.total_amount} • Room {o.room_number || '101'}</div>
                  </div>
                  <Badge variant={o.status.toLowerCase()} dot>{o.status}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Member Exclusive Offers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Tag className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Member Offers</h2>
            </div>
          </div>

          <div className="space-y-3">
            {offers.slice(0, 3).map((off) => (
              <div key={off.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-indigo-950 dark:text-indigo-200 text-sm">{off.title}</div>
                  <div className="text-xs text-indigo-700/80 dark:text-indigo-400 mt-0.5 font-mono">
                    Code: <span className="font-bold underline">{off.code}</span> ({off.discount_percentage}% OFF)
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/search')}>
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </Card>
        {/* Active Hotel Service Requests */}
        {myServiceRequests.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Service Requests</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
                All Services <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {myServiceRequests.slice(0, 3).map((sr) => (
                <div key={sr.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{sr.service_name}</div>
                    <div className="text-xs text-slate-400">Request #{sr.id} • ₹{Number(sr.service_price).toLocaleString('en-IN')}</div>
                    {sr.notes && <div className="text-[11px] text-slate-500 italic mt-0.5 truncate max-w-xs">"{sr.notes}"</div>}
                  </div>
                  <Badge variant={sr.request_status} dot>{sr.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
