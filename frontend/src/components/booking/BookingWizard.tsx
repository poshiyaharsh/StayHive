import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  BedDouble, User, Tag, CreditCard, CheckCircle2, ArrowRight,
  ArrowLeft, Calendar, ShieldCheck, QrCode, Sparkles, Building,
  Star, MapPin, Users, Check, ChevronRight, Download, Eye, Loader2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { StatusBadge } from '../ui/StatusBadge';
import { Stepper, StepItem } from '../ui/Stepper';
import { useDatabase } from '../../context/DatabaseContext';
import { useAuth } from '../../context/AuthContext';
import { useAvailability, useCreateBooking, useValidateOffer } from '../../hooks/useBookings';

export const BookingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hotels, rooms } = useDatabase();
  const createBookingMutation = useCreateBooking();
  const validateOfferMutation = useValidateOffer();

  // Stay dates default: tomorrow to 3 days later
  const getDefaultDates = () => {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 1);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 4);
    return {
      in: d1.toISOString().split('T')[0],
      out: d2.toISOString().split('T')[0]
    };
  };

  const defaultDates = getDefaultDates();

  const [step, setStep] = useState<number>(1);
  const [selectedHotelId, setSelectedHotelId] = useState<number>(1);
  const [selectedRoomId, setSelectedRoomId] = useState<number>(2);
  const [checkInDate, setCheckInDate] = useState(defaultDates.in);
  const [checkOutDate, setCheckOutDate] = useState(defaultDates.out);
  const [guests, setGuests] = useState(2);
  const [specialPreferences, setSpecialPreferences] = useState<string[]>(['High Floor Room']);

  // Real-time Availability Query
  const { data: availabilityData, isLoading: isCheckingAvailability } = useAvailability({
    hotel_id: selectedHotelId,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    guests,
  });

  // Guest details (autofilled from authenticated user if available)
  const [guestName, setGuestName] = useState(
    user ? `${user.first_name} ${user.last_name}`.trim() : 'Rahul Sharma'
  );
  const [guestEmail, setGuestEmail] = useState(user?.email || 'rahul.sharma@gmail.com');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+91 98220 11223');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('9845 2314 7890');
  const [specialNotes, setSpecialNotes] = useState('Anniversary trip, requested quiet room with sea/garden view.');

  // Update guest details if user loads in later
  useEffect(() => {
    if (user) {
      if (user.first_name || user.last_name) {
        setGuestName(`${user.first_name} ${user.last_name}`.trim());
      }
      if (user.email) setGuestEmail(user.email);
      if (user.phone) setGuestPhone(user.phone);
    }
  }, [user]);

  // Promo code
  const [couponCode, setCouponCode] = useState('SUMMER15');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(15);
  const [couponApplied, setCouponApplied] = useState(true);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('rahul@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('•••');
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const isSubmitting = createBookingMutation.isPending;

  // Derivations
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId) || hotels[0] || {
    id: 1,
    name: 'StayHive Grand Ahmedabad',
    city: 'Ahmedabad',
    address: 'SG Highway, Bodakdev',
    star_rating: 4.9,
  };

  // Use real available rooms if returned from availability API, otherwise fallback to DB available rooms
  const availableRooms = (availabilityData?.available_rooms && availabilityData.available_rooms.length > 0)
    ? availabilityData.available_rooms
    : rooms.filter((r) => r.hotel_id === selectedHotelId && r.status !== 'Maintenance');

  const selectedRoom = availableRooms.find((r) => r.id === selectedRoomId) || availableRooms[0] || rooms[0] || {
    id: 2,
    room_number: '102',
    price_per_night: 4500,
    room_type_name: 'Deluxe Suite',
    capacity: 2,
  };

  // Keep selectedRoomId in sync if current selection is not available
  useEffect(() => {
    if (availableRooms.length > 0 && !availableRooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(availableRooms[0].id);
    }
  }, [availableRooms, selectedRoomId]);

  // Calculate nights
  const calcNights = () => {
    try {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 3;
    }
  };

  const nights = calcNights();
  const pricePerNight = Number(selectedRoom?.price_per_night) || 4500;
  const subtotal = pricePerNight * nights;
  const discountAmount = couponApplied ? (subtotal * appliedDiscountPercent) / 100 : 0;
  const netAmount = subtotal - discountAmount;
  const gstTax = netAmount * 0.18; // 18% GST (9% CGST + 9% SGST)
  const grandTotal = netAmount + gstTax;

  const steps: StepItem[] = [
    { id: 1, label: 'Property & Suite', icon: BedDouble },
    { id: 2, label: 'Guest Details', icon: User },
    { id: 3, label: 'Payment', icon: CreditCard },
    { id: 4, label: 'Confirmation', icon: CheckCircle2 },
  ];

  const hotelOptions = hotels.map((h) => ({
    value: h.id,
    label: h.name,
    sublabel: `${h.city} • ★ ${h.star_rating || '5.0'}`,
    icon: <Building className="w-4 h-4 text-indigo-600" />,
  }));

  const roomOptions = availableRooms.map((r) => ({
    value: r.id,
    label: `Room ${r.room_number} — ${r.room_type_name || 'Luxury Suite'}`,
    sublabel: `₹${Number(r.price_per_night).toLocaleString('en-IN')}/night • Up to ${r.capacity || 2} Guests`,
    icon: <BedDouble className="w-4 h-4 text-indigo-600" />,
  }));

  const idOptions = [
    { value: 'Aadhaar Card', label: 'Aadhaar Card (National ID)' },
    { value: 'Passport', label: 'Passport (International Guests)' },
    { value: 'Driving License', label: 'Driving License' },
    { value: 'Voter ID', label: 'Voter ID Card' },
  ];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await validateOfferMutation.mutateAsync({
        code: couponCode.trim(),
        amount: subtotal
      });
      if (res?.discount_percentage) {
        setAppliedDiscountPercent(Number(res.discount_percentage));
        setCouponApplied(true);
      }
    } catch {
      // Local fallback for demo coupons
      if (couponCode.toUpperCase() === 'SUMMER15') {
        setAppliedDiscountPercent(15);
        setCouponApplied(true);
      } else if (couponCode.toUpperCase() === 'ROYALSTAY') {
        setAppliedDiscountPercent(25);
        setCouponApplied(true);
      } else {
        setCouponApplied(false);
      }
    }
  };

  const handleFinishBooking = async () => {
    try {
      const res = await createBookingMutation.mutateAsync({
        hotel_id: selectedHotelId,
        room_id: selectedRoom?.id || selectedRoomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        total_guests: guests,
        offer_code: couponApplied ? couponCode : undefined,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        id_proof_type: idProofType,
        id_proof_number: idProofNumber,
        special_notes: specialNotes,
      });

      setConfirmedBooking(
        res || {
          booking_number: `SH-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          hotel_name: selectedHotel?.name,
          net_amount: grandTotal,
          created_at: new Date().toISOString(),
        }
      );

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setStep(4);
    } catch (e) {
      console.error('Booking submission error:', e);
    }
  };

  const togglePreference = (pref: string) => {
    if (specialPreferences.includes(pref)) {
      setSpecialPreferences(specialPreferences.filter((p) => p !== pref));
    } else {
      setSpecialPreferences([...specialPreferences, pref]);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/bookings" className="hover:text-indigo-600 transition-colors">
          Bookings
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white">New Reservation</span>
      </div>

      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> StayHive Verified Reservation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Book Your Luxury Stay
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select your preferred property, suite category, stay dates, and guest folio details.
          </p>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <Card className="p-6">
        <Stepper steps={steps} currentStep={step} onStepClick={(s) => setStep(s)} />
      </Card>

      {/* Main Multi-Step Content Area */}
      {step < 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Configuration Forms (7 or 8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Property, Suite & Stay Dates */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Destination Hotel Card */}
                  <Card className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Destination Hotel
                        </h2>
                        <p className="text-xs text-slate-400">
                          Choose from our flagship heritage and luxury properties
                        </p>
                      </div>
                    </div>

                    <Select
                      label="Select Property"
                      value={selectedHotelId}
                      onChange={(v) => setSelectedHotelId(Number(v))}
                      options={hotelOptions}
                      placeholder="Choose StayHive property"
                      searchable
                    />

                    {/* Selected Hotel Preview Banner */}
                    {selectedHotel && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {selectedHotel.name}
                            <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                              ★ {selectedHotel.star_rating || 5.0}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {selectedHotel.address}, {selectedHotel.city}
                          </div>
                        </div>
                        <StatusBadge status="Available for Booking" variant="available" size="sm" />
                      </div>
                    )}
                  </Card>

                  {/* Suite Category Card */}
                  <Card className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                        <BedDouble className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Suite Category & Room Selection
                        </h2>
                        <p className="text-xs text-slate-400">
                          Handpicked luxury suites sanitized according to hospital-grade standards
                        </p>
                      </div>
                    </div>

                    <Select
                      label="Suite / Room"
                      value={selectedRoomId}
                      onChange={(v) => setSelectedRoomId(Number(v))}
                      options={roomOptions}
                      placeholder={isCheckingAvailability ? "Checking availability..." : "Select available suite"}
                    />
                    {isCheckingAvailability ? (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5 pt-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying real-time suite availability...
                      </p>
                    ) : availableRooms.length > 0 ? (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                        <Check className="w-3.5 h-3.5" /> {availableRooms.length} suite{availableRooms.length > 1 ? 's' : ''} available for these stay dates
                      </p>
                    ) : (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
                        No suites available for the selected dates. Please adjust your stay dates.
                      </p>
                    )}

                    {/* Quick Room Features */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900 text-center">
                        <div className="text-[11px] text-slate-400">Room No.</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                          #{selectedRoom.room_number}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900 text-center">
                        <div className="text-[11px] text-slate-400">Bedding</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                          King Bed
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900 text-center">
                        <div className="text-[11px] text-slate-400">Capacity</div>
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                          2 Adults
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200/80 dark:border-white/5 bg-white dark:bg-slate-900 text-center">
                        <div className="text-[11px] text-slate-400">Base Tariff</div>
                        <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          ₹{pricePerNight.toLocaleString('en-IN')}/n
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Dates & Guests */}
                  <Card className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Stay Dates & Guests
                        </h2>
                        <p className="text-xs text-slate-400">
                          Check-in begins at 14:00 • Check-out by 11:00
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <DatePicker
                        label="Check-In Date"
                        value={checkInDate}
                        onChange={(d) => setCheckInDate(d)}
                        minDate={new Date().toISOString().split('T')[0]}
                      />

                      <DatePicker
                        label="Check-Out Date"
                        value={checkOutDate}
                        onChange={(d) => setCheckOutDate(d)}
                        minDate={checkInDate}
                      />

                      {/* Guest Counter */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Total Guests
                        </label>
                        <div className="h-11.5 px-3 flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {guests} {guests === 1 ? 'Guest' : 'Guests'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGuests(Math.min(4, guests + 1))}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stay Preferences */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Complimentary Stay Preferences
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['High Floor Room', 'Early Check-in (12 PM)', 'Express Airport Transfer', 'Extra Feather Pillows'].map((p) => {
                          const isSelected = specialPreferences.includes(p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => togglePreference(p)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-white/10 dark:text-slate-300 hover:border-slate-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 2: Guest Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Primary Guest Information
                        </h2>
                        <p className="text-xs text-slate-400">
                          Details required for digital room key issuance and Government ID verification
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="e.g. rahul@example.com"
                      />

                      <Input
                        label="Phone Number"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+91 98220 11223"
                      />

                      <Select
                        label="Identification Type"
                        value={idProofType}
                        onChange={(v) => setIdProofType(v)}
                        options={idOptions}
                      />

                      <div className="sm:col-span-2">
                        <Input
                          label="ID Proof Number"
                          value={idProofNumber}
                          onChange={(e) => setIdProofNumber(e.target.value)}
                          placeholder="e.g. 9845 2314 7890"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Special Requests & Notes (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={specialNotes}
                          onChange={(e) => setSpecialNotes(e.target.value)}
                          placeholder="Dietary preferences, arrival time, or special occasions..."
                          className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 3: Payment & Folio */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <Card className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white">
                          Select Payment Method
                        </h2>
                        <p className="text-xs text-slate-400">
                          Encrypted 256-bit SSL transaction via StayHive Gateway
                        </p>
                      </div>
                    </div>

                    {/* Method Selector Tabs */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'upi', label: 'UPI / QR', desc: 'Google Pay, PhonePe, Paytm' },
                        { id: 'card', label: 'Credit / Debit', desc: 'Visa, Mastercard, RuPay' },
                        { id: 'netbanking', label: 'Corporate Billing', desc: 'Direct NetBanking' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`p-3.5 rounded-2xl border text-left transition-all ${
                            paymentMethod === m.id
                              ? 'bg-indigo-50/70 border-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-700 shadow-sm ring-2 ring-indigo-500/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Method Detail Form */}
                    {paymentMethod === 'upi' && (
                      <div className="space-y-3 pt-2">
                        <Input
                          label="UPI VPA ID"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okbank"
                        />
                        <p className="text-xs text-slate-400">
                          A payment collect request will be pushed directly to your UPI mobile app.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-4 pt-2">
                        <Input
                          label="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 0000 0000 0000"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="Expiry Date"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                          />
                          <Input
                            label="CVV"
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'netbanking' && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        Corporate billing authorized. Invoice will be forwarded directly to your registered company tax folio.
                      </div>
                    )}

                    {/* Promotional Voucher Input */}
                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Promotional Coupon
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. SUMMER15"
                          className="flex-1 h-11.5 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm font-semibold tracking-wider text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <Button variant="secondary" onClick={handleApplyCoupon}>
                          Apply
                        </Button>
                      </div>
                      {couponApplied && (
                        <p className="mt-1.5 text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Coupon '{couponCode}' applied ({appliedDiscountPercent}% OFF)
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Navigation Bottom Controls */}
            <div className="flex items-center justify-between pt-2">
              {step > 1 ? (
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setStep(step - 1)}
                >
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {step === 1 && (
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setStep(2)}
                >
                  Continue to Guest Details
                </Button>
              )}

              {step === 2 && (
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setStep(3)}
                >
                  Continue to Payment
                </Button>
              )}

              {step === 3 && (
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  onClick={handleFinishBooking}
                >
                  Confirm & Pay ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Booking Summary Folio (4 cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <Card className="p-6 border border-slate-200/90 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Booking Summary
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Best Rate Guaranteed
                </span>
              </div>

              {/* Property & Room Snapshot */}
              <div className="py-4 border-b border-slate-100 dark:border-white/5 space-y-2">
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedHotel.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedHotel.city}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {selectedRoom.room_type_name || 'Deluxe Suite'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Room #{selectedRoom.room_number} • {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{pricePerNight.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">/ night</div>
                  </div>
                </div>
              </div>

              {/* Date Breakdown */}
              <div className="py-4 border-b border-slate-100 dark:border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Stay Dates</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {checkInDate} → {checkOutDate}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {nights} {nights === 1 ? 'Night' : 'Nights'}
                  </span>
                </div>
              </div>

              {/* Itemized Folio Pricing */}
              <div className="py-4 border-b border-slate-100 dark:border-white/5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>
                    Tariff (₹{pricePerNight.toLocaleString('en-IN')} × {nights}n)
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {couponApplied && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-semibold">
                    <span>Promo Discount ({couponCode})</span>
                    <span>−₹{Math.round(discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Taxes & GST (18%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{Math.round(gstTax).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 pb-2 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Payable</span>
                  <span className="text-[11px] text-slate-400">All Taxes Included</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quick Action Button */}
              {step === 1 && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setStep(2)}
                >
                  Continue to Guest Details
                </Button>
              )}

              {step === 2 && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setStep(3)}
                >
                  Continue to Payment
                </Button>
              )}

              {step === 3 && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  isLoading={isSubmitting}
                  onClick={handleFinishBooking}
                >
                  Confirm & Pay
                </Button>
              )}
            </Card>

            {/* Trust Badges */}
            <div className="px-4 py-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-center gap-6 text-slate-400 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Free Cancellation
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Instant Keycard
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 4: Confirmation Celebration View */
        <motion.div
          key="step4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto space-y-6"
        >
          <Card className="p-8 sm:p-10 text-center space-y-6 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60">
                Reservation Confirmed & Synchronized
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Welcome to StayHive, {guestName.split(' ')[0]}!
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Your reservation at <span className="font-semibold text-slate-900 dark:text-white">{selectedHotel.name}</span> has been confirmed. A digital keycard folio has been delivered to <span className="font-semibold">{guestEmail}</span>.
              </p>
            </div>

            {/* Boarding Pass Folio */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Booking Reference
                  </div>
                  <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
                    {confirmedBooking?.booking_number || 'SH-2026-95963E'}
                  </div>
                </div>
                <StatusBadge status="Confirmed" variant="confirmed" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-slate-400">Suite</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    Room #{selectedRoom.room_number}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Check-In</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {checkInDate} (14:00)
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Check-Out</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {checkOutDate} (11:00)
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Guests</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {guests} Adults
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Paid Amount</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Digital Key</div>
                  <div className="font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" /> Active in Portal
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Eye className="w-4 h-4" />}
                onClick={() => navigate('/my-bookings')}
              >
                View in My Bookings
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
