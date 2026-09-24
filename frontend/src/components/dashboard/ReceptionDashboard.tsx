import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  UserX,
  KeyRound,
  BedDouble,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  Filter,
  Sparkles,
  Building2,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  Layers,
  ChevronRight,
  Home,
  Check,
  X,
  Play
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import {
  useReceptionDashboard,
  useArrivals,
  useDepartures,
  useActiveStays,
  useRoomStatusBoard,
  useCheckIn,
  useCheckOut,
  ReceptionArrival,
  ReceptionDeparture,
  ReceptionActiveStay,
  RoomStatusItem,
} from '../../hooks/useReception';
import { useHotels } from '../../hooks/useHotels';

import {
  useServiceRequests,
  useUpdateServiceRequestStatus
} from '../../hooks/useServices';

export const ReceptionDashboard: React.FC = () => {
  const [selectedHotel, setSelectedHotel] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures' | 'in-house' | 'room-status' | 'services'>('arrivals');
  const [serviceStatusFilter, setServiceStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRoomStatus, setFilterRoomStatus] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');

  // Modal states
  const [checkInModalData, setCheckInModalData] = useState<ReceptionArrival | null>(null);
  const [keyCard, setKeyCard] = useState('');
  const [checkInRemarks, setCheckInRemarks] = useState('');

  const [checkOutModalData, setCheckOutModalData] = useState<ReceptionDeparture | ReceptionActiveStay | null>(null);
  const [checkOutRemarks, setCheckOutRemarks] = useState('');

  // API hooks
  const hotelIdParam = selectedHotel !== 'all' ? selectedHotel : undefined;
  const { data: hotels } = useHotels();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useReceptionDashboard(hotelIdParam);
  const { data: arrivals = [], isLoading: arrivalsLoading, refetch: refetchArrivals } = useArrivals(hotelIdParam);
  const { data: departures = [], isLoading: departuresLoading, refetch: refetchDepartures } = useDepartures(hotelIdParam);
  const { data: activeStays = [], isLoading: staysLoading, refetch: refetchStays } = useActiveStays(hotelIdParam);
  const { data: roomBoard = [], isLoading: roomsLoading, refetch: refetchRooms } = useRoomStatusBoard({
    hotel_id: hotelIdParam,
    status: filterRoomStatus,
    floor: filterFloor,
  });

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const { data: serviceRequests = [], isLoading: servicesLoading, refetch: refetchServices } = useServiceRequests({
    status: serviceStatusFilter !== 'all' ? serviceStatusFilter : undefined,
  });
  const updateServiceStatusMutation = useUpdateServiceRequestStatus();

  const handleRefreshAll = () => {
    refetchStats();
    refetchArrivals();
    refetchDepartures();
    refetchStays();
    refetchRooms();
    refetchServices();
  };

  // Filtered arrivals
  const filteredArrivals = useMemo(() => {
    if (!searchQuery.trim()) return arrivals;
    const q = searchQuery.toLowerCase();
    return arrivals.filter(
      (a) =>
        a.customer_name?.toLowerCase().includes(q) ||
        a.booking_number?.toLowerCase().includes(q) ||
        a.room_number?.toLowerCase().includes(q) ||
        a.customer_email?.toLowerCase().includes(q) ||
        a.customer_phone?.toLowerCase().includes(q)
    );
  }, [arrivals, searchQuery]);

  // Filtered departures
  const filteredDepartures = useMemo(() => {
    if (!searchQuery.trim()) return departures;
    const q = searchQuery.toLowerCase();
    return departures.filter(
      (d) =>
        d.customer_name?.toLowerCase().includes(q) ||
        d.booking_number?.toLowerCase().includes(q) ||
        d.room_number?.toLowerCase().includes(q) ||
        d.customer_email?.toLowerCase().includes(q) ||
        d.customer_phone?.toLowerCase().includes(q)
    );
  }, [departures, searchQuery]);

  // Filtered active stays
  const filteredActiveStays = useMemo(() => {
    if (!searchQuery.trim()) return activeStays;
    const q = searchQuery.toLowerCase();
    return activeStays.filter(
      (s) =>
        s.customer_name?.toLowerCase().includes(q) ||
        s.booking_number?.toLowerCase().includes(q) ||
        s.room_number?.toLowerCase().includes(q) ||
        s.customer_email?.toLowerCase().includes(q) ||
        s.customer_phone?.toLowerCase().includes(q)
    );
  }, [activeStays, searchQuery]);

  // Filtered room status board
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return roomBoard;
    const q = searchQuery.toLowerCase();
    return roomBoard.filter(
      (r) =>
        r.room_number?.toLowerCase().includes(q) ||
        r.room_type_name?.toLowerCase().includes(q) ||
        r.current_occupant?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q)
    );
  }, [roomBoard, searchQuery]);

  // Open Check-in Modal
  const openCheckInModal = (arrival: ReceptionArrival) => {
    setCheckInModalData(arrival);
    const roomNum = arrival.room_number && arrival.room_number !== 'Unassigned' ? arrival.room_number : '101';
    setKeyCard(`KEY-${roomNum}-A`);
    setCheckInRemarks('');
  };

  // Submit Check-In
  const handleConfirmCheckIn = async () => {
    if (!checkInModalData) return;
    try {
      await checkInMutation.mutateAsync({
        booking_id: checkInModalData.id,
        key_card_issued: keyCard.trim() || undefined,
        remarks: checkInRemarks.trim() || undefined,
      });
      setCheckInModalData(null);
    } catch {
      // Toast handled by hook
    }
  };

  // Open Check-Out Modal
  const openCheckOutModal = (stay: ReceptionDeparture | ReceptionActiveStay) => {
    setCheckOutModalData(stay);
    setCheckOutRemarks('');
  };

  // Submit Check-Out
  const handleConfirmCheckOut = async () => {
    if (!checkOutModalData) return;
    try {
      await checkOutMutation.mutateAsync({
        booking_id: checkOutModalData.id,
        remarks: checkOutRemarks.trim() || undefined,
      });
      setCheckOutModalData(null);
    } catch {
      // Toast handled by hook
    }
  };

  // Hotel options for filter
  const hotelOptions = [
    { value: 'all', label: 'All Hotel Properties' },
    ...(hotels?.map((h) => ({ value: String(h.id), label: h.name })) || []),
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Front Desk Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
            <KeyRound className="w-3.5 h-3.5" /> Front Desk & Concierge Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reception Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Express Check-in, digital RFID keycard issuance, departures, and room allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hotel Filter Dropdown */}
          <div className="w-56">
            <Select
              value={selectedHotel}
              onChange={(val) => setSelectedHotel(String(val))}
              options={hotelOptions}
              placeholder="Filter by Hotel"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5"
            title="Refresh front desk data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            Front Desk Live
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Expected Arrivals
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.today_arrivals_count ?? arrivals.length)}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready for check-in
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Scheduled Departures
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.today_departures_count ?? departures.length)}
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" /> Pending check-out
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                In-House Guests
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.in_house_count ?? activeStays.length)}
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 flex items-center gap-1">
                <BedDouble className="w-3 h-3" /> Active room stays
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <BedDouble className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Rooms
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.available_rooms_count ?? 0)}
              </h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Ready for allocation
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Home className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('arrivals')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'arrivals'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Arrivals ({arrivals.length})
          </button>

          <button
            onClick={() => setActiveTab('departures')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'departures'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <UserX className="w-4 h-4" />
            Departures ({departures.length})
          </button>

          <button
            onClick={() => setActiveTab('in-house')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'in-house'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            In-House ({activeStays.length})
          </button>

          <button
            onClick={() => setActiveTab('room-status')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'room-status'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Room Status Board ({roomBoard.length})
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'services'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Guest Services ({serviceRequests.length})
          </button>
        </div>

        {/* Global Search Input */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guest, room, ref..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {/* Tab 1: Expected Arrivals */}
      {activeTab === 'arrivals' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Expected Arrivals ({filteredArrivals.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Confirmed reservations ready for express keycard check-in
                </p>
              </div>
            </div>
          </div>

          {arrivalsLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
              Loading arrivals...
            </div>
          ) : filteredArrivals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              No pending arrivals matching current criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArrivals.map((arrival) => (
                <div
                  key={arrival.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {arrival.customer_name}
                      </span>
                      <Badge variant="confirmed">Confirmed</Badge>
                      {arrival.hotel_name && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {arrival.hotel_name}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Booking: <strong className="font-mono text-slate-700 dark:text-slate-300">{arrival.booking_number}</strong></span>
                      <span>•</span>
                      <span>
                        Room: <strong className="text-emerald-600 dark:text-emerald-400">{arrival.room_number || '101'}</strong> ({arrival.room_type})
                      </span>
                      <span>•</span>
                      <span>{arrival.nights} Nights ({arrival.total_guests} Guests)</span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {arrival.check_in_date} → {arrival.check_out_date}
                      </span>
                      {arrival.customer_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" /> {arrival.customer_phone}
                        </span>
                      )}
                      {arrival.id_proof_type && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> {arrival.id_proof_type}: {arrival.id_proof_number}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-400">Total Stay</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{Number(arrival.net_amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openCheckInModal(arrival)}
                      className="shadow-sm"
                    >
                      <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                      Check In
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Departures & Check-Out Queue */}
      {activeTab === 'departures' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Scheduled Departures ({filteredDepartures.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Guests checking out today & keycard settlement
                </p>
              </div>
            </div>
          </div>

          {departuresLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              Loading departures...
            </div>
          ) : filteredDepartures.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <UserX className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              No pending departures scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDepartures.map((dept) => (
                <div
                  key={dept.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {dept.customer_name}
                      </span>
                      <Badge variant="occupied">Checked-in</Badge>
                      {dept.hotel_name && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {dept.hotel_name}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Booking: <strong className="font-mono text-slate-700 dark:text-slate-300">{dept.booking_number}</strong></span>
                      <span>•</span>
                      <span>
                        Room: <strong className="text-blue-600 dark:text-blue-400">{dept.room_number || '101'}</strong> ({dept.room_type})
                      </span>
                      <span>•</span>
                      <span>Active Keycard: <strong className="font-mono text-slate-700 dark:text-slate-300">{dept.key_card_issued || 'KEY-101-A'}</strong></span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Checked in: {dept.actual_check_in ? new Date(dept.actual_check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Earlier today'}
                      </span>
                      <span>•</span>
                      <span>Checkout Date: <strong>{dept.check_out_date}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCheckOutModal(dept)}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/50"
                    >
                      <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                      Check Out
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: In-House Active Stays */}
      {activeTab === 'in-house' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Active In-House Stays ({filteredActiveStays.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  All guests currently residing on property
                </p>
              </div>
            </div>
          </div>

          {staysLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-500" />
              Loading active stays...
            </div>
          ) : filteredActiveStays.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              <BedDouble className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              No guests are currently checked in.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActiveStays.map((stay) => (
                <div
                  key={stay.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 hover:border-purple-200 dark:hover:border-purple-900/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {stay.customer_name}
                        </span>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Ref: <span className="font-mono">{stay.booking_number}</span>
                        </div>
                      </div>
                      <Badge variant="occupied">Checked-in</Badge>
                    </div>

                    <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Room:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Room {stay.room_number || '101'} ({stay.room_type})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Keycard:</span>
                        <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          {stay.key_card_issued || 'KEY-101-A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Checked-in By:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {stay.checked_in_by || 'Front Desk'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Departs:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {stay.check_out_date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      {stay.total_guests} Guest{stay.total_guests > 1 ? 's' : ''}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCheckOutModal(stay)}
                    >
                      Express Check-Out <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 4: Room Status Board */}
      {activeTab === 'room-status' && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Real-time Room Status Board
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live occupancy, housekeeping cleanliness, and room allocations
                </p>
              </div>
            </div>

            {/* Room filters */}
            <div className="flex items-center gap-2">
              <select
                value={filterRoomStatus}
                onChange={(e) => setFilterRoomStatus(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Room Statuses</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Maintenance">Maintenance</option>
              </select>

              <select
                value={filterFloor}
                onChange={(e) => setFilterFloor(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Floors</option>
                <option value="1">Floor 1</option>
                <option value="2">Floor 2</option>
                <option value="3">Floor 3</option>
                <option value="4">Floor 4</option>
              </select>
            </div>
          </div>

          {roomsLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
              Loading room board...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              No rooms found matching status or floor filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredRooms.map((room) => {
                const isOccupied = room.status === 'Occupied';
                const isAvailable = room.status === 'Available';
                const isCleaning = room.status === 'Cleaning' || room.housekeeping_status === 'Needs Cleaning';
                const isMaintenance = room.status === 'Maintenance';

                let borderTone = 'border-slate-200 dark:border-white/10';
                let bgTone = 'bg-white dark:bg-slate-900';
                if (isOccupied) {
                  borderTone = 'border-blue-300 dark:border-blue-900/60';
                  bgTone = 'bg-blue-50/30 dark:bg-blue-950/20';
                } else if (isAvailable) {
                  borderTone = 'border-emerald-300 dark:border-emerald-900/60';
                  bgTone = 'bg-emerald-50/30 dark:bg-emerald-950/20';
                } else if (isCleaning) {
                  borderTone = 'border-amber-300 dark:border-amber-900/60';
                  bgTone = 'bg-amber-50/30 dark:bg-amber-950/20';
                } else if (isMaintenance) {
                  borderTone = 'border-rose-300 dark:border-rose-900/60';
                  bgTone = 'bg-rose-50/30 dark:bg-rose-950/20';
                }

                return (
                  <div
                    key={room.id}
                    className={`p-3 rounded-xl border ${borderTone} ${bgTone} flex flex-col justify-between transition-all hover:shadow-md`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-base text-slate-900 dark:text-white">
                          {room.room_number}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Fl. {room.floor}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {room.room_type_name}
                      </div>

                      <div className="mt-2 space-y-1">
                        <Badge
                          variant={
                            room.status === 'Available' ? 'available' :
                            room.status === 'Occupied' ? 'occupied' :
                            room.status === 'Cleaning' ? 'cleaning' : 'maintenance'
                          }
                          size="sm"
                          dot
                        >
                          {room.status}
                        </Badge>

                        <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          Cleanliness: <span className="font-semibold text-slate-700 dark:text-slate-300">{room.housekeeping_status}</span>
                        </div>
                      </div>
                    </div>

                    {room.current_occupant && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px]">
                        <div className="text-slate-400 text-[10px]">Guest:</div>
                        <div className="font-semibold text-blue-600 dark:text-blue-400 truncate">
                          {room.current_occupant}
                        </div>
                        {room.expected_checkout && (
                          <div className="text-[10px] text-slate-400">
                            Until {room.expected_checkout}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Guest Service Requests (Section 10) */}
      {activeTab === 'services' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Guest Service Requests Queue ({serviceRequests.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage incoming concierge, laundry, spa, and guest service dispatches.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold">
              {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setServiceStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    serviceStatusFilter === st
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {servicesLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
              Loading service requests...
            </div>
          ) : serviceRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
              No service requests matching status filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {serviceRequests.map((req) => (
                <Card
                  key={req.id}
                  className="p-5 border-2 border-slate-200/80 dark:border-white/10 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Service Request #{req.id}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                          {req.service_name}
                        </div>
                      </div>
                      <Badge variant={req.request_status} dot>{req.status}</Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div>
                        <strong className="text-slate-900 dark:text-white">Guest:</strong> {req.customer_name || 'Guest'}
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Booking:</strong> #{req.booking_number}
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Tariff:</strong> ₹{Number(req.service_price).toLocaleString('en-IN')}
                      </div>
                      {req.notes && (
                        <div className="pt-1 text-slate-500 dark:text-slate-400 italic border-t border-slate-100 dark:border-white/5">
                          "{req.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions according to Section 10 */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
                    {req.request_status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => updateServiceStatusMutation.mutate({ id: req.id, status: 'accepted' })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateServiceStatusMutation.mutate({ id: req.id, status: 'rejected' })}
                          className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </>
                    )}

                    {req.request_status === 'accepted' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateServiceStatusMutation.mutate({ id: req.id, status: 'in_progress' })}
                        className="text-xs"
                      >
                        <Play className="w-3.5 h-3.5 mr-1" /> Start
                      </Button>
                    )}

                    {req.request_status === 'in_progress' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateServiceStatusMutation.mutate({ id: req.id, status: 'completed' })}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                      </Button>
                    )}

                    {['completed', 'cancelled', 'rejected'].includes(req.request_status) && (
                      <span className="text-xs text-slate-400 italic">Fulfilled</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Express Check-In Modal */}
      <Modal
        isOpen={!!checkInModalData}
        onClose={() => setCheckInModalData(null)}
        title="Express Guest Check-In"
        subtitle={`Reservation Ref: ${checkInModalData?.booking_number}`}
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Guest Card Summary */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-emerald-950 dark:text-emerald-100 text-base">
                {checkInModalData?.customer_name}
              </div>
              <Badge variant="confirmed">Confirmed</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-emerald-900 dark:text-emerald-300">
              <div>
                Room Assigned: <strong className="font-bold text-slate-900 dark:text-white">{checkInModalData?.room_number || '101'}</strong>
              </div>
              <div>
                Room Type: <strong>{checkInModalData?.room_type}</strong>
              </div>
              <div>
                Dates: <strong>{checkInModalData?.check_in_date} → {checkInModalData?.check_out_date}</strong>
              </div>
              <div>
                Party: <strong>{checkInModalData?.total_guests} Guest{checkInModalData && checkInModalData.total_guests > 1 ? 's' : ''}</strong>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Government ID verified at front desk scanner ({checkInModalData?.id_proof_type || 'Passport'}: {checkInModalData?.id_proof_number || 'VERIFIED'})</span>
            </div>
          </div>

          {/* Keycard Input */}
          <div>
            <Input
              label="Digital Keycard RFID / NFC Code"
              value={keyCard}
              onChange={(e) => setKeyCard(e.target.value)}
              helperText="Tap master card on the desk reader or enter assigned card ID"
              leftIcon={<KeyRound className="w-4 h-4 text-emerald-600" />}
              placeholder="e.g. KEY-101-A"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Front Desk Remarks (Optional)
            </label>
            <input
              type="text"
              value={checkInRemarks}
              onChange={(e) => setCheckInRemarks(e.target.value)}
              placeholder="e.g. Late checkout requested, extra key issued"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
            <Button
              variant="ghost"
              onClick={() => setCheckInModalData(null)}
              disabled={checkInMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCheckIn}
              isLoading={checkInMutation.isPending}
              className="shadow-sm"
            >
              Confirm Check-In & Issue Key
            </Button>
          </div>
        </div>
      </Modal>

      {/* Express Check-Out Modal */}
      <Modal
        isOpen={!!checkOutModalData}
        onClose={() => setCheckOutModalData(null)}
        title="Express Guest Check-Out"
        subtitle={`Booking Ref: ${checkOutModalData?.booking_number}`}
        maxWidth="md"
      >
        <div className="space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 space-y-2">
            <div className="font-bold text-blue-950 dark:text-blue-100 text-base">
              {checkOutModalData?.customer_name}
            </div>

            <div className="text-xs text-blue-900 dark:text-blue-300">
              Vacating Room: <strong className="font-bold text-slate-900 dark:text-white">{checkOutModalData?.room_number || '101'}</strong> ({checkOutModalData?.room_type})
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Room will transition to <strong>Available</strong>, and housekeeping will be notified (<strong>Needs Cleaning</strong>).</span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Settlement / Checkout Notes (Optional)
            </label>
            <input
              type="text"
              value={checkOutRemarks}
              onChange={(e) => setCheckOutRemarks(e.target.value)}
              placeholder="e.g. Minibar verified, keycard returned"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5">
            <Button
              variant="ghost"
              onClick={() => setCheckOutModalData(null)}
              disabled={checkOutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCheckOut}
              isLoading={checkOutMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              Confirm Check-Out & Dispatch Cleaning
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
