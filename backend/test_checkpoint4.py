import os
import sys
import json
import urllib.request
import urllib.error
from datetime import date, timedelta
from decimal import Decimal
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import (
    User, Role, Customer, Hotel, Room, RoomType,
    Booking, BookingRoom, CancellationRequest, OfferPackage
)
from rest_framework_simplejwt.tokens import RefreshToken

BASE_URL = "http://127.0.0.1:8000/api"

def api_call(url, data=None, headers=None, method='GET'):
    h = {'Content-Type': 'application/json'}
    if headers:
        h.update(headers)
    body = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode('utf-8')
            return resp.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(err_body)
        except Exception:
            return e.code, {'raw': err_body}

print("=" * 60)
print("STAYHIVE — CHECKPOINT 4 VERIFICATION SUITE")
print("=" * 60)

passed_tests = 0
failed_tests = 0

def test(name, condition, details=""):
    global passed_tests, failed_tests
    if condition:
        print(f"  [PASS] {name}")
        passed_tests += 1
    else:
        print(f"  [FAIL] {name} - {details}")
        failed_tests += 1

# Setup test users and tokens
customer_role = Role.objects.get(name='CUSTOMER')
admin_role = Role.objects.get(name='ADMIN')

# Customer A
user_a, _ = User.objects.get_or_create(
    username='cust_a_test',
    defaults={
        'email': 'cust_a@stayhive.test',
        'first_name': 'Aarav',
        'last_name': 'Patel',
        'role': customer_role,
        'phone': '+91 99000 11111'
    }
)
user_a.set_password('pass123')
user_a.save()
customer_a, _ = Customer.objects.get_or_create(user=user_a, defaults={'loyalty_tier': 'Silver'})
token_a = str(RefreshToken.for_user(user_a).access_token)
headers_a = {'Authorization': f'Bearer {token_a}'}

# Customer B
user_b, _ = User.objects.get_or_create(
    username='cust_b_test',
    defaults={
        'email': 'cust_b@stayhive.test',
        'first_name': 'Bhavna',
        'last_name': 'Shah',
        'role': customer_role,
        'phone': '+91 99000 22222'
    }
)
user_b.set_password('pass123')
user_b.save()
customer_b, _ = Customer.objects.get_or_create(user=user_b, defaults={'loyalty_tier': 'Gold'})
token_b = str(RefreshToken.for_user(user_b).access_token)
headers_b = {'Authorization': f'Bearer {token_b}'}

# Admin
admin_user = User.objects.filter(role=admin_role).first()
if not admin_user:
    admin_user = User.objects.create(
        username='admin_test_cp4',
        email='admin_cp4@stayhive.test',
        first_name='Admin',
        last_name='User',
        role=admin_role
    )
    admin_user.set_password('admin123')
    admin_user.save()
token_admin = str(RefreshToken.for_user(admin_user).access_token)
headers_admin = {'Authorization': f'Bearer {token_admin}'}

hotel = Hotel.objects.first()
room = Room.objects.filter(hotel=hotel).exclude(status='Maintenance').first()
room_type = room.room_type

print("\n--- 1. CUSTOMER PROFILE & PERMISSIONS ---")

# Admin lists all customers
s, r = api_call(f"{BASE_URL}/customers/", headers=headers_admin)
test("Admin can list all customers", s == 200 and len(r.get('data', [])) >= 2, f"Status: {s}")

# Customer A lists customers (should ONLY see Customer A)
s, r = api_call(f"{BASE_URL}/customers/", headers=headers_a)
data = r.get('data', [])
test("Customer A list is isolated to Customer A only", s == 200 and len(data) == 1 and data[0]['id'] == customer_a.id, f"Count: {len(data)}")

# Customer A tries to access Customer B profile by ID (403 Forbidden)
s, r = api_call(f"{BASE_URL}/customers/{customer_b.id}/", headers=headers_a)
test("Customer A accessing Customer B profile returns HTTP 403 Forbidden", s == 403, f"Status: {s}")

# Customer A accesses /api/customers/me/
s, r = api_call(f"{BASE_URL}/customers/me/", headers=headers_a)
test("Customer A can access /api/customers/me/", s == 200 and r.get('data', {}).get('email') == user_a.email, f"Status: {s}")

# Customer A updates profile via PATCH /api/customers/me/
patch_payload = {'phone': '+91 99999 88888', 'address': '123 SG Highway, Ahmedabad'}
s, r = api_call(f"{BASE_URL}/customers/me/", data=patch_payload, headers=headers_a, method='PATCH')
test("Customer A can update profile via PATCH /api/customers/me/", s == 200 and r.get('data', {}).get('phone') == '+91 99999 88888', f"Status: {s}")

print("\n--- 2. BOOKING AVAILABILITY & STRICT OVERLAP ALGORITHM ---")

