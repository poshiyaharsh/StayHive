import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BedDouble, Users, Maximize2, Sparkles, Plus, Layers,
  Edit2, Trash2, AlertTriangle, Layers3
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import {
  useRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType
} from '../hooks/useRooms';
import { RoomType } from '../types/database';

export const RoomTypesPage: React.FC = () => {
  const { role } = useAuth();
  const canManage = role === 'ADMIN' || role === 'MANAGER';

  const { data: roomTypes = [], isLoading } = useRoomTypes();
  const createRoomTypeMutation = useCreateRoomType();
  const updateRoomTypeMutation = useUpdateRoomType();
  const deleteRoomTypeMutation = useDeleteRoomType();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [deletingType, setDeletingType] = useState<RoomType | null>(null);

  const [formData, setFormData] = useState({
    type_name: '',
    base_price: '',
    capacity: 2,
    size_sqft: 450,
    bed_type: 'King Bed',
    description: '',
    image_url: '',
  });

  const resetForm = () => {
    setFormData({
      type_name: '',
      base_price: '',
      capacity: 2,
      size_sqft: 450,
      bed_type: 'King Bed',
      description: '',
      image_url: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (type: RoomType) => {
    setEditingType(type);
    setFormData({
      type_name: type.type_name,
      base_price: String(type.base_price),
      capacity: type.capacity,
      size_sqft: type.size_sqft || 450,
      bed_type: type.bed_type || 'King Bed',
      description: type.description || '',
      image_url: type.image_url || '',
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type_name.trim() || !formData.base_price) return;
    try {
      await createRoomTypeMutation.mutateAsync({
        type_name: formData.type_name.trim(),
        base_price: Number(formData.base_price),
        capacity: Number(formData.capacity) || 2,
        size_sqft: Number(formData.size_sqft) || 450,
        bed_type: formData.bed_type,
        description: formData.description,
        image_url: formData.image_url || undefined,
      });
      setIsAddModalOpen(false);
      resetForm();
    } catch {
      // Handled by mutation
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    try {
      await updateRoomTypeMutation.mutateAsync({
        id: editingType.id,
        data: {
          type_name: formData.type_name.trim(),
          base_price: Number(formData.base_price),
          capacity: Number(formData.capacity) || 2,
          size_sqft: Number(formData.size_sqft) || 450,
          bed_type: formData.bed_type,
          description: formData.description,
          image_url: formData.image_url || undefined,
        },
      });
      setEditingType(null);
      resetForm();
    } catch {
      // Handled by mutation
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingType) return;
    await deleteRoomTypeMutation.mutateAsync(deletingType.id);
    setDeletingType(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Room & Suite Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore luxury tier specifications, guest capacities, and room amenities.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Category
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-4 space-y-4">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : roomTypes.length === 0 ? (
        <EmptyState
          icon={<Layers3 className="w-8 h-8" />}
          title="No room categories found"
          description="Create your first suite tier or room category to assign rooms to."
          actionLabel={canManage ? "Add Category" : undefined}
          onAction={canManage ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roomTypes.map((type) => (
            <Card key={type.id} hover className="overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-[16/11] overflow-hidden">
                <img
                  src={type.image_url || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
                  alt={type.type_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                  ₹{Number(type.base_price).toLocaleString('en-IN')} / night
                </div>

                {canManage && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 hover:opacity-100">
                    <button
                      onClick={() => handleOpenEdit(type)}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-blue-600 shadow-sm transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingType(type)}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-rose-600 shadow-sm transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{type.type_name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{type.description}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" /> Max Capacity</span>
                    <span className="font-bold">{type.capacity} Guests</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Maximize2 className="w-3.5 h-3.5 text-emerald-500" /> Size</span>
                    <span className="font-bold">{type.size_sqft || 450} sq.ft</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><BedDouble className="w-3.5 h-3.5 text-purple-500" /> Bed Type</span>
                    <span className="font-bold">{type.bed_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-500" /> Inventory</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{type.rooms_count ?? 0} Rooms</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Room Type Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Suite / Room Category"
        subtitle="Configure a new accommodation tier and tariff"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
          <Input
            label="Category Name *"
            placeholder="e.g. Deluxe King Room or Presidential Penthouse"
            value={formData.type_name}
            onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Tariff per Night (₹) *"
              type="number"
              min="0"
              placeholder="e.g. 4500"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              required
            />
            <Input
              label="Guest Capacity *"
              type="number"
              min="1"
              max="10"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room Size (sq.ft)"
              type="number"
              placeholder="e.g. 520"
              value={formData.size_sqft}
              onChange={(e) => setFormData({ ...formData, size_sqft: parseInt(e.target.value) || 450 })}
            />
            <Input
              label="Bed Configuration"
              placeholder="e.g. King Bed or Twin Beds"
              value={formData.bed_type}
              onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
            />
          </div>

          <Input
            label="Cover Image URL"
            placeholder="https://images.unsplash.com/..."
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Key suite amenities, views, and executive perks..."
              className="block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createRoomTypeMutation.isPending}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Room Type Modal */}
      <Modal
        isOpen={!!editingType}
        onClose={() => setEditingType(null)}
        title={`Edit ${editingType?.type_name}`}
        subtitle="Update category specifications and base tariff"
        maxWidth="lg"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-2">
          <Input
            label="Category Name *"
            value={formData.type_name}
            onChange={(e) => setFormData({ ...formData, type_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Tariff per Night (₹) *"
              type="number"
              min="0"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              required
            />
            <Input
              label="Guest Capacity *"
              type="number"
              min="1"
              max="10"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 2 })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Room Size (sq.ft)"
              type="number"
              value={formData.size_sqft}
              onChange={(e) => setFormData({ ...formData, size_sqft: parseInt(e.target.value) || 450 })}
            />
            <Input
              label="Bed Configuration"
              value={formData.bed_type}
              onChange={(e) => setFormData({ ...formData, bed_type: e.target.value })}
            />
          </div>

          <Input
            label="Cover Image URL"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />

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
            <Button variant="outline" type="button" onClick={() => setEditingType(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={updateRoomTypeMutation.isPending}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Room Type Confirmation Modal */}
      <Modal
        isOpen={!!deletingType}
        onClose={() => setDeletingType(null)}
        title="Confirm Category Deletion"
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center text-rose-600 mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Delete {deletingType?.type_name}?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This category cannot be deleted if rooms are currently assigned to it.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button variant="outline" size="sm" onClick={() => setDeletingType(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={deleteRoomTypeMutation.isPending}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
