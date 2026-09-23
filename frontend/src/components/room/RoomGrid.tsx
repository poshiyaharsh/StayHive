import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble, Filter, Search, CheckCircle2, Wrench, Sparkles,
  Users, Check, X, ShieldAlert, ArrowRight, Layers, Plus,
  Hotel as HotelIcon, Edit2, Trash2, AlertTriangle
} from 'lucide-react';
import { Room, RoomStatus } from '../../types/database';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { SearchInput } from '../ui/SearchInput';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import {
  useRooms, useRoomTypes, useCreateRoom, useUpdateRoom,
  useUpdateRoomStatus, useDeleteRoom
} from '../../hooks/useRooms';
import { useHotels } from '../../hooks/useHotels';

export const RoomGrid: React.FC = () => {
  const { role } = useAuth();
  const canManage = role === 'ADMIN' || role === 'MANAGER';
  const canUpdateStatus = ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING'].includes(role);

  // Filters state
  const [selectedHotel, setSelectedHotel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  // Queries & Mutations
  const { data: hotels = [] } = useHotels();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: rooms = [], isLoading } = useRooms({
    hotel_id: selectedHotel,
    status: selectedStatus,
    floor: selectedFloor,
    search: searchQuery,
  });

  const createRoomMutation = useCreateRoom();
  const updateRoomMutation = useUpdateRoom();
  const updateStatusMutation = useUpdateRoomStatus();
  const deleteRoomMutation = useDeleteRoom();

  // Add Room Form state
  const [roomFormData, setRoomFormData] = useState({
    hotel_id: '',
    room_type_id: '',
    room_number: '',
    floor: 1,
    status: 'Available',
    housekeeping_status: 'Clean',
    price_per_night: '',
  });

  const statuses: { id: string; label: string; color: string }[] = [
    { id: 'all', label: 'All Rooms', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    { id: 'Available', label: 'Available', color: 'bg-emerald-500 text-white' },
    { id: 'Occupied', label: 'Occupied', color: 'bg-blue-600 text-white' },
    { id: 'Cleaning', label: 'Cleaning', color: 'bg-amber-500 text-white' },
    { id: 'Reserved', label: 'Reserved', color: 'bg-purple-600 text-white' },
    { id: 'Maintenance', label: 'Maintenance', color: 'bg-orange-500 text-white' },
  ];

  const handleOpenAdd = () => {
    setRoomFormData({
      hotel_id: hotels.length > 0 ? String(hotels[0].id) : '',
      room_type_id: roomTypes.length > 0 ? String(roomTypes[0].id) : '',
      room_number: '',
      floor: 1,
      status: 'Available',
      housekeeping_status: 'Clean',
      price_per_night: roomTypes.length > 0 ? String(roomTypes[0].base_price) : '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      hotel_id: String((room as any).hotel_id || (room as any).hotel?.id || hotels[0]?.id || ''),
      room_type_id: String((room as any).room_type_id || (room as any).room_type?.id || roomTypes[0]?.id || ''),
      room_number: room.room_number,
      floor: room.floor,
      status: room.status,
      housekeeping_status: room.housekeeping_status,
      price_per_night: String(room.price_per_night),
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.room_number.trim() || !roomFormData.hotel_id || !roomFormData.room_type_id) {
      return;
    }

    try {
      await createRoomMutation.mutateAsync({
        hotel_id: roomFormData.hotel_id,
        room_type_id: roomFormData.room_type_id,
        room_number: roomFormData.room_number.trim(),
        floor: Number(roomFormData.floor) || 1,
        status: roomFormData.status,
        housekeeping_status: roomFormData.housekeeping_status,
        price_per_night: roomFormData.price_per_night ? Number(roomFormData.price_per_night) : undefined,
      });
      setIsAddModalOpen(false);
    } catch {
      // Error handled by mutation onError toast
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    try {
      await updateRoomMutation.mutateAsync({
        id: editingRoom.id,
        data: {
          hotel_id: Number(roomFormData.hotel_id) as any,
          room_type_id: Number(roomFormData.room_type_id) as any,
          room_number: roomFormData.room_number.trim(),
          floor: Number(roomFormData.floor) || 1,
          status: roomFormData.status as any,
          housekeeping_status: roomFormData.housekeeping_status as any,
          price_per_night: Number(roomFormData.price_per_night) || editingRoom.price_per_night,
        },
      });
      setEditingRoom(null);
      if (activeRoom?.id === editingRoom.id) {
        setActiveRoom(null);
      }
    } catch {
      // Handled by mutation
    }
  };

  const handleStatusChange = async (newStatus: string, housekeeping?: string) => {
    if (!activeRoom || !canUpdateStatus) return;
    await updateStatusMutation.mutateAsync({
      id: activeRoom.id,
      status: newStatus,
      housekeeping,
    });
    setActiveRoom((prev) =>
      prev ? { ...prev, status: newStatus as any, housekeeping_status: (housekeeping as any) || prev.housekeeping_status } : null
    );
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoom) return;
    await deleteRoomMutation.mutateAsync(deletingRoom.id);
    setDeletingRoom(null);
    if (activeRoom?.id === deletingRoom.id) {
      setActiveRoom(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Search room number, type, hotel..."
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hotel Filter */}
          <div className="w-52">
            <Select
              value={selectedHotel}
              onChange={(val) => setSelectedHotel(String(val))}
              options={[
                { value: 'all', label: 'All Properties' },
                ...hotels.map((h) => ({ value: String(h.id), label: h.name })),
              ]}
            />
          </div>

          {/* Floor Filter */}
          <div className="w-36">
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
                { value: '9', label: 'Floor 9' },
              ]}
            />
          </div>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAdd}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Room
            </Button>
          )}
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((s) => {
          const isSelected = selectedStatus.toLowerCase() === s.id.toLowerCase();
          const count = s.id === 'all'
            ? rooms.length
            : rooms.filter((r) => r.status.toLowerCase() === s.id.toLowerCase()).length;
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
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<BedDouble className="w-8 h-8" />}
          title="No rooms found"
          description={searchQuery || selectedStatus !== 'all' || selectedFloor !== 'all' ? "No rooms match the selected filter criteria." : "No rooms have been registered in this property yet."}
          actionLabel={canManage ? "Add Room" : undefined}
          onAction={canManage ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {rooms.map((room) => {
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
                <span className="text-slate-400">Property:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{activeRoom.hotel_name || 'StayHive Grand'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capacity:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{activeRoom.capacity || 2} Guests</span>
              </div>
            </div>

            {canUpdateStatus && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Status Transition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={activeRoom.status === 'Available' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('Available', 'Clean')}
                    isLoading={updateStatusMutation.isPending}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Available (Clean)
                  </Button>
                  <Button
                    variant={activeRoom.status === 'Occupied' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('Occupied')}
                    isLoading={updateStatusMutation.isPending}
                  >
                    <Users className="w-3.5 h-3.5 mr-1 text-blue-500" />
                    Occupied
                  </Button>
                  <Button
                    variant={activeRoom.status === 'Cleaning' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('Cleaning', 'In Progress')}
                    isLoading={updateStatusMutation.isPending}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    Cleaning
                  </Button>
                  <Button
                    variant={activeRoom.status === 'Maintenance' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('Maintenance', 'Needs Cleaning')}
                    isLoading={updateStatusMutation.isPending}
                  >
                    <Wrench className="w-3.5 h-3.5 mr-1 text-orange-500" />
                    Maintenance
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              {canManage ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const r = activeRoom;
                      setActiveRoom(null);
                      handleOpenEdit(r);
                    }}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const r = activeRoom;
                      setActiveRoom(null);
                      setDeletingRoom(r);
                    }}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              ) : <div />}

              <Button variant="secondary" size="sm" onClick={() => setActiveRoom(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Room"
        subtitle="Add a suite or guest room to a StayHive property"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Hotel *
            </label>
            <Select
              value={roomFormData.hotel_id}
              onChange={(val) => setRoomFormData({ ...roomFormData, hotel_id: String(val) })}
              options={hotels.map((h) => ({ value: String(h.id), label: h.name }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Room Category / Type *
            </label>
            <Select
              value={roomFormData.room_type_id}
              onChange={(val) => {
                const rt = roomTypes.find((r) => String(r.id) === String(val));
                setRoomFormData({
                  ...roomFormData,
                  room_type_id: String(val),
                  price_per_night: rt ? String(rt.base_price) : roomFormData.price_per_night,
                });
              }}
              options={roomTypes.map((rt) => ({
                value: String(rt.id),
                label: `${rt.type_name} (₹${Number(rt.base_price).toLocaleString('en-IN')}/night)`,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room Number *"
              placeholder="e.g. 102 or 305"
              value={roomFormData.room_number}
              onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
              required
            />
            <Input
              label="Floor Number *"
              type="number"
              min="1"
              max="20"
              value={roomFormData.floor}
              onChange={(e) => setRoomFormData({ ...roomFormData, floor: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Status
              </label>
              <Select
                value={roomFormData.status}
                onChange={(val) => setRoomFormData({ ...roomFormData, status: String(val) })}
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Occupied', label: 'Occupied' },
                  { value: 'Cleaning', label: 'Cleaning' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Reserved', label: 'Reserved' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Housekeeping
              </label>
              <Select
                value={roomFormData.housekeeping_status}
                onChange={(val) => setRoomFormData({ ...roomFormData, housekeeping_status: String(val) })}
                options={[
                  { value: 'Clean', label: 'Clean' },
                  { value: 'Needs Cleaning', label: 'Needs Cleaning' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Inspected', label: 'Inspected' },
                ]}
              />
            </div>
          </div>

          <Input
            label="Custom Tariff (Optional - defaults to Category Base Tariff)"
            type="number"
            placeholder="e.g. 4500"
            value={roomFormData.price_per_night}
            onChange={(e) => setRoomFormData({ ...roomFormData, price_per_night: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createRoomMutation.isPending}>
              Create Room
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        title={`Edit Room ${editingRoom?.room_number}`}
        subtitle="Update room details, type, or assigned tariff"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Hotel *
            </label>
            <Select
              value={roomFormData.hotel_id}
              onChange={(val) => setRoomFormData({ ...roomFormData, hotel_id: String(val) })}
              options={hotels.map((h) => ({ value: String(h.id), label: h.name }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Room Category / Type *
            </label>
            <Select
              value={roomFormData.room_type_id}
              onChange={(val) => setRoomFormData({ ...roomFormData, room_type_id: String(val) })}
              options={roomTypes.map((rt) => ({
                value: String(rt.id),
                label: `${rt.type_name} (₹${Number(rt.base_price).toLocaleString('en-IN')}/night)`,
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room Number *"
              value={roomFormData.room_number}
              onChange={(e) => setRoomFormData({ ...roomFormData, room_number: e.target.value })}
              required
            />
            <Input
              label="Floor Number *"
              type="number"
              min="1"
              max="20"
              value={roomFormData.floor}
              onChange={(e) => setRoomFormData({ ...roomFormData, floor: parseInt(e.target.value) || 1 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Room Status
              </label>
              <Select
                value={roomFormData.status}
                onChange={(val) => setRoomFormData({ ...roomFormData, status: String(val) })}
                options={[
                  { value: 'Available', label: 'Available' },
                  { value: 'Occupied', label: 'Occupied' },
                  { value: 'Cleaning', label: 'Cleaning' },
                  { value: 'Maintenance', label: 'Maintenance' },
                  { value: 'Reserved', label: 'Reserved' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Housekeeping
              </label>
              <Select
                value={roomFormData.housekeeping_status}
                onChange={(val) => setRoomFormData({ ...roomFormData, housekeeping_status: String(val) })}
                options={[
                  { value: 'Clean', label: 'Clean' },
                  { value: 'Needs Cleaning', label: 'Needs Cleaning' },
                  { value: 'In Progress', label: 'In Progress' },
                  { value: 'Inspected', label: 'Inspected' },
                ]}
              />
            </div>
          </div>

          <Input
            label="Tariff per Night (₹)"
            type="number"
            value={roomFormData.price_per_night}
            onChange={(e) => setRoomFormData({ ...roomFormData, price_per_night: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" type="button" onClick={() => setEditingRoom(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={updateRoomMutation.isPending}>
              Save Room Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Room Confirmation Modal */}
      <Modal
        isOpen={!!deletingRoom}
        onClose={() => setDeletingRoom(null)}
        title="Confirm Room Deletion"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Room {deletingRoom?.room_number}?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This action will remove Room {deletingRoom?.room_number} from the property matrix.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" size="sm" onClick={() => setDeletingRoom(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={deleteRoomMutation.isPending}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
