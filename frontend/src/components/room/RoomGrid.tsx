import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble, Filter, Search, CheckCircle2, Wrench, Sparkles,
  Users, Check, X, ShieldAlert, ArrowRight, Layers
} from 'lucide-react';
import { Room, RoomStatus } from '../../types/database';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { SearchInput } from '../ui/SearchInput';
import { useDatabase } from '../../context/DatabaseContext';

export const RoomGrid: React.FC = () => {
  const { rooms, updateRoomStatus, hotels } = useDatabase();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const statuses: { id: string; label: string; color: string }[] = [
    { id: 'all', label: 'All Rooms', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'Available', label: 'Available', color: 'bg-emerald-500 text-white' },
    { id: 'Occupied', label: 'Occupied', color: 'bg-blue-600 text-white' },
    { id: 'Cleaning', label: 'Cleaning', color: 'bg-amber-500 text-white' },
    { id: 'Reserved', label: 'Reserved', color: 'bg-purple-600 text-white' },
    { id: 'Maintenance', label: 'Maintenance', color: 'bg-orange-500 text-white' },
  ];

  const filteredRooms = rooms.filter((r) => {
    const matchesStatus = selectedStatus === 'all' || r.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesFloor = selectedFloor === 'all' || String(r.floor) === selectedFloor;
    const matchesSearch = r.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room_type_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.hotel_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesFloor && matchesSearch;
  });

  const handleStatusChange = async (newStatus: RoomStatus, housekeeping?: string) => {
    if (!activeRoom) return;
    await updateRoomStatus(activeRoom.id, newStatus, housekeeping);
    setActiveRoom((prev) => prev ? { ...prev, status: newStatus, housekeeping_status: (housekeeping as any) || prev.housekeeping_status } : null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Search room number, type, hotel..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </div>

        {/* Floor Filter */}
        <div className="w-44">
          <Select
            value={selectedFloor}
            onChange={(val) => setSelectedFloor(String(val))}
            options={[
              { value: 'all', label: 'All Floors' },
              { value: '1', label: 'Floor 1' },
              { value: '2', label: 'Floor 2' },
              { value: '3', label: 'Floor 3' },
              { value: '4', label: 'Floor 4' },
              { value: '5', label: 'Floor 5' },
            ]}
          />
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((s) => {
          const isSelected = selectedStatus.toLowerCase() === s.id.toLowerCase();
          const count = s.id === 'all' ? rooms.length : rooms.filter(r => r.status.toLowerCase() === s.id.toLowerCase()).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{s.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Room Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredRooms.map((room) => {
          const statusBgMap: Record<string, string> = {
            Available: 'border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-500',
            Occupied: 'border-blue-200 dark:border-blue-900/40 hover:border-blue-500',
            Cleaning: 'border-amber-200 dark:border-amber-900/40 hover:border-amber-500',
            Reserved: 'border-purple-200 dark:border-purple-900/40 hover:border-purple-500',
            Maintenance: 'border-orange-200 dark:border-orange-900/40 hover:border-orange-500',
          };

          return (
            <motion.div
              key={room.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveRoom(room)}
              className={`cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#111827] border-2 shadow-sm transition-all ${
                statusBgMap[room.status] || 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {room.room_number}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">F{room.floor}</span>
              </div>

              <div className="mt-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {room.room_type_name || 'Deluxe King'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ₹{Number(room.price_per_night).toLocaleString('en-IN')}/night
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <Badge variant={room.status.toLowerCase()} size="sm" dot>
                  {room.status}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="p-12 text-center text-sm text-slate-400 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-white/10">
          No rooms found matching the selected criteria.
        </div>
      )}

      {/* Room Detail & Quick Status Modal */}
      <Modal
        isOpen={!!activeRoom}
        onClose={() => setActiveRoom(null)}
        title={`Room ${activeRoom?.room_number} Details`}
        subtitle={`${activeRoom?.room_type_name} • Floor ${activeRoom?.floor}`}
        maxWidth="md"
      >
        {activeRoom && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <Badge variant={activeRoom.status.toLowerCase()} dot>{activeRoom.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Housekeeping:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{activeRoom.housekeeping_status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Base Tariff:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{Number(activeRoom.price_per_night).toLocaleString('en-IN')} / night</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hotel:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{activeRoom.hotel_name || 'StayHive Grand Ahmedabad'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Status Transition
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={activeRoom.status === 'Available' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('Available', 'Clean')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Make Available
                </Button>
                <Button
                  variant={activeRoom.status === 'Occupied' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('Occupied')}
                >
                  <Users className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  Mark Occupied
                </Button>
                <Button
                  variant={activeRoom.status === 'Cleaning' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('Cleaning', 'In Progress')}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  Send for Cleaning
                </Button>
                <Button
                  variant={activeRoom.status === 'Maintenance' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange('Maintenance', 'Needs Cleaning')}
                >
                  <Wrench className="w-3.5 h-3.5 mr-1 text-orange-500" />
                  Put in Maintenance
                </Button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setActiveRoom(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
