// StayHive 33-Table Relational Schema TypeScript Definitions

export type UserRole = 'ADMIN' | 'MANAGER' | 'RECEPTION' | 'HOUSEKEEPING' | 'RESTAURANT' | 'CUSTOMER';

export interface Role {
  id: number;
  name: UserRole;
  description?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role: Role | UserRole;
  role_detail?: Role;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  staff_count?: number;
}

export interface HotelFacility {
  id: number;
  hotel_id: number;
  facility_name: string;
  icon?: string;
  description?: string;
}

export interface Gallery {
  id: number;
  hotel_id: number;
  image_url: string;
  title?: string;
  is_featured: boolean;
  created_at: string;
}

export interface Hotel {
  id: number;
  name: string;
  tagline?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contact_number: string;
  email: string;
  star_rating: number;
  image?: string;
  is_active: boolean;
  created_at: string;
  facilities?: HotelFacility[];
  gallery_images?: Gallery[];
  rooms_count?: number;
  available_rooms_count?: number;
}

export interface RoomAmenity {
  id: number;
  room_type_id: number;
  amenity_name: string;
  icon?: string;
}

export interface RoomType {
  id: number;
  type_name: string;
  base_price: number;
  capacity: number;
  size_sqft?: number;
  bed_type: string;
  description?: string;
  image_url?: string;
  amenities?: RoomAmenity[];
  rooms_count?: number;
}

export type RoomStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Cleaning';
export type HousekeepingStatus = 'Clean' | 'Needs Cleaning' | 'In Progress' | 'Inspected';

export interface Room {
  id: number;
  hotel_id: number;
  room_type_id: number;
  hotel_name?: string;
  room_type_name?: string;
  room_number: string;
  floor: number;
  status: RoomStatus;
  price_per_night: number;
  housekeeping_status: HousekeepingStatus;
  capacity?: number;
  amenities?: RoomAmenity[];
}

export interface Staff {
  id: number;
  user_id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department_id: number;
  department_name?: string;
  hotel_id: number;
  hotel_name?: string;
  designation: string;
  shift: 'Morning' | 'Evening' | 'Night' | 'Rotational';
  salary?: number;
  performance_score: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  joined_date: string;
}

export interface Customer {
  id: number;
  user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  address?: string;
  total_stays: number;
  total_spend: number;
  loyalty_tier: 'Silver' | 'Gold' | 'Platinum';
  created_at: string;
  bookings?: any[];
  interactions?: any[];
}

