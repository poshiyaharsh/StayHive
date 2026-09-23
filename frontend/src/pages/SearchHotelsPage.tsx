import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, BedDouble, Filter, ArrowRight, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useDatabase } from '../context/DatabaseContext';

export const SearchHotelsPage: React.FC = () => {
  const { hotels } = useDatabase();
  const navigate = useNavigate();

  const [cityFilter, setCityFilter] = useState('All');
  const [minRating, setMinRating] = useState('0');

  const filteredHotels = hotels.filter((h) => {
    const matchesCity = cityFilter === 'All' || h.city.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesRating = Number(h.star_rating) >= Number(minRating);
    return matchesCity && matchesRating;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Explore Luxury Stays</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Handpicked 5-star properties, heritage palaces, and coastal beach resorts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Ahmedabad', 'Udaipur', 'Goa', 'Mumbai'].map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                cityFilter === c
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Rating:</span>
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            <option value="0">All Ratings</option>
            <option value="4.8">4.8★ & Above</option>
            <option value="5.0">5.0★ Only</option>
          </select>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((h) => (
          <Card key={h.id} hover className="overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
                alt={h.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {h.star_rating}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs text-blue-600 font-semibold">{h.city}, {h.state}</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{h.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{h.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Tariff from</span>
                  <div className="text-base font-extrabold text-slate-900 dark:text-white">
                    ₹4,500 <span className="text-xs font-normal text-slate-400">/ night</span>
                  </div>
                </div>
                <Button variant="primary" size="sm" onClick={() => navigate('/booking/new')}>
                  Select Room <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
