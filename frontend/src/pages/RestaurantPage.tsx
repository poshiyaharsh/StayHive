import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, ShoppingBag, Clock, Plus, Minus, Trash2,
  CheckCircle2, Coffee, Sparkles, Filter
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useDatabase } from '../context/DatabaseContext';

export const RestaurantPage: React.FC = () => {
  const { foods, createFoodOrder, bookings } = useDatabase();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [cart, setCart] = useState<{ food: any; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('101');
  const [isOrdering, setIsOrdering] = useState(false);

  const categories = ['All', 'Breakfast', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

  const filteredFoods = foods.filter((f) => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesVeg = !vegOnly || f.is_veg;
    return matchesCategory && matchesVeg;
  });

  const addToCart = (food: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { food, quantity: 1 }];
    });
  };

  const updateQuantity = (foodId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.food.id === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { food: any; quantity: number }[]
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.food.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsOrdering(true);
    try {
      await createFoodOrder({
        customer_id: 1,
        booking_id: 1,
        room_id: 1,
        items: cart.map(i => ({ food_id: i.food.id, quantity: i.quantity })),
        payment_status: 'Billed to Room'
      });
      setCart([]);
      setIsCartOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Cart Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">In-Room Dining & Restaurant</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Handcrafted Indian, Pan-Asian & Continental delicacies prepared fresh to order.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCartOpen(true)}
          className="relative shadow-md shadow-blue-500/20"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          View Tray ({cart.reduce((a, b) => a + b.quantity, 0)})
          {cart.length > 0 && (
            <span className="ml-2 font-mono font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
          )}
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            vegOnly
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
              : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Pure Vegetarian Only
        </button>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredFoods.map((food) => {
          const inCart = cart.find(c => c.food.id === food.id);
          return (
            <Card key={food.id} hover className="overflow-hidden flex flex-col justify-between">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                  alt={food.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center bg-white ${
                    food.is_veg ? 'border-emerald-600' : 'border-rose-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${food.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {food.preparation_time || 20}m
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{food.name}</h3>
                  <div className="text-[11px] text-slate-400 mt-0.5 capitalize">{food.category}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    ₹{Number(food.price).toLocaleString('en-IN')}
                  </span>
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(food.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold shadow-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-blue-600 w-4 text-center">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(food.id, 1)}
                        className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => addToCart(food)}>
                      Add <Plus className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cart Drawer / Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="In-Room Dining Tray"
        subtitle="Review your selections before sending to the kitchen"
        maxWidth="md"
      >
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Your dining tray is currently empty.
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {cart.map((item) => (
                  <div key={item.food.id} className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{item.food.name}</div>
                      <div className="text-xs text-slate-400">₹{item.food.price} each</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.food.id, -1)}
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.food.id, 1)}
                          className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-900 dark:text-white w-16 text-right">
                        ₹{item.food.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Delivery Room:</span>
                  <span className="font-bold text-blue-600">Room 101 (Deluxe King)</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-white/5">
                  <span>Grand Total</span>
                  <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handlePlaceOrder}
                isLoading={isOrdering}
              >
                Send Order to Kitchen (Billed to Room)
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
