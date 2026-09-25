import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hotel, BedDouble, Calendar, DollarSign, Users, Sparkles, CheckCircle2,
  Clock, ArrowUpRight, ArrowRight, ShieldCheck, TrendingUp, BarChart3, RefreshCw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { StatCard } from './StatCard';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDatabase } from '../../context/DatabaseContext';
import { useAnalyticsOverview, AnalyticsFilterParams } from '../../hooks/useAnalytics';

export const AdminDashboard: React.FC = () => {
  const { analytics, bookings, hotels, rooms, loading } = useDatabase();
  const [period, setPeriod] = useState<AnalyticsFilterParams['period']>('this_month');
  const { data: liveOverview, isLoading: analyticsLoading, refetch } = useAnalyticsOverview({ period });
  const navigate = useNavigate();

  const revTrends = analytics?.revenue_trends || [
    { month: 'Apr', revenue: 342000, bookings: 88 },
    { month: 'May', revenue: 395000, bookings: 104 },
    { month: 'Jun', revenue: 420000, bookings: 112 },
    { month: 'Jul', revenue: 410000, bookings: 98 },
    { month: 'Aug', revenue: 465000, bookings: 128 },
    { month: 'Sep', revenue: 482500, bookings: 142 },
  ];

  const occupancyData = analytics?.room_status_distribution || [
    { name: 'Available', value: 5, color: '#10B981' },
    { name: 'Occupied', value: 4, color: '#2563EB' },
    { name: 'Cleaning', value: 1, color: '#EAB308' },
    { name: 'Reserved', value: 1, color: '#8B5CF6' },
    { name: 'Maintenance', value: 1, color: '#F97316' },
  ];

  const sourcesData = analytics?.booking_sources || [
    { source: 'Direct Website', percentage: 52, color: '#2563EB' },
    { source: 'Corporate Tie-ups', percentage: 24, color: '#6366F1' },
    { source: 'OTAs & Partners', percentage: 16, color: '#06B6D4' },
    { source: 'Walk-ins', percentage: 8, color: '#F59E0B' },
  ];

  const liveHotelsCount = hotels.length || analytics?.total_hotels || 4;
  const liveTotalRooms = liveOverview?.rooms?.total ?? rooms.length ?? analytics?.total_rooms ?? 12;
  const liveAvailableRooms = liveOverview?.rooms?.available ?? (rooms.length > 0
    ? rooms.filter(r => r.status === 'Available').length
    : (analytics?.available_rooms ?? 7));
  const liveOccupiedRooms = liveOverview?.rooms?.occupied ?? (rooms.length > 0
    ? rooms.filter(r => r.status === 'Occupied').length
    : (analytics?.occupied_rooms ?? 3));
  const liveOccupancyRate = liveOverview?.rooms?.occupancy_rate ?? (liveTotalRooms > 0
    ? Math.round((liveOccupiedRooms / liveTotalRooms) * 100)
    : (analytics?.occupancy_rate || 25));
  const liveRevenue = liveOverview?.revenue?.net_revenue ?? liveOverview?.revenue?.total ?? analytics?.total_revenue ?? 482500;
  const liveActiveBookings = liveOverview?.bookings?.total ?? analytics?.active_bookings ?? bookings.length ?? 5;

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> StayHive Executive Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good Morning, Aditya
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative management analytics, occupancy metrics & live business operations.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
            {(['today', 'this_week', 'this_month', 'all'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
            <BarChart3 className="w-3.5 h-3.5 mr-1" /> Reports & Audits
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/rooms')}>
            Manage Rooms
          </Button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Hotels"
          value={liveHotelsCount}
          change="+1 New"
          isPositive={true}
          icon={Hotel}
          iconColor="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Available Rooms"
          value={liveAvailableRooms}
          change="Ready to Sell"
          isPositive={true}
          icon={BedDouble}
          iconColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
        />
        <StatCard
          title="Occupied Rooms"
          value={liveOccupiedRooms}
          change={`${liveOccupancyRate}% Rate`}
          isPositive={true}
          icon={Users}
          iconColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatCard
          title="Total Net Revenue"
          value={`₹${Number(liveRevenue).toLocaleString('en-IN')}`}
          change="+14.2%"
          isPositive={true}
          timeframe={period ? period.replace('_', ' ') : 'vs last month'}
          icon={DollarSign}
          iconColor="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        />
        <StatCard
          title="Today's Check-ins"
          value={analytics?.todays_checkins ?? 4}
          change="3 Arrived"
          isPositive={true}
          icon={CheckCircle2}
          iconColor="bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400"
        />
        <StatCard
          title="Today's Check-outs"
          value={analytics?.todays_checkouts ?? 2}
          change="Turnover In Progress"
          isPositive={true}
          icon={Clock}
          iconColor="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
        />
        <StatCard
          title="Active Bookings"
          value={liveActiveBookings}
          change="+8 This Week"
          isPositive={true}
          icon={Calendar}
          iconColor="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
        />
        <StatCard
          title="F&B & Services"
          value={`₹${((analytics?.food_revenue || 54800) + (analytics?.service_revenue || 43500)).toLocaleString('en-IN')}`}
          change="+22.5%"
          isPositive={true}
          icon={TrendingUp}
          iconColor="bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview (Area Chart) */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Revenue Overview</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly gross booking performance (INR)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Gross Revenue</span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Room Status Distribution Donut */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Room Inventory Status</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Real-time room occupancy & turnover</p>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            {occupancyData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Bookings Quick Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Guest Reservations</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live booking activity and stay details</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-xs text-slate-400 uppercase">
                <th className="py-3 px-4 font-semibold">Booking ID</th>
                <th className="py-3 px-4 font-semibold">Guest</th>
                <th className="py-3 px-4 font-semibold">Property</th>
                <th className="py-3 px-4 font-semibold">Dates</th>
                <th className="py-3 px-4 font-semibold">Net Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">{b.booking_number}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{b.customer_name}</div>
                    <div className="text-xs text-slate-400">{b.customer_phone}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{b.hotel_name}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {b.check_in_date} → {b.check_out_date}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    ₹{Number(b.net_amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={b.status} dot>{b.status}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/bookings/${b.id}`)}>
                      Details
                    </Button>
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