export interface OfferPackage {
  id: number;
  hotel_id?: number;
  hotel_name?: string;
  code: string;
  title: string;
  description?: string;
  discount_percentage: number;
  min_booking_amount: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  usage_count: number;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled' | 'Completed';

export interface BookingRoom {
  id: number;
  booking_id: number;
  room_id: number;
  room_number: string;
  room_type: string;
  floor: number;
  allocated_at: string;
}

export interface CheckInRecord {
  id: number;
  booking_id: number;
  room_id: number;
  staff_id: number;
  room_number: string;
  staff_name?: string;
  check_in_time: string;
  id_verified: boolean;
  key_card_issued?: string;
  notes?: string;
}

export interface Booking {
  id: number;
  booking_number: string;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  hotel_id: number;
  hotel_name?: string;
  hotel_city?: string;
  check_in_date: string;
  check_out_date: string;
  total_guests: number;
  adults: number;
  children: number;
  total_amount: number;
  discount_amount: number;
  net_amount: number;
  status: BookingStatus;
  created_at: string;
  rooms?: BookingRoom[];
  check_in_record?: CheckInRecord;
  invoices?: any[];
  food_orders?: any[];
  service_requests?: any[];
}

export interface Restaurant {
  id: number;
  hotel_id: number;
  hotel_name?: string;
  name: string;
  cuisine: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
}

export interface Food {
  id: number;
  restaurant_id: number;
  restaurant_name?: string;
  name: string;
  category: 'Breakfast' | 'Starters' | 'Main Course' | 'Desserts' | 'Beverages';
  price: number;
  is_veg: boolean;
  is_available: boolean;
  image_url?: string;
  preparation_time: number;
}

export type FoodOrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: number;
  food_order_id: number;
  food_id: number;
  food_name: string;
  food_image?: string;
  is_veg: boolean;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface FoodOrder {
  id: number;
  booking_id?: number;
  booking_number?: string;
  customer_id: number;
  customer_name?: string;
  room_id?: number;
  room_number?: string;
  order_time: string;
  total_amount: number;
  status: FoodOrderStatus;
  payment_status: 'Unpaid' | 'Paid' | 'Billed to Room';
  items?: OrderItem[];
}

export interface Service {
  id: number;
  hotel_id: number;
  hotel_name?: string;
  name: string;
  category: string;
  price: number;
  duration_minutes: number;
  is_available: boolean;
  description?: string;
}

export type ServiceRequestStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';

export interface ServiceRequest {
  id: number;
  booking_id: number;
  booking_number?: string;
  customer_name?: string;
  service_id: number;
  service_name: string;
  service_category?: string;
  service_price: number;
  staff_id?: number;
  staff_name?: string;
  requested_at: string;
  status: ServiceRequestStatus;
  notes?: string;
}

export type HousekeepingPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type HousekeepingTaskStatus = 'Pending' | 'Assigned' | 'Cleaning' | 'Inspection' | 'Completed';

export interface HousekeepingTask {
  id: number;
  room_id: number;
  room_number: string;
  room_floor: number;
  room_type: string;
  hotel_name: string;
  staff_id?: number;
  staff_name?: string;
  task_type: string;
  priority: HousekeepingPriority;
  status: HousekeepingTaskStatus;
  scheduled_time: string;
  completed_at?: string;
  notes?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface Payment {
  id: number;
  invoice_id: number;
  invoice_number?: string;
  payment_method_id: number;
  method_name?: string;
  transaction_id: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed' | 'Refunded';
  payment_date: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  booking_id: number;
  booking_number: string;
  issue_date: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  hotel_name?: string;
  hotel_address?: string;
  hotel_city?: string;
  hotel_contact?: string;
  check_in_date?: string;
  check_out_date?: string;
  room_charges: number;
  food_charges: number;
  service_charges: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  status: 'Paid' | 'Unpaid' | 'Refunded';
  payments?: Payment[];
}

export interface CancellationRequest {
  id: number;
  booking_id: number;
  booking_number: string;
  customer_id: number;
  customer_name: string;
  staff_id?: number;
  reason: string;
  requested_at: string;
  refund_applicable: boolean;
  refund_amount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  refund?: any;
}

export interface Refund {
  id: number;
  cancellation_id: number;
  payment_id: number;
  amount: number;
  status: 'Initiated' | 'Completed' | 'Failed';
  processed_by?: number;
  staff_name?: string;
  processed_at: string;
  bank_reference?: string;
}

export interface Feedback {
  id: number;
  booking_id: number;
  customer_id: number;
  customer_name: string;
  customer_avatar?: string;
  hotel_id: number;
  hotel_name: string;
  rating: number;
  cleanliness_rating: number;
  service_rating: number;
  comments?: string;
  staff_response?: string;
  created_at: string;
}

export interface Complaint {
  id: number;
  customer_id: number;
  customer_name: string;
  booking_id?: number;
  booking_number?: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_to?: number;
  assigned_name?: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Inquiry {
  id: number;
  customer_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'New' | 'Responded' | 'Closed';
  assigned_to?: number;
  assigned_name?: string;
  response?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface Interaction {
  id: number;
  customer_id: number;
  staff_id?: number;
  type: string;
  notes: string;
  created_at: string;
}

export interface AnalyticsOverview {
  total_hotels: number;
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  cleaning_rooms: number;
  maintenance_rooms: number;
  occupancy_rate: number;
  todays_checkins: number;
  todays_checkouts: number;
  active_bookings: number;
  total_revenue: number;
  room_revenue: number;
  food_revenue: number;
  service_revenue: number;
  pending_payments: number;
  pending_complaints: number;
  revenue_trends: { month: string; revenue: number; bookings: number }[];
  room_status_distribution: { name: string; value: number; color: string }[];
  booking_sources: { source: string; percentage: number; color: string }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}
