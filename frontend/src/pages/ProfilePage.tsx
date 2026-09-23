import React from 'react';
import { User, Shield, Phone, Mail, Award, Calendar, CreditCard } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account & Membership Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personal details, membership tier benefits, and account preferences.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.first_name}
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-blue-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <Badge variant="occupied">{role}</Badge>
            </div>
            <div className="text-xs text-slate-400 mt-1">{user?.email}</div>
            <div className="text-xs text-slate-400">{user?.phone || '+91 98220 11223'}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/5 text-xs">
          <div>
            <span className="text-slate-400">Account Type:</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 capitalize">{role.toLowerCase()} Account</div>
          </div>
          <div>
            <span className="text-slate-400">Loyalty Status:</span>
            <div className="font-semibold text-amber-500 mt-0.5">StayHive Gold Tier (5 Stays)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-300 space-y-1">
          <span className="font-bold">Gold Tier Privileges:</span>
          <p>• Complimentary room upgrade upon arrival (subject to suite availability)</p>
          <p>• Late checkout until 2:00 PM</p>
          <p>• 15% discount on all culinary dining & Ayurvedic spa services</p>
        </div>
      </Card>
    </div>
  );
};
