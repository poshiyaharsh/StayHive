import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Hotel, Search, Calendar, Users, Star, Sparkles, Shield,
  ArrowRight, CheckCircle2, Award, Heart, Phone, Mail, MapPin
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useDatabase } from '../context/DatabaseContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { hotels } = useDatabase();

  const [destination, setDestination] = useState('Ahmedabad');
  const [guests, setGuests] = useState('2');

  const handleSearch = () => {
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100">
      {/* Top Luxury Public Navigation */}
      <nav className="sticky top-0 z-40 glass-nav px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Hotel className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Stay<span className="text-blue-600">Hive</span>
            </span>
            <span className="block text-[10px] text-slate-400 font-semibold tracking-widest uppercase">
              Luxury Hotels & Resorts
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#hotels" className="hover:text-blue-600 transition-colors">Properties</a>
          <a href="#experiences" className="hover:text-blue-600 transition-colors">Experiences</a>
          <a href="#offers" className="hover:text-blue-600 transition-colors">Offers</a>
          <a href="#reviews" className="hover:text-blue-600 transition-colors">Reviews</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/booking/new')}>
            Book Now
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 lg:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Award-Winning Luxury Hospitality
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Your Stay. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Our Priority.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
              Smart hotel management and seamless stays, all in one place. Experience bespoke suites, fine dining, and intuitive contactless service.
            </p>

            {/* Quick Search Widget */}
            <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Ahmedabad">Ahmedabad, Gujarat</option>
                    <option value="Udaipur">Udaipur, Rajasthan</option>
                    <option value="Goa">Calangute, Goa</option>
                    <option value="Mumbai">Marine Drive, Mumbai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dates</label>
                  <div className="text-xs sm:text-sm font-medium py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>23 Sep — 26 Sep</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="1">1 Adult</option>
                    <option value="2">2 Adults, 1 Room</option>
                    <option value="3">3 Guests (Suite)</option>
                    <option value="4">4+ Guests (Family Suite)</option>
                  </select>
                </div>
              </div>

              <Button variant="primary" size="lg" className="w-full font-bold shadow-lg shadow-blue-500/20" onClick={handleSearch}>
                <Search className="w-5 h-5 mr-2" /> Search Luxury Hotels
              </Button>
            </div>
          </div>

          {/* Right Visual Image with Floating UI KPI Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5] max-w-md mx-auto">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000"
                alt="StayHive Grand Hotel"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-xs font-bold uppercase tracking-wider">
                  Featured Property
                </span>
                <h3 className="text-xl font-bold mt-2">StayHive Grand Ahmedabad</h3>
                <p className="text-xs text-slate-300 mt-1">Sindhu Bhavan Marg, Gujarat</p>
              </div>
            </div>

            {/* Floating KPI Pill 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-4 -left-4 sm:-left-8 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Live Occupancy</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">98% Occupied</div>
              </div>
            </motion.div>

            {/* Floating KPI Pill 2 */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-6 -right-4 sm:-right-6 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xl flex items-center gap-3"
            >
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">Guest Satisfaction</div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">4.9 / 5.0 Rating</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id="hotels" className="py-20 px-6 lg:px-12 bg-white dark:bg-[#0F172A]/50 border-y border-slate-200/80 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Curated Portfolio</span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Featured StayHive Properties
              </h2>
            </div>
            <Button variant="ghost" onClick={() => navigate('/search')}>
              View All Properties <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <Card key={hotel.id} hover className="overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'}
                    alt={hotel.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {hotel.star_rating}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs text-blue-600 font-semibold">{hotel.city}, {hotel.state}</span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                      {hotel.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {hotel.tagline || hotel.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase">Tariff from</span>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹4,500 <span className="text-xs font-normal text-slate-400">/ night</span>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate('/booking/new')}>
                      Book
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why StayHive Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">The StayHive Standard</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hospitality Redefined with Modern Tech
            </h2>
            <p className="text-sm text-slate-400">
              From instant digital check-ins to Michelin-curated in-room dining, every touchpoint is crafted for luxury and effortless ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Contactless Digital Check-In',
                desc: 'Bypass queues. Receive your room key on your phone before you even arrive at the lobby.',
                icon: Shield,
              },
              {
                title: 'Instant In-Room Dining (KOT)',
                desc: 'Browse live restaurant menus and track your gourmet meal in real-time straight to your room.',
                icon: Sparkles,
              },
              {
                title: 'Itemized GST Invoices & Checkout',
                desc: 'Review all room, dining, and spa charges transparently with instant one-click digital billing.',
                icon: Award,
              },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/10 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-14 px-6 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-extrabold text-xl tracking-tight text-white">
              Stay<span className="text-blue-500">Hive</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premium hotel management and guest booking platform designed for world-class hospitality properties across India.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Properties</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>StayHive Grand Ahmedabad</li>
              <li>StayHive Palace Udaipur</li>
              <li>StayHive Beach Resort Goa</li>
              <li>StayHive Horizon Mumbai</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li onClick={() => navigate('/dashboard')} className="cursor-pointer hover:text-blue-400">Staff Portal</li>
              <li onClick={() => navigate('/booking/new')} className="cursor-pointer hover:text-blue-400">Direct Booking</li>
              <li onClick={() => navigate('/search')} className="cursor-pointer hover:text-blue-400">Room Search</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Contact Concierge</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /> +91 79 4000 8800</div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /> concierge@stayhive.com</div>
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400" /> Gujarat, India</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 StayHive Luxury Hotels & Resorts. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
