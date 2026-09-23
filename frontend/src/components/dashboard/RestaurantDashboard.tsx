import React from 'react';
import { motion } from 'framer-motion';
import {
  Utensils, Coffee, Clock, CheckCircle2, AlertCircle, ArrowRight,
  User, Check
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDatabase } from '../../context/DatabaseContext';

export const RestaurantDashboard: React.FC = () => {
  const { foodOrders, updateOrderStatus } = useDatabase();

  const columns = [
    { id: 'Pending', label: 'Incoming Orders', color: 'border-amber-400' },
    { id: 'Preparing', label: 'In Kitchen (Cooking)', color: 'border-indigo-400' },
    { id: 'Ready', label: 'Ready for Service', color: 'border-teal-400' },
    { id: 'Delivered', label: 'Delivered to Room', color: 'border-emerald-400' },
  ];

  const handleNextStatus = async (orderId: number, currentStatus: string) => {
    const transitions: Record<string, string> = {
      Pending: 'Preparing',
      Preparing: 'Ready',
      Ready: 'Delivered',
    };
    const next = transitions[currentStatus];
    if (next) {
      await updateOrderStatus(orderId, next);
    }
  };

  return (
    <div className="space-y-8">
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
            Real-time in-room dining orders, kitchen preparation status, and runner delivery logs.
          </p>
        </div>
      </div>

      {/* KOT Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const ordersInCol = foodOrders.filter(o => o.status === col.id);
          return (
            <div key={col.id} className="space-y-3">
              <div className={`p-3.5 rounded-2xl bg-white dark:bg-[#111827] border-t-4 ${col.color} border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between`}>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{col.label}</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  {ordersInCol.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {ordersInCol.length === 0 ? (
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
                          <span className="text-xs font-bold text-slate-400">KOT #{order.id}</span>
                          <div className="text-base font-extrabold text-slate-900 dark:text-white">
                            Room {order.room_number || '101'}
                          </div>
                        </div>
                        <Badge variant={order.status.toLowerCase()} dot>
                          {order.status}
                        </Badge>
                      </div>

                      {/* Items Ordered list */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((it) => (
                            <div key={it.id} className="flex items-center justify-between text-xs">
                              <span className="text-slate-700 dark:text-slate-200 font-medium">
                                <span className="font-bold text-blue-600 dark:text-blue-400 mr-1.5">{it.quantity}x</span>
                                {it.food_name}
                              </span>
                              <span className="text-slate-400">₹{it.subtotal}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500">1x Dal Makhani, 1x Paneer Tikka</div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Total: ₹{Number(order.total_amount).toLocaleString('en-IN')}
                        </span>
                        {order.status !== 'Delivered' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleNextStatus(order.id, order.status)}
                            className="text-xs py-1 px-2.5"
                          >
                            Advance →
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
