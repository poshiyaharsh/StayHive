-- StayHive Database Seed Data (Realistic Luxury Indian Hotel Data)
USE stayhive;

-- 1. Roles
INSERT INTO role (id, name, description) VALUES
(1, 'ADMIN', 'Full system access and configurations'),
(2, 'MANAGER', 'Hotel operations, financials and reports'),
(3, 'RECEPTION', 'Front desk check-ins, check-outs, and room allocations'),
(4, 'HOUSEKEEPING', 'Room cleaning, maintenance status and inspections'),
(5, 'RESTAURANT', 'Food orders, dining menu, kitchen management'),
(6, 'CUSTOMER', 'Guest reservations, service requests and invoices')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Users (Default password will be initialized with Django standard hash)
INSERT INTO user (id, username, email, password, first_name, last_name, phone, avatar, role_id, is_active, created_at) VALUES
(1, 'admin', 'admin@stayhive.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Aditya', 'Singhania', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 1, 1, NOW()),
(2, 'manager_vikram', 'vikram.mehta@stayhive.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Vikram', 'Mehta', '+91 98765 43211', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 2, 1, NOW()),
(3, 'reception_priya', 'priya.sharma@stayhive.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Priya', 'Sharma', '+91 98765 43212', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 3, 1, NOW()),
(4, 'housekeeping_suresh', 'suresh.kumar@stayhive.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Suresh', 'Kumar', '+91 98765 43213', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 4, 1, NOW()),
(5, 'chef_anand', 'anand.joshi@stayhive.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Anand', 'Joshi', '+91 98765 43214', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 5, 1, NOW()),
(6, 'rahul_sharma', 'rahul.sharma@gmail.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Rahul', 'Sharma', '+91 98220 11223', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 6, 1, NOW()),
(7, 'ananya_patel', 'ananya.patel@gmail.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Ananya', 'Patel', '+91 98220 33445', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 6, 1, NOW()),
(8, 'arjun_verma', 'arjun.verma@gmail.com', 'pbkdf2_sha256$870000$stayhive_hash$123456', 'Arjun', 'Verma', '+91 98220 55667', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 6, 1, NOW())
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- 3. Departments
INSERT INTO department (id, name, description) VALUES
(1, 'Executive Management', 'Hotel strategy, executive oversight, revenue management'),
(2, 'Front Desk & Reception', 'Guest arrivals, departures, concierge, customer service'),
(3, 'Housekeeping & Sanitation', 'Room cleaning, linen management, property hygiene'),
(4, 'Food & Beverage', 'Fine dining, kitchen operations, room service dining'),
(5, 'Engineering & Maintenance', 'HVAC, electrical, plumbing, facilities maintenance')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Hotels
INSERT INTO hotel (id, name, tagline, description, address, city, state, country, pincode, contact_number, email, star_rating, image, is_active) VALUES
(1, 'StayHive Grand Ahmedabad', 'Urban Luxury in the Heart of Gujarat', 'Experience 5-star hospitality on Sindhu Bhavan Road featuring infinity pool, award-winning specialty restaurants, luxury spa, and high-tech conference spaces.', 'Sindhu Bhavan Marg, Bodakdev', 'Ahmedabad', 'Gujarat', 'India', '380054', '+91 79 4000 8800', 'grand.ahmedabad@stayhive.com', 5.0, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 1),
(2, 'StayHive Palace Udaipur', 'Royal Heritage by the Pichola Lake', 'Immerse yourself in Rajasthani regal architecture, serene lake views, private jharokhas, and royal Ayurvedic wellness rituals.', 'Lake Pichola Promenade', 'Udaipur', 'Rajasthan', 'India', '313001', '+91 294 240 9900', 'palace.udaipur@stayhive.com', 5.0, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', 1),
(3, 'StayHive Beach Resort Goa', 'Sun-Kissed Seaside Paradise', 'Unwind along pristine Calangute sands with private cabanas, sunset beach bar, deep-sea water sports, and tranquil tropical villas.', 'Calangute - Baga Coastal Road', 'North Goa', 'Goa', 'India', '403516', '+91 832 278 1100', 'resort.goa@stayhive.com', 4.9, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 1),
(4, 'StayHive Horizon Mumbai', 'Modern Skyline Luxury on Marine Drive', 'Panoramic Arabian Sea views, bespoke penthouse suites, Michelin-curated rooftop lounge, and 24-hour butler assistance in South Mumbai.', 'Marine Drive, Nariman Point', 'Mumbai', 'Maharashtra', 'India', '400021', '+91 22 6655 4400', 'horizon.mumbai@stayhive.com', 4.8, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Hotel Facilities
INSERT INTO hotel_facility (id, hotel_id, facility_name, icon, description) VALUES
(1, 1, 'Temperature-Controlled Infinity Pool', 'waves', 'Rooftop pool with skyline panoramic views'),
(2, 1, 'Ayurvedic Wellness Spa', 'sparkles', 'Holistic therapies, steam rooms & sauna'),
(3, 1, '24/7 TechnoGym Fitness Center', 'dumbbell', 'State-of-the-art strength & cardio equipment'),
(4, 1, 'High-Speed Wi-Fi 6', 'wifi', 'Complimentary 500 Mbps connection across property'),
(5, 1, 'Valet Parking & EV Charging', 'car', 'Underground secure valet parking with fast EV docks'),
(6, 2, 'Heritage Royal Courtyard', 'crown', 'Private traditional musical performances every evening'),
(7, 2, 'Sunset Lake Boating', 'ship', 'Private gondola rides on Lake Pichola'),
(8, 3, 'Private Beachfront Cabanas', 'umbrella', 'Exclusive beach access with butler service')
ON DUPLICATE KEY UPDATE facility_name=VALUES(facility_name);

-- 6. Gallery
INSERT INTO gallery (id, hotel_id, image_url, title, is_featured) VALUES
(1, 1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000', 'Grand Exterior Facade', 1),
(2, 1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000', 'Luxury Presidential Suite', 1),
(3, 1, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000', 'Rooftop Pool at Sunset', 1),
(4, 2, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1000', 'Udaipur Palace Architecture', 1),
(5, 3, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000', 'Goa Beachfront Villas', 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. Room Types
INSERT INTO room_type (id, type_name, base_price, capacity, size_sqft, bed_type, description, image_url) VALUES
(1, 'Deluxe King Room', 4500.00, 2, 420, '1 King Bed', 'Spacious luxury room with Italian marble bath, ergonomic work desk, high-speed Wi-Fi, and city skyline balcony.', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'),
(2, 'Premium Executive Suite', 7800.00, 3, 650, '1 King Bed + Sofa Bed', 'Separate living salon, espresso machine, soaking tub, complimentary club lounge access and airport drop.', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'),
(3, 'Royal Presidential Suite', 16500.00, 4, 1250, '2 King Beds', 'The ultimate StayHive indulgence: private jacuzzi terrace, dining room for 8, dedicated 24/7 butler, and designer amenities.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'),
(4, 'Family Grand Suite', 9800.00, 5, 850, '1 King Bed + 2 Twin Beds', 'Dual interconnecting bedrooms with children entertainment console, kitchenette, and dual rain showers.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800')
ON DUPLICATE KEY UPDATE type_name=VALUES(type_name);

-- 8. Room Amenities
INSERT INTO room_amenity (id, room_type_id, amenity_name, icon) VALUES
(1, 1, '55-inch 4K Smart OLED TV', 'tv'),
(2, 1, 'Nespresso Coffee Machine', 'coffee'),
(3, 1, 'High-Speed Wi-Fi 6', 'wifi'),
(4, 2, 'Private Balcony with View', 'eye'),
(5, 2, 'Luxury Soaking Bathtub', 'bath'),
(6, 3, 'Private Heated Jacuzzi', 'flame'),
(7, 3, 'Dedicated 24/7 Personal Butler', 'user-check'),
(8, 4, 'Dual Connected Bedrooms', 'layout')
ON DUPLICATE KEY UPDATE amenity_name=VALUES(amenity_name);

-- 9. Rooms
INSERT INTO room (id, hotel_id, room_type_id, room_number, floor, status, price_per_night, housekeeping_status) VALUES
(1, 1, 1, '101', 1, 'Occupied', 4500.00, 'Clean'),
(2, 1, 1, '102', 1, 'Available', 4500.00, 'Clean'),
(3, 1, 2, '201', 2, 'Occupied', 7800.00, 'Clean'),
(4, 1, 2, '202', 2, 'Cleaning', 7800.00, 'In Progress'),
(5, 1, 3, '301', 3, 'Reserved', 16500.00, 'Inspected'),
(6, 1, 4, '401', 4, 'Available', 9800.00, 'Clean'),
(7, 1, 1, '103', 1, 'Maintenance', 4500.00, 'Needs Cleaning'),
(8, 1, 2, '203', 2, 'Available', 7800.00, 'Clean'),
(9, 2, 1, '101', 1, 'Occupied', 5200.00, 'Clean'),
(10, 2, 3, '201', 2, 'Available', 18500.00, 'Clean'),
(11, 3, 1, '101', 1, 'Available', 4900.00, 'Clean'),
(12, 4, 2, '201', 2, 'Occupied', 8900.00, 'Clean')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10. Staff
INSERT INTO staff (id, user_id, department_id, hotel_id, designation, shift, salary, performance_score, status, joined_date) VALUES
(1, 1, 1, 1, 'Chief Executive Director', 'Morning', 180000.00, 4.98, 'Active', '2023-01-15'),
(2, 2, 1, 1, 'General Hotel Manager', 'Morning', 120000.00, 4.90, 'Active', '2023-03-01'),
(3, 3, 2, 1, 'Senior Reception Executive', 'Morning', 45000.00, 4.85, 'Active', '2023-06-10'),
(4, 4, 3, 1, 'Housekeeping Supervisor', 'Morning', 35000.00, 4.75, 'Active', '2023-08-20'),
(5, 5, 4, 1, 'Executive Master Chef', 'Evening', 75000.00, 4.92, 'Active', '2023-04-12')
ON DUPLICATE KEY UPDATE designation=VALUES(designation);

-- 11. Customer
INSERT INTO customer (id, user_id, id_proof_type, id_proof_number, address, total_stays, total_spend, loyalty_tier) VALUES
(1, 6, 'Aadhaar Card', '9845 2314 7890', '402, Shivalik Highstreet, Vastrapur, Ahmedabad', 5, 48500.00, 'Gold'),
(2, 7, 'Passport', 'Z8472910', 'B-12, Green Glen Layout, Bellandur, Bengaluru', 3, 29400.00, 'Silver'),
(3, 8, 'Driving License', 'DL-0420110023451', '701, Oberoi Splendor, JVLR, Andheri East, Mumbai', 8, 112000.00, 'Platinum')
ON DUPLICATE KEY UPDATE total_stays=VALUES(total_stays);

-- 12. Offer Packages
INSERT INTO offer_package (id, hotel_id, code, title, description, discount_percentage, min_booking_amount, valid_from, valid_to, is_active, usage_count) VALUES
(1, 1, 'WEEKEND20', 'StayHive Weekend Escape', 'Flat 20% discount on 2+ nights weekend bookings across all luxury suites.', 20.00, 8000.00, '2026-01-01', '2026-12-31', 1, 142),
(2, NULL, 'STAYHIVE15', 'Monsoon & Festive Special', '15% savings across all StayHive properties in India with free buffet breakfast.', 15.00, 5000.00, '2026-06-01', '2026-11-30', 1, 389),
(3, 2, 'ROYALUDAIPUR', 'Royal Udaipur Experience', '25% discount on Palace Suites including complimentary evening lake boat ride.', 25.00, 15000.00, '2026-01-01', '2026-12-31', 1, 78)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 13. Bookings
INSERT INTO booking (id, booking_number, customer_id, hotel_id, check_in_date, check_out_date, total_guests, adults, children, total_amount, discount_amount, net_amount, status, created_at) VALUES
(1, 'SH-2026-00101', 1, 1, '2026-09-22', '2026-09-25', 2, 2, 0, 13500.00, 2700.00, 10800.00, 'Checked-in', '2026-09-20 14:30:00'),
(2, 'SH-2026-00102', 2, 1, '2026-09-23', '2026-09-26', 3, 2, 1, 23400.00, 3510.00, 19890.00, 'Checked-in', '2026-09-21 10:15:00'),
(3, 'SH-2026-00103', 3, 1, '2026-09-25', '2026-09-28', 2, 2, 0, 49500.00, 0.00, 49500.00, 'Confirmed', '2026-09-22 18:45:00'),
(4, 'SH-2026-00104', 1, 2, '2026-10-02', '2026-10-05', 2, 2, 0, 15600.00, 2340.00, 13260.00, 'Confirmed', '2026-09-23 09:20:00'),
(5, 'SH-2026-00095', 3, 1, '2026-09-15', '2026-09-18', 2, 2, 0, 13500.00, 0.00, 13500.00, 'Completed', '2026-09-12 11:00:00')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 14. Booking Room allocations
INSERT INTO booking_room (id, booking_id, room_id, allocated_at) VALUES
(1, 1, 1, '2026-09-22 14:00:00'),
(2, 2, 3, '2026-09-23 11:30:00'),
(3, 3, 5, '2026-09-22 18:45:00'),
(4, 5, 2, '2026-09-15 12:00:00')
ON DUPLICATE KEY UPDATE room_id=VALUES(room_id);

-- 15. Offer Application
INSERT INTO offer_application (id, booking_id, offer_id, discount_applied, applied_at) VALUES
(1, 1, 1, 2700.00, '2026-09-20 14:30:00'),
(2, 2, 2, 3510.00, '2026-09-21 10:15:00'),
(3, 4, 2, 2340.00, '2026-09-23 09:20:00')
ON DUPLICATE KEY UPDATE discount_applied=VALUES(discount_applied);

-- 16. Check-in records
INSERT INTO check_in (id, booking_id, room_id, staff_id, check_in_time, id_verified, key_card_issued, notes) VALUES
(1, 1, 1, 3, '2026-09-22 14:15:00', 1, 'KEY-101-A', 'Guest requested late checkout at 1 PM'),
(2, 2, 3, 3, '2026-09-23 12:05:00', 1, 'KEY-201-B', 'VIP Gold Guest, extra towels and baby crib provided')
ON DUPLICATE KEY UPDATE key_card_issued=VALUES(key_card_issued);

-- 17. Restaurants
INSERT INTO restaurant (id, hotel_id, name, cuisine, opening_time, closing_time, is_active) VALUES
(1, 1, 'The Hive Grand Dining', 'Pan-Asian, North Indian & Continental', '07:00:00', '23:30:00', 1),
(2, 1, 'Saffron Spice Fine Dine', 'Authentic Gujarati & Royal Awadhi', '12:00:00', '23:00:00', 1),
(3, 2, 'Sheesh Mahal Terrace', 'Rajasthani Royal Thali & Continental', '07:30:00', '23:00:00', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 18. Food Items
INSERT INTO food (id, restaurant_id, name, category, price, is_veg, is_available, image_url, preparation_time) VALUES
(1, 1, 'Paneer Tikka Angara', 'Starters', 420.00, 1, 1, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500', 18),
(2, 1, 'Dal Makhani Bukhara', 'Main Course', 480.00, 1, 1, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', 25),
(3, 1, 'Murgh Makhani (Butter Chicken)', 'Main Course', 580.00, 0, 1, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500', 25),
(4, 1, 'StayHive Club Sandwich', 'Breakfast', 340.00, 1, 1, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', 15),
(5, 1, 'Masala Dosa with Chutneys', 'Breakfast', 280.00, 1, 1, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500', 15),
(6, 2, 'Kathiyawadi Royal Thali', 'Main Course', 650.00, 1, 1, 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500', 20),
(7, 1, 'Gulab Jamun with Rabdi', 'Desserts', 220.00, 1, 1, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500', 10),
(8, 1, 'Artisanal Cold Brew Coffee', 'Beverages', 260.00, 1, 1, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500', 8)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 19. Food Orders
INSERT INTO food_order (id, booking_id, customer_id, room_id, order_time, total_amount, status, payment_status) VALUES
(1, 1, 1, 1, '2026-09-22 20:30:00', 900.00, 'Delivered', 'Billed to Room'),
(2, 2, 2, 3, '2026-09-23 13:15:00', 1280.00, 'Preparing', 'Billed to Room')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 20. Order Items
INSERT INTO order_item (id, food_order_id, food_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 1, 420.00, 420.00),
(2, 1, 2, 1, 480.00, 480.00),
(3, 2, 6, 1, 650.00, 650.00),
(4, 2, 4, 1, 340.00, 340.00),
(5, 2, 8, 1, 260.00, 260.00),
(6, 2, 7, 1, 220.00, 220.00)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- 21. Services
INSERT INTO service (id, hotel_id, name, category, price, duration_minutes, is_available, description) VALUES
(1, 1, 'Abhyanga Ayurvedic Full Body Massage', 'Wellness & Spa', 3500.00, 75, 1, 'Herbal warm oil therapeutic massage releasing muscular fatigue and restoring vitality.'),
(2, 1, 'Express Dry Cleaning & Laundry', 'Housekeeping', 850.00, 180, 1, 'Same-day steam press, stain treatment and luxury garment finishing.'),
(3, 1, 'Luxury Airport Chauffeur Transfer (Mercedes E-Class)', 'Transport', 2400.00, 60, 1, 'Private airport pickup or drop with bottled water, Wi-Fi and chauffeur assistance.'),
(4, 1, 'Extra Rollaway Luxury Bed', 'Room Service', 1200.00, 30, 1, 'High-density memory foam rollaway bed with hypoallergenic duvet and pillows.'),
(5, 1, 'Celebration Room Decor & Cake', 'Concierge', 1800.00, 45, 1, 'Fresh orchid floral setup, balloons, and 500g handcrafted Belgian chocolate cake.')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 22. Service Requests
INSERT INTO service_request (id, booking_id, service_id, staff_id, requested_at, status, notes) VALUES
(1, 1, 3, 3, '2026-09-22 12:00:00', 'Completed', 'Chauffeur Ramesh picked up from Ahmedabad Airport Terminal 2'),
(2, 2, 2, 4, '2026-09-23 14:00:00', 'In Progress', '2 shirts and 1 formal blazer for dry cleaning')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 23. Housekeeping Tasks
INSERT INTO housekeeping_task (id, room_id, staff_id, task_type, priority, status, scheduled_time, completed_at, notes) VALUES
(1, 4, 4, 'Full Turnover Cleaning', 'Urgent', 'Cleaning', '2026-09-23 11:00:00', NULL, 'Checkout turnover for incoming guest arrival at 3 PM'),
(2, 7, 4, 'AC Filter & Drain Inspection', 'High', 'Pending', '2026-09-23 13:00:00', NULL, 'Reported minor AC moisture leak on terrace wall'),
(3, 2, 4, 'Routine Morning Inspection', 'Low', 'Completed', '2026-09-23 09:30:00', '2026-09-23 10:15:00', 'Sanitized, fresh amenities placed, mini-bar restocked')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 24. Invoices
INSERT INTO invoice (id, invoice_number, booking_id, issue_date, room_charges, food_charges, service_charges, subtotal, discount_amount, tax_amount, grand_total, status) VALUES
(1, 'INV-2026-00088', 5, '2026-09-18 11:30:00', 13500.00, 1450.00, 850.00, 15800.00, 0.00, 2844.00, 18644.00, 'Paid'),
(2, 'INV-2026-00091', 1, '2026-09-23 15:00:00', 10800.00, 900.00, 2400.00, 14100.00, 0.00, 2538.00, 16638.00, 'Unpaid')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 25. Payment Methods
INSERT INTO payment_method (id, name, code, is_active) VALUES
(1, 'UPI (Google Pay, PhonePe, Paytm)', 'UPI', 1),
(2, 'Credit Card (Visa, Mastercard, Amex)', 'CARD_CREDIT', 1),
(3, 'Debit Card', 'CARD_DEBIT', 1),
(4, 'Net Banking', 'NET_BANKING', 1),
(5, 'Cash at Desk', 'CASH', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 26. Payments
INSERT INTO payment (id, invoice_id, payment_method_id, transaction_id, amount, status, payment_date) VALUES
(1, 1, 1, 'TXN-UPI-9847291847', 18644.00, 'Success', '2026-09-18 11:45:00'),
(2, 2, 2, 'TXN-CARD-4829104820', 10800.00, 'Success', '2026-09-20 14:35:00')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 27. Cancellation Requests
INSERT INTO cancellation_request (id, booking_id, customer_id, staff_id, reason, requested_at, refund_applicable, refund_amount, status) VALUES
(1, 4, 1, 2, 'Emergency personal travel plan rescheduled', '2026-09-23 11:20:00', 1, 13260.00, 'Pending')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 28. Refunds
INSERT INTO refund (id, cancellation_id, payment_id, amount, status, processed_by, processed_at, bank_reference) VALUES
(1, 1, 2, 13260.00, 'Initiated', 2, NOW(), 'REF-HDFC-994821')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 29. Feedback
INSERT INTO feedback (id, booking_id, customer_id, hotel_id, rating, cleanliness_rating, service_rating, comments, staff_response, created_at) VALUES
(1, 5, 3, 1, 5, 5, 5, 'Unbelievable experience! The rooftop infinity pool and hospitality of Ms. Priya at the front desk was unmatched. Will return with family.', 'Thank you Mr. Arjun! We are thrilled you enjoyed your stay and look forward to welcoming you back soon.', '2026-09-18 16:00:00')
ON DUPLICATE KEY UPDATE comments=VALUES(comments);

-- 30. Complaints
INSERT INTO complaint (id, customer_id, booking_id, subject, category, priority, status, assigned_to, resolution_notes, created_at, resolved_at) VALUES
(1, 1, 1, 'Late night hallway noise on 1st floor', 'Noise Disturbance', 'Medium', 'Resolved', 3, 'Security visited the corridor and cautioned guests in room 108; guest offered complimentary breakfast beverage.', '2026-09-22 23:15:00', '2026-09-22 23:40:00'),
(2, 2, 2, 'Slow Wi-Fi speed in bedroom corner', 'Amenities', 'Low', 'In Progress', 4, 'IT dispatched a dedicated access point booster to Room 201.', '2026-09-23 14:10:00', NULL)
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

-- 31. Inquiries
INSERT INTO inquiry (id, customer_name, email, phone, subject, message, status, assigned_to, response, created_at) VALUES
(1, 'Dr. Sunita Rao', 'sunita.rao@apollo.org', '+91 94481 22334', 'Inquiry for 3-Day Medical Conference & 40 Rooms', 'We are organizing an international cardiology symposium in November 2026. Please share corporate delegate packages, banquet capacity and audio-visual inclusions.', 'Responded', 2, 'Dear Dr. Rao, our senior events director has sent the StayHive MICE brochure and corporate tariffs to your email. We look forward to hosting your symposium.', '2026-09-23 09:00:00'),
(2, 'Rohit Deshmukh', 'rohit.d@techcorp.in', '+91 98900 77665', 'Airport Pickup Availability for Midnight Flight', 'I will arrive at Ahmedabad airport at 2:30 AM on 28th Sep. Do you provide late night chauffeur transfers?', 'New', NULL, NULL, '2026-09-23 15:45:00')
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

-- 32. Notifications
INSERT INTO notification (id, user_id, title, message, type, is_read, created_at) VALUES
(1, 1, 'New Corporate Inquiry Received', 'Dr. Sunita Rao inquired for 40 luxury rooms and banquet booking.', 'inquiry', 0, NOW()),
(2, 6, 'Booking Confirmed: SH-2026-00101', 'Your stay at StayHive Grand Ahmedabad is active. Room 101 assigned.', 'booking', 1, NOW()),
(3, 4, 'Urgent Housekeeping Dispatch: Room 202', 'Room 202 turnover required for incoming check-in at 3:00 PM.', 'housekeeping', 0, NOW()),
(4, 5, 'New Room Service Order #202', 'Room 201 ordered 1x Royal Thali, 1x Club Sandwich.', 'food', 0, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 33. Interactions
INSERT INTO interaction (id, customer_id, staff_id, type, notes, created_at) VALUES
(1, 1, 3, 'Check-In', 'Customer checked in via Reception Desk. ID verified with Aadhaar. Digital keycard issued.', '2026-09-22 14:15:00'),
(2, 1, 3, 'Service Call', 'Customer requested airport cab for departure on 25th September.', '2026-09-23 10:00:00'),
(3, 3, 2, 'Feedback Call', 'Customer appreciated luxury service and expressed interest in StayHive Platinum membership.', '2026-09-19 11:30:00')
ON DUPLICATE KEY UPDATE notes=VALUES(notes);
