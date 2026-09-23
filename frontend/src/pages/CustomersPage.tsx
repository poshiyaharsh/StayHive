import React, { useState } from 'react';
import { Users, Award, Calendar, DollarSign, MapPin, Shield, Search, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useDatabase } from '../context/DatabaseContext';
import { useCustomers } from '../hooks/useCustomers';

export const CustomersPage: React.FC = () => {
  const { customers: contextCustomers } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');

  const { data: remoteCustomers, isLoading } = useCustomers({
    search: searchTerm || undefined,
    loyalty_tier: selectedTier !== 'ALL' ? selectedTier : undefined,
  });

  const rawList = remoteCustomers !== undefined ? remoteCustomers : contextCustomers;
  const customers = rawList.filter((c) => {
    const matchesTier = selectedTier === 'ALL' || c.loyalty_tier?.toUpperCase() === selectedTier;
    const matchesSearch =
      !searchTerm ||
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm);
    return matchesTier && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Guest Directory & CRM</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registered guest profiles, lifetime stay history, total spends, and loyalty membership tiers.
          </p>
        </div>

        {/* Loyalty Tier Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/5">
          {['ALL', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTier === tier
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search guests by name, email, or phone..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-slate-500 mt-3">Loading guest directory from database...</p>
        </Card>
      ) : customers.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          No guests found matching your filter criteria.
        </Card>
      ) : (
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
      )}
    </div>
  );
};
