import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils, ShoppingBag, Clock, Plus, Minus, Trash2,
  CheckCircle2, Coffee, Sparkles, Filter, Building2, Flame,
  AlertCircle, ChefHat, Check, ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  useFoods,
  useRestaurants,
  useCreateFoodOrder,
  useMyFoodOrders,
  FoodItem
} from '../hooks/useRestaurant';
import { useMyBookings } from '../hooks/useBookings';

export const RestaurantPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('all');
  const [cart, setCart] = useState<{ food: FoodItem; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // API hooks
  const { data: restaurants = [], isLoading: restaurantsLoading } = useRestaurants();
  const { data: foods = [], isLoading: foodsLoading } = useFoods({
    is_available: true,
    restaurant_id: selectedRestaurantId !== 'all' ? selectedRestaurantId : undefined,
  });
  const { data: myBookings = [] } = useMyBookings();
  const { data: myOrders = [] } = useMyFoodOrders();
  const createOrderMutation = useCreateFoodOrder();

  const categories = ['All', 'Breakfast', 'Starters', 'Main Course', 'Desserts', 'Beverages'];

  // Identify active checked-in or confirmed booking for delivery
  const activeStay = useMemo(() => {
    return (
      myBookings.find((b) => b.status === 'Checked-in') ||
      myBookings.find((b) => b.status === 'Confirmed') ||
      myBookings[0]
    );
  }, [myBookings]);

  const deliveryRoomNumber = activeStay?.rooms?.[0]?.room_number || '101';
  const deliveryRoomType = activeStay?.rooms?.[0]?.room_type || 'Deluxe Room';

  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      const matchesCategory = activeCategory === 'All' || f.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesVeg = !vegOnly || f.is_veg;
      return matchesCategory && matchesVeg;
    });
  }, [foods, activeCategory, vegOnly]);

  const addToCart = (food: FoodItem) => {
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
        .filter(Boolean) as { food: FoodItem; quantity: number }[]
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + Number(item.food.price) * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!activeStay) {
      alert("No active hotel stay found to bill in-room dining.");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        booking_id: activeStay.id,
        room_id: activeStay.rooms?.[0]?.id || null,
        items: cart.map((i) => ({ food_id: i.food.id, quantity: i.quantity })),
        payment_status: 'Billed to Room',
      });
      setCart([]);
      setIsCartOpen(false);
    } catch {
      // Toast notification is handled by mutation hook
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner with Cart Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-semibold mb-2">
            <Utensils className="w-3.5 h-3.5" /> In-Room Dining & Gourmet Room Service
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            In-Room Dining & Restaurant Menu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Handcrafted Pan-Asian, North Indian, and Continental delicacies delivered straight to your room.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeStay && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Delivery To</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Room {deliveryRoomNumber} ({deliveryRoomType})
              </span>
            </div>
          )}

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
      </div>

      {/* Active Orders Status Tracking (if customer has placed orders) */}
      {myOrders.length > 0 && (
        <Card className="p-5 border-l-4 border-l-orange-500 bg-orange-50/20 dark:bg-orange-950/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-orange-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Active In-Room Orders ({myOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length} Active)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Live Kitchen Tracking</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myOrders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">Order #{order.id}</span>
                  <Badge
                    variant={
                      order.status === 'Delivered' ? 'delivered' :
                      order.status === 'Preparing' ? 'preparing' :
                      order.status === 'Ready' ? 'ready' : 'pending'
                    }
                    size="sm"
                    dot
                  >
                    {order.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                  {order.items?.map(it => `${it.quantity}x ${it.food_name}`).join(', ') || 'Chef Delicacies'}
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 dark:border-white/5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{Number(order.total_amount).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Room {order.room_number || deliveryRoomNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

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
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {restaurants.length > 1 && (
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.name}
                </option>
              ))}
            </select>
          )}

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
      </div>

      {/* Dishes Grid */}
      {foodsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-white/10 rounded-2xl">
          <Utensils className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          No menu items available matching current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFoods.map((food) => {
            const inCart = cart.find((c) => c.food.id === food.id);
            return (
              <Card key={food.id} hover className="overflow-hidden flex flex-col justify-between">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={food.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600'}
                    alt={food.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center bg-white ${
                        food.is_veg ? 'border-emerald-600' : 'border-rose-600'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${food.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-sm">
                    <Clock className="w-3 h-3" /> {food.preparation_time || 20}m
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{food.name}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5 capitalize">{food.category}</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {food.description}
                    </p>
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
      )}

      {/* Cart Tray Modal */}
      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="In-Room Dining Tray"
        subtitle="Review your selections before sending to the executive kitchen"
        maxWidth="md"
      >
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Your dining tray is currently empty.
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 pr-1">
                {cart.map((item) => (
                  <div key={item.food.id} className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{item.food.name}</div>
                      <div className="text-xs text-slate-400">₹{Number(item.food.price).toLocaleString('en-IN')} each</div>
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
                      <span className="text-sm font-bold text-slate-900 dark:text-white w-20 text-right">
                        ₹{(Number(item.food.price) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Delivery Room:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    Room {deliveryRoomNumber} ({deliveryRoomType})
                  </span>
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
                isLoading={createOrderMutation.isPending}
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