# Clean up any test bookings for this room in November/December 2026
BookingRoom.objects.filter(
    room=room,
    booking__check_in_date__gte=date(2026, 11, 1),
    booking__check_out_date__lte=date(2026, 12, 31)
).delete()
Booking.objects.filter(
    customer__in=[customer_a, customer_b],
    check_in_date__gte=date(2026, 11, 1)
).delete()

# Create a reference booking: 2026-11-10 to 2026-11-15
ref_booking = Booking.objects.create(
    booking_number=f"SH-2026-REF001",
    customer=customer_a,
    hotel=hotel,
    check_in_date=date(2026, 11, 10),
    check_out_date=date(2026, 11, 15),
    total_guests=2,
    adults=2,
    children=0,
    total_amount=Decimal('20000.00'),
    discount_amount=Decimal('0.00'),
    net_amount=Decimal('20000.00'),
    status='Confirmed'
)
BookingRoom.objects.create(booking=ref_booking, room=room)

# Test 2.1: Direct overlap inside the range (2026-11-11 to 2026-11-14)
s, r = api_call(
    f"{BASE_URL}/bookings/availability/?hotel_id={hotel.id}&check_in_date=2026-11-11&check_out_date=2026-11-14"
)
avail_room_ids = [rm['id'] for rm in r.get('data', {}).get('available_rooms', [])]
test("Strict overlap (internal date range): Room is unavailable", room.id not in avail_room_ids, f"Room {room.id} in {avail_room_ids}")

# Test 2.2: Overlap spanning check-in boundary (2026-11-08 to 2026-11-12)
s, r = api_call(
    f"{BASE_URL}/bookings/availability/?hotel_id={hotel.id}&check_in_date=2026-11-08&check_out_date=2026-11-12"
)
avail_room_ids = [rm['id'] for rm in r.get('data', {}).get('available_rooms', [])]
test("Strict overlap (spanning check-in): Room is unavailable", room.id not in avail_room_ids)

# Test 2.3: Overlap spanning check-out boundary (2026-11-13 to 2026-11-18)
s, r = api_call(
    f"{BASE_URL}/bookings/availability/?hotel_id={hotel.id}&check_in_date=2026-11-13&check_out_date=2026-11-18"
)
avail_room_ids = [rm['id'] for rm in r.get('data', {}).get('available_rooms', [])]
test("Strict overlap (spanning check-out): Room is unavailable", room.id not in avail_room_ids)

# Test 2.4: BOUNDARY CHECK: Same-day check-in on checkout date (2026-11-15 to 2026-11-20)
# Existing check-out is 2026-11-15. New check-in is 2026-11-15. SHOULD NOT CONFLICT!
s, r = api_call(
    f"{BASE_URL}/bookings/availability/?hotel_id={hotel.id}&check_in_date=2026-11-15&check_out_date=2026-11-20"
)
avail_room_ids = [rm['id'] for rm in r.get('data', {}).get('available_rooms', [])]
test("Boundary test (check-in on checkout date 2026-11-15): Room IS available (no conflict)", room.id in avail_room_ids)

# Test 2.5: BOUNDARY CHECK: Same-day check-out on checkin date (2026-11-05 to 2026-11-10)
# Existing check-in is 2026-11-10. New check-out is 2026-11-10. SHOULD NOT CONFLICT!
s, r = api_call(
    f"{BASE_URL}/bookings/availability/?hotel_id={hotel.id}&check_in_date=2026-11-05&check_out_date=2026-11-10"
)
avail_room_ids = [rm['id'] for rm in r.get('data', {}).get('available_rooms', [])]
test("Boundary test (check-out on check-in date 2026-11-10): Room IS available (no conflict)", room.id in avail_room_ids)

print("\n--- 3. CAPACITY & DATE VALIDATION ---")

# Capacity validation: pass 99 guests for a room of capacity 2-4
payload_over_capacity = {
    'hotel_id': hotel.id,
    'room_id': room.id,
    'check_in_date': '2026-11-20',
    'check_out_date': '2026-11-23',
    'total_guests': 99
}
s, r = api_call(f"{BASE_URL}/bookings/", data=payload_over_capacity, headers=headers_a, method='POST')
test("Exceeding room capacity rejected with HTTP 400", s == 400, f"Status: {s}")

# Invalid dates: checkout before checkin
payload_invalid_dates = {
    'hotel_id': hotel.id,
    'room_id': room.id,
    'check_in_date': '2026-11-25',
    'check_out_date': '2026-11-20',
    'total_guests': 2
}
s, r = api_call(f"{BASE_URL}/bookings/", data=payload_invalid_dates, headers=headers_a, method='POST')
test("Checkout before checkin rejected with HTTP 400", s == 400, f"Status: {s}")

print("\n--- 4. TRANSACTIONAL BOOKING & DOUBLE-BOOKING REJECTION ---")

