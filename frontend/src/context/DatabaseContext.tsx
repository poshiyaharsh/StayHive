import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Hotel, Room, RoomType, Booking, FoodOrder, Food, Service, ServiceRequest,
  HousekeepingTask, Invoice, Staff, Customer, OfferPackage, CancellationRequest,
  Feedback, Complaint, Inquiry, Notification, AnalyticsOverview
} from '../types/database';
import apiClient from '../api/client';
import { useNotification } from './NotificationContext';

interface DatabaseContextType {
  hotels: Hotel[];
  rooms: Room[];
  roomTypes: RoomType[];
  bookings: Booking[];
  foods: Food[];
  foodOrders: FoodOrder[];
  services: Service[];
  serviceRequests: ServiceRequest[];
  housekeepingTasks: HousekeepingTask[];
  invoices: Invoice[];
  staff: Staff[];
  customers: Customer[];
  offers: OfferPackage[];
  cancellations: CancellationRequest[];
  feedbacks: Feedback[];
  complaints: Complaint[];
  inquiries: Inquiry[];
  notifications: Notification[];
  analytics: AnalyticsOverview | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  
  // Operational Actions
  createBooking: (bookingData: any) => Promise<any>;
  checkInGuest: (bookingId: number, roomNumber: string, keyCard: string) => Promise<boolean>;
  checkOutGuest: (bookingId: number) => Promise<boolean>;
  updateRoomStatus: (roomId: number, status: string, housekeeping?: string) => Promise<boolean>;
  createFoodOrder: (orderData: any) => Promise<any>;
  updateOrderStatus: (orderId: number, status: string) => Promise<boolean>;
  createServiceRequest: (bookingId: number, serviceId: number, notes?: string) => Promise<any>;
  updateServiceStatus: (requestId: number, status: string) => Promise<boolean>;
  updateHousekeepingTask: (taskId: number, status: string) => Promise<boolean>;
  payInvoice: (invoiceId: number, methodId: number, amount: number) => Promise<boolean>;
  approveCancellation: (cancelId: number) => Promise<boolean>;
  replyFeedback: (feedbackId: number, reply: string) => Promise<boolean>;
  resolveComplaint: (complaintId: number, notes: string) => Promise<boolean>;
  replyInquiry: (inquiryId: number, reply: string) => Promise<boolean>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState<boolean>(true);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState<HousekeepingTask[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [offers, setOffers] = useState<OfferPackage[]>([]);
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [
        hotelsRes, roomsRes, roomTypesRes, bookingsRes, foodsRes, ordersRes,
        servicesRes, sReqRes, hkRes, invRes, staffRes, custRes, offersRes,
        cancRes, fbRes, compRes, inqRes, notifRes, anRes
      ] = await Promise.allSettled([
        apiClient.get('/hotels/'),
        apiClient.get('/rooms/'),
        apiClient.get('/room-types/'),
        apiClient.get('/bookings/'),
        apiClient.get('/foods/'),
        apiClient.get('/orders/'),
        apiClient.get('/services/'),
        apiClient.get('/service-requests/'),
        apiClient.get('/housekeeping/'),
        apiClient.get('/invoices/'),
        apiClient.get('/staff/'),
        apiClient.get('/customers/'),
        apiClient.get('/offers/'),
        apiClient.get('/cancellations/'),
        apiClient.get('/feedback/'),
        apiClient.get('/complaints/'),
        apiClient.get('/inquiries/'),
        apiClient.get('/notifications/'),
        apiClient.get('/analytics/overview/')
      ]);

      if (hotelsRes.status === 'fulfilled' && hotelsRes.value.data?.data) {
        setHotels(hotelsRes.value.data.data);
      }
      if (roomsRes.status === 'fulfilled' && roomsRes.value.data?.data) {
        setRooms(roomsRes.value.data.data);
      }
      if (roomTypesRes.status === 'fulfilled' && roomTypesRes.value.data) {
        setRoomTypes(Array.isArray(roomTypesRes.value.data) ? roomTypesRes.value.data : roomTypesRes.value.data.data || []);
      }
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data?.data) {
        setBookings(bookingsRes.value.data.data);
      }
      if (foodsRes.status === 'fulfilled' && foodsRes.value.data) {
        setFoods(Array.isArray(foodsRes.value.data) ? foodsRes.value.data : foodsRes.value.data.data || []);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data?.data) {
        setFoodOrders(ordersRes.value.data.data);
      }
      if (servicesRes.status === 'fulfilled' && servicesRes.value.data) {
        setServices(Array.isArray(servicesRes.value.data) ? servicesRes.value.data : servicesRes.value.data.data || []);
      }
      if (sReqRes.status === 'fulfilled' && sReqRes.value.data?.data) {
        setServiceRequests(sReqRes.value.data.data);
      }
      if (hkRes.status === 'fulfilled' && hkRes.value.data?.data) {
        setHousekeepingTasks(hkRes.value.data.data);
      }
      if (invRes.status === 'fulfilled' && invRes.value.data?.data) {
        setInvoices(invRes.value.data.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value.data?.data) {
        setStaff(staffRes.value.data.data);
      }
      if (custRes.status === 'fulfilled' && custRes.value.data?.data) {
        setCustomers(custRes.value.data.data);
      }
      if (offersRes.status === 'fulfilled' && offersRes.value.data?.data) {
        setOffers(offersRes.value.data.data);
      }
      if (cancRes.status === 'fulfilled' && cancRes.value.data?.data) {
        setCancellations(cancRes.value.data.data);
      }
      if (fbRes.status === 'fulfilled' && fbRes.value.data?.data) {
        setFeedbacks(fbRes.value.data.data);
      }
      if (compRes.status === 'fulfilled' && compRes.value.data?.data) {
        setComplaints(compRes.value.data.data);
      }
      if (inqRes.status === 'fulfilled' && inqRes.value.data?.data) {
        setInquiries(inqRes.value.data.data);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.data?.data) {
        setNotifications(notifRes.value.data.data.notifications || []);
      }
      if (anRes.status === 'fulfilled' && anRes.value.data?.data) {
        setAnalytics(anRes.value.data.data);
      }
    } catch (e) {
      console.error('Error fetching StayHive data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Operational Action Implementations
  const createBooking = async (bookingData: any) => {
    try {
      const res = await apiClient.post('/bookings/', bookingData);
      if (res.data?.success) {
        showToast('Booking created successfully!', 'success', 'Reservation Confirmed');
        await refreshData();
        return res.data.data;
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create booking', 'error');
      throw err;
    }
  };

  const checkInGuest = async (bookingId: number, roomNumber: string, keyCard: string) => {
    try {
      const res = await apiClient.post('/reception/check-in/', {
        booking_id: bookingId,
        key_card_issued: keyCard
      });
      if (res.data?.success) {
        showToast(`Guest checked into Room ${roomNumber}. Keycard ${keyCard} active.`, 'success', 'Check-In Complete');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    }
    return false;
  };

  const checkOutGuest = async (bookingId: number) => {
    try {
      const res = await apiClient.post('/reception/check-out/', {
        booking_id: bookingId
      });
      if (res.data?.success) {
        showToast('Guest checked out. Housekeeping task dispatched.', 'success', 'Check-Out Complete');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Check-out failed', 'error');
    }
    return false;
  };

  const updateRoomStatus = async (roomId: number, status: string, housekeeping?: string) => {
    try {
      const res = await apiClient.patch(`/rooms/${roomId}/update_status/`, {
        status,
        housekeeping_status: housekeeping
      });
      if (res.data?.success) {
        showToast(`Room status updated to ${status}`, 'success');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to update room status', 'error');
    }
    return false;
  };

  const createFoodOrder = async (orderData: any) => {
    try {
      const res = await apiClient.post('/food-orders/', orderData);
      if (res.data?.success) {
        showToast('Food order sent to the kitchen!', 'success', 'Order Placed');
        await refreshData();
        return res.data.data;
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await apiClient.patch(`/food-orders/${orderId}/status/`, { order_status: status });
      if (res.data?.success) {
        showToast(`Order #${orderId} moved to ${status}`, 'info');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update order status', 'error');
    }
    return false;
  };

  const createServiceRequest = async (bookingId: number, serviceId: number, notes?: string) => {
    try {
      const res = await apiClient.post('/service-requests/', { booking_id: bookingId, service_id: serviceId, notes });
      if (res.data?.success) {
        showToast('Service requested. Staff will attend shortly.', 'success', 'Service Requested');
        await refreshData();
        return res.data.data;
      }
    } catch (err: any) {
      showToast('Failed to request service', 'error');
    }
  };

  const updateServiceStatus = async (requestId: number, status: string) => {
    try {
      const res = await apiClient.patch(`/service-requests/${requestId}/update_status/`, { status });
      if (res.data?.success) {
        showToast(`Service request updated to ${status}`, 'info');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to update service status', 'error');
    }
    return false;
  };

  const updateHousekeepingTask = async (taskId: number, status: string) => {
    try {
      const res = await apiClient.patch(`/housekeeping/${taskId}/update_task_status/`, { status });
      if (res.data?.success) {
        showToast(`Cleaning task marked as ${status}`, 'success');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to update housekeeping task', 'error');
    }
    return false;
  };

  const payInvoice = async (invoiceId: number, methodId: number, amount: number) => {
    try {
      const res = await apiClient.post(`/invoices/${invoiceId}/pay_invoice/`, {
        payment_method_id: methodId,
        amount
      });
      if (res.data?.success) {
        showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded!`, 'success', 'Payment Received');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to record payment', 'error');
    }
    return false;
  };

  const approveCancellation = async (cancelId: number) => {
    try {
      const res = await apiClient.post(`/cancellations/${cancelId}/approve/`);
      if (res.data?.success) {
        showToast('Cancellation approved & refund processed', 'success');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to approve cancellation', 'error');
    }
    return false;
  };

  const replyFeedback = async (feedbackId: number, response: string) => {
    try {
      const res = await apiClient.post(`/feedback/${feedbackId}/reply/`, { response });
      if (res.data?.success) {
        showToast('Guest response posted', 'success');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to post reply', 'error');
    }
    return false;
  };

  const resolveComplaint = async (complaintId: number, notes: string) => {
    try {
      const res = await apiClient.post(`/complaints/${complaintId}/resolve/`, { resolution_notes: notes });
      if (res.data?.success) {
        showToast('Complaint resolved & recorded', 'success');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to resolve complaint', 'error');
    }
    return false;
  };

  const replyInquiry = async (inquiryId: number, response: string) => {
    try {
      const res = await apiClient.post(`/inquiries/${inquiryId}/reply/`, { response });
      if (res.data?.success) {
        showToast('Inquiry response sent to guest', 'success');
        await refreshData();
        return true;
      }
    } catch (err: any) {
      showToast('Failed to send response', 'error');
    }
    return false;
  };

  return (
    <DatabaseContext.Provider
      value={{
        hotels,
        rooms,
        roomTypes,
        bookings,
        foods,
        foodOrders,
        services,
        serviceRequests,
        housekeepingTasks,
        invoices,
        staff,
        customers,
        offers,
        cancellations,
        feedbacks,
        complaints,
        inquiries,
        notifications,
        analytics,
        loading,
        refreshData,
        createBooking,
        checkInGuest,
        checkOutGuest,
        updateRoomStatus,
        createFoodOrder,
        updateOrderStatus,
        createServiceRequest,
        updateServiceStatus,
        updateHousekeepingTask,
        payInvoice,
        approveCancellation,
        replyFeedback,
        resolveComplaint,
        replyInquiry,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within DatabaseProvider');
  return context;
};
