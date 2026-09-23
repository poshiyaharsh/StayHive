import React from 'react';
import { Tag, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useDatabase } from '../context/DatabaseContext';
import { useNotification } from '../context/NotificationContext';

export const OffersPage: React.FC = () => {
  const { offers } = useDatabase();
  const { showToast } = useNotification();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code ${code} copied to clipboard!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Promotional Packages & Coupons</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Active seasonal promotions, discounts, and minimum booking qualifiers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <Card key={offer.id} hover className="p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {offer.discount_percentage}% OFF
                </span>
                <Badge variant={offer.is_active ? 'available' : 'maintenance'}>
                  {offer.is_active ? 'Active' : 'Expired'}
                </Badge>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{offer.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{offer.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between">
                <span className="font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-white">
                  {offer.code}
                </span>
                <button
                  onClick={() => handleCopyCode(offer.code)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Copy Code
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Valid: {offer.valid_from} to {offer.valid_to}</span>
                <span>{offer.usage_count} Redemptions</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
