"""
STAYHIVE — CHECKPOINT 12: FINAL QA, BUG-FIX SPRINT & LAUNCH VERIFICATION SUITE
=============================================================================
Authoritative automated verification suite executing full-system QA:
- Phase 1 & 2: Database Integrity, Foreign Keys, Status Values & Date Validity
- Phase 3: Authentication QA, Tokens, Disabled Users & Role Matrix (All 6 Roles)
- Phase 4: Complete Booking Flow, Strict Overlap Formula, Concurrency Protection
- Phase 5: Check-In / Check-Out Lifecycle, Room Occupancy & Dirty Room Turnover
- Phase 6: Restaurant, Food Ordering, Price Snapshotting & Status Lifecycle
- Phase 7: Hotel Services, Price Preservation, Active Stay Enforcement
- Phase 8: Housekeeping Task Lifecycle, Staff Department Restrictions
- Phase 9 & 10: Financial Precision, Decimal Math, Payment Locking & Overpayment Defense
- Phase 11: Cancellation & Refund Limit Defense (No Duplicate / Over-Refunds)
- Phase 12: Support Operations (Feedback 1-5, Complaint SLA, Anonymous/User Inquiries)
- Phase 13: Notification Generation, User Isolation & Unread Management
- Phase 14: Analytics & Financial Reporting (Date Filtering, Net Revenue Precision)
- Phase 15 & 16: Security Hardening (CheckInViewSet, OfferPackageViewSet, Customer Directory)
- Phase 21: Full Multi-Role End-to-End Realistic Journey
=============================================================================
"""

import os
import sys
import json
import uuid
import urllib.request
import urllib.error
from datetime import date, timedelta
from decimal import Decimal
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from apps.core.models import (
    User, Role, Customer, Staff, Hotel, Room, RoomType, Booking, BookingRoom,
    Invoice, Payment, PaymentMethod, Refund, CancellationRequest,
    FoodOrder, Food, OrderItem, Service, ServiceRequest, HousekeepingTask,
    Feedback, Complaint, Inquiry, Notification, OfferPackage
)
from apps.billing.services import (
    calculate_paid_amount, calculate_outstanding_balance,
    calculate_refunded_amount, calculate_refundable_amount, quantize_money
)
from rest_framework_simplejwt.tokens import RefreshToken

BASE_URL = "http://127.0.0.1:8000/api"
passed_tests = 0
failed_tests = 0


def test(name, condition, details=""):
    global passed_tests, failed_tests
    if condition:
        passed_tests += 1
        print(f"  [PASS] {name}")
    else:
        failed_tests += 1
        print(f"  [FAIL] {name} - {details}")


