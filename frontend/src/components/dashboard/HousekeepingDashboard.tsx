import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare, Sparkles, Clock, AlertTriangle, CheckCircle2,
  BedDouble, User, RefreshCw
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDatabase } from '../../context/DatabaseContext';

export const HousekeepingDashboard: React.FC = () => {
  const { housekeepingTasks, updateHousekeepingTask } = useDatabase();
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const columns = [
    { id: 'Pending', label: 'Pending Dispatch', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'Cleaning', label: 'Cleaning In Progress', color: 'border-amber-400 dark:border-amber-600' },
    { id: 'Inspection', label: 'Supervisor Inspection', color: 'border-blue-400 dark:border-blue-600' },
    { id: 'Completed', label: 'Sanitized & Ready', color: 'border-emerald-400 dark:border-emerald-600' },
  ];

  const filteredTasks = filterPriority === 'all'
    ? housekeepingTasks
    : housekeepingTasks.filter(t => t.priority.toLowerCase() === filterPriority.toLowerCase());

  const handleAdvanceStatus = async (taskId: number, currentStatus: string) => {
    const nextStatusMap: Record<string, string> = {
      Pending: 'Cleaning',
      Cleaning: 'Inspection',
      Inspection: 'Completed',
    };
    const next = nextStatusMap[currentStatus];
    if (next) {
      await updateHousekeepingTask(taskId, next);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Housekeeping & Sanitation Grid
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Housekeeping Dispatch Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time turnover cleaning tasks, priority escalations and supervisor approvals.
          </p>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-medium">
          {['all', 'urgent', 'high', 'medium'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                filterPriority === p
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="space-y-3">
              <div className={`p-3.5 rounded-2xl bg-white dark:bg-[#111827] border-t-4 ${col.color} border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between`}>
                <span className="font-bold text-sm text-slate-900 dark:text-white">{col.label}</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[400px]">
                {colTasks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                    No tasks in {col.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            Room {task.room_number}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">Floor {task.room_floor}</span>
                        </div>
                        <Badge variant={task.priority.toLowerCase()} dot>
                          {task.priority}
                        </Badge>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {task.task_type}
                      </div>

                      {task.notes && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 line-clamp-2">
                          "{task.notes}"
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {task.staff_name || 'Staff Suresh K.'}
                        </span>
                        {task.status !== 'Completed' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAdvanceStatus(task.id, task.status)}
                            className="text-xs py-1 px-2.5"
                          >
                            Advance →
                          </Button>
                        )}
                        {task.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" /> Ready
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
