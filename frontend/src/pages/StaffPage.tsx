import React from 'react';
import { Briefcase, Star, Clock, DollarSign, UserCheck, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useDatabase } from '../context/DatabaseContext';

export const StaffPage: React.FC = () => {
  const { staff } = useDatabase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Staff Roster & Departments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hospitality personnel directory, assigned shifts, performance ratings, and departments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((s) => (
          <Card key={s.id} hover className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={s.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={s.first_name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                  {s.first_name} {s.last_name}
                </h3>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{s.designation}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{s.department_name || 'Department'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
              <div>
                <span className="text-slate-400">Shift Roster:</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{s.shift} Shift</div>
              </div>
              <div>
                <span className="text-slate-400">Performance:</span>
                <div className="font-semibold text-amber-500 flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {s.performance_score} / 5.0
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Status</span>
              <Badge variant={s.status === 'Active' ? 'available' : 'maintenance'}>
                {s.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