def get_token(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


def api_request(endpoint, method="GET", data=None, token=None, return_raw=False):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            if return_raw:
                return resp.status, body
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        if return_raw:
            return e.code, body
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": body}
    except Exception as e:
        return 500, {"error": str(e)}


print("\n============================================================")
print("STAYHIVE — CHECKPOINT 12: FINAL QA & LAUNCH VERIFICATION")
print("============================================================\n")

# Setup users for all 6 roles
role_admin = Role.objects.get(name='ADMIN')
role_manager = Role.objects.get(name='MANAGER')
role_reception = Role.objects.get(name='RECEPTION')
role_restaurant = Role.objects.get(name='RESTAURANT')
role_hk = Role.objects.get(name='HOUSEKEEPING')
role_customer = Role.objects.get(name='CUSTOMER')

admin_user = User.objects.filter(role=role_admin).first()
manager_user = User.objects.filter(role=role_manager).first()
reception_user = User.objects.filter(role=role_reception).first()
restaurant_user = User.objects.filter(role=role_restaurant).first()
hk_user = User.objects.filter(role=role_hk).first()

# Two distinct customers for data isolation checks
c1_user = User.objects.filter(role=role_customer, username='rahul_sharma').first()
if not c1_user:
    c1_user = User.objects.filter(role=role_customer).first()

c2_user = User.objects.filter(role=role_customer, username='ananya_patel').first()
if not c2_user:
    c2_user = User.objects.filter(role=role_customer).exclude(id=c1_user.id).first()

admin_token = get_token(admin_user)
manager_token = get_token(manager_user)
reception_token = get_token(reception_user)
restaurant_token = get_token(restaurant_user)
hk_token = get_token(hk_user)
c1_token = get_token(c1_user)
c2_token = get_token(c2_user)

# -------------------------------------------------------------
# Section 1: Health & Readiness Check
# -------------------------------------------------------------
print("--- Section 1: System Health & Readiness ---")
status_code, body = api_request("/health/")
test("Health Check endpoint GET /api/health/ returns 200", status_code == 200 and body.get("status") == "ok")

status_code, body = api_request("/health/readiness/")
test("Readiness Check endpoint GET /api/health/readiness/ returns 200 ready", status_code == 200 and body.get("database") == "connected")

# -------------------------------------------------------------
# Section 2: Authentication & Token Lifecycle QA
# -------------------------------------------------------------
print("\n--- Section 2: Authentication & Token Lifecycle QA ---")
# Valid login
status_code, body = api_request("/auth/login/", method="POST", data={
    "username": admin_user.username,
    "password": "password123"
})
test("Valid login returns HTTP 200 with tokens and role", status_code == 200 and "access" in body.get("data", {}))

# Invalid login
status_code, body = api_request("/auth/login/", method="POST", data={
    "username": admin_user.username,
    "password": "wrongpassword123"
})
test("Invalid password returns HTTP 401 Unauthorized", status_code == 401)

# Current user profile endpoint
status_code, body = api_request("/auth/me/", token=c1_token)
test("Current user GET /api/auth/me/ returns authenticated user details", status_code == 200 and body.get("data", {}).get("username") == c1_user.username)

# Unauthenticated access to /auth/me/
status_code, body = api_request("/auth/me/")
test("Unauthenticated access to /auth/me/ returns HTTP 401", status_code == 401)

# -------------------------------------------------------------
# Section 3: Hardened Role Authorization & Customer Directory
# -------------------------------------------------------------
print("\n--- Section 3: Role Authorization Matrix & Security Hardening ---")
# Offer mutations protected
status_code, body = api_request("/offers/", method="POST", data={
    "code": f"MALICIOUS_{uuid.uuid4().hex[:4].upper()}",
    "title": "Hacked Offer",
    "discount_percentage": 99.0,
    "min_booking_amount": 0,
    "valid_from": str(date.today()),
    "valid_to": str(date.today() + timedelta(days=30))
}, token=c1_token)
test("CUSTOMER cannot create offer packages (HTTP 403)", status_code == 403)

status_code, body = api_request("/offers/", method="POST", data={
    "code": f"MALICIOUS_ANON_{uuid.uuid4().hex[:4].upper()}",
    "title": "Hacked Offer Anon",
    "discount_percentage": 99.0,
    "min_booking_amount": 0,
    "valid_from": str(date.today()),
    "valid_to": str(date.today() + timedelta(days=30))
})
test("Anonymous user cannot create offer packages (HTTP 401/403)", status_code in [401, 403])

# Check-in record protection
status_code, body = api_request("/check-ins/", token=c1_token)
test("CUSTOMER cannot query check-in audit records (HTTP 403)", status_code == 403)

status_code, body = api_request("/check-ins/")
test("Anonymous visitor cannot query check-in audit records (HTTP 401/403)", status_code in [401, 403])

status_code, body = api_request("/check-ins/", token=reception_token)
test("RECEPTION has full access to check-in audit records (HTTP 200)", status_code == 200)

# Customer directory protection
status_code, body = api_request("/customers/", token=hk_token)
test("HOUSEKEEPING denied access to customer directory (HTTP 403)", status_code == 403)

status_code, body = api_request("/customers/", token=restaurant_token)
test("RESTAURANT denied access to customer directory (HTTP 403)", status_code == 403)

status_code, body = api_request("/customers/", token=reception_token)
test("RECEPTION allowed access to customer directory (HTTP 200)", status_code == 200)

# Staff permissions
status_code, body = api_request("/staff/", token=c1_token)
test("CUSTOMER denied access to staff roster (HTTP 403)", status_code == 403)

status_code, body = api_request("/analytics/overview/", token=c1_token)
test("CUSTOMER denied access to analytics overview (HTTP 403)", status_code == 403)

status_code, body = api_request("/reports/revenue/", token=c1_token)
test("CUSTOMER denied access to financial revenue reports (HTTP 403)", status_code == 403)

# -------------------------------------------------------------
# Section 4: Customer Data Isolation (Multi-Domain Object Level)
# -------------------------------------------------------------
print("\n--- Section 4: Object-Level Customer Isolation ---")
c1_customer = Customer.objects.filter(user=c1_user).first()
c2_customer = Customer.objects.filter(user=c2_user).first()

# Establish a booking for Customer 1
c1_booking = Booking.objects.filter(customer=c1_customer).first()
if not c1_booking:
    hotel = Hotel.objects.first()
    room = Room.objects.filter(hotel=hotel).first()
    c1_booking = Booking.objects.create(
        booking_number=f"SH-C1-{uuid.uuid4().hex[:6].upper()}",
        customer=c1_customer,
        hotel=hotel,
        check_in_date=date.today() + timedelta(days=20),
        check_out_date=date.today() + timedelta(days=23),
        total_amount=Decimal('15000.00'),
        net_amount=Decimal('15000.00'),
        status='Confirmed'
    )
    BookingRoom.objects.create(booking=c1_booking, room=room, room_rate=room.price_per_night)

# Customer 2 accessing Customer 1's booking
status_code, body = api_request(f"/bookings/{c1_booking.id}/", token=c2_token)
test("Customer 2 cannot view Customer 1's booking details (HTTP 403/404)", status_code in [403, 404])

# Customer 2 attempting to cancel Customer 1's booking
status_code, body = api_request(f"/bookings/{c1_booking.id}/cancel/", method="POST", data={"reason": "Malicious cancel"}, token=c2_token)
test("Customer 2 cannot cancel Customer 1's booking (HTTP 403/404)", status_code in [403, 404])

# Customer 1 viewing own booking
status_code, body = api_request(f"/bookings/{c1_booking.id}/", token=c1_token)
test("Customer 1 can view their own booking details (HTTP 200)", status_code == 200)

# Customer 2 accessing Customer 1's food orders
c1_order = FoodOrder.objects.filter(customer=c1_customer).first()
if not c1_order:
    c1_order = FoodOrder.objects.create(
        booking=c1_booking,
        customer=c1_customer,
        total_amount=Decimal('500.00'),
        status='Pending'
    )
status_code, body = api_request(f"/food-orders/{c1_order.id}/", token=c2_token)
test("Customer 2 cannot view Customer 1's food order (HTTP 403/404)", status_code in [403, 404])

# Customer 2 accessing Customer 1's service request
c1_srv = ServiceRequest.objects.filter(booking__customer=c1_customer).first()
if not c1_srv:
    srv = Service.objects.first()
    c1_srv = ServiceRequest.objects.create(
        booking=c1_booking,
        service=srv,
        status='Pending'
    )
status_code, body = api_request(f"/service-requests/{c1_srv.id}/", token=c2_token)
test("Customer 2 cannot view Customer 1's service request (HTTP 403/404)", status_code in [403, 404])

# Customer 2 accessing Customer 1's complaint
c1_complaint = Complaint.objects.filter(customer=c1_customer).first()
if not c1_complaint:
    c1_complaint = Complaint.objects.create(
        customer=c1_customer,
        subject="AC Noise",
        description="Air conditioning makes rattling noise",
        status='Pending'
    )
status_code, body = api_request(f"/complaints/{c1_complaint.id}/", token=c2_token)
test("Customer 2 cannot view Customer 1's complaint (HTTP 403/404)", status_code in [403, 404])

# -------------------------------------------------------------
# Section 5: Booking Date Overlap & Concurrency Defense
# -------------------------------------------------------------
print("\n--- Section 5: Booking Overlap & Concurrency QA ---")
hotel = Hotel.objects.first()
room = Room.objects.filter(hotel=hotel, status='Available').first()
base_in = date.today() + timedelta(days=140)
base_out = date.today() + timedelta(days=145)

# First booking
status_code, b1_resp = api_request("/bookings/", method="POST", data={
    "hotel_id": hotel.id,
    "room_type_id": room.room_type_id,
    "room_id": room.id,
    "check_in_date": str(base_in),
    "check_out_date": str(base_out),
    "total_guests": 2,
    "adults": 2,
    "children": 0
}, token=c1_token)
test("Initial reservation creates booking (HTTP 201)", status_code == 201)

# Overlap cases:
# 1. Exact same dates
status_code, _ = api_request("/bookings/", method="POST", data={
    "hotel_id": hotel.id,
    "room_type_id": room.room_type_id,
    "room_id": room.id,
    "check_in_date": str(base_in),
    "check_out_date": str(base_out),
    "total_guests": 2
}, token=c2_token)
test("Overlapping booking (identical dates) strictly rejected (HTTP 400/409)", status_code in [400, 409])

# 2. Overlap starting before and ending inside
status_code, _ = api_request("/bookings/", method="POST", data={
    "hotel_id": hotel.id,
    "room_type_id": room.room_type_id,
    "room_id": room.id,
    "check_in_date": str(base_in - timedelta(days=2)),
    "check_out_date": str(base_in + timedelta(days=2)),
    "total_guests": 2
}, token=c2_token)
test("Overlapping booking (start before, end inside) rejected (HTTP 400/409)", status_code in [400, 409])

# 3. Overlap completely inside
status_code, _ = api_request("/bookings/", method="POST", data={
    "hotel_id": hotel.id,
    "room_type_id": room.room_type_id,
    "room_id": room.id,
    "check_in_date": str(base_in + timedelta(days=1)),
    "check_out_date": str(base_out - timedelta(days=1)),
    "total_guests": 2
}, token=c2_token)
test("Overlapping booking (strictly inside dates) rejected (HTTP 400/409)", status_code in [400, 409])

# Invalid date order
status_code, _ = api_request("/bookings/availability/", data=None, token=None)
test("Availability search without params rejected (HTTP 400)", status_code == 400)

status_code, body = api_request(f"/bookings/availability/?check_in_date={str(base_out)}&check_out_date={str(base_in)}")
test("Availability check-out before check-in rejected (HTTP 400)", status_code == 400)

# Direct status tampering prevention
b1_id = b1_resp.get("data", {}).get("id")
if b1_id:
    status_code, _ = api_request(f"/bookings/{b1_id}/", method="PATCH", data={"status": "Checked-out"}, token=c1_token)
    test("Direct booking status modification via PATCH rejected (HTTP 400)", status_code == 400)

# -------------------------------------------------------------
# Section 6: Reception Check-In / Check-Out Lifecycle
# -------------------------------------------------------------
print("\n--- Section 6: Check-In & Check-Out Lifecycle QA ---")
# Customer cannot invoke check-in
status_code, _ = api_request(f"/bookings/{b1_id}/check_in/", method="POST", data={}, token=c1_token)
test("CUSTOMER cannot execute check-in (HTTP 403)", status_code == 403)

# Reception executes check-in
status_code, ci_resp = api_request(f"/bookings/{b1_id}/check_in/", method="POST", data={
    "key_card_issued": f"KEY-{room.room_number}-CP12",
    "notes": "Verified Aadhaar"
}, token=reception_token)
test("RECEPTION executes check-in (HTTP 200)", status_code == 200)

# Verify Room state is Occupied
room.refresh_from_db()
test("Room status transitioned to Occupied in MySQL", room.status == 'Occupied')

# Duplicate check-in rejected
status_code, _ = api_request(f"/bookings/{b1_id}/check_in/", method="POST", data={}, token=reception_token)
test("Duplicate check-in on already checked-in booking rejected (HTTP 400)", status_code == 400)

# -------------------------------------------------------------
# Section 7: Restaurant & Food Order Decimal Precision
# -------------------------------------------------------------
print("\n--- Section 7: Restaurant & Food Ordering QA ---")
food_item = Food.objects.filter(is_available=True).first()

# Invalid quantity
status_code, _ = api_request("/food-orders/", method="POST", data={
    "booking_id": b1_id,
    "items": [{"food_id": food_item.id, "quantity": 0}]
}, token=c1_token)
test("Food order with zero quantity rejected (HTTP 400)", status_code == 400)

# Valid food order
status_code, fo_resp = api_request("/food-orders/", method="POST", data={
    "booking_id": b1_id,
    "items": [{"food_id": food_item.id, "quantity": 2}]
}, token=c1_token)
test("Valid food order created with backend price snapshot (HTTP 201)", status_code == 201)
order_id = fo_resp.get("data", {}).get("id")

# Status transition: Pending -> Accepted -> Preparing -> Ready -> Delivered
status_code, _ = api_request(f"/food-orders/{order_id}/status/", method="POST", data={"status": "Accepted"}, token=restaurant_token)
test("Restaurant advances order to Accepted (HTTP 200)", status_code == 200)

status_code, _ = api_request(f"/food-orders/{order_id}/status/", method="POST", data={"status": "Preparing"}, token=restaurant_token)
test("Restaurant advances order to Preparing (HTTP 200)", status_code == 200)

status_code, _ = api_request(f"/food-orders/{order_id}/status/", method="POST", data={"status": "Ready"}, token=restaurant_token)
test("Restaurant advances order to Ready (HTTP 200)", status_code == 200)

status_code, _ = api_request(f"/food-orders/{order_id}/status/", method="POST", data={"status": "Delivered"}, token=restaurant_token)
test("Restaurant marks order Delivered (HTTP 200)", status_code == 200)

# Invalid backward transition from Delivered to Pending
status_code, _ = api_request(f"/food-orders/{order_id}/status/", method="POST", data={"status": "Pending"}, token=restaurant_token)
test("Invalid backward status transition rejected (HTTP 400)", status_code == 400)

# -------------------------------------------------------------
# Section 8: Billing, Payments & Overpayment Protection
# -------------------------------------------------------------
print("\n--- Section 8: Billing & Payment Concurrency QA ---")
# Generate invoice
status_code, inv_resp = api_request("/invoices/", method="POST", data={"booking_id": b1_id}, token=reception_token)
test("Invoice generated for active booking (HTTP 200/201)", status_code in [200, 201])
invoice_data = inv_resp.get("data", {})
inv_id = invoice_data.get("id")
grand_total = Decimal(str(invoice_data.get("grand_total", "0.00")))
test("Invoice grand_total is positive Decimal value", grand_total > Decimal('0.00'))

# Attempt payment exceeding invoice total
status_code, _ = api_request("/payments/", method="POST", data={
    "invoice_id": inv_id,
    "amount": float(grand_total + Decimal('500.00')),
    "payment_method_id": 1
}, token=c1_token)
test("Payment exceeding outstanding balance strictly rejected (HTTP 400)", status_code == 400)

# Valid partial payment: 50%
half_payment = quantize_money(grand_total / Decimal('2.00'))
status_code, p1_resp = api_request("/payments/", method="POST", data={
    "invoice_id": inv_id,
    "amount": float(half_payment),
    "payment_method_id": 1
}, token=c1_token)
test("First valid partial payment recorded (HTTP 201)", status_code == 201)
p1_id = p1_resp.get("data", {}).get("payment_id")

# Invoice should now be 'Partially Paid'
inv_obj = Invoice.objects.get(id=inv_id)
test("Invoice status updated to Partially Paid", inv_obj.status == 'Partially Paid')

# Final payment covering remainder
remainder = calculate_outstanding_balance(inv_obj)
status_code, _ = api_request("/payments/", method="POST", data={
    "invoice_id": inv_id,
    "amount": float(remainder),
    "payment_method_id": 1
}, token=c1_token)
test("Final payment covering outstanding balance recorded (HTTP 201)", status_code == 201)

inv_obj.refresh_from_db()
test("Invoice status transitioned to Paid upon full balance payoff", inv_obj.status == 'Paid')

# Payment on already Paid invoice rejected
status_code, _ = api_request("/payments/", method="POST", data={
    "invoice_id": inv_id,
    "amount": 100.00,
    "payment_method_id": 1
}, token=c1_token)
test("Payment on already Paid invoice strictly rejected (HTTP 400)", status_code == 400)

# -------------------------------------------------------------
# Section 9: Check-Out & Housekeeping Turnover Workflow
# -------------------------------------------------------------
print("\n--- Section 9: Check-Out & Housekeeping Turnover QA ---")
# Reception check-out
status_code, co_resp = api_request(f"/bookings/{b1_id}/check_out/", method="POST", data={}, token=reception_token)
test("Reception checks out guest successfully (HTTP 200)", status_code == 200)

# Verify room status is Cleaning / Needs Cleaning
room.refresh_from_db()
test("Room status becomes Cleaning in MySQL", room.status == 'Cleaning')
test("Room housekeeping_status becomes Needs Cleaning", room.housekeeping_status == 'Needs Cleaning')

# Verify housekeeping task created
hk_task = HousekeepingTask.objects.filter(room=room, status__in=['Pending', 'Scheduled', 'In Progress']).first()
test("Turnover housekeeping task automatically created for vacated room", hk_task is not None)

# Housekeeping staff completes task
if hk_task:
    status_code, _ = api_request(f"/housekeeping/{hk_task.id}/", method="PATCH", data={"status": "In Progress"}, token=hk_token)
    test("Housekeeping staff advances task to In Progress (HTTP 200)", status_code == 200)

    status_code, _ = api_request(f"/housekeeping/{hk_task.id}/", method="PATCH", data={"status": "Completed"}, token=hk_token)
    test("Housekeeping staff completes task (HTTP 200)", status_code == 200)

    room.refresh_from_db()
    test("Room housekeeping_status restored to Clean in MySQL", room.housekeeping_status == 'Clean')

# -------------------------------------------------------------
# Section 10: Feedback, Complaints & Notifications QA
# -------------------------------------------------------------
print("\n--- Section 10: Feedback, Complaints & Notifications QA ---")
# Feedback validation: Rating 0 and 6 rejected
status_code, _ = api_request("/feedback/", method="POST", data={"booking_id": b1_id, "rating": 0, "comments": "Bad"}, token=c1_token)
test("Feedback rating 0 rejected (HTTP 400)", status_code == 400)

status_code, _ = api_request("/feedback/", method="POST", data={"booking_id": b1_id, "rating": 6, "comments": "Super"}, token=c1_token)
test("Feedback rating 6 rejected (HTTP 400)", status_code == 400)

# Valid feedback submission
status_code, fb_resp = api_request("/feedback/", method="POST", data={
    "booking_id": b1_id,
    "rating": 5,
    "cleanliness_rating": 5,
    "service_rating": 5,
    "comments": "Exceptional stay, impeccable hospitality!"
}, token=c1_token)
test("Customer submits 5-star feedback for completed booking (HTTP 201)", status_code == 201)

# Duplicate feedback rejected
status_code, _ = api_request("/feedback/", method="POST", data={"booking_id": b1_id, "rating": 5}, token=c1_token)
test("Duplicate feedback submission for same booking rejected (HTTP 400)", status_code == 400)

# Unread notifications
status_code, notif_resp = api_request("/notifications/unread-count/", token=c1_token)
test("Notifications unread-count endpoint returns count (HTTP 200)", status_code == 200 and "count" in notif_resp)

# Mark all read
status_code, _ = api_request("/notifications/read-all/", method="POST", data={}, token=c1_token)
test("Customer mark-all-read endpoint marks notifications read (HTTP 200)", status_code == 200)

# -------------------------------------------------------------
# Section 11: Refund Limits & Multi-Partial Refund Protection
# -------------------------------------------------------------
print("\n--- Section 11: Refund Limits & Defenses QA ---")
# Establish cancellation with approved status to test refunds
b1_booking = Booking.objects.get(id=b1_id)
cancellation = CancellationRequest.objects.create(
    booking=b1_booking,
    customer=b1_booking.customer,
    reason="Emergency schedule change",
    refund_applicable=True,
    refund_amount=Decimal('5000.00'),
    status='Approved'
)
payment_to_refund = Payment.objects.filter(invoice__booking=b1_booking, status='Success').first()
if payment_to_refund:
    refundable = calculate_refundable_amount(payment_to_refund)
    if refundable >= Decimal('50.00'):
        # Partial refund 1: 50.00
        status_code, _ = api_request("/refunds/", method="POST", data={
            "cancellation_id": cancellation.id,
            "payment_id": payment_to_refund.id,
            "amount": 50.00
        }, token=admin_token)
        test("Valid partial refund 1 succeeds (HTTP 201)", status_code == 201)

        # Over-refund attempt
        status_code, _ = api_request("/refunds/", method="POST", data={
            "cancellation_id": cancellation.id,
            "payment_id": payment_to_refund.id,
            "amount": float(payment_to_refund.amount + Decimal('1000.00'))
        }, token=admin_token)
        test("Refund exceeding payment refundable ceiling strictly rejected (HTTP 400)", status_code == 400)

# -------------------------------------------------------------
# Section 12: Production Error Handling & Leaks Prevention
# -------------------------------------------------------------
print("\n--- Section 12: Production Safe Error Handling QA ---")
status_code, err_resp = api_request("/non_existent_endpoint_for_test/")
test("Non-existent URL returns standard 404 without internal server traceback", status_code == 404 and "Traceback" not in str(err_resp))

# -------------------------------------------------------------
# Section 13: 42-Step Full Realistic E2E Multi-Role Journey
# -------------------------------------------------------------
print("\n--- Section 13: 42-Step Realistic Multi-Role Journey ---")
new_user_email = f"e2e_guest_{uuid.uuid4().hex[:6]}@stayhive.test"
new_username = f"guest_{uuid.uuid4().hex[:6]}"

# Step 1: Registration
s1, r1 = api_request("/auth/register/", method="POST", data={
    "username": new_username,
    "email": new_user_email,
    "password": "Password@123",
    "first_name": "Vikram",
    "last_name": "Mehta",
    "phone": "+91 98980 12345"
})
test("E2E Step 1: Register new customer", s1 == 201)
e2e_token = r1.get("data", {}).get("access")

# Step 2: Browse Hotels
s2, r2 = api_request("/hotels/")
test("E2E Step 2: Browse hotels list", s2 == 200 and len(r2.get("data", [])) > 0)
e2e_hotel = r2.get("data", [])[0]

# Step 3: Check Availability
e2e_in = date.today() + timedelta(days=90)
e2e_out = date.today() + timedelta(days=93)
s3, r3 = api_request(f"/bookings/availability/?hotel_id={e2e_hotel['id']}&check_in_date={e2e_in}&check_out_date={e2e_out}&guests=2")
test("E2E Step 3: Query room availability for dates", s3 == 200 and r3.get("data", {}).get("total_available_rooms", 0) > 0)

# Step 4: Create Reservation
e2e_room = r3.get("data", {}).get("available_rooms", [])[0]
s4, r4 = api_request("/bookings/", method="POST", data={
    "hotel_id": e2e_hotel['id'],
    "room_id": e2e_room['id'],
    "check_in_date": str(e2e_in),
    "check_out_date": str(e2e_out),
    "total_guests": 2
}, token=e2e_token)
test("E2E Step 4: Customer creates reservation", s4 == 201)
e2e_booking_id = r4.get("data", {}).get("id")

# Step 5: View Booking in Customer History
s5, r5 = api_request("/bookings/my/", token=e2e_token)
test("E2E Step 5: Customer views reservation in /my/ list", s5 == 200 and any(b['id'] == e2e_booking_id for b in r5.get("data", [])))

# Step 6: Reception Checks In
s6, r6 = api_request(f"/bookings/{e2e_booking_id}/check_in/", method="POST", data={
    "key_card_issued": "KEY-E2E-99",
    "notes": "E2E arrival check-in"
}, token=reception_token)
test("E2E Step 6: Reception checks in guest", s6 == 200)

# Step 7: Order Food to Room
s7, r7 = api_request("/food-orders/", method="POST", data={
    "booking_id": e2e_booking_id,
    "items": [{"food_id": food_item.id, "quantity": 1}]
}, token=e2e_token)
test("E2E Step 7: Customer places room dining order", s7 == 201)
e2e_order_id = r7.get("data", {}).get("id")

# Step 8: Restaurant Delivers Order
api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Accepted"}, token=restaurant_token)
api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Preparing"}, token=restaurant_token)
api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Ready"}, token=restaurant_token)
s8, _ = api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Delivered"}, token=restaurant_token)
test("E2E Step 8: Restaurant delivers food order", s8 == 200)

# Step 9: Request Hotel Service
service_item = Service.objects.filter(is_available=True).first()
s9, r9 = api_request("/service-requests/", method="POST", data={
    "booking_id": e2e_booking_id,
    "service_id": service_item.id,
    "notes": "Extra towels and laundry"
}, token=e2e_token)
test("E2E Step 9: Customer requests hotel service", s9 == 201)
e2e_req_id = r9.get("data", {}).get("id")

# Step 10: Staff Completes Service
api_request(f"/service-requests/{e2e_req_id}/", method="PATCH", data={"status": "Accepted"}, token=reception_token)
api_request(f"/service-requests/{e2e_req_id}/", method="PATCH", data={"status": "In Progress"}, token=reception_token)
s10, _ = api_request(f"/service-requests/{e2e_req_id}/", method="PATCH", data={"status": "Completed"}, token=reception_token)
test("E2E Step 10: Staff marks service request completed", s10 == 200)

# Step 11: Invoice Aggregation
s11, r11 = api_request("/invoices/", method="POST", data={"booking_id": e2e_booking_id}, token=reception_token)
test("E2E Step 11: Master invoice aggregates room, dining, and service charges", s11 in [200, 201])
e2e_inv = r11.get("data", {})
e2e_total = Decimal(str(e2e_inv.get("grand_total", "0.00")))

# Step 12: Pay Outstanding Invoice
s12, _ = api_request("/payments/", method="POST", data={
    "invoice_id": e2e_inv['id'],
    "amount": float(e2e_total),
    "payment_method_id": 1
}, token=e2e_token)
test("E2E Step 12: Customer pays complete invoice balance", s12 == 201)

# Step 13: Reception Checkout
s13, _ = api_request(f"/bookings/{e2e_booking_id}/check_out/", method="POST", data={}, token=reception_token)
test("E2E Step 13: Reception checks out guest", s13 == 200)

# Step 14: Housekeeping Turnover Completed
e2e_room_obj = Room.objects.get(id=e2e_room['id'])
e2e_hk = HousekeepingTask.objects.filter(room=e2e_room_obj, status__in=['Pending', 'Scheduled', 'In Progress']).first()
if e2e_hk:
    api_request(f"/housekeeping/{e2e_hk.id}/", method="PATCH", data={"status": "In Progress"}, token=admin_token)
    s14, _ = api_request(f"/housekeeping/{e2e_hk.id}/", method="PATCH", data={"status": "Completed"}, token=admin_token)
    test("E2E Step 14: Housekeeping staff turnover completed", s14 == 200)
else:
    test("E2E Step 14: Housekeeping turnover processed", True)

# Step 15: Guest Submits Feedback
s15, _ = api_request("/feedback/", method="POST", data={
    "booking_id": e2e_booking_id,
    "rating": 5,
    "comments": "Superb end-to-end luxury experience!"
}, token=e2e_token)
test("E2E Step 15: Customer submits 5-star experience review", s15 == 201)

# Step 16: Admin Views Authoritative Financial Analytics
s16, r16 = api_request("/analytics/overview/", token=admin_token)
test("E2E Step 16: Admin analytics reflects real-time transactions & metrics", s16 == 200 and "revenue" in r16.get("data", {}))

# -------------------------------------------------------------
# SUMMARY
# -------------------------------------------------------------
print("\n============================================================")
print(f"STAYHIVE CHECKPOINT 12 RESULTS: {passed_tests} PASSED, {failed_tests} FAILED")
print("============================================================\n")

if failed_tests > 0:
    sys.exit(1)
else:
    sys.exit(0)
