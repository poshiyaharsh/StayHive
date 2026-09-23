import React from 'react';
import { BedDouble, Users, Maximize2, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useDatabase } from '../context/DatabaseContext';

export const RoomTypesPage: React.FC = () => {
  const { roomTypes } = useDatabase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Room & Suite Categories</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore luxury tier specifications, guest capacities, and room amenities.
        </p>
      </div>

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
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
