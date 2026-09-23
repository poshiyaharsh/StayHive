import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, Filter, Plus, ArrowRight, Eye, KeyRound } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { useDatabase } from '../context/DatabaseContext';

export const BookingsPage: React.FC = () => {
  const { bookings, checkInGuest, checkOutGuest } = useDatabase();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.booking_number.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.hotel_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reservations & Stays</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming arrivals, in-house guests, and booking records.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/book')}>
          <Plus className="w-4 h-4 mr-1.5" /> New Reservation
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Search booking #, guest name, property..."
            value={search}
            onChange={(val) => setSearch(val)}
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'confirmed', 'checked-in', 'checked-out', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Data Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 text-xs text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Booking ID</th>
                <th className="py-3.5 px-4 font-semibold">Guest</th>
                <th className="py-3.5 px-4 font-semibold">Property</th>
                <th className="py-3.5 px-4 font-semibold">Room</th>
                <th className="py-3.5 px-4 font-semibold">Dates</th>
                <th className="py-3.5 px-4 font-semibold">Amount</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {b.booking_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{b.customer_name}</div>
                    <div className="text-xs text-slate-400">{b.customer_phone || b.customer_email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    {b.hotel_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold">
                    {b.rooms?.[0]?.room_number ? `Room ${b.rooms[0].room_number}` : 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {b.check_in_date} → {b.check_out_date}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    ₹{Number(b.net_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={b.status.toLowerCase()} dot>{b.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'Confirmed' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => checkInGuest(b.id, b.rooms?.[0]?.room_number || '101', `KEY-${b.rooms?.[0]?.room_number || '101'}-A`)}
                        >
                          Check In
                        </Button>
                      )}
                      {b.status === 'Checked-in' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkOutGuest(b.id)}
                        >
                          Check Out
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/bookings/${b.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