# Customer A books Room from 2026-11-20 to 2026-11-24
booking_payload = {
    'hotel_id': hotel.id,
    'room_id': room.id,
    'check_in_date': '2026-11-20',
    'check_out_date': '2026-11-24',
    'total_guests': 2,
    'adults': 2,
    'children': 0,
}
s, r_book_a = api_call(f"{BASE_URL}/bookings/", data=booking_payload, headers=headers_a, method='POST')
booking_a_id = r_book_a.get('data', {}).get('id') if s == 201 else None
test("Customer A successfully books Room for 2026-11-20 to 2026-11-24", s == 201 and booking_a_id is not None, f"Status: {s}")

# Customer B attempts to double-book Room for overlapping dates 2026-11-22 to 2026-11-26
s, r_book_b_fail = api_call(f"{BASE_URL}/bookings/", data={
    'hotel_id': hotel.id,
    'room_id': room.id,
    'check_in_date': '2026-11-22',
    'check_out_date': '2026-11-26',
    'total_guests': 2
}, headers=headers_b, method='POST')
test("Double-booking attempt by Customer B rejected with HTTP 400", s == 400, f"Status: {s}")

# Customer B books Room for NON-overlapping dates 2026-11-24 to 2026-11-28 (boundary checkin)
s, r_book_b_ok = api_call(f"{BASE_URL}/bookings/", data={
    'hotel_id': hotel.id,
    'room_id': room.id,
    'check_in_date': '2026-11-24',
    'check_out_date': '2026-11-28',
    'total_guests': 2
}, headers=headers_b, method='POST')
booking_b_id = r_book_b_ok.get('data', {}).get('id') if s == 201 else None
test("Customer B successfully books non-conflicting boundary dates (2026-11-24 to 2026-11-28)", s == 201 and booking_b_id is not None, f"Status: {s}")

print("\n--- 5. CUSTOMER DATA ISOLATION (BOOKINGS) ---")

# Customer A tries to access Customer B's booking by ID -> HTTP 403 Forbidden!
s, r_cross_access = api_call(f"{BASE_URL}/bookings/{booking_b_id}/", headers=headers_a)
test("Customer A accessing Customer B's booking returns HTTP 403 Forbidden", s == 403, f"Status: {s}")

# Customer B tries to access Customer A's booking by ID -> HTTP 403 Forbidden!
s, r_cross_access_b = api_call(f"{BASE_URL}/bookings/{booking_a_id}/", headers=headers_b)
test("Customer B accessing Customer A's booking returns HTTP 403 Forbidden", s == 403, f"Status: {s}")

# Customer A lists /api/bookings/ -> MUST NOT contain Customer B's booking
s, r_list_a = api_call(f"{BASE_URL}/bookings/", headers=headers_a)
list_a_ids = [b['id'] for b in r_list_a.get('data', [])]
test("Customer A list contains Booking A and NOT Booking B", (booking_a_id in list_a_ids) and (booking_b_id not in list_a_ids), f"List: {list_a_ids}")

# Customer A calls /api/bookings/my/
s, r_my_a = api_call(f"{BASE_URL}/bookings/my/", headers=headers_a)
my_a_ids = [b['id'] for b in r_my_a.get('data', [])]
test("Customer A /api/bookings/my/ returns Customer A's bookings", (booking_a_id in my_a_ids) and (booking_b_id not in my_a_ids), f"My IDs: {my_a_ids}")

print("\n--- 6. BOOKING CANCELLATION ---")

# Customer B tries to cancel Customer A's booking -> HTTP 403 Forbidden!
s, r_cross_cancel = api_call(f"{BASE_URL}/bookings/{booking_a_id}/cancel/", data={'reason': 'Malicious attempt'}, headers=headers_b, method='POST')
test("Customer B attempting to cancel Customer A's booking returns HTTP 403 Forbidden", s == 403, f"Status: {s}")

# Customer A cancels own booking
s, r_cancel = api_call(f"{BASE_URL}/bookings/{booking_a_id}/cancel/", data={'reason': 'Trip rescheduled'}, headers=headers_a, method='POST')
test("Customer A successfully cancels own booking", s == 200, f"Status: {s}")

# Verify database state after cancellation
booking_a_db = Booking.objects.get(id=booking_a_id)
cancel_req = CancellationRequest.objects.filter(booking=booking_a_db).first()
test("Booking status updated to 'Cancelled' in MySQL", booking_a_db.status == 'Cancelled', f"Status: {booking_a_db.status}")
test("CancellationRequest created in MySQL with refund amount", cancel_req is not None and cancel_req.refund_amount == booking_a_db.net_amount, f"Req: {cancel_req}")

print("\n" + "=" * 60)
print(f"VERIFICATION SUMMARY: {passed_tests} PASSED, {failed_tests} FAILED")
print("=" * 60)

if failed_tests > 0:
    sys.exit(1)
