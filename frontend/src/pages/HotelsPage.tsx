import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel as HotelIcon, Star, MapPin, Phone, Mail, BedDouble, Plus, Search,
  Edit2, Trash2, AlertTriangle, Sparkles, Building2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useHotels, useCreateHotel, useUpdateHotel, useDeleteHotel } from '../hooks/useHotels';
import { Hotel } from '../types/database';

export const HotelsPage: React.FC = () => {
  const { role } = useAuth();
  const [search, setSearch] = useState('');

  // TanStack Query
  const { data: hotels = [], isLoading } = useHotels({ search });
  const createHotelMutation = useCreateHotel();
  const updateHotelMutation = useUpdateHotel();
  const deleteHotelMutation = useDeleteHotel();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [deletingHotel, setDeletingHotel] = useState<Hotel | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '380001',
    contact_number: '',
    email: '',
    star_rating: 5.0,
    description: '',
    image: '',
  });

  const canManage = role === 'ADMIN' || role === 'MANAGER';
  const canDelete = role === 'ADMIN';

  const resetForm = () => {
    setFormData({
      name: '',
      tagline: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '380001',
      contact_number: '',
      email: '',
      star_rating: 5.0,
      description: '',
      image: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || '',
      tagline: hotel.tagline || '',
      address: hotel.address || '',
      city: hotel.city || '',
      state: hotel.state || '',
      country: hotel.country || 'India',
      pincode: hotel.pincode || '380001',
      contact_number: hotel.contact_number || '',
      email: hotel.email || '',
      star_rating: Number(hotel.star_rating) || 5.0,
      description: hotel.description || '',
      image: hotel.image || '',
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      return;
    }
    await createHotelMutation.mutateAsync(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;
    await updateHotelMutation.mutateAsync({ id: editingHotel.id, data: formData });
    setEditingHotel(null);
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingHotel) return;
    await deleteHotelMutation.mutateAsync(deletingHotel.id);
    setDeletingHotel(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Properties & Resorts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage StayHive luxury hotels, suites, and property amenities.</p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Hotel
          </Button>
        )}
      </div>

      <div className="max-w-md">
        <SearchInput
          placeholder="Filter by hotel name or city..."
          value={search}
          onChange={(val) => setSearch(val)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-4 space-y-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8" />}
          title="No hotels found"
          description={search ? `No properties matching "${search}".` : "No hotels currently exist in the database."}
          actionLabel={canManage ? "Add First Hotel" : undefined}
          onAction={canManage ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card key={hotel.id} hover className="overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {hotel.star_rating}
                </div>

                {canManage && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-90 hover:opacity-100">
                    <button
                      onClick={() => handleOpenEdit(hotel)}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-sm transition-colors"
                      title="Edit Hotel"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => setDeletingHotel(hotel)}
                        className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-rose-600 shadow-sm transition-colors"
                        title="Delete Hotel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{hotel.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {hotel.address}, {hotel.city}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {hotel.description || hotel.tagline}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <BedDouble className="w-4 h-4 text-emerald-500" />
                    <span>{hotel.rooms_count ?? 0} Rooms Total</span>
                  </div>
                  <Badge variant={hotel.is_active ? 'available' : 'maintenance'}>
                    {hotel.is_active ? 'Active' : 'Closed'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Hotel Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Luxury Property"
        subtitle="Register a new hotel destination in the StayHive portfolio"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hotel Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. StayHive Heritage Palace"
              required
            />
            <Input
              label="Tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Royal Luxury in the Heart of Jaipur"
            />
          </div>

          <Input
            label="Address *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Civil Lines, Near Raj Bhavan"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. Jaipur"
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Rajasthan"
            />
            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="e.g. 302006"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              placeholder="+91 141 556677"
            />
            <Input
              label="Contact Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jaipur@stayhive.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Star Rating (1.0 - 5.0)"
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              value={formData.star_rating}
              onChange={(e) => setFormData({ ...formData, star_rating: parseFloat(e.target.value) || 5.0 })}
            />
            <Input
              label="Cover Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Write a brief description of the hotel ambiance, location, and guest experience..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createHotelMutation.isPending}>
              Create Hotel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Hotel Modal */}
      <Modal
        isOpen={!!editingHotel}
        onClose={() => setEditingHotel(null)}
        title={`Edit ${editingHotel?.name || 'Hotel'}`}
        subtitle="Update property information, address, and contact details"
        maxWidth="2xl"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hotel Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Tagline"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            />
          </div>

          <Input
            label="Address *"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City *"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Star Rating"
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              value={formData.star_rating}
              onChange={(e) => setFormData({ ...formData, star_rating: parseFloat(e.target.value) || 5.0 })}
            />
            <Input
              label="Cover Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" type="button" onClick={() => setEditingHotel(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={updateHotelMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingHotel}
        onClose={() => setDeletingHotel(null)}
        title="Confirm Hotel Deletion"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Delete {deletingHotel?.name}?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This action may remove associated facilities, gallery entries, rooms and offers according to the database foreign-key behavior.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" size="sm" onClick={() => setDeletingHotel(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={deleteHotelMutation.isPending}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
