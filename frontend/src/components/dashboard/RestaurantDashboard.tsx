import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, Coffee, Clock, CheckCircle2, AlertCircle, ArrowRight,
  User, Check, RefreshCw, ChefHat, Flame, Bell, DollarSign
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  useFoodOrders,
  useFoodOrderStats,
  useUpdateOrderStatus,
  FoodOrderDetail
} from '../../hooks/useRestaurant';

export const RestaurantDashboard: React.FC = () => {
  const { data: foodOrders = [], isLoading: ordersLoading, refetch: refetchOrders } = useFoodOrders();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useFoodOrderStats();
  const updateStatusMutation = useUpdateOrderStatus();

  const handleRefresh = () => {
    refetchOrders();
    refetchStats();
  };

  const columns = [
    {
      id: 'Pending',
      statusKeys: ['Pending', 'Accepted'],
      label: 'Incoming Orders',
      color: 'border-amber-400',
      badgeColor: 'bg-amber-500',
      nextLabel: 'Accept & Cook',
      nextStatus: 'Preparing',
      icon: Bell,
    },
    {
      id: 'Preparing',
      statusKeys: ['Preparing'],
      label: 'In Kitchen (Cooking)',
      color: 'border-indigo-400',
      badgeColor: 'bg-indigo-500',
      nextLabel: 'Mark Ready',
      nextStatus: 'Ready',
      icon: Flame,
    },
    {
      id: 'Ready',
      statusKeys: ['Ready'],
      label: 'Ready for Service',
      color: 'border-teal-400',
      badgeColor: 'bg-teal-500',
      nextLabel: 'Deliver to Room',
      nextStatus: 'Delivered',
      icon: ChefHat,
    },
    {
      id: 'Delivered',
      statusKeys: ['Delivered'],
      label: 'Delivered Today',
      color: 'border-emerald-400',
      badgeColor: 'bg-emerald-500',
      nextLabel: null,
      nextStatus: null,
      icon: CheckCircle2,
    },
  ];

  const handleAdvance = async (orderId: number, nextStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, nextStatus });
    } catch {
      // Toast notification is handled by the hook
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-semibold mb-2">
            <Utensils className="w-3.5 h-3.5" /> Kitchen Order Ticket (KOT) Terminal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Live Kitchen Display System (KDS)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time in-room dining orders, kitchen preparation queue, and runner delivery logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1.5"
            title="Refresh KDS Terminal"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            KDS Terminal Live
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Incoming Orders
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.pending_count ?? 0)}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Bell className="w-3 h-3" /> Awaiting kitchen acceptance
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Bell className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                In Kitchen (Cooking)
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.preparing_count ?? 0)}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Under active preparation
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Flame className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-teal-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ready for Service
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.ready_count ?? 0)}
              </h3>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
                <ChefHat className="w-3 h-3" /> Plated & awaiting runner
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Delivered Today
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {statsLoading ? '...' : (stats?.delivered_today_count ?? 0)}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> ₹{(stats?.today_food_revenue ?? 0).toLocaleString('en-IN')} food revenue
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* KOT Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const ordersInCol = foodOrders.filter(o => col.statusKeys.includes(o.status));
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="space-y-3">
              <div className={`p-3.5 rounded-2xl bg-white dark:bg-[#111827] border-t-4 ${col.color} border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{col.label}</span>
                </div>
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  {ordersInCol.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {ordersLoading ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading KOTs...
                  </div>
                ) : ordersInCol.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    No orders in this stage
                  </div>
                ) : (
                  ordersInCol.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">KOT #{order.id}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              Ref: {order.booking_number}
                            </span>
                          </div>
                          <div className="text-base font-extrabold text-slate-900 dark:text-white">
                            Room {order.room_number || '101'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {order.customer_name}
                          </div>
                        </div>
                        <Badge
                          variant={
                            order.status === 'Delivered' ? 'delivered' :
                            order.status === 'Preparing' ? 'preparing' :
                            order.status === 'Ready' ? 'ready' : 'pending'
                          }
                          dot
                        >
                          {order.status}
                        </Badge>
                      </div>

                      {/* Items Ordered list */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((it) => (
                            <div key={it.id || it.order_item_id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 dark:text-slate-200 font-medium">
                                <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5">{it.quantity}x</span>
                                {it.food_name}
                              </span>
                              <span className="text-slate-400">₹{Number(it.subtotal).toLocaleString('en-IN')}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500">In-room dining items</div>
                        )}
                      </div>

                      {/* Footer & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {order.payment_status}
                          </div>
                        </div>

                        {col.nextStatus && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAdvance(order.id, col.nextStatus!)}
                            isLoading={updateStatusMutation.isPending}
                            className="text-xs py-1 px-3 shadow-sm"
                          >
                            {col.nextLabel} →
                          </Button>
                        )}

                        {order.status === 'Delivered' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Served
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
