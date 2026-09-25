# StayHive — Production-Grade Hotel Management & Booking Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Backend-Python%203.12%20%2B%20Django%205-3776AB?logo=python&logoColor=white)](https://www.djangoproject.com/)
[![DRF](https://img.shields.io/badge/API-Django%20REST%20Framework-red?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![MySQL](https://img.shields.io/badge/Database-MySQL%208.x%20%2F%20MariaDB%20(33%20Tables)-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

**StayHive** is a luxury, enterprise-grade full-stack hotel management and booking platform. Built on an interconnected **33-table relational database**, it bridges high-end hospitality operations with customer reservation experiences.

---

## 🌟 Key Features

### Multi-Persona Architecture
Dedicated workspaces and views for all hotel operational roles:
- **Executive Admin (`ADMIN`)**: Real-time KPI metrics, Recharts revenue and occupancy analytics, department expenditure, quick action command palette (`Ctrl+K`).
- **Front Desk (`RECEPTION`)**: Express check-in/out, room allocations, keycard issuance, arrivals & departures timeline.
- **Housekeeping Manager (`HOUSEKEEPING`)**: Interactive Kanban cleaning dispatch board (`Pending`, `Cleaning`, `Inspection`, `Completed`), room priority escalations.
- **Executive Chef (`RESTAURANT`)**: Live Kitchen Order Ticket (KOT) workflow, table and room-service order tracking, menu item status.
- **Customer Guest Portal (`CUSTOMER`)**: Booking wizard with confetti celebration, digital room keycard, on-demand room service ordering, stay folio breakdown.

### Luxury Design & Experience
- **Tailored Aesthetics**: Warm slate, champagne gold, emerald accents, glassmorphic navigation, micro-animations via Framer Motion.
- **Global Theme Engine**: Dark Mode and Light Mode with persistent local storage.
- **GST Folio & Invoicing**: Comprehensive invoice generator with CGST/SGST breakdown, room tariffs, food charges, and payment tracking.
- **Interactive Command Palette (`Ctrl+K`)**: Rapid navigation across all 18 modules.

---

## 🏗️ Architecture & Technology Stack

```
Frontend (React 19 + Vite + Tailwind CSS v4)
                    │
           Axios REST Client (JWT Interceptor)
                    │
Backend (Python 3.12 + Django REST Framework)
                    │
            Django ORM + PyMySQL
                    │
Database (MySQL 8.x / MariaDB 10.4 — 33 Interconnected Tables)
```

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Recharts, Canvas Confetti, Axios |
| **Backend** | Python 3.12, Django 5.2, Django REST Framework, SimpleJWT, django-cors-headers, PyMySQL |
| **Database** | MySQL 8.x / MariaDB 10.4 (InnoDB, Foreign Key Constraints, 33 Tables) |

---

## 🗄️ Database Schema (33 Interconnected Tables)

StayHive implements an enterprise relational schema adhering strictly to InnoDB foreign key constraints:

1. `role` — System security roles (Admin, Manager, Reception, Housekeeping, Restaurant, Customer)
2. `user` — Centralized authentication with hashed passwords, JWT integration, and avatars
3. `department` — Operational hotel divisions (Front Desk, Housekeeping, Food & Beverage, Spa, etc.)
4. `hotel` — Multi-property registry with star ratings, Indian addresses, and coordinates
5. `hotel_facility` — Luxury facilities (Infinity Pool, Spa, Valet Parking, Helipad)
6. `room_type` — Categorized suites (Deluxe, Presidential, Royal, Beachfront)
7. `room` — Physical rooms with floor mapping, price per night, and live statuses
8. `room_amenity` — Specific in-room amenities (Jacuzzi, Espresso Machine, Sea View Balcony)
9. `room_pricing_history` — Dynamic rate tracking
10. `customer` — Guest profiles with loyalty tiers (Silver, Gold, Platinum) and identity proof
11. `staff` — Employee records with emergency contacts and salary structure
12. `staff_shift` — Shift scheduling (Morning, Evening, Night)
13. `booking` — Core reservation records with guest counts, dates, and amounts
14. `booking_room` — Specific room allocations per booking
15. `check_in` — Formal check-in registry with keycard allocations
16. `check_out` — Departure records and final room releases
17. `restaurant` — On-site luxury dining venues
18. `food` — Culinary items with dietary tags (Veg, Non-Veg, Jain)
19. `food_order` — Room-service & restaurant dining orders
20. `order_item` — Individual items within a food order
21. `service` — Auxiliary hotel services (Airport Transfer, Spa, Laundry, Car Rental)
22. `service_request` — Active guest service requests
23. `housekeeping_task` — Room turnover and sanitation task dispatch
24. `invoice` — Billing folios with tax calculation and itemized breakdowns
25. `payment_method` — Supported channels (UPI, Credit Card, Cash, Corporate)
26. `payment` — Recorded transactions linked to folios
27. `offer_package` — Promotional vouchers (e.g., `SUMMER15`, `ROYALSTAY`)
28. `offer_application` — Coupon redemption logs
29. `cancellation_policy` — Hotel cancellation guidelines and refund rules
30. `cancellation_request` — Guest cancellation applications and refund workflows
31. `feedback` — Guest star ratings and reviews
32. `complaint` — Helpdesk incident management with escalation levels
33. `inquiry` — Pre-booking and general inquiries

---

## 👥 Default User Personas & Credentials

All default accounts are pre-seeded in the database:

| Role | Username | Password | Full Name | Access Scope |
|---|---|---|---|---|
| **ADMIN** | `admin` | `admin123` | Harsh Poshiya (Super Admin) | Full System & Configuration |
| **MANAGER** | `manager_vikram` | `stayhive123` | Vikram Rathore | Hotel Operations & Analytics |
| **RECEPTION** | `reception_priya` | `stayhive123` | Priya Patel | Front Desk, Check-In/Out, Keys |
| **HOUSEKEEPING**| `housekeeping_suresh` | `stayhive123` | Suresh Kumar | Room Cleaning & Sanitation |
| **RESTAURANT** | `chef_anand` | `stayhive123` | Chef Anand Verma | Kitchen Order Tickets (KOT) |
| **CUSTOMER** | `rahul_sharma` | `stayhive123` | Rahul Sharma | Guest Portal, Digital Key, Booking |

> **Pro Tip**: Use the **Role Switcher** dropdown in the top-right header to instantaneously switch personas with zero login friction during testing!

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (tested on 3.12)
- **Node.js 18+** and **npm**
- **MySQL / MariaDB** (via XAMPP or standalone on port 3306)

---

### Step 1: Database Setup
1. Ensure your MySQL/MariaDB service is running on `127.0.0.1:3306`.
2. Open your MySQL client or terminal and execute:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p < backend/database/seed_data.sql
   ```
   *(If your root user has no password, omit `-p`)*.

---

### Step 2: Backend Setup (Django REST Framework)
1. Open a terminal in `backend/`:
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```
2. Verify database settings in `backend/config/settings.py` (defaults to `root` with no password).
3. Start the Django dev server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   The API will be available at `http://127.0.0.1:8000/api/`.

---

### Step 3: Frontend Setup (React + Vite)
1. Open a terminal in `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev -- --host 127.0.0.1 --port 5173
   ```
3. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173/
   ```

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/login/` | `POST` | Authenticate with username & password to receive JWT tokens |
| `/api/auth/me/` | `GET` | Retrieve authenticated user profile |
| `/api/hotels/` | `GET`, `POST` | Hotel properties list & details |
| `/api/rooms/` | `GET`, `POST` | Real-time rooms with occupancy and housekeeping status |
| `/api/rooms/{id}/update_status/` | `PATCH` | Update room status (`Available`, `Occupied`, `Cleaning`, `Maintenance`) |
| `/api/bookings/` | `GET`, `POST` | Booking reservations with pricing, offer validation, and auto-invoice |
| `/api/bookings/{id}/check_in/` | `POST` | Front-desk express check-in and keycard allocation |
| `/api/bookings/{id}/check_out/` | `POST` | Front-desk check-out and automated cleaning task dispatch |
| `/api/foods/` | `GET` | Restaurant culinary menu |
| `/api/orders/` | `GET`, `POST` | Kitchen food orders with items and room delivery |
| `/api/orders/{id}/update_status/` | `PATCH` | KOT lifecycle (`Pending` → `Preparing` → `Ready` → `Delivered`) |
| `/api/services/` | `GET` | Auxiliary amenities (Spa, Airport Transfer, Laundry) |
| `/api/service-requests/` | `GET`, `POST` | Guest service bookings |
| `/api/housekeeping/` | `GET`, `POST` | Housekeeping sanitation tasks |
| `/api/housekeeping/{id}/update_task_status/` | `PATCH` | Advance cleaning tasks (`Pending` → `Cleaning` → `Inspection` → `Completed`) |
| `/api/invoices/` | `GET` | Itemized guest folios with GST breakdown |
| `/api/invoices/{id}/pay_invoice/` | `POST` | Record payment against invoice folio |
| `/api/offers/` | `GET` | Active promotional packages and coupons |
| `/api/cancellations/` | `GET`, `POST` | Guest cancellation requests |
| `/api/feedback/` | `GET`, `POST` | Guest star ratings and reviews |
| `/api/complaints/` | `GET`, `POST` | Operational issues & incident resolution |
| `/api/inquiries/` | `GET`, `POST` | Pre-booking inquiries |
| `/api/notifications/` | `GET` | User-isolated notification center with unread count |
| `/api/analytics/overview/` | `GET` | Revenue, ADR, RevPAR, and occupancy analytics |
| `/api/reports/revenue/` | `GET` | Financial reports with date filtering and CSV export |
| `/api/health/` | `GET` | Production health check (`{"status": "ok"}`) |
| `/api/health/readiness/` | `GET` | Database connectivity readiness check (`{"status": "ready"}`) |

---

## 🔒 Security & Hardening (Checkpoint 11)

StayHive has been hardened for enterprise production environments:
- **Zero Hardcoded Secrets**: All keys, passwords, and sensitive settings are driven by environment variables (`.env`).
- **Production Exception Masking**: Internal stack traces and database exceptions are masked behind safe API responses while being logged to rotating server files (`stayhive.log`).
- **Role-Based Access Control (RBAC)**: Strict server-side authorization ensures Customers cannot access Admin/Staff views, Housekeeping cannot access payments, and Restaurant cannot access billing folios.
- **Object-Level Authorization**: Strict ownership validation ensures Customers can only view and mutate their own bookings, folios, orders, service requests, and notifications.
- **Double-Booking & Race Condition Prevention**: Database row-locking (`select_for_update`) and transactional concurrency checks guarantee room availability across overlapping dates.
- **Financial Precision**: All monetary values (invoices, payments, refunds, taxes, discounts) strictly utilize quantized `Decimal` arithmetic.
- **Deployment Hardening**: Automated checks (`python manage.py check --deploy`) confirm 0 issues under production settings.

---

## 🧪 Automated Testing & Verification

StayHive features complete end-to-end and regression test coverage across all checkpoints:

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run CP11 Security, Concurrency & Acceptance Suite (79 Tests)
python test_checkpoint11.py

# Run Cumulative Regression Suites (CP5–CP10)
python test_checkpoint10.py  # Notifications, Analytics, Reports (104 Tests)
python test_checkpoint9.py   # Feedback, Complaints, Inquiries (58 Tests)
python test_checkpoint8.py   # Invoices, Payments, Refunds (71 Tests)
python test_checkpoint7.py   # Services & Housekeeping (42 Tests)
python test_checkpoint6.py   # Restaurant & Food Orders (34 Tests)
python test_checkpoint5.py   # Reception Operations (29 Tests)
```

**Total automated tests: 417 passing, 0 failing.**

---

## 🚀 Production Deployment

For complete server setup, Gunicorn configuration, Nginx reverse proxy, SSL/HTTPS certificates, and automated MySQL backup instructions, see the dedicated [Deployment Guide](DEPLOYMENT.md).

---

## 📄 License
This project is licensed under the MIT License.

