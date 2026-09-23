import React, { useState, useEffect } from 'react';
import { User, Shield, Phone, Mail, Award, Calendar, CreditCard, MapPin, Edit3, Check, Loader2, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useCurrentCustomer, useUpdateCustomer } from '../hooks/useCustomers';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const { data: customerProfile, isLoading } = useCurrentCustomer();
  const updateCustomerMutation = useUpdateCustomer();

  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (customerProfile) {
      if (customerProfile.phone) setPhone(customerProfile.phone);
      if (customerProfile.address) setAddress(customerProfile.address);
    }
  }, [customerProfile]);

  const handleSave = async () => {
    try {
      await updateCustomerMutation.mutateAsync({
        data: {
          phone,
          address
        }
      });
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  };

  const loyaltyTier = customerProfile?.loyalty_tier || 'Silver';
  const totalStays = customerProfile?.total_stays ?? 0;
  const totalSpend = customerProfile?.total_spend ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Account & Membership Profile</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personal details, membership tier benefits, and account preferences.
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.first_name}
            className="w-20 h-20 rounded-3xl object-cover ring-4 ring-blue-500/20"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {user?.first_name} {user?.last_name}
              </h2>
              <Badge variant="occupied">{role}</Badge>
            </div>
            <div className="text-xs text-slate-400 mt-1">{user?.email}</div>
            <div className="text-xs text-slate-400">{customerProfile?.phone || user?.phone || '+91 98220 11223'}</div>
          </div>
        </div>

        {/* Profile Edit Mode */}
        {isEditing ? (
          <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Update Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Phone"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
              />
              <Input
                label="Residential Address"
                value={address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
                placeholder="City, State"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Check className="w-3.5 h-3.5" />}
                isLoading={updateCustomerMutation.isPending}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          customerProfile?.address && (
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{customerProfile.address}</span>
            </div>
          )
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/5 text-xs">
          <div>
            <span className="text-slate-400">Account Type:</span>
            <div className="font-semibold text-slate-900 dark:text-white mt-0.5 capitalize">{role.toLowerCase()} Account</div>
          </div>
          <div>
            <span className="text-slate-400">Loyalty Status:</span>
            <div className="font-semibold text-amber-500 mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> StayHive {loyaltyTier} Tier
            </div>
          </div>
          <div>
            <span className="text-slate-400">Lifetime Stays & Spends:</span>
            <div className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalStays} Stays • ₹{Number(totalSpend).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-300 space-y-1">
          <span className="font-bold">{loyaltyTier} Tier Privileges:</span>
          {loyaltyTier === 'Platinum' ? (
            <>
              <p>• Complimentary suite upgrade on every reservation</p>
              <p>• 24/7 dedicated personal butler & executive airport transfer</p>
              <p>• 25% discount on all culinary dining, private dining & spa</p>
            </>
          ) : loyaltyTier === 'Gold' ? (
            <>
              <p>• Complimentary room upgrade upon arrival (subject to suite availability)</p>
              <p>• Late checkout until 2:00 PM</p>
              <p>• 15% discount on all culinary dining & Ayurvedic spa services</p>
            </>
          ) : (
            <>
              <p>• Welcome beverage & priority high-speed WiFi</p>
              <p>• Flexible cancellation up to 24 hours prior to check-in</p>
              <p>• 10% discount on in-room dining orders</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
