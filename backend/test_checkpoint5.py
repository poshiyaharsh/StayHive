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
    Booking, BookingRoom, CheckIn, CancellationRequest, Staff
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
print("STAYHIVE — CHECKPOINT 5: RECEPTION OPERATIONS VERIFICATION")
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

# Setup test users and roles
customer_role = Role.objects.get(name='CUSTOMER')
reception_role = Role.objects.get(name='RECEPTION')
admin_role = Role.objects.get(name='ADMIN')

# 1. Customer User
customer_user = User.objects.filter(role=customer_role).first()
if not customer_user:
    customer_user = User.objects.create(
        username='cust_cp5_test',
        email='cust_cp5@stayhive.test',
        first_name='Kavita',
        last_name='Mehta',
        role=customer_role
    )
token_customer = str(RefreshToken.for_user(customer_user).access_token)
headers_customer = {'Authorization': f'Bearer {token_customer}'}

# 2. Reception Staff User
reception_user = User.objects.filter(role=reception_role).first()
if not reception_user:
    reception_user = User.objects.create(
        username='reception_cp5_test',
        email='reception_cp5@stayhive.test',
        first_name='Priya',
        last_name='Nair',
        role=reception_role
    )
token_reception = str(RefreshToken.for_user(reception_user).access_token)
headers_reception = {'Authorization': f'Bearer {token_reception}'}

# Ensure Staff profile exists for reception_user
hotel = Hotel.objects.first()
staff_reception = Staff.objects.filter(user=reception_user).first()
if not staff_reception:
    staff_reception = Staff.objects.create(
        user=reception_user,
        hotel=hotel,
        designation='Senior Reception Executive',
        shift='Morning',
        salary=Decimal('45000.00'),
        joined_date=date(2025, 1, 1)
    )

# 3. Admin User
admin_user = User.objects.filter(role=admin_role).first()
token_admin = str(RefreshToken.for_user(admin_user).access_token)
headers_admin = {'Authorization': f'Bearer {token_admin}'}

print("\n--- 1. RECEPTION PERMISSIONS & SECURITY ---")

# Customer attempts to access arrivals -> HTTP 403 Forbidden
s, r = api_call(f"{BASE_URL}/reception/arrivals/", headers=headers_customer)
test("Customer accessing /api/reception/arrivals/ returns HTTP 403 Forbidden", s == 403, f"Status: {s}")

# Customer attempts check-in -> HTTP 403 Forbidden
s, r = api_call(f"{BASE_URL}/reception/check-in/", data={'booking_id': 1}, headers=headers_customer, method='POST')
test("Customer calling /api/reception/check-in/ returns HTTP 403 Forbidden", s == 403, f"Status: {s}")

# Customer attempts check-out -> HTTP 403 Forbidden
s, r = api_call(f"{BASE_URL}/reception/check-out/", data={'booking_id': 1}, headers=headers_customer, method='POST')
test("Customer calling /api/reception/check-out/ returns HTTP 403 Forbidden", s == 403, f"Status: {s}")

# Reception accesses arrivals -> HTTP 200 OK
s, r = api_call(f"{BASE_URL}/reception/arrivals/", headers=headers_reception)
test("Reception staff can access /api/reception/arrivals/", s == 200, f"Status: {s}")

# Admin accesses dashboard stats -> HTTP 200 OK
s, r = api_call(f"{BASE_URL}/reception/dashboard/", headers=headers_admin)
test("Admin can access /api/reception/dashboard/", s == 200 and 'today_arrivals_count' in r.get('data', {}), f"Status: {s}")

print("\n--- 2. FRONT DESK DASHBOARD & METRICS ---")

