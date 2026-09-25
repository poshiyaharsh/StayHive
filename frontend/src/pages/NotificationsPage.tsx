import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Clock, Sparkles, Calendar, DollarSign,
  Utensils, CheckSquare, AlertOctagon, HelpCircle, Star, Shield,
  Check, Filter, RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  NotificationItem
} from '../hooks/useNotifications';

export const NotificationsPage: React.FC = () => {
  const [filterUnread, setFilterUnread] = useState(false);
  const { data, isLoading, refetch } = useNotifications(filterUnread ? { is_read: false } : undefined);
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];

  const getTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('booking') || t.includes('check_in') || t.includes('check_out')) {
      return <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    if (t.includes('payment') || t.includes('refund') || t.includes('invoice')) {
      return <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
    if (t.includes('food') || t.includes('order')) {
      return <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
    if (t.includes('housekeeping') || t.includes('clean') || t.includes('service')) {
      return <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
    if (t.includes('complaint')) {
      return <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
    }
    if (t.includes('feedback')) {
      return <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
    }
    if (t.includes('inquiry')) {
      return <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
    return <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  const getTypeBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('booking')) return <Badge variant="info">Booking</Badge>;
    if (t.includes('payment')) return <Badge variant="success">Payment</Badge>;
    if (t.includes('refund')) return <Badge variant="warning">Refund</Badge>;
    if (t.includes('food')) return <Badge variant="secondary">Dining</Badge>;
    if (t.includes('service')) return <Badge variant="info">Service</Badge>;
    if (t.includes('housekeeping')) return <Badge variant="secondary">Housekeeping</Badge>;
    if (t.includes('complaint')) return <Badge variant="danger">Complaint</Badge>;
    if (t.includes('feedback')) return <Badge variant="success">Feedback</Badge>;
    if (t.includes('inquiry')) return <Badge variant="warning">Inquiry</Badge>;
    return <Badge variant="secondary">System</Badge>;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" /> Live Notification Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time business events, customer requests, operations, and billing updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All Read ({unreadCount})
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        <button
          onClick={() => setFilterUnread(false)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            !filterUnread
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            filterUnread
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread Only
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <Card className="divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <CheckCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">All caught up!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {filterUnread
                ? 'You have zero unread notifications. New alerts will show up here in real time.'
                : 'No notifications recorded yet.'}
            </p>
          </div>
        ) : (
          notifications.map((n: NotificationItem) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                !n.is_read
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getTypeIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm font-bold ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </h3>
                    {getTypeBadge(n.type)}
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 whitespace-nowrap">
                    {formatDate(n.created_at)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {n.message}
                </p>

                {!n.is_read && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      disabled={markReadMutation.isPending}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark as read
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
};
