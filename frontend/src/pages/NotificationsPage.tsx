import React from 'react';
import { Bell, CheckCheck, Clock, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDatabase } from '../context/DatabaseContext';

export const NotificationsPage: React.FC = () => {
  const { notifications } = useDatabase();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Notification Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System activity, room assignments, bookings, and urgent operational alerts.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <CheckCheck className="w-4 h-4 mr-1.5" /> Mark All Read
        </Button>
      </div>

      <Card className="divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
        {notifications.map((n) => (
          <div key={n.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h3>
                <span className="text-xs text-slate-400">Just now</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