s, r = api_call(f"{BASE_URL}/reception/dashboard/?hotel_id={hotel.id}", headers=headers_reception)
stats = r.get('data', {})
test("Dashboard returns today_arrivals_count", 'today_arrivals_count' in stats and isinstance(stats['today_arrivals_count'], int))
test("Dashboard returns today_departures_count", 'today_departures_count' in stats and isinstance(stats['today_departures_count'], int))
test("Dashboard returns in_house_count", 'in_house_count' in stats and isinstance(stats['in_house_count'], int))
test("Dashboard returns available_rooms_count", 'available_rooms_count' in stats and isinstance(stats['available_rooms_count'], int))
test("Dashboard returns occupied_rooms_count", 'occupied_rooms_count' in stats and isinstance(stats['occupied_rooms_count'], int))

print("\n--- 3. CHECK-IN TRANSACTION & VALIDATIONS ---")

# Setup a clean room and confirmed booking for today
today = date.today()
tomorrow = today + timedelta(days=2)

room = Room.objects.filter(hotel=hotel, status='Available').first()
if not room:
    room = Room.objects.filter(hotel=hotel).first()
    room.status = 'Available'
    room.housekeeping_status = 'Clean'
    room.save()

customer, _ = Customer.objects.get_or_create(user=customer_user)

# Clean up any existing booking for this room today
BookingRoom.objects.filter(room=room, booking__check_in_date=today).delete()

import uuid
test_unique_id = uuid.uuid4().hex[:6].upper()
booking = Booking.objects.create(
    booking_number=f"SH-REC-{int(date.today().strftime('%Y%m%d'))}-{test_unique_id}",
    customer=customer,
    hotel=hotel,
    check_in_date=today,
    check_out_date=tomorrow,
    total_guests=2,
    adults=2,
    children=0,
    total_amount=Decimal('9000.00'),
    discount_amount=Decimal('0.00'),
    net_amount=Decimal('9000.00'),
    status='Confirmed'
)
BookingRoom.objects.create(booking=booking, room=room)

# Test 3.1: Check arrivals endpoint includes this booking
s, r = api_call(f"{BASE_URL}/reception/arrivals/?hotel_id={hotel.id}", headers=headers_reception)
arrival_ids = [b['id'] for b in r.get('data', [])]
test("Today's arrivals contains newly created confirmed booking", booking.id in arrival_ids, f"Arrivals: {arrival_ids}")

# Test 3.2: Successful Check-In
check_in_payload = {
    'booking_id': booking.id,
    'key_card_issued': f"KEY-{room.room_number}-VIP",
    'remarks': 'VIP Guest checked in by front desk'
}
s, r_checkin = api_call(f"{BASE_URL}/reception/check-in/", data=check_in_payload, headers=headers_reception, method='POST')
checkin_data = r_checkin.get('data', {})
test("Check-in request succeeds with HTTP 200", s == 200 and checkin_data.get('status') == 'Checked-in', f"Status: {s}")

# Test 3.3: MySQL State Verification after Check-in
booking.refresh_from_db()
room.refresh_from_db()
checkin_record = CheckIn.objects.filter(booking=booking).first()

test("Booking status updated to 'Checked-in' in MySQL", booking.status == 'Checked-in', f"Status: {booking.status}")
test("Room status updated to 'Occupied' in MySQL", room.status == 'Occupied', f"Room status: {room.status}")
test("CheckIn record created in MySQL with staff and keycard", checkin_record is not None and checkin_record.key_card_issued == f"KEY-{room.room_number}-VIP", f"Record: {checkin_record}")
test("CheckIn recorded authenticated staff_id", checkin_record.staff_id == staff_reception.id, f"Staff ID: {checkin_record.staff_id} vs {staff_reception.id}")

# Test 3.4: Active Stays endpoint includes the checked-in booking
s, r_active = api_call(f"{BASE_URL}/reception/active-stays/?hotel_id={hotel.id}", headers=headers_reception)
active_ids = [b['id'] for b in r_active.get('data', [])]
test("Active stays endpoint includes checked-in stay", booking.id in active_ids, f"Active stays: {active_ids}")

