import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare, Sparkles, Clock, AlertTriangle, CheckCircle2,
  BedDouble, User, RefreshCw, Plus, Play, Check, Filter,
  Layers, Calendar, ChevronRight, LayoutGrid, List
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import {
  useHousekeepingTasks,
  useMyHousekeepingTasks,
  useCreateHousekeepingTask,
  useUpdateHousekeepingTaskStatus,
  useHousekeepingRoomBoard,
  HousekeepingTaskItem
} from '../../hooks/useHousekeeping';
import { useRooms } from '../../hooks/useRooms';

export const HousekeepingDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const isHousekeepingStaff = role === 'HOUSEKEEPING';
  const isAdminOrManager = ['ADMIN', 'MANAGER'].includes(role);

  // States
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeView, setActiveView] = useState<'kanban' | 'table' | 'room-board'>('kanban');

  // New task modal
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('4'); // Suresh Kumar
  const [taskType, setTaskType] = useState('Turnover Cleaning');
  const [priority, setPriority] = useState('Medium');
  const [taskRemarks, setTaskRemarks] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);

  // Queries
  const { data: allTasks = [], isLoading: tasksLoading } = useHousekeepingTasks({
    status: filterStatus !== 'all' ? filterStatus : undefined,
  });
  const { data: myTasks = [], isLoading: myTasksLoading } = useMyHousekeepingTasks();
  const { data: roomBoard = [], isLoading: boardLoading } = useHousekeepingRoomBoard();
  const { data: rooms = [] } = useRooms();

  // Mutations
  const createTaskMutation = useCreateHousekeepingTask();
  const updateStatusMutation = useUpdateHousekeepingTaskStatus();

  // Tasks to display based on persona
  const tasksToDisplay = isHousekeepingStaff ? myTasks : allTasks;
  const filteredTasks = tasksToDisplay.filter((t) => {
    const matchPriority = filterPriority === 'all' || t.priority.toLowerCase() === filterPriority.toLowerCase();
    const matchStatus = filterStatus === 'all' || t.task_status === filterStatus || t.status.toLowerCase() === filterStatus.toLowerCase();
    return matchPriority && matchStatus;
  });

  // KPI Metrics
  const todayTasksCount = tasksToDisplay.length;
  const scheduledCount = tasksToDisplay.filter((t) => ['scheduled', 'pending', 'assigned'].includes(t.task_status) || ['Pending', 'Assigned', 'Scheduled'].includes(t.status)).length;
  const inProgressCount = tasksToDisplay.filter((t) => ['in_progress', 'cleaning'].includes(t.task_status) || ['Cleaning', 'In Progress'].includes(t.status)).length;
  const completedCount = tasksToDisplay.filter((t) => t.task_status === 'completed' || t.status === 'Completed').length;
  const dirtyRoomsCount = roomBoard.filter((r) => r.is_dirty).length;

  const handleStartTask = async (taskId: number) => {
    await updateStatusMutation.mutateAsync({
      id: taskId,
      status: 'in_progress',
    });
  };

  const handleCompleteTask = async (taskId: number) => {
    await updateStatusMutation.mutateAsync({
      id: taskId,
      status: 'completed',
    });
  };

  const handleCreateTask = async () => {
    if (!selectedRoomId) return;
    await createTaskMutation.mutateAsync({
      room_id: parseInt(selectedRoomId),
      staff_id: selectedStaffId ? parseInt(selectedStaffId) : null,
      task_type: taskType,
      priority: priority,
      scheduled_date: scheduledDate,
      remarks: taskRemarks,
    });
    setIsNewTaskModalOpen(false);
    setSelectedRoomId('');
    setTaskRemarks('');
  };

  // Kanban Columns
  const kanbanColumns = [
    { id: 'scheduled', label: 'Scheduled / Pending', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'in_progress', label: 'Cleaning In Progress', color: 'border-amber-400 dark:border-amber-600' },
    { id: 'completed', label: 'Cleaned & Ready', color: 'border-emerald-400 dark:border-emerald-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Housekeeping & Turnover Sanitation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isHousekeepingStaff ? 'My Housekeeping Tasks' : 'Housekeeping Management Grid'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isHousekeepingStaff
              ? 'Your assigned turnover duties, daily cleans, and room sanitization queue.'
              : 'Real-time turnover monitoring, staff assignment, and room cleanliness board.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isHousekeepingStaff && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-semibold">
              <button
                onClick={() => setActiveView('kanban')}
                className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                  activeView === 'kanban'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Board
              </button>
              <button
                onClick={() => setActiveView('table')}
                className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                  activeView === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
              <button
                onClick={() => setActiveView('room-board')}
                className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
                  activeView === 'room-board'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BedDouble className="w-3.5 h-3.5" /> Rooms
              </button>
            </div>
          )}

          {isAdminOrManager && (
            <Button variant="primary" size="sm" onClick={() => setIsNewTaskModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Dispatch Task
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{todayTasksCount}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Scheduled</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{scheduledCount}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">In Progress</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{inProgressCount}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{completedCount}</div>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
          <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Dirty Rooms</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{dirtyRoomsCount}</div>
        </Card>
      </div>

      {/* Housekeeping Staff Mobile & Touch Card View (Section 19 & 33) */}
      {isHousekeepingStaff && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Assigned Tasks</h2>
            <div className="flex items-center gap-2">
              {['all', 'urgent', 'high'].map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    filterPriority === p
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-900/40">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <div className="text-base font-bold text-slate-800 dark:text-slate-200">No pending housekeeping tasks</div>
              <p className="text-xs text-slate-400 mt-1">All assigned rooms have been cleaned and inspected.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <Card key={task.id} hover className="p-6 flex flex-col justify-between space-y-5 border-2 border-slate-200/80 dark:border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          ROOM {task.room_number}
                        </div>
                        <div className="text-xs text-slate-400 font-semibold mt-0.5">
                          Floor {task.room_floor || task.floor_number || 1} • {task.room_type || 'Standard'}
                        </div>
                      </div>
                      <Badge variant={task.priority.toLowerCase()} dot>
                        {task.priority}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5 space-y-1.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {task.task_type}
                      </div>
                      {task.notes && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                          "{task.notes}"
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        Scheduled: {task.scheduled_date || 'Today'}
                      </div>
                    </div>
                  </div>

                  {/* Touch-Friendly Large Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                    {['scheduled', 'pending', 'assigned'].includes(task.task_status) && (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 text-sm rounded-xl flex items-center justify-center gap-2 shadow-md"
                        onClick={() => handleStartTask(task.id)}
                        isLoading={updateStatusMutation.isPending}
                      >
                        <Play className="w-4 h-4 fill-white" /> START CLEANING
                      </Button>
                    )}

                    {['in_progress', 'cleaning'].includes(task.task_status) && (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm rounded-xl flex items-center justify-center gap-2 shadow-md"
                        onClick={() => handleCompleteTask(task.id)}
                        isLoading={updateStatusMutation.isPending}
                      >
                        <Check className="w-4 h-4" /> MARK COMPLETED
                      </Button>
                    )}

                    {task.task_status === 'completed' && (
                      <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Sanitized & Ready
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin / Manager Views */}
      {!isHousekeepingStaff && (
        <div className="space-y-6">
          {/* Kanban Board View */}
          {activeView === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {kanbanColumns.map((col) => {
                const colTasks = filteredTasks.filter((t) => {
                  if (col.id === 'scheduled') return ['scheduled', 'pending', 'assigned'].includes(t.task_status);
                  if (col.id === 'in_progress') return ['in_progress', 'cleaning'].includes(t.task_status);
                  if (col.id === 'completed') return t.task_status === 'completed';
                  return false;
                });

                return (
                  <div key={col.id} className="space-y-3">
                    <div className={`p-3.5 rounded-2xl bg-white dark:bg-[#111827] border-t-4 ${col.color} border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between`}>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{col.label}</span>
                      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[350px]">
                      {colTasks.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
                          No tasks in {col.label.toLowerCase()}
                        </div>
                      ) : (
                        colTasks.map((task) => (
                          <Card key={task.id} className="p-4 space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                  Room {task.room_number}
                                </span>
                                <span className="text-xs text-slate-400 ml-2 font-medium">
                                  Floor {task.room_floor || task.floor_number}
                                </span>
                              </div>
                              <Badge variant={task.priority.toLowerCase()} dot>
                                {task.priority}
                              </Badge>
                            </div>

                            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              {task.task_type}
                            </div>

                            {task.notes && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-white/5 line-clamp-2">
                                "{task.notes}"
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {task.staff_name || 'Staff Suresh K.'}
                              </span>

                              {['scheduled', 'pending', 'assigned'].includes(task.task_status) && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleStartTask(task.id)}
                                  className="text-xs py-1 px-2.5"
                                >
                                  Start →
                                </Button>
                              )}

                              {['in_progress', 'cleaning'].includes(task.task_status) && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="text-xs py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Complete ✓
                                </Button>
                              )}

                              {task.task_status === 'completed' && (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                </span>
                              )}
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View (Section 32) */}
          {activeView === 'table' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-white/10 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Task #</th>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Floor</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Assigned Staff</th>
                      <th className="py-3 px-4">Scheduled</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">#{task.id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">Room {task.room_number}</td>
                        <td className="py-3.5 px-4 text-slate-500">Floor {task.room_floor || task.floor_number}</td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{task.task_type}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {task.staff_name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{task.scheduled_date || 'Today'}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={task.task_status} dot>{task.status}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          {['scheduled', 'pending', 'assigned'].includes(task.task_status) && (
                            <Button variant="outline" size="sm" onClick={() => handleStartTask(task.id)}>
                              Start
                            </Button>
                          )}
                          {['in_progress', 'cleaning'].includes(task.task_status) && (
                            <Button variant="primary" size="sm" onClick={() => handleCompleteTask(task.id)}>
                              Complete
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Room Housekeeping Board (Section 20) */}
          {activeView === 'room-board' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Room Housekeeping Board</h3>
                  <p className="text-xs text-slate-400">Synchronized cleanliness status and operational room occupancy.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Clean
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Needs Cleaning
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> In Progress
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {roomBoard.map((rm) => (
                  <Card
                    key={rm.room_id}
                    className={`p-4 border-2 transition-all ${
                      rm.is_dirty
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                        : rm.is_clean
                        ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                    }`}
                  >
                    <div className="text-center space-y-1.5">
                      <div className="text-lg font-black text-slate-900 dark:text-white">
                        {rm.room_number}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Floor {rm.floor} • {rm.room_type}
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                        <Badge
                          variant={rm.is_clean ? 'success' : rm.is_dirty ? 'error' : 'warning'}
                          dot
                          className="w-full justify-center"
                        >
                          {rm.housekeeping_status}
                        </Badge>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {rm.room_status}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dispatch Housekeeping Task Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title="Dispatch Housekeeping Task"
        subtitle="Assign a room cleaning or inspection task to housekeeping personnel."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
              Select Room
            </label>
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="">-- Choose Room --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.room_number} (Floor {r.floor} • {r.status} • {r.housekeeping_status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Assign Staff
              </label>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="4">Suresh Kumar (Housekeeping)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Turnover Cleaning">Turnover Cleaning</option>
                <option value="Daily Clean">Daily Clean</option>
                <option value="Sanitization & Linen Change">Sanitization & Linen Change</option>
                <option value="Supervisor Inspection">Supervisor Inspection</option>
              </select>
            </div>

            <Input
              label="Scheduled Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Remarks & Special Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Post-checkout cleaning, inspect AC filter..."
              value={taskRemarks}
              onChange={(e) => setTaskRemarks(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsNewTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateTask}
              isLoading={createTaskMutation.isPending}
              disabled={!selectedRoomId}
            >
              Dispatch Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
