"""
STAYHIVE — CHECKPOINT 7: SERVICES + HOUSEKEEPING MANAGEMENT VERIFICATION SUITE
Tests the full lifecycle of hotel services, guest service requests, housekeeping tasks,
staff department validations, staff task isolation, room cleanliness synchronization,
automatic checkout turnover integration, and duplicate task prevention.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from decimal import Decimal
from datetime import date, timedelta
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import (
    User, Role, Staff, Customer, Hotel, Room, Booking, BookingRoom,
    Service, ServiceRequest, HousekeepingTask
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
        print(f"  [FAIL] {name} | {details}")


def get_token(username):
    user = User.objects.get(username=username)
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


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
print("STAYHIVE — CHECKPOINT 7: SERVICES & HOUSEKEEPING VERIFICATION")
print("=" * 60)

# Persona tokens
token_admin = get_token("admin")
token_manager = get_token("manager_vikram")
token_reception = get_token("reception_priya")
token_housekeeping = get_token("housekeeping_suresh")
token_chef = get_token("chef_anand")
token_customer_a = get_token("rahul_sharma")
token_customer_b = get_token("ananya_patel")

headers_admin = {"Authorization": f"Bearer {token_admin}"}
headers_manager = {"Authorization": f"Bearer {token_manager}"}
headers_reception = {"Authorization": f"Bearer {token_reception}"}
headers_housekeeping = {"Authorization": f"Bearer {token_housekeeping}"}
headers_chef = {"Authorization": f"Bearer {token_chef}"}
headers_cust_a = {"Authorization": f"Bearer {token_customer_a}"}
headers_cust_b = {"Authorization": f"Bearer {token_customer_b}"}

# ============================================================
# 1. SERVICES MANAGEMENT & ROLE PERMISSIONS
# ============================================================
print("\n--- 1. SERVICES APIS & PERMISSIONS ---")

# 1.1 Customer can list services
s, r = api_call(f"{BASE_URL}/services/", headers=headers_cust_a)
services_list = r.get("data", []) if isinstance(r, dict) else []
test("Customer can list services (HTTP 200)", s == 200 and len(services_list) > 0, f"Status: {s}")

# 1.2 Search & active filtering
s, r = api_call(f"{BASE_URL}/services/?search=Laundry", headers=headers_cust_a)
laundry_items = r.get("data", []) if isinstance(r, dict) else []
test("Search service by keyword works", s == 200 and any("Laundry" in item.get("name", "") for item in laundry_items))

s, r = api_call(f"{BASE_URL}/services/?is_active=true", headers=headers_cust_a)
active_items = r.get("data", []) if isinstance(r, dict) else []
test("Filter services by is_active=true works", s == 200 and all(item.get("is_available") is True or item.get("is_active") is True for item in active_items))

# 1.3 Forbidden roles (Housekeeping and Restaurant)
s, _ = api_call(f"{BASE_URL}/services/", headers=headers_housekeeping)
test("Housekeeping denied from services management (HTTP 403)", s == 403, f"Status: {s}")

s, _ = api_call(f"{BASE_URL}/services/", headers=headers_chef)
test("Restaurant denied from services management (HTTP 403)", s == 403, f"Status: {s}")

# 1.4 Customer cannot create service
s, _ = api_call(f"{BASE_URL}/services/", data={"name": "Fake Service", "price": 100}, headers=headers_cust_a, method="POST")
test("Customer cannot create service (HTTP 403 Forbidden)", s == 403, f"Status: {s}")

# 1.5 Admin can create, update, delete service
s, created_svc_res = api_call(
    f"{BASE_URL}/services/",
    data={
        "name": "Luxury Sunset Yoga Session",
        "category": "Wellness",
        "price": "1500.00",
        "duration_minutes": 60,
        "is_available": True,
        "description": "Guided sunset yoga on rooftop pavilion"
    },
    headers=headers_admin,
    method="POST"
)
created_svc = created_svc_res.get("data", {}) if isinstance(created_svc_res, dict) else {}
new_service_id = created_svc.get("id") or created_svc.get("service_id")
test("Admin can create new service (HTTP 201)", s == 201 and new_service_id is not None, f"Status: {s}, Res: {created_svc_res}")

s, updated_svc_res = api_call(
    f"{BASE_URL}/services/{new_service_id}/",
    data={"price": "1650.00"},
    headers=headers_admin,
    method="PATCH"
)
test("Admin can update service (HTTP 200)", s == 200 and float(updated_svc_res.get("data", {}).get("price", 0)) == 1650.0)

# ============================================================
# 2. SERVICE REQUEST VALIDATION & AUTHORITATIVE PRICING
# ============================================================
print("\n--- 2. SERVICE REQUESTS & VALIDATION ---")

cust_a = Customer.objects.filter(user__username="rahul_sharma").first()
cust_b = Customer.objects.filter(user__username="ananya_patel").first()

# Ensure Customer A has an active booking
booking_a = Booking.objects.filter(customer=cust_a, status__in=['Confirmed', 'Checked-in']).first()
if not booking_a:
    booking_a = Booking.objects.create(
        booking_number=f"TEST-CP7-A-{date.today().strftime('%s')}",
        customer=cust_a,
        hotel_id=1,
        check_in_date=date.today(),
        check_out_date=date.today() + timedelta(days=2),
        total_guests=1, adults=1, children=0,
        total_amount=Decimal('5000.00'), net_amount=Decimal('5000.00'),
        status='Checked-in'
    )

booking_b = Booking.objects.filter(customer=cust_b, status__in=['Confirmed', 'Checked-in']).first()
if not booking_b:
    booking_b = Booking.objects.create(
        booking_number=f"TEST-CP7-B-{date.today().strftime('%s')}",
        customer=cust_b,
        hotel_id=1,
        check_in_date=date.today(),
        check_out_date=date.today() + timedelta(days=3),
        total_guests=1, adults=1, children=0,
        total_amount=Decimal('6000.00'), net_amount=Decimal('6000.00'),
        status='Checked-in'
    )

# 2.1 Customer cannot request service for another customer's booking
s, err_res = api_call(
    f"{BASE_URL}/service-requests/",
    data={"booking_id": booking_b.id, "service_id": new_service_id, "remarks": "Malicious request"},
    headers=headers_cust_a,
    method="POST"
)
test("Customer A cannot create request for Customer B's booking (HTTP 403)", s == 403, f"Status: {s}")

# 2.2 Customer cannot request inactive service
inactive_svc = Service.objects.create(
    hotel_id=1, name="Decommissioned Sauna", category="Wellness", price=Decimal('999.00'), is_available=False
)
s, err_res = api_call(
    f"{BASE_URL}/service-requests/",
    data={"booking_id": booking_a.id, "service_id": inactive_svc.id, "remarks": "Unavailable request"},
    headers=headers_cust_a,
    method="POST"
)
test("Customer cannot request inactive service (HTTP 400)", s == 400, f"Status: {s}")

# 2.3 Customer successfully creates service request for own active booking
s, sr_res = api_call(
    f"{BASE_URL}/service-requests/",
    data={
        "booking_id": booking_a.id,
        "service_id": new_service_id,
        "remarks": "Please schedule for 5:30 PM",
        "price": "10.00"
    },
    headers=headers_cust_a,
    method="POST"
)
created_sr = sr_res.get("data", {}) if isinstance(sr_res, dict) else {}
sr_id = created_sr.get("id") or created_sr.get("request_id")
test("Customer A creates service request (HTTP 201)", s == 201 and sr_id is not None, f"Status: {s}, Res: {sr_res}")

# 2.4 Authoritative pricing: client override ignored
svc_obj = Service.objects.get(id=new_service_id)
test("Authoritative pricing applied from database", float(created_sr.get("service", {}).get("price", 0)) == float(svc_obj.price))

# ============================================================
# 3. SERVICE REQUEST STATUS TRANSITIONS & CUSTOMER ISOLATION
# ============================================================
print("\n--- 3. SERVICE REQUEST LIFECYCLE & ISOLATION ---")

# 3.1 Customer cannot accept or complete their own service request
s, _ = api_call(
    f"{BASE_URL}/service-requests/{sr_id}/status/",
    data={"status": "accepted"},
    headers=headers_cust_a,
    method="PATCH"
)
test("Customer cannot accept service request directly (HTTP 403 Forbidden)", s == 403, f"Status: {s}")

# 3.2 Customer B cannot access Customer A's service request
s, _ = api_call(f"{BASE_URL}/service-requests/{sr_id}/", headers=headers_cust_b)
test("Customer B accessing Customer A service request returns HTTP 403", s == 403, f"Status: {s}")

# 3.3 Customer A /my/ returns their own service requests
s, my_sr_res = api_call(f"{BASE_URL}/service-requests/my/", headers=headers_cust_a)
my_sr_list = my_sr_res.get("data", []) if isinstance(my_sr_res, dict) else []
test("Customer A /my/ returns their own requests", s == 200 and any(item.get("id") == sr_id for item in my_sr_list))

# 3.4 Reception advances status: Pending -> Accepted
s, r_acc = api_call(
    f"{BASE_URL}/service-requests/{sr_id}/status/",
    data={"status": "accepted"},
    headers=headers_reception,
    method="PATCH"
)
test("Reception advances request Pending -> Accepted (HTTP 200)", s == 200 and r_acc.get("data", {}).get("request_status") == "accepted")

# 3.5 Reception advances: Accepted -> In Progress
s, r_inp = api_call(
    f"{BASE_URL}/service-requests/{sr_id}/status/",
    data={"status": "in_progress"},
    headers=headers_reception,
    method="PATCH"
)
test("Reception advances request Accepted -> In Progress (HTTP 200)", s == 200 and r_inp.get("data", {}).get("request_status") == "in_progress")

# 3.6 Reception advances: In Progress -> Completed
s, r_comp = api_call(
    f"{BASE_URL}/service-requests/{sr_id}/status/",
    data={"status": "completed"},
    headers=headers_reception,
    method="PATCH"
)
test("Reception advances request In Progress -> Completed (HTTP 200)", s == 200 and r_comp.get("data", {}).get("request_status") == "completed")

# 3.7 Invalid transition: Completed -> Pending rejected
s, _ = api_call(
    f"{BASE_URL}/service-requests/{sr_id}/status/",
    data={"status": "pending"},
    headers=headers_reception,
    method="PATCH"
)
test("Invalid transition Completed -> Pending rejected (HTTP 400)", s == 400, f"Status: {s}")

# 3.8 Customer cancellation of pending request
s, sr2_res = api_call(
    f"{BASE_URL}/service-requests/",
    data={"booking_id": booking_a.id, "service_id": new_service_id, "remarks": "To be cancelled"},
    headers=headers_cust_a,
    method="POST"
)
sr2_id = sr2_res.get("data", {}).get("id")
s, cancel_res = api_call(f"{BASE_URL}/service-requests/{sr2_id}/cancel/", headers=headers_cust_a, method="PATCH")
test("Customer can cancel their pending service request (HTTP 200)", s == 200 and cancel_res.get("data", {}).get("request_status") == "cancelled")

# ============================================================
# 4. HOUSEKEEPING TASK CREATION & DEPARTMENT VALIDATION
# ============================================================
print("\n--- 4. HOUSEKEEPING TASK CREATION & DEPARTMENT VALIDATION ---")

# 4.1 Customer denied from housekeeping APIs
s, _ = api_call(f"{BASE_URL}/housekeeping/tasks/", headers=headers_cust_a)
test("Customer denied from Housekeeping APIs (HTTP 403 Forbidden)", s == 403, f"Status: {s}")

s, _ = api_call(f"{BASE_URL}/housekeeping/tasks/", headers=headers_chef)
test("Restaurant denied from Housekeeping APIs (HTTP 403 Forbidden)", s == 403, f"Status: {s}")

# 4.2 Validate staff department: Restaurant or Reception staff cannot be assigned
staff_chef = Staff.objects.filter(user__username="chef_anand").first()
staff_reception = Staff.objects.filter(user__username="reception_priya").first()
staff_hk = Staff.objects.filter(user__username="housekeeping_suresh").first()
room_target = Room.objects.filter(status='Available').first()

s, _ = api_call(
    f"{BASE_URL}/housekeeping/tasks/",
    data={"room_id": room_target.id, "staff_id": staff_chef.id, "scheduled_date": "2026-09-24", "remarks": "Invalid staff assignment"},
    headers=headers_admin,
    method="POST"
)
test("Assigning Chef to Housekeeping Task rejected with HTTP 400", s == 400, f"Status: {s}")

s, _ = api_call(
    f"{BASE_URL}/housekeeping/tasks/",
    data={"room_id": room_target.id, "staff_id": staff_reception.id, "scheduled_date": "2026-09-24", "remarks": "Invalid staff assignment"},
    headers=headers_admin,
    method="POST"
)
test("Assigning Reception to Housekeeping Task rejected with HTTP 400", s == 400, f"Status: {s}")

# 4.3 Inactive staff rejection
inactive_hk_staff = Staff.objects.create(
    user_id=cust_b.user_id,
    department_id=staff_hk.department_id,
    hotel_id=1, designation="Helper", status="Inactive", joined_date=date.today()
)
s, _ = api_call(
    f"{BASE_URL}/housekeeping/tasks/",
    data={"room_id": room_target.id, "staff_id": inactive_hk_staff.id, "scheduled_date": "2026-09-24"},
    headers=headers_admin,
    method="POST"
)
test("Assigning Inactive Housekeeping Staff rejected with HTTP 400", s == 400, f"Status: {s}")
inactive_hk_staff.delete()

# 4.4 Successful task creation with valid Housekeeping staff
HousekeepingTask.objects.filter(room=room_target, status__in=['Pending', 'Assigned', 'Scheduled', 'Cleaning', 'In Progress', 'Inspection']).delete()

s, hk_task_res = api_call(
    f"{BASE_URL}/housekeeping/tasks/",
    data={
        "room_id": room_target.id,
        "staff_id": staff_hk.id,
        "scheduled_date": "2026-09-24",
        "task_type": "Turnover Sanitization",
        "priority": "Urgent",
        "remarks": "Deep sanitization before VIP arrival"
    },
    headers=headers_admin,
    method="POST"
)
created_task = hk_task_res.get("data", {}) if isinstance(hk_task_res, dict) else {}
hk_task_id = created_task.get("id") or created_task.get("task_id")
test("Admin successfully creates Housekeeping Task (HTTP 201)", s == 201 and hk_task_id is not None, f"Status: {s}, Res: {hk_task_res}")

# 4.5 Duplicate task prevention
s, dup_res = api_call(
    f"{BASE_URL}/housekeeping/tasks/",
    data={"room_id": room_target.id, "staff_id": staff_hk.id, "scheduled_date": "2026-09-24"},
    headers=headers_admin,
    method="POST"
)
test("Duplicate active Housekeeping Task on same room prevented (HTTP 400)", s == 400, f"Status: {s}")

# ============================================================
# 5. STAFF ISOLATION & ROOM CLEANLINESS SYNCHRONIZATION
# ============================================================
print("\n--- 5. STAFF ISOLATION & CLEANLINESS SYNCHRONIZATION ---")

# 5.1 Housekeeping Suresh sees his assigned tasks
s, my_tasks_res = api_call(f"{BASE_URL}/housekeeping/tasks/my/", headers=headers_housekeeping)
my_tasks = my_tasks_res.get("data", []) if isinstance(my_tasks_res, dict) else []
test("Housekeeping staff can view assigned tasks (/my/)", s == 200 and any(t.get("id") == hk_task_id for t in my_tasks))

# 5.2 Staff Isolation: Staff member cannot modify task assigned to someone else
role_hk = Role.objects.get(name="HOUSEKEEPING")
user_hk2, _ = User.objects.get_or_create(username="hk_worker_two", defaults={"role": role_hk, "email": "hk2@stayhive.com"})
user_hk2.set_password("stayhive123")
user_hk2.save()
staff_hk2, _ = Staff.objects.get_or_create(
    user=user_hk2,
    defaults={"department": staff_hk.department, "hotel_id": 1, "designation": "Sanitation Associate", "status": "Active", "joined_date": date.today()}
)
token_hk2 = get_token("hk_worker_two")
headers_hk2 = {"Authorization": f"Bearer {token_hk2}"}

s, _ = api_call(
    f"{BASE_URL}/housekeeping/tasks/{hk_task_id}/status/",
    data={"status": "in_progress"},
    headers=headers_hk2,
    method="PATCH"
)
test("Staff B cannot update task assigned to Staff A (HTTP 403 Forbidden)", s == 403, f"Status: {s}")

# 5.3 Assigned Staff starts task -> Room housekeeping status becomes 'In Progress'
s, start_res = api_call(
    f"{BASE_URL}/housekeeping/tasks/{hk_task_id}/status/",
    data={"status": "in_progress"},
    headers=headers_housekeeping,
    method="PATCH"
)
room_target.refresh_from_db()
test("Assigned staff starts task (HTTP 200)", s == 200)
test("Room housekeeping_status synchronized to 'In Progress'", room_target.housekeeping_status == 'In Progress', f"HK Status: {room_target.housekeeping_status}")

# 5.4 Assigned Staff completes task -> Room housekeeping status becomes 'Clean'
s, comp_res = api_call(
    f"{BASE_URL}/housekeeping/tasks/{hk_task_id}/status/",
    data={"status": "completed"},
    headers=headers_housekeeping,
    method="PATCH"
)
room_target.refresh_from_db()
completed_task = HousekeepingTask.objects.get(id=hk_task_id)
test("Assigned staff completes task (HTTP 200)", s == 200)
test("Task completed_at timestamp recorded", completed_task.completed_at is not None)
test("Room housekeeping_status becomes 'Clean'", room_target.housekeeping_status == 'Clean', f"HK Status: {room_target.housekeeping_status}")

# 5.5 Operational room status safety: occupied room remains occupied after cleaning
room_target.status = 'Occupied'
room_target.save()
HousekeepingTask.objects.filter(room=room_target, status__in=['Pending', 'Assigned', 'Scheduled', 'Cleaning', 'In Progress', 'Inspection']).delete()
task_occ = HousekeepingTask.objects.create(
    room=room_target, staff=staff_hk, task_type="Daily In-Stay Refresh", status="Cleaning"
)
s, _ = api_call(
    f"{BASE_URL}/housekeeping/tasks/{task_occ.id}/status/",
    data={"status": "completed"},
    headers=headers_housekeeping,
    method="PATCH"
)
room_target.refresh_from_db()
test("Cleaning completion does NOT alter occupied operational room status", room_target.status == 'Occupied', f"Status: {room_target.status}")

# Reset room
room_target.status = 'Available'
room_target.save()

# ============================================================
# 6. CHECKOUT → HOUSEKEEPING INTEGRATION
# ============================================================
print("\n--- 6. CHECKOUT -> HOUSEKEEPING INTEGRATION ---")

# Setup checked-in booking for checkout
test_room = Room.objects.filter(status='Available').last()
test_room.status = 'Occupied'
test_room.housekeeping_status = 'Clean'
test_room.save()

from datetime import datetime
checkout_booking = Booking.objects.create(
    booking_number=f"TEST-CO-{datetime.now().strftime('%Y%m%d%H%M%S%f')}",
    customer=cust_a,
    hotel_id=1,
    check_in_date=date.today() - timedelta(days=1),
    check_out_date=date.today(),
    total_guests=1, adults=1, children=0,
    total_amount=Decimal('4500.00'), net_amount=Decimal('4500.00'),
    status='Checked-in'
)
BookingRoom.objects.create(
    booking=checkout_booking,
    room=test_room
)

HousekeepingTask.objects.filter(room=test_room).delete()

s, co_res = api_call(
    f"{BASE_URL}/reception/check-out/",
    data={"booking_id": checkout_booking.id, "remarks": "Guest departed early morning"},
    headers=headers_reception,
    method="POST"
)
test("Checkout via Reception API succeeds (HTTP 200)", s == 200)

test_room.refresh_from_db()
test("Room housekeeping_status updated to 'Needs Cleaning' (dirty)", test_room.housekeeping_status == 'Needs Cleaning')

# Verify Housekeeping task was automatically created/dispatched
dispatched_task = HousekeepingTask.objects.filter(
    room=test_room,
    status__in=['Pending', 'Assigned', 'Scheduled']
).first()
test("Housekeeping Task automatically dispatched upon checkout", dispatched_task is not None)
if dispatched_task:
    test("Dispatched task has Housekeeping staff assigned", dispatched_task.staff is not None and "housekeeping" in dispatched_task.staff.department.name.lower())

# Repeated checkout attempt should NOT create duplicate tasks
s, co_dup_res = api_call(
    f"{BASE_URL}/reception/check-out/",
    data={"booking_id": checkout_booking.id},
    headers=headers_reception,
    method="POST"
)
test("Repeated checkout rejected with HTTP 400 'Guest has already checked out.'", s == 400)
active_tasks_count = HousekeepingTask.objects.filter(
    room=test_room,
    status__in=['Pending', 'Assigned', 'Scheduled', 'Cleaning', 'In Progress']
).count()
test("No duplicate housekeeping tasks created for room (exactly 1 active task)", active_tasks_count == 1, f"Count: {active_tasks_count}")

# Housekeeping room board endpoint returns room status and housekeeping status
s, rb_res = api_call(f"{BASE_URL}/housekeeping/tasks/room-board/", headers=headers_manager)
rb_data = rb_res.get("data", []) if isinstance(rb_res, dict) else []
test("Housekeeping Room Board returns rooms with status and cleanliness", s == 200 and len(rb_data) > 0 and "housekeeping_status" in rb_data[0])

# Clean up temporary test data
ServiceRequest.objects.filter(service_id=new_service_id).delete()
Service.objects.filter(id=new_service_id).delete()
inactive_svc.delete()

print("\n============================================================")
print(f"VERIFICATION SUMMARY: {passed_tests} PASSED, {failed_tests} FAILED")
print("============================================================")

if failed_tests > 0:
    sys.exit(1)