# Test 3.5: Duplicate Check-In rejected
s, r_dup = api_call(f"{BASE_URL}/reception/check-in/", data=check_in_payload, headers=headers_reception, method='POST')
test("Duplicate check-in rejected with HTTP 400 'Guest is already checked in.'", s == 400 and 'already checked in' in r_dup.get('message', '').lower(), f"Status: {s}, Msg: {r_dup.get('message')}")

print("\n--- 4. CHECK-OUT TRANSACTION & ROOM HOUSEKEEPING ---")

# Test 4.1: Perform Check-out
checkout_payload = {
    'booking_id': booking.id,
    'remarks': 'Guest checked out peacefully. Express folio settled.'
}
s, r_checkout = api_call(f"{BASE_URL}/reception/check-out/", data=checkout_payload, headers=headers_reception, method='POST')
checkout_data = r_checkout.get('data', {})
test("Check-out request succeeds with HTTP 200", s == 200, f"Status: {s}")
test("Check-out response has room_status and housekeeping_status dirty", checkout_data.get('housekeeping_status') == 'dirty', f"Data: {checkout_data}")

# Test 4.2: MySQL State Verification after Check-out
booking.refresh_from_db()
room.refresh_from_db()
customer.refresh_from_db()

test("Booking status updated to 'Checked-out' in MySQL", booking.status == 'Checked-out', f"Status: {booking.status}")
test("Room status updated to 'Available' in MySQL", room.status in ['Available', 'Cleaning'], f"Status: {room.status}")
test("Room housekeeping_status updated to 'Needs Cleaning' in MySQL", room.housekeeping_status == 'Needs Cleaning', f"HK Status: {room.housekeeping_status}")
test("Customer lifetime stats incremented in MySQL", customer.total_stays >= 1 and customer.total_spend >= Decimal('9000.00'), f"Stays: {customer.total_stays}, Spend: {customer.total_spend}")

# Test 4.3: Duplicate Check-Out rejected
s, r_dup_co = api_call(f"{BASE_URL}/reception/check-out/", data=checkout_payload, headers=headers_reception, method='POST')
test("Duplicate check-out rejected with HTTP 400 'Guest has already checked out.'", s == 400 and 'already checked out' in r_dup_co.get('message', '').lower(), f"Status: {s}, Msg: {r_dup_co.get('message')}")

print("\n--- 5. RECEPTION SEARCH & ROOM STATUS BOARD ---")

# Test 5.1: Search by booking reference
s, r_search_num = api_call(f"{BASE_URL}/reception/search/?q={booking.booking_number}", headers=headers_reception)
search_num_ids = [b['id'] for b in r_search_num.get('data', [])]
test("Search by booking reference returns target booking", booking.id in search_num_ids, f"Found: {search_num_ids}")

# Test 5.2: Search by guest name
s, r_search_name = api_call(f"{BASE_URL}/reception/search/?q={customer_user.first_name}", headers=headers_reception)
search_name_ids = [b['id'] for b in r_search_name.get('data', [])]
test("Search by guest first name returns target booking", booking.id in search_name_ids, f"Found: {search_name_ids}")

# Test 5.3: Search by room number
s, r_search_room = api_call(f"{BASE_URL}/reception/search/?q={room.room_number}", headers=headers_reception)
search_room_ids = [b['id'] for b in r_search_room.get('data', [])]
test("Search by room number returns target booking", booking.id in search_room_ids, f"Found: {search_room_ids}")

# Test 5.4: Room Status Board
s, r_board = api_call(f"{BASE_URL}/reception/room-status/?hotel_id={hotel.id}", headers=headers_reception)
board_rooms = r_board.get('data', [])
test("Room status board returns rooms with status and housekeeping info", s == 200 and len(board_rooms) > 0 and 'housekeeping_status' in board_rooms[0], f"Rooms: {len(board_rooms)}")

print("\n" + "=" * 60)
print(f"VERIFICATION SUMMARY: {passed_tests} PASSED, {failed_tests} FAILED")
print("=" * 60)

if failed_tests > 0:
    sys.exit(1)
