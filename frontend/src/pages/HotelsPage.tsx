import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hotel, Star, MapPin, Phone, Mail, BedDouble, Plus, Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { useDatabase } from '../context/DatabaseContext';

export const HotelsPage: React.FC = () => {
  const { hotels } = useDatabase();
  const [search, setSearch] = useState('');

  const filteredHotels = hotels.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Properties & Resorts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage StayHive luxury hotels, suites, and property amenities.</p>
        </div>
      </div>

      <div className="max-w-md">
        <SearchInput
          placeholder="Filter by hotel name or city..."
          value={search}
          onChange={(val) => setSearch(val)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
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
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{hotel.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {hotel.address}, {hotel.city}
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {hotel.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <BedDouble className="w-4 h-4 text-emerald-500" />
                  <span>{hotel.rooms_count || 8} Rooms Total</span>
                </div>
                <Badge variant={hotel.is_active ? 'available' : 'maintenance'}>
                  {hotel.is_active ? 'Active' : 'Closed'}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
