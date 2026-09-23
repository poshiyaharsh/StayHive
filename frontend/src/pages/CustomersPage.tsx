import React from 'react';
import { Users, Award, Calendar, DollarSign, MapPin, Shield } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useDatabase } from '../context/DatabaseContext';

export const CustomersPage: React.FC = () => {
  const { customers } = useDatabase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Guest Directory & CRM</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Registered guest profiles, lifetime stay history, total spends, and loyalty membership tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <Card key={c.id} hover className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={c.first_name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                    {c.first_name} {c.last_name}
                  </h3>
                  <Badge variant={c.loyalty_tier === 'Platinum' ? 'reserved' : c.loyalty_tier === 'Gold' ? 'cleaning' : 'neutral'}>
                    {c.loyalty_tier}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 truncate">{c.email}</div>
                <div className="text-xs text-slate-400">{c.phone}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs">
              <div>
                <span className="text-slate-400">Total Stays:</span>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{c.total_stays} Visits</div>
              </div>
              <div>
                <span className="text-slate-400">Lifetime Spend:</span>
                <div className="font-bold text-emerald-600 mt-0.5">₹{Number(c.total_spend).toLocaleString('en-IN')}</div>
              </div>
            </div>

            {c.address && (
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{c.address}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
