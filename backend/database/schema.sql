-- StayHive Database Schema (MySQL 8.x / MariaDB)
-- 33 Interconnected Tables with Foreign Keys and InnoDB Engine

CREATE DATABASE IF NOT EXISTS stayhive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stayhive;

-- 1. role
CREATE TABLE IF NOT EXISTS role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. user
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar VARCHAR(255) NULL,
    role_id INT NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. department
CREATE TABLE IF NOT EXISTS department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. hotel
CREATE TABLE IF NOT EXISTS hotel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    tagline VARCHAR(255) NULL,
    description TEXT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    pincode VARCHAR(20) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    star_rating DECIMAL(2,1) DEFAULT 5.0,
    image VARCHAR(255) NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. hotel_facility
CREATE TABLE IF NOT EXISTS hotel_facility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    facility_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NULL,
    description VARCHAR(255) NULL,
    CONSTRAINT fk_facility_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. gallery
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(150) NULL,
    is_featured TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gallery_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. room_type
CREATE TABLE IF NOT EXISTS room_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    size_sqft INT NULL,
    bed_type VARCHAR(100) NOT NULL DEFAULT 'King Bed',
    description TEXT NULL,
    image_url VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. room
CREATE TABLE IF NOT EXISTS room (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    room_type_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    status ENUM('Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning') NOT NULL DEFAULT 'Available',
    price_per_night DECIMAL(10,2) NOT NULL,
    housekeeping_status ENUM('Clean', 'Needs Cleaning', 'In Progress', 'Inspected') NOT NULL DEFAULT 'Clean',
    UNIQUE KEY uk_hotel_room (hotel_id, room_number),
    CONSTRAINT fk_room_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_type FOREIGN KEY (room_type_id) REFERENCES room_type(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. room_amenity
CREATE TABLE IF NOT EXISTS room_amenity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_type_id INT NOT NULL,
    amenity_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NULL,
    CONSTRAINT fk_amenity_room_type FOREIGN KEY (room_type_id) REFERENCES room_type(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. staff
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    department_id INT NOT NULL,
    hotel_id INT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    shift ENUM('Morning', 'Evening', 'Night', 'Rotational') DEFAULT 'Morning',
    salary DECIMAL(10,2) NULL,
    performance_score DECIMAL(3,2) DEFAULT 4.8,
    status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
    joined_date DATE NOT NULL,
    CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_staff_dept FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE RESTRICT,
    CONSTRAINT fk_staff_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. customer
CREATE TABLE IF NOT EXISTS customer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    id_proof_type VARCHAR(50) NULL,
    id_proof_number VARCHAR(100) NULL,
    address TEXT NULL,
    total_stays INT DEFAULT 0,
    total_spend DECIMAL(12,2) DEFAULT 0.00,
    loyalty_tier ENUM('Silver', 'Gold', 'Platinum') DEFAULT 'Silver',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. offer_package
CREATE TABLE IF NOT EXISTS offer_package (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    discount_percentage DECIMAL(5,2) NOT NULL,
    min_booking_amount DECIMAL(10,2) DEFAULT 0.00,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    usage_count INT DEFAULT 0,
    CONSTRAINT fk_offer_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. booking
CREATE TABLE IF NOT EXISTS booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    hotel_id INT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_guests INT NOT NULL DEFAULT 1,
    adults INT NOT NULL DEFAULT 1,
    children INT NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. booking_room
CREATE TABLE IF NOT EXISTS booking_room (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    room_id INT NOT NULL,
    allocated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_br_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_br_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. offer_application
CREATE TABLE IF NOT EXISTS offer_application (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    offer_id INT NOT NULL,
    discount_applied DECIMAL(10,2) NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_oa_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_oa_offer FOREIGN KEY (offer_id) REFERENCES offer_package(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. check_in
CREATE TABLE IF NOT EXISTS check_in (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    room_id INT NOT NULL,
    staff_id INT NOT NULL,
    check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_verified TINYINT(1) DEFAULT 1,
    key_card_issued VARCHAR(50) NULL,
    notes TEXT NULL,
    CONSTRAINT fk_checkin_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_checkin_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE RESTRICT,
    CONSTRAINT fk_checkin_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. restaurant
CREATE TABLE IF NOT EXISTS restaurant (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    cuisine VARCHAR(100) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    CONSTRAINT fk_restaurant_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. food
CREATE TABLE IF NOT EXISTS food (
    id INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category ENUM('Breakfast', 'Starters', 'Main Course', 'Desserts', 'Beverages') NOT NULL,
    price DECIMAL(8,2) NOT NULL,
    is_veg TINYINT(1) DEFAULT 1,
    is_available TINYINT(1) DEFAULT 1,
    image_url VARCHAR(255) NULL,
    preparation_time INT DEFAULT 20,
    CONSTRAINT fk_food_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurant(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. food_order
CREATE TABLE IF NOT EXISTS food_order (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    room_id INT NULL,
    order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Accepted', 'Preparing', 'Ready', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    payment_status ENUM('Unpaid', 'Paid', 'Billed to Room') DEFAULT 'Billed to Room',
    CONSTRAINT fk_fo_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_fo_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_fo_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. order_item
CREATE TABLE IF NOT EXISTS order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(8,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_oi_order FOREIGN KEY (food_order_id) REFERENCES food_order(id) ON DELETE CASCADE,
    CONSTRAINT fk_oi_food FOREIGN KEY (food_id) REFERENCES food(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. service
CREATE TABLE IF NOT EXISTS service (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hotel_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT DEFAULT 60,
    is_available TINYINT(1) DEFAULT 1,
    description TEXT NULL,
    CONSTRAINT fk_service_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. service_request
CREATE TABLE IF NOT EXISTS service_request (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    staff_id INT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Pending',
    notes TEXT NULL,
    CONSTRAINT fk_sr_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_sr_service FOREIGN KEY (service_id) REFERENCES service(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sr_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 23. housekeeping_task
CREATE TABLE IF NOT EXISTS housekeeping_task (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    staff_id INT NULL,
    task_type VARCHAR(100) NOT NULL DEFAULT 'Daily Clean',
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('Pending', 'Assigned', 'Cleaning', 'Inspection', 'Completed') DEFAULT 'Pending',
    scheduled_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    notes TEXT NULL,
    CONSTRAINT fk_ht_room FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE CASCADE,
    CONSTRAINT fk_ht_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 24. invoice
CREATE TABLE IF NOT EXISTS invoice (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    booking_id INT NOT NULL,
    issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    room_charges DECIMAL(10,2) NOT NULL,
    food_charges DECIMAL(10,2) DEFAULT 0.00,
    service_charges DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL,
    grand_total DECIMAL(10,2) NOT NULL,
    status ENUM('Paid', 'Unpaid', 'Refunded') DEFAULT 'Unpaid',
    CONSTRAINT fk_invoice_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 25. payment_method
CREATE TABLE IF NOT EXISTS payment_method (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    is_active TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 26. payment
CREATE TABLE IF NOT EXISTS payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Success', 'Pending', 'Failed', 'Refunded') DEFAULT 'Success',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_method FOREIGN KEY (payment_method_id) REFERENCES payment_method(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 27. cancellation_request
CREATE TABLE IF NOT EXISTS cancellation_request (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    staff_id INT NULL,
    reason TEXT NOT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    refund_applicable TINYINT(1) DEFAULT 1,
    refund_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    CONSTRAINT fk_cr_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 28. refund
CREATE TABLE IF NOT EXISTS refund (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cancellation_id INT NOT NULL,
    payment_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Initiated', 'Completed', 'Failed') DEFAULT 'Completed',
    processed_by INT NULL,
    processed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    bank_reference VARCHAR(100) NULL,
    CONSTRAINT fk_refund_cancellation FOREIGN KEY (cancellation_id) REFERENCES cancellation_request(id) ON DELETE CASCADE,
    CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES payment(id) ON DELETE RESTRICT,
    CONSTRAINT fk_refund_staff FOREIGN KEY (processed_by) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 29. feedback
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    customer_id INT NOT NULL,
    hotel_id INT NOT NULL,
    rating INT NOT NULL,
    cleanliness_rating INT NOT NULL DEFAULT 5,
    service_rating INT NOT NULL DEFAULT 5,
    comments TEXT NULL,
    staff_response TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_hotel FOREIGN KEY (hotel_id) REFERENCES hotel(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 30. complaint
CREATE TABLE IF NOT EXISTS complaint (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    booking_id INT NULL,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    assigned_to INT NULL,
    resolution_notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_complaint_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaint_staff FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 31. inquiry
CREATE TABLE IF NOT EXISTS inquiry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('New', 'Responded', 'Closed') DEFAULT 'New',
    assigned_to INT NULL,
    response TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inquiry_staff FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 32. notification
CREATE TABLE IF NOT EXISTS notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system',
    is_read TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 33. interaction
CREATE TABLE IF NOT EXISTS interaction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    staff_id INT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'Inquiry',
    notes TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interaction_customer FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    CONSTRAINT fk_interaction_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
