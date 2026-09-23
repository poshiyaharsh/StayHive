import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hotel, BedDouble, Calendar, User, FileText, Utensils, X, ArrowRight } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { hotels, rooms, bookings, customers } = useDatabase();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredHotels = q ? hotels.filter(h => h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredRooms = q ? rooms.filter(r => r.room_number.toLowerCase().includes(q) || r.status.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredBookings = q ? bookings.filter(b => b.booking_number.toLowerCase().includes(q) || b.customer_name?.toLowerCase().includes(q)).slice(0, 3) : [];
  const filteredCustomers = q ? customers.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)).slice(0, 3) : [];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-10"
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-white/5">
            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search hotels, rooms, guests, bookings... (Type to filter)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div className="max-h-96 overflow-y-auto p-2">
            {!query ? (
              <div className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Navigation
                <div className="mt-2 space-y-1">
                  {[
                    { label: 'Hotels Directory', icon: Hotel, path: '/hotels' },
                    { label: 'Room Management & Grid', icon: BedDouble, path: '/rooms' },
                    { label: 'Active Bookings Desk', icon: Calendar, path: '/bookings' },
                    { label: 'Restaurant & Kitchen Orders', icon: Utensils, path: '/restaurant' },
                    { label: 'Invoices & Ledger', icon: FileText, path: '/billing' },
                  ].map((nav, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelect(nav.path)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-normal transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <nav.icon className="w-4 h-4 text-blue-500" />
                        <span>{nav.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHotels.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Hotels</div>
                    {filteredHotels.map(h => (
                      <button
                        key={h.id}
                        onClick={() => handleSelect(`/hotels`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                      >
                        <Hotel className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{h.name}</div>
                          <div className="text-xs text-slate-400">{h.city}, {h.state} • {h.star_rating}★</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredRooms.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Rooms</div>
                    {filteredRooms.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSelect(`/rooms`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                      >
                        <BedDouble className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">Room {r.room_number} ({r.room_type_name})</div>
                          <div className="text-xs text-slate-400">Floor {r.floor} • Status: {r.status} • ₹{r.price_per_night}/night</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredBookings.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Bookings</div>
                    {filteredBookings.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect(`/bookings/${b.id}`)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{b.booking_number} — {b.customer_name}</div>
                          <div className="text-xs text-slate-400">{b.check_in_date} to {b.check_out_date} • ₹{b.net_amount} • {b.status}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredHotels.length === 0 && filteredRooms.length === 0 && filteredBookings.length === 0 && (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No results found for "{query}".
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
