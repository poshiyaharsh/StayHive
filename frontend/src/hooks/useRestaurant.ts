import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useNotification } from '../context/NotificationContext';

export interface RestaurantItem {
  id: number;
  restaurant_id: number;
  hotel_id: number;
  hotel_name: string;
  name: string;
  restaurant_name: string;
  cuisine: string;
  description: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  foods_count: number;
}

export interface FoodItem {
  id: number;
  food_id: number;
  restaurant_id: number;
  restaurant_name: string;
  name: string;
  food_name: string;
  category: 'Breakfast' | 'Starters' | 'Main Course' | 'Desserts' | 'Beverages' | string;
  description: string;
  price: string | number;
  is_veg: boolean;
  is_available: boolean;
  image_url: string | null;
  preparation_time: number;
}

export interface OrderItemDetail {
  id: number;
  order_item_id: number;
  food_order_id: number;
  food_id: number;
  food_name: string;
  food_image: string | null;
  is_veg: boolean;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
}

export interface FoodOrderDetail {
  id: number;
  order_id: number;
  booking_id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  customer?: {
    customer_id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  restaurant?: {
    restaurant_id: number;
    restaurant_name: string;
  };
  room_id: number | null;
  room_number: string | null;
  order_time: string;
  order_date: string;
  total_amount: string | number;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled' | string;
  order_status: string;
  payment_status: string;
  items: OrderItemDetail[];
}

export interface FoodOrderStats {
  pending_count: number;
  confirmed_count: number;
  accepted_count: number;
  preparing_count: number;
  ready_count: number;
  delivered_today_count: number;
  delivered_total_count: number;
  today_food_revenue: number;
}

export interface CreateFoodOrderPayload {
  booking_id: number;
  room_id?: number | null;
  items: {
    food_id: number;
    quantity: number;
  }[];
  payment_status?: string;
}

// -------------------------------------------------------------
// Hooks
// -------------------------------------------------------------

export const useRestaurants = (filters?: { search?: string; hotel_id?: number | string; is_active?: boolean }) => {
  return useQuery<RestaurantItem[]>({
    queryKey: ['restaurants', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.hotel_id) params.append('hotel_id', String(filters.hotel_id));
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

      const qs = params.toString();
      const url = qs ? `/restaurants/?${qs}` : '/restaurants/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useRestaurant = (id: number | string | undefined) => {
  return useQuery<RestaurantItem>({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      if (!id) throw new Error('Restaurant ID is required');
      const res = await apiClient.get(`/restaurants/${id}/`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });
};

export const useFoods = (filters?: {
  restaurant_id?: number | string;
  category?: string;
  is_veg?: boolean;
  is_available?: boolean;
  search?: string;
}) => {
  return useQuery<FoodItem[]>({
    queryKey: ['foods', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.restaurant_id) params.append('restaurant_id', String(filters.restaurant_id));
      if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters?.is_veg !== undefined) params.append('is_veg', String(filters.is_veg));
      if (filters?.is_available !== undefined) params.append('is_available', String(filters.is_available));
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString();
      const url = qs ? `/foods/?${qs}` : '/foods/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useFoodOrders = (filters?: {
  status?: string;
  booking_id?: number | string;
  customer_id?: number | string;
}) => {
  return useQuery<FoodOrderDetail[]>({
    queryKey: ['food-orders', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters?.booking_id) params.append('booking_id', String(filters.booking_id));
      if (filters?.customer_id) params.append('customer_id', String(filters.customer_id));

      const qs = params.toString();
      const url = qs ? `/food-orders/?${qs}` : '/food-orders/';
      const res = await apiClient.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 15000, // Live KOT poll every 15s
  });
};

export const useMyFoodOrders = () => {
  return useQuery<FoodOrderDetail[]>({
    queryKey: ['my-food-orders'],
    queryFn: async () => {
      const res = await apiClient.get('/food-orders/my/');
      if (res.data?.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 20000, // Poll active tray tracking every 20s
  });
};

export const useFoodOrderStats = (hotelId?: number | string) => {
  return useQuery<FoodOrderStats>({
    queryKey: ['food-order-stats', hotelId],
    queryFn: async () => {
      const url = hotelId ? `/food-orders/stats/?hotel_id=${hotelId}` : '/food-orders/stats/';
      const res = await apiClient.get(url);
      return res.data?.data || res.data;
    },
    refetchInterval: 15000,
  });
};

export const useCreateFoodOrder = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (payload: CreateFoodOrderPayload) => {
      const res = await apiClient.post('/food-orders/', payload);
      return res.data;
    },
    onSuccess: (data) => {
      const orderId = data.data?.id || data.data?.order_id || '';
      showToast(
        `Your dining tray order #${orderId} has been sent to the executive kitchen!`,
        'success',
        'Order Placed'
      );
      queryClient.invalidateQueries({ queryKey: ['food-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-orders'] });
      queryClient.invalidateQueries({ queryKey: ['food-order-stats'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to place food order. Please check item availability.';
      showToast(msg, 'error', 'Dining Order Error');
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async ({ orderId, nextStatus }: { orderId: number; nextStatus: string }) => {
      const res = await apiClient.patch(`/food-orders/${orderId}/status/`, {
        order_status: nextStatus,
      });
      return res.data;
    },
    onSuccess: (data) => {
      const orderId = data.data?.id || data.data?.order_id || '';
      const st = data.data?.status || '';
      showToast(`KOT #${orderId} advanced to ${st}.`, 'success');
      queryClient.invalidateQueries({ queryKey: ['food-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-orders'] });
      queryClient.invalidateQueries({ queryKey: ['food-order-stats'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update order status.';
      showToast(msg, 'error', 'KOT Error');
    },
  });
};

export const useCancelFoodOrder = () => {
  const queryClient = useQueryClient();
  const { showToast } = useNotification();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiClient.post(`/food-orders/${orderId}/cancel/`);
      return res.data;
    },
    onSuccess: (data) => {
      showToast('Order has been cancelled.', 'success');
      queryClient.invalidateQueries({ queryKey: ['food-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-food-orders'] });
      queryClient.invalidateQueries({ queryKey: ['food-order-stats'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to cancel order.';
      showToast(msg, 'error');
    },
  });
};
