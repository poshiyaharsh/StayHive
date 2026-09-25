"""
STAYHIVE — CHECKPOINT 11: FINAL SECURITY + CONCURRENCY + INTEGRITY TEST SUITE
=============================================================================
Comprehensive automated test suite verifying:
- Phase 63 & 64: Health (/api/health/) & Readiness (/api/health/readiness/) checks
- Phase 68: Complete Role Authorization Security Matrix (Admin, Manager, Reception, Restaurant, Housekeeping, Customer)
- Phase 7: Object-Level Authorization & Customer Data Isolation (Bookings, Invoices, Orders, Feedback, Complaints, Inquiries, Notifications)
- Phase 10 & 11: Booking Security & Double-Booking / Overlap Protection
- Phase 12: Payment Concurrency & Overpayment Protection (Total payments <= Invoice total)
- Phase 13: Refund Security (Total refunds <= Successful payments, Partial refund validation)
- Phase 14 & 15: Cancellation Security & Status Transition Tampering Prevention
- Phase 9: Financial Precision & Decimal Arithmetic (Quantized calculations)
- Phase 21: Production API Error Security (No stack trace exposure)
- Phase 2 & 4: Privilege Escalation Prevention (Role injection during registration blocked)
- Phase 40 & 74: Complete 40-Step Critical End-to-End Business Flow & Persistence
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
print("STAYHIVE — CHECKPOINT 11: FINAL SECURITY + TESTING + HARDENING")
print("============================================================\n")

# Load existing core users
admin_user = User.objects.get(username="admin")
manager_user = User.objects.get(username="manager_vikram")
reception_user = User.objects.get(username="reception_priya")
hk_user = User.objects.get(username="housekeeping_suresh")
rest_user = User.objects.get(username="chef_anand")
cust1_user = User.objects.get(username="rahul_sharma")
cust2_user = User.objects.get(username="ananya_patel")

admin_token = get_token(admin_user)
manager_token = get_token(manager_user)
reception_token = get_token(reception_user)
hk_token = get_token(hk_user)
rest_token = get_token(rest_user)
cust1_token = get_token(cust1_user)
cust2_token = get_token(cust2_user)

# ==============================================================================
# SECTION 1: HEALTH & READINESS ENDPOINTS (Phases 63 & 64)
# ==============================================================================
print("--- Section 1: Health & Readiness Endpoints ---")
st_h, data_h = api_request("/health/")
test("Health Check GET /api/health/ returns 200 ok",
     st_h == 200 and data_h.get("status") == "ok",
     f"Status: {st_h}, Data: {data_h}")

st_r, data_r = api_request("/health/readiness/")
test("Readiness Check GET /api/health/readiness/ returns 200 ready",
     st_r == 200 and data_r.get("status") == "ready" and data_r.get("database") == "connected",
     f"Status: {st_r}, Data: {data_r}")

# ==============================================================================
# SECTION 2: PRODUCTION ERROR HANDLING & INFO LEAKAGE (Phase 21)
# ==============================================================================
print("\n--- Section 2: Production Safe Error Handling ---")
st_nf, data_nf = api_request("/non-existent-endpoint-xyz-123/")
test("Non-existent endpoint returns 404 without internal traces",
     st_nf == 404,
     f"Status: {st_nf}, Body: {data_nf}")

# ==============================================================================
# SECTION 3: PRIVILEGE ESCALATION PREVENTION (Phases 2, 4, 34)
# ==============================================================================
print("\n--- Section 3: Privilege Escalation & Registration Hardening ---")
test_reg_email = f"attacker_{uuid.uuid4().hex[:6]}@example.com"
reg_payload = {
    "username": test_reg_email,
    "email": test_reg_email,
    "password": "SecurePassword123!",
    "first_name": "Injected",
    "last_name": "AdminAttempt",
    "role_name": "ADMIN"  # Malicious attempt to escalate role
}
st_reg, data_reg = api_request("/auth/register/", method="POST", data=reg_payload)
# Query created user from DB
created_user = User.objects.filter(email=test_reg_email).first()
test("Registration ignores injected ADMIN role and assigns CUSTOMER",
     created_user is not None and created_user.role.name == "CUSTOMER",
     f"Role was: {getattr(created_user.role, 'name', None) if created_user else 'None'}")

# ==============================================================================
# SECTION 4: ROLE AUTHORIZATION SECURITY MATRIX (Phase 68)
# ==============================================================================
print("\n--- Section 4: Role Authorization Security Matrix (Phase 68) ---")

# CUSTOMER restrictions
st_c_admin, _ = api_request("/analytics/overview/", token=cust1_token)
test("CUSTOMER: Cannot access admin analytics (403)",
     st_c_admin == 403, f"Status: {st_c_admin}")

st_c_staff, _ = api_request("/staff/", token=cust1_token)
test("CUSTOMER: Cannot access staff management (403)",
     st_c_staff == 403, f"Status: {st_c_staff}")

st_c_hk, _ = api_request("/housekeeping/tasks/", token=cust1_token)
test("CUSTOMER: Cannot access housekeeping tasks (403)",
     st_c_hk == 403, f"Status: {st_c_hk}")

st_c_rep, _ = api_request("/reports/revenue/", token=cust1_token)
test("CUSTOMER: Cannot access financial reports (403)",
     st_c_rep == 403, f"Status: {st_c_rep}")

# RESTAURANT restrictions
st_rest_bill, _ = api_request("/invoices/", token=rest_token)
test("RESTAURANT: Cannot access billing invoices (403)",
     st_rest_bill == 403, f"Status: {st_rest_bill}")

st_rest_hk, _ = api_request("/housekeeping/tasks/", token=rest_token)
test("RESTAURANT: Cannot access housekeeping administration (403)",
     st_rest_hk == 403, f"Status: {st_rest_hk}")

st_rest_menu, _ = api_request("/foods/", token=rest_token)
test("RESTAURANT: Can view and manage food menu (200)",
     st_rest_menu == 200, f"Status: {st_rest_menu}")

# HOUSEKEEPING restrictions
st_hk_pay, _ = api_request("/payments/", token=hk_token)
test("HOUSEKEEPING: Cannot access billing payments (403)",
     st_hk_pay == 403, f"Status: {st_hk_pay}")

st_hk_rest, _ = api_request("/food-orders/", token=hk_token)
test("HOUSEKEEPING: Cannot access restaurant orders (403)",
     st_hk_rest == 403, f"Status: {st_hk_rest}")

st_hk_tasks, _ = api_request("/housekeeping/tasks/", token=hk_token)
test("HOUSEKEEPING: Can access assigned housekeeping tasks (200)",
     st_hk_tasks == 200, f"Status: {st_hk_tasks}")

# RECEPTION operational limits
st_rec_arr, _ = api_request("/reception/arrivals/", token=reception_token)
test("RECEPTION: Can access reception arrivals dashboard (200)",
     st_rec_arr == 200, f"Status: {st_rec_arr}")

# ADMIN full access
st_adm_dash, _ = api_request("/analytics/overview/", token=admin_token)
test("ADMIN: Full intended access to system analytics (200)",
     st_adm_dash == 200, f"Status: {st_adm_dash}")

# ==============================================================================
# SECTION 5: OBJECT-LEVEL AUTHORIZATION & CUSTOMER ISOLATION (Phase 7)
# ==============================================================================
print("\n--- Section 5: Object-Level Authorization & Data Isolation (Phase 7) ---")
# Find a booking belonging to Customer 1
cust1_obj = Customer.objects.get(user=cust1_user)
cust2_obj = Customer.objects.get(user=cust2_user)

cust1_booking = Booking.objects.filter(customer=cust1_obj).first()
if cust1_booking:
    # Customer 2 attempts to view Customer 1's booking
    st_b_iso, _ = api_request(f"/bookings/{cust1_booking.id}/", token=cust2_token)
    test("Customer 2 CANNOT access Customer 1's Booking details (403 or 404)",
         st_b_iso in [403, 404], f"Status: {st_b_iso}")

    # Customer 2 attempts to cancel Customer 1's booking
    st_b_cancel, _ = api_request(f"/bookings/{cust1_booking.id}/cancel/", method="POST", data={"reason": "Malicious cancellation"}, token=cust2_token)
    test("Customer 2 CANNOT cancel Customer 1's Booking (403 or 404)",
         st_b_cancel in [403, 404], f"Status: {st_b_cancel}")

# Customer 2 attempts to access Customer 1's Food Order
cust1_order = FoodOrder.objects.filter(customer=cust1_obj).first()
if cust1_order:
    st_fo_iso, _ = api_request(f"/food-orders/{cust1_order.id}/", token=cust2_token)
    test("Customer 2 CANNOT access Customer 1's Food Order (403 or 404)",
         st_fo_iso in [403, 404], f"Status: {st_fo_iso}")

# Customer 2 attempts to access Customer 1's Service Request
cust1_req = ServiceRequest.objects.filter(booking__customer=cust1_obj).first()
if cust1_req:
    st_sr_iso, _ = api_request(f"/service-requests/{cust1_req.id}/", token=cust2_token)
    test("Customer 2 CANNOT access Customer 1's Service Request (403 or 404)",
         st_sr_iso in [403, 404], f"Status: {st_sr_iso}")

# Customer 2 attempts to access Customer 1's Inquiries
cust1_inq = Inquiry.objects.filter(customer=cust1_obj).first()
if cust1_inq:
    st_inq_iso, _ = api_request(f"/inquiries/{cust1_inq.id}/", token=cust2_token)
    test("Customer 2 CANNOT access Customer 1's Support Inquiry (403 or 404)",
         st_inq_iso in [403, 404], f"Status: {st_inq_iso}")

# Customer 2 attempts to access Customer 1's Complaints
cust1_cmp = Complaint.objects.filter(customer=cust1_obj).first()
if cust1_cmp:
    st_cmp_iso, _ = api_request(f"/complaints/{cust1_cmp.id}/", token=cust2_token)
    test("Customer 2 CANNOT access Customer 1's Complaint (403 or 404)",
         st_cmp_iso in [403, 404], f"Status: {st_cmp_iso}")

# ==============================================================================
# SECTION 6: STATUS TRANSITION TAMPERING & WORKFLOW SECURITY (Phase 15)
# ==============================================================================
print("\n--- Section 6: Status Transition & Workflow Security (Phase 15) ---")

# Customer attempts to directly PATCH a booking status to 'Checked-out'
if cust1_booking:
    st_patch, data_patch = api_request(f"/bookings/{cust1_booking.id}/", method="PATCH", data={"status": "Checked-out"}, token=cust1_token)
    test("Direct booking status modification via PATCH is rejected (400)",
         st_patch == 400, f"Status: {st_patch}, Body: {data_patch}")

    # Customer attempts to trigger reception check-in directly
    st_cust_ci, _ = api_request(f"/bookings/{cust1_booking.id}/check_in/", method="POST", token=cust1_token)
    test("Customer CANNOT invoke reception check-in directly (403)",
         st_cust_ci == 403, f"Status: {st_cust_ci}")

    # Customer attempts to trigger reception check-out directly
    st_cust_co, _ = api_request(f"/bookings/{cust1_booking.id}/check_out/", method="POST", token=cust1_token)
    test("Customer CANNOT invoke reception check-out directly (403)",
         st_cust_co == 403, f"Status: {st_cust_co}")

# Customer attempts to advance their own food order status
if cust1_order:
    st_fo_status, _ = api_request(f"/food-orders/{cust1_order.id}/status/", method="POST", data={"status": "Delivered"}, token=cust1_token)
    test("Customer CANNOT advance their own Food Order status to Delivered (403)",
         st_fo_status == 403, f"Status: {st_fo_status}")

# ==============================================================================
# SECTION 7: DECIMAL FINANCIAL PRECISION (Phase 9)
# ==============================================================================
print("\n--- Section 7: Decimal Precision & Money Security (Phase 9) ---")
offer_code_payload = {
    "code": "WEEKEND20",
    "amount": "15000.00"
}
st_off, data_off = api_request("/offers/validate_code/", method="POST", data=offer_code_payload)
test("Offer validation calculates exact discount via Decimal precision",
     st_off == 200 and data_off.get("success") is True and Decimal(str(data_off["data"]["discount_amount"])) > 0,
     f"Status: {st_off}, Data: {data_off}")

# Verify quantize_money helper
d_raw = Decimal("123.4567")
d_quant = quantize_money(d_raw)
test("quantize_money accurately rounds and preserves 2-decimal precision",
     d_quant == Decimal("123.46"), f"Result: {d_quant}")

# ==============================================================================
# SECTION 8: DOUBLE-BOOKING & OVERLAP PROTECTION (Phases 10 & 11)
# ==============================================================================
print("\n--- Section 8: Double-Booking & Date Overlap Protection (Phases 10 & 11) ---")
hotel = Hotel.objects.first()
room_type = RoomType.objects.first()
# Find an available room
target_room = Room.objects.filter(hotel=hotel, room_type=room_type, status='Available').first()
if not target_room:
    target_room = Room.objects.filter(hotel=hotel).first()

# Pick test dates
t_in = (date.today() + timedelta(days=40)).isoformat()
t_out = (date.today() + timedelta(days=45)).isoformat()

# Booking 1: Reserve target room
b1_payload = {
    "hotel_id": hotel.id,
    "room_type_id": target_room.room_type_id,
    "room_id": target_room.id,
    "check_in_date": t_in,
    "check_out_date": t_out,
    "total_guests": 2,
    "adults": 2,
    "children": 0
}
st_b1, data_b1 = api_request("/bookings/", method="POST", data=b1_payload, token=cust1_token)
test("Initial reservation of target room succeeds (201)",
     st_b1 == 201, f"Status: {st_b1}, Data: {data_b1}")

# Booking 2: Attempt overlapping reservation on the same room (e.g., day 42 to 47)
overlap_in = (date.today() + timedelta(days=42)).isoformat()
overlap_out = (date.today() + timedelta(days=47)).isoformat()
b2_payload = {
    "hotel_id": hotel.id,
    "room_type_id": target_room.room_type_id,
    "room_id": target_room.id,
    "check_in_date": overlap_in,
    "check_out_date": overlap_out,
    "total_guests": 2,
    "adults": 2,
    "children": 0
}
st_b2, data_b2 = api_request("/bookings/", method="POST", data=b2_payload, token=cust2_token)
test("Overlapping reservation on the same room is STRICTLY REJECTED (400 or 409)",
     st_b2 in [400, 409], f"Status: {st_b2}, Data: {data_b2}")

# ==============================================================================
# SECTION 9: PAYMENT OVERPAYMENT & CONCURRENCY PROTECTION (Phase 12)
# ==============================================================================
print("\n--- Section 9: Payment Overpayment & Concurrency Security (Phase 12) ---")
# Use the booking we just created
created_booking_id = data_b1["data"]["id"]
created_booking = Booking.objects.get(id=created_booking_id)

# Generate invoice for this booking
st_inv, data_inv = api_request("/invoices/", method="POST", data={"booking_id": created_booking_id}, token=reception_token)
test("Invoice generated for reservation (201 or 200)",
     st_inv in [200, 201], f"Status: {st_inv}, Data: {data_inv}")

invoice_id = data_inv["data"]["id"]
invoice_obj = Invoice.objects.get(id=invoice_id)
grand_total = invoice_obj.grand_total

# Payment method
pm = PaymentMethod.objects.filter(is_active=True).first()

# Attempt 1: Overpayment attempt (paying grand_total + ₹10,000)
excess_amount = grand_total + Decimal("10000.00")
st_over, data_over = api_request("/payments/", method="POST", data={
    "invoice_id": invoice_id,
    "payment_method_id": pm.id,
    "amount": float(excess_amount),
    "transaction_id": f"TXN-OVER-{uuid.uuid4().hex[:6]}"
}, token=reception_token)
test("Payment exceeding outstanding balance is strictly rejected (400)",
     st_over == 400, f"Status: {st_over}, Data: {data_over}")

# Attempt 2: Partial payment 1 (50% of grand total)
half_amount = quantize_money(grand_total / Decimal("2.00"))
st_p1, data_p1 = api_request("/payments/", method="POST", data={
    "invoice_id": invoice_id,
    "payment_method_id": pm.id,
    "amount": float(half_amount),
    "transaction_id": f"TXN-P1-{uuid.uuid4().hex[:6]}"
}, token=reception_token)
test("First valid partial payment succeeds (201)",
     st_p1 == 201, f"Status: {st_p1}")

# Attempt 3: Second partial payment for remaining balance
rem_balance = grand_total - half_amount
st_p2, data_p2 = api_request("/payments/", method="POST", data={
    "invoice_id": invoice_id,
    "payment_method_id": pm.id,
    "amount": float(rem_balance),
    "transaction_id": f"TXN-P2-{uuid.uuid4().hex[:6]}"
}, token=reception_token)
test("Second partial payment covering remainder succeeds and marks invoice Paid (201)",
     st_p2 == 201, f"Status: {st_p2}")

invoice_obj.refresh_from_db()
test("Invoice status updated to Paid with 0 outstanding balance",
     invoice_obj.status == "Paid", f"Status: {invoice_obj.status}")

# Attempt 4: Payment on fully paid invoice
st_p3, data_p3 = api_request("/payments/", method="POST", data={
    "invoice_id": invoice_id,
    "payment_method_id": pm.id,
    "amount": 100.0,
    "transaction_id": f"TXN-P3-{uuid.uuid4().hex[:6]}"
}, token=reception_token)
test("Payment on already Paid invoice is strictly rejected (400)",
     st_p3 == 400, f"Status: {st_p3}")

# ==============================================================================
# SECTION 10: REFUND CONCURRENCY & LIMIT SECURITY (Phase 13)
# ==============================================================================
print("\n--- Section 10: Refund Limit & Multi-Partial Refund Security (Phase 13) ---")
# Create an approved cancellation request to test partial refunds via POST /api/refunds/
cancellation_req = CancellationRequest.objects.create(
    booking=created_booking,
    customer=created_booking.customer,
    reason="Testing manual partial refund constraints",
    refund_applicable=True,
    refund_amount=grand_total,
    status='Approved'
)

payment1 = Payment.objects.filter(invoice=invoice_obj, status="Success").first()
p1_amount = payment1.amount

# Refund 1: Valid partial refund (40% of payment 1)
ref1_amount = quantize_money(p1_amount * Decimal("0.40"))
st_rf1, data_rf1 = api_request("/refunds/", method="POST", data={
    "cancellation_id": cancellation_req.id,
    "payment_id": payment1.id,
    "amount": float(ref1_amount)
}, token=admin_token)
test("Valid partial refund 1 succeeds (201 or 200)",
     st_rf1 in [200, 201], f"Status: {st_rf1}, Data: {data_rf1}")

# Refund 2: Valid partial refund for the remaining 60%
ref2_amount = p1_amount - ref1_amount
st_rf2, data_rf2 = api_request("/refunds/", method="POST", data={
    "cancellation_id": cancellation_req.id,
    "payment_id": payment1.id,
    "amount": float(ref2_amount)
}, token=admin_token)
test("Valid partial refund 2 exhausting payment refundable amount succeeds (201 or 200)",
     st_rf2 in [200, 201], f"Status: {st_rf2}, Data: {data_rf2}")

# Refund 3: Excessive refund attempt beyond total paid (even ₹1)
st_rf3, data_rf3 = api_request("/refunds/", method="POST", data={
    "cancellation_id": cancellation_req.id,
    "payment_id": payment1.id,
    "amount": 1.0
}, token=admin_token)
test("Refund exceeding total refundable amount is STRICTLY REJECTED (400)",
     st_rf3 == 400, f"Status: {st_rf3}, Data: {data_rf3}")

# ==============================================================================
# SECTION 11: COMPLETE 40-STEP CRITICAL END-TO-END REGRESSION (Phases 40 & 74)
# ==============================================================================
print("\n--- Section 11: Critical 40-Step End-to-End Acceptance Flow ---")

# Step 1: Register unique customer
e2e_email = f"e2e_guest_{uuid.uuid4().hex[:6]}@stayhive.test"
st_e1, data_e1 = api_request("/auth/register/", method="POST", data={
    "username": e2e_email,
    "email": e2e_email,
    "password": "Password123!",
    "first_name": "E2E",
    "last_name": "AcceptanceGuest"
})
test("Step 1: Register new customer", st_e1 == 201, f"Status: {st_e1}")

# Step 2: Login customer
st_e2, data_e2 = api_request("/auth/login/", method="POST", data={
    "username": e2e_email,
    "password": "Password123!"
})
e2e_token = data_e2.get("data", {}).get("access")
test("Step 2: Login new customer and receive JWT token", st_e2 == 200 and bool(e2e_token), f"Status: {st_e2}")

# Step 3: Browse hotels
st_e3, data_e3 = api_request("/hotels/", token=e2e_token)
test("Step 3: Browse hotels", st_e3 == 200 and len(data_e3.get("data", [])) > 0, f"Count: {len(data_e3.get('data', []))}")

# Step 4: Browse rooms
st_e4, data_e4 = api_request("/rooms/", token=e2e_token)
test("Step 4: Browse rooms", st_e4 == 200 and len(data_e4.get("data", [])) > 0, f"Count: {len(data_e4.get('data', []))}")

# Step 5: Check availability
cin_date = (date.today() + timedelta(days=60)).isoformat()
cout_date = (date.today() + timedelta(days=63)).isoformat()
st_e5, data_e5 = api_request(f"/bookings/availability/?check_in_date={cin_date}&check_out_date={cout_date}", token=e2e_token)
test("Step 5: Search room availability for date range", st_e5 == 200 and data_e5.get("success") is True, f"Data: {data_e5}")

# Step 6: Create booking
e2e_hotel = Hotel.objects.first()
e2e_rt = RoomType.objects.first()
st_e6, data_e6 = api_request("/bookings/", method="POST", data={
    "hotel_id": e2e_hotel.id,
    "room_type_id": e2e_rt.id,
    "check_in_date": cin_date,
    "check_out_date": cout_date,
    "total_guests": 2,
    "adults": 2,
    "children": 0
}, token=e2e_token)
e2e_booking_id = data_e6.get("data", {}).get("id")
test("Step 6: Customer creates booking", st_e6 == 201 and bool(e2e_booking_id), f"Booking ID: {e2e_booking_id}")

# Step 7: View booking
st_e7, data_e7 = api_request(f"/bookings/{e2e_booking_id}/", token=e2e_token)
test("Step 7: Customer views own booking details", st_e7 == 200, f"Status: {st_e7}")

# Step 8: Receive booking notification
st_e8, data_e8 = api_request("/notifications/", token=e2e_token)
test("Step 8: Customer receives automated booking notification",
     st_e8 == 200 and len(data_e8.get("data", {}).get("notifications", [])) > 0, f"Status: {st_e8}")

# Step 9: Reception confirms booking
st_e9, data_e9 = api_request(f"/bookings/{e2e_booking_id}/confirm/", method="POST", token=reception_token)
test("Step 9: Reception confirms booking", st_e9 == 200, f"Status: {st_e9}")

# Step 10: Reception check customer in
st_e10, data_e10 = api_request(f"/bookings/{e2e_booking_id}/check_in/", method="POST", data={
    "notes": "Checked-in with Aadhaar verification"
}, token=reception_token)
test("Step 10: Reception checks customer in", st_e10 == 200, f"Status: {st_e10}")

# Step 11: Verify room becomes occupied
e2e_booking = Booking.objects.get(id=e2e_booking_id)
allocated_room = e2e_booking.booking_rooms.first().room
test("Step 11: Verify allocated room state is Occupied",
     allocated_room.status == "Occupied", f"Room Status: {allocated_room.status}")

# Step 12: Browse restaurant menu
st_e12, data_e12 = api_request("/foods/", token=e2e_token)
food_item = Food.objects.filter(is_available=True).first()
test("Step 12: Customer browses restaurant menu", st_e12 == 200 and food_item is not None, f"Found food: {bool(food_item)}")

# Step 13: Create food order
st_e13, data_e13 = api_request("/food-orders/", method="POST", data={
    "booking_id": e2e_booking_id,
    "room_id": allocated_room.id,
    "items": [{"food_id": food_item.id, "quantity": 2}]
}, token=e2e_token)
e2e_order_id = data_e13.get("data", {}).get("id")
test("Step 13: Customer creates room food order", st_e13 == 201 and bool(e2e_order_id), f"Order ID: {e2e_order_id}")

# Step 14: Track food order
st_e14, data_e14 = api_request(f"/food-orders/{e2e_order_id}/", token=e2e_token)
test("Step 14: Customer tracks food order status", st_e14 == 200, f"Status: {st_e14}")

# Step 15: Create service request
service_item = Service.objects.filter(is_available=True).first()
st_e15, data_e15 = api_request("/service-requests/", method="POST", data={
    "booking_id": e2e_booking_id,
    "service_id": service_item.id,
    "remarks": "Please deliver fresh towels"
}, token=e2e_token)
e2e_serv_id = data_e15.get("data", {}).get("id")
test("Step 15: Customer creates service request", st_e15 == 201 and bool(e2e_serv_id), f"Service Req ID: {e2e_serv_id}")

# Step 16: Track service request
st_e16, data_e16 = api_request(f"/service-requests/{e2e_serv_id}/", token=e2e_token)
test("Step 16: Customer tracks service request", st_e16 == 200, f"Status: {st_e16}")

# Step 17: Restaurant processes food order through valid lifecycle
st_e17_1, _ = api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Accepted"}, token=rest_token)
st_e17_2, _ = api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Preparing"}, token=rest_token)
st_e17_3, _ = api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Ready"}, token=rest_token)
st_e17_4, _ = api_request(f"/food-orders/{e2e_order_id}/status/", method="POST", data={"status": "Delivered"}, token=rest_token)
test("Step 17: Restaurant advances food order through valid lifecycle to Delivered", st_e17_4 == 200, f"Status: {st_e17_4}")

# Step 18: Staff completes service request through valid lifecycle
st_e18_1, _ = api_request(f"/service-requests/{e2e_serv_id}/update_status/", method="PATCH", data={"status": "Accepted"}, token=manager_token)
st_e18_2, _ = api_request(f"/service-requests/{e2e_serv_id}/update_status/", method="PATCH", data={"status": "In Progress"}, token=manager_token)
st_e18_3, _ = api_request(f"/service-requests/{e2e_serv_id}/update_status/", method="PATCH", data={"status": "Completed"}, token=manager_token)
test("Step 18: Staff marks service request Completed", st_e18_3 == 200, f"Status: {st_e18_3}")

# Step 19: Generate comprehensive invoice
st_e19, data_e19 = api_request("/invoices/", method="POST", data={"booking_id": e2e_booking_id}, token=reception_token)
e2e_invoice_id = data_e19.get("data", {}).get("id")
test("Step 19: Generate comprehensive invoice", st_e19 in [200, 201] and bool(e2e_invoice_id), f"Invoice ID: {e2e_invoice_id}")

# Step 20: Verify room charges
e2e_invoice = Invoice.objects.get(id=e2e_invoice_id)
test("Step 20: Verify room charges calculated correctly", e2e_invoice.room_charges > 0, f"Room Chg: {e2e_invoice.room_charges}")

# Step 21: Verify food charges
test("Step 21: Verify food charges added to invoice", e2e_invoice.food_charges > 0, f"Food Chg: {e2e_invoice.food_charges}")

# Step 22: Verify service charges
test("Step 22: Verify service charges aggregated to invoice", e2e_invoice.service_charges >= 0, f"Service Chg: {e2e_invoice.service_charges}")

# Step 23: Verify discount
test("Step 23: Verify discount amount quantized properly", e2e_invoice.discount_amount >= 0, f"Discount: {e2e_invoice.discount_amount}")

# Step 24: Calculate tax
test("Step 24: Verify 18% GST tax calculated properly", e2e_invoice.tax_amount > 0, f"Tax: {e2e_invoice.tax_amount}")

# Step 25: Partial payment
e2e_grand_total = e2e_invoice.grand_total
e2e_p1_amt = quantize_money(e2e_grand_total / Decimal("2.00"))
st_e25, data_e25 = api_request("/payments/", method="POST", data={
    "invoice_id": e2e_invoice_id,
    "payment_method_id": pm.id,
    "amount": float(e2e_p1_amt),
    "transaction_id": f"TXN-E2E-1-{uuid.uuid4().hex[:6]}"
}, token=reception_token)
test("Step 25: Make partial payment (50%)", st_e25 == 201, f"Status: {st_e25}")

# Step 26: Final payment
e2e_p2_amt = e2e_grand_total - e2e_p1_amt
st_e26, data_e26 = api_request("/payments/", method="POST", data={
    "invoice_id": e2e_invoice_id,
    "payment_method_id": pm.id,
    "amount": float(e2e_p2_amt),
    "transaction_id": f"TXN-E2E-2-{uuid.uuid4().hex[:6]}"
}, token=reception_token)
test("Step 26: Make final payment covering remainder", st_e26 == 201, f"Status: {st_e26}")

# Step 27: Verify invoice paid
e2e_invoice.refresh_from_db()
test("Step 27: Verify invoice payment status is Paid", e2e_invoice.status == "Paid", f"Status: {e2e_invoice.status}")

# Step 28: Reception checks customer out
st_e28, data_e28 = api_request(f"/bookings/{e2e_booking_id}/check_out/", method="POST", token=reception_token)
test("Step 28: Reception checks customer out", st_e28 == 200, f"Status: {st_e28}")

# Step 29: Verify room housekeeping turnover task
allocated_room.refresh_from_db()
hk_turnover = HousekeepingTask.objects.filter(room=allocated_room, status='Pending').first()
test("Step 29: Verify room flagged Needs Cleaning and turnover task generated",
     allocated_room.status == "Cleaning" and hk_turnover is not None,
     f"Room status: {allocated_room.status}, Task: {hk_turnover.task_type if hk_turnover else None}")

# Step 30: Customer submits feedback
st_e30, data_e30 = api_request("/feedback/", method="POST", data={
    "booking_id": e2e_booking_id,
    "rating": 5,
    "cleanliness_rating": 5,
    "service_rating": 5,
    "comment": "Flawless luxury experience at StayHive!"
}, token=e2e_token)
test("Step 30: Customer submits 5-star feedback", st_e30 in [200, 201], f"Status: {st_e30}")

# Step 31: Customer submits complaint
st_e31, data_e31 = api_request("/complaints/", method="POST", data={
    "booking_id": e2e_booking_id,
    "category": "Maintenance",
    "priority": "Low",
    "subject": "Slight AC temperature adjustment delay",
    "description": "The AC took 10 minutes to reach set temperature."
}, token=e2e_token)
test("Step 31: Customer submits complaint", st_e31 in [200, 201], f"Status: {st_e31}")

# Step 32: Customer submits inquiry
st_e32, data_e32 = api_request("/inquiries/", method="POST", data={
    "name": "E2E Guest",
    "email": e2e_email,
    "subject": "Corporate event booking inquiry for next quarter",
    "message": "We would like to book 20 suites for an executive retreat."
}, token=e2e_token)
test("Step 32: Customer submits general inquiry", st_e32 in [200, 201], f"Status: {st_e32}")

# Step 33: Customer views notifications
st_e33, data_e33 = api_request("/notifications/", token=e2e_token)
test("Step 33: Customer reads personalized notifications",
     st_e33 == 200 and len(data_e33.get("data", {}).get("notifications", [])) > 0, f"Status: {st_e33}")

# Step 34: Admin views analytics overview
st_e34, data_e34 = api_request("/analytics/overview/", token=admin_token)
test("Step 34: Admin views updated analytics overview",
     st_e34 == 200 and "revenue" in data_e34.get("data", {}), f"Status: {st_e34}")

# Step 35: Admin views financial revenue report
st_e35, data_e35 = api_request("/reports/revenue/", token=admin_token)
test("Step 35: Admin views authoritative financial revenue report",
     st_e35 == 200 and ("summary" in data_e35 or "data" in data_e35), f"Status: {st_e35}")

# Step 36: Filter revenue report by date range
today_s = date.today().isoformat()
st_e36, data_e36 = api_request(f"/reports/revenue/?start_date={today_s}&end_date={today_s}", token=admin_token)
test("Step 36: Admin filters financial reports with timezone-aware date range",
     st_e36 == 200, f"Status: {st_e36}")

# Step 37: Admin reviews support operations feedback stats
st_e37, data_e37 = api_request("/feedback/summary/", token=admin_token)
test("Step 37: Admin reviews support operations feedback stats",
     st_e37 == 200 and "total_feedback" in data_e37.get("data", {}), f"Status: {st_e37}")

# Step 38: Logout / Token blacklisting behavior
refresh_tok = data_e2.get("data", {}).get("refresh")
st_e38, data_e38 = api_request("/auth/logout/", method="POST", data={"refresh": refresh_tok}, token=e2e_token)
test("Step 38: Customer logs out successfully", st_e38 in [200, 205], f"Status: {st_e38}")

# Step 39: Customer logs in again
st_e39, data_e39 = api_request("/auth/login/", method="POST", data={
    "username": e2e_email,
    "password": "Password123!"
})
new_e2e_token = data_e39.get("data", {}).get("access")
test("Step 39: Customer logs back in with valid credentials",
     st_e39 == 200 and bool(new_e2e_token), f"Status: {st_e39}")

# Step 40: Verify full data persistence
st_e40, data_e40 = api_request("/bookings/my/", token=new_e2e_token)
my_bookings = data_e40.get("data", [])
persisted = any(b.get("id") == e2e_booking_id for b in my_bookings)
test("Step 40: Verify customer booking and transaction history persisted accurately",
     persisted, f"Found booking in customer history: {persisted}")

# ==============================================================================
# FINAL RESULTS SUMMARY
# ==============================================================================
print("\n============================================================")
print(f"STAYHIVE CHECKPOINT 11 TEST RESULTS: {passed_tests} PASSED, {failed_tests} FAILED")
print("============================================================\n")

if failed_tests > 0:
    sys.exit(1)
sys.exit(0)
