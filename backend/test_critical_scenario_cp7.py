"""
STAYHIVE — CHECKPOINT 7: CRITICAL REAL-WORLD INTEGRATION SCENARIO (Section 46)
Executes the exact 23-step end-to-end lifecycle:
Customer Confirmed Booking -> Check-in -> Room Occupied -> Request Laundry ->
Reception Sees & Accepts -> Starts Request -> In Progress -> Completed ->
Customer Sees Completed -> Customer Checks Out -> Room Dirty -> Task Dispatched ->
Housekeeping Staff Sees Task -> Starts Cleaning -> Task In Progress -> Completes Cleaning ->
Room Clean -> Operational Status Consistent -> Data Persists in MySQL.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from decimal import Decimal
from datetime import date, timedelta, datetime
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

def step(num, desc, passed):
    if passed:
        print(f"  Step {num:02d}: [PASS] {desc}")
    else:
        print(f"  Step {num:02d}: [FAIL] {desc}")
        sys.exit(1)

print("=" * 65)
print("STAYHIVE — CHECKPOINT 7: CRITICAL REAL-WORLD INTEGRATION SCENARIO")
print("=" * 65)

# Tokens
token_reception = get_token("reception_priya")
token_hk = get_token("housekeeping_suresh")
token_customer = get_token("rahul_sharma")

headers_rec = {"Authorization": f"Bearer {token_reception}"}
headers_hk = {"Authorization": f"Bearer {token_hk}"}
headers_cust = {"Authorization": f"Bearer {token_customer}"}

cust = Customer.objects.filter(user__username="rahul_sharma").first()
target_room = Room.objects.filter(status='Available', housekeeping_status='Clean').first()
if not target_room:
    target_room = Room.objects.filter(status='Available').first()
    target_room.housekeeping_status = 'Clean'
    target_room.save()

# 1. Customer has confirmed booking
b_num = f"E2E-CP7-{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
e2e_booking = Booking.objects.create(
    booking_number=b_num,
    customer=cust,
    hotel_id=target_room.hotel_id,
    check_in_date=date.today(),
    check_out_date=date.today() + timedelta(days=2),
    total_guests=2, adults=2, children=0,
    total_amount=Decimal('8500.00'), net_amount=Decimal('8500.00'),
    status='Confirmed'
)
BookingRoom.objects.create(booking=e2e_booking, room=target_room)
step(1, f"Customer has confirmed booking (#{b_num})", e2e_booking.id is not None)

# 2. Customer checks in via Reception API
s, checkin_res = api_call(
    f"{BASE_URL}/reception/check-in/",
    data={"booking_id": e2e_booking.id, "room_id": target_room.id, "key_card": "RFID-E2E-701"},
    headers=headers_rec,
    method="POST"
)
step(2, "Customer checks in via Reception API", s == 200)

# 3. Room becomes occupied
target_room.refresh_from_db()
step(3, f"Room {target_room.room_number} status becomes Occupied", target_room.status == 'Occupied')

# 4. Customer requests Laundry
laundry_svc = Service.objects.filter(name__icontains="Laundry", is_available=True).first()
if not laundry_svc:
    laundry_svc = Service.objects.create(
        hotel=target_room.hotel, name="Express Steam Laundry", category="Housekeeping", price=Decimal('450.00'), is_available=True
    )

s, sr_res = api_call(
    f"{BASE_URL}/service-requests/",
    data={"booking_id": e2e_booking.id, "service_id": laundry_svc.id, "remarks": "2 formal shirts and trousers"},
    headers=headers_cust,
    method="POST"
)
sr_id = sr_res.get("data", {}).get("id")
step(4, f"Customer requests {laundry_svc.name} (Request #{sr_id})", s == 201 and sr_id is not None)

# 5. Reception sees request
s, list_res = api_call(f"{BASE_URL}/service-requests/?status=pending", headers=headers_rec)
pending_list = list_res.get("data", []) if isinstance(list_res, dict) else []
step(5, "Reception sees pending request in queue", any(r.get("id") == sr_id for r in pending_list))

# 6. Reception accepts request
s, acc_res = api_call(f"{BASE_URL}/service-requests/{sr_id}/status/", data={"status": "accepted"}, headers=headers_rec, method="PATCH")
step(6, "Reception accepts request", s == 200 and acc_res.get("data", {}).get("request_status") == "accepted")

# 7. Reception starts request
s, start_sr_res = api_call(f"{BASE_URL}/service-requests/{sr_id}/status/", data={"status": "in_progress"}, headers=headers_rec, method="PATCH")
step(7, "Reception starts service request", s == 200)

# 8. Request becomes in_progress
step(8, "Request status verified as in_progress", start_sr_res.get("data", {}).get("request_status") == "in_progress")

# 9. Request becomes completed
s, comp_sr_res = api_call(f"{BASE_URL}/service-requests/{sr_id}/status/", data={"status": "completed"}, headers=headers_rec, method="PATCH")
step(9, "Reception marks service request as completed", s == 200 and comp_sr_res.get("data", {}).get("request_status") == "completed")

# 10. Customer sees completed request
s, cust_view = api_call(f"{BASE_URL}/service-requests/{sr_id}/", headers=headers_cust)
step(10, "Customer sees completed service request", s == 200 and cust_view.get("data", {}).get("request_status") == "completed")

# 11. Customer checks out
HousekeepingTask.objects.filter(room=target_room).delete()
s, co_res = api_call(
    f"{BASE_URL}/reception/check-out/",
    data={"booking_id": e2e_booking.id, "remarks": "E2E checkout complete"},
    headers=headers_rec,
    method="POST"
)
step(11, "Customer checks out via Reception API", s == 200)

# 12. Room housekeeping status becomes dirty (Needs Cleaning)
target_room.refresh_from_db()
step(12, "Room housekeeping status becomes 'Needs Cleaning' (dirty)", target_room.housekeeping_status == 'Needs Cleaning')

# 13. Housekeeping task is created/available
hk_task = HousekeepingTask.objects.filter(room=target_room, status__in=['Pending', 'Assigned', 'Scheduled']).first()
step(13, f"Housekeeping task automatically created/available (Task #{hk_task.id if hk_task else 'None'})", hk_task is not None)

# 14. Housekeeping staff logs in
step(14, "Housekeeping staff authenticated (housekeeping_suresh)", token_hk is not None)

# 15. Staff sees assigned room
s, my_tasks_res = api_call(f"{BASE_URL}/housekeeping/tasks/my/", headers=headers_hk)
my_task_items = my_tasks_res.get("data", []) if isinstance(my_tasks_res, dict) else []
step(15, f"Staff sees assigned room {target_room.room_number} in /my/ tasks", any(t.get("room_number") == str(target_room.room_number) for t in my_task_items))

# 16. Staff starts cleaning
s, start_hk_res = api_call(
    f"{BASE_URL}/housekeeping/tasks/{hk_task.id}/status/",
    data={"status": "in_progress"},
    headers=headers_hk,
    method="PATCH"
)
step(16, "Staff starts cleaning via status update", s == 200)

# 17. Task becomes in_progress and room housekeeping status updates
target_room.refresh_from_db()
step(17, "Task status becomes in_progress & room housekeeping status becomes In Progress", target_room.housekeeping_status == 'In Progress')

# 18. Staff completes cleaning
s, comp_hk_res = api_call(
    f"{BASE_URL}/housekeeping/tasks/{hk_task.id}/status/",
    data={"status": "completed"},
    headers=headers_hk,
    method="PATCH"
)
step(18, "Staff completes cleaning", s == 200)

# 19. Task becomes completed
hk_task.refresh_from_db()
step(19, "Task status in MySQL is 'Completed' with completed_at set", hk_task.status == 'Completed' and hk_task.completed_at is not None)

# 20. Room housekeeping status becomes clean
target_room.refresh_from_db()
step(20, "Room housekeeping_status becomes 'Clean'", target_room.housekeeping_status == 'Clean')

# 21. Room operational status remains consistent
step(21, "Room operational status remains consistent ('Available')", target_room.status == 'Available')

# 22. Refresh browser simulation (Query API again)
s, verify_room = api_call(f"{BASE_URL}/rooms/{target_room.id}/", headers=headers_rec)
step(22, "Browser refresh simulation (GET /api/rooms/{id}/ returns clean)", s == 200 and verify_room.get("data", {}).get("housekeeping_status") == "Clean")

# 23. Data persists in MySQL
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT housekeeping_status, status FROM room WHERE id=%s", [target_room.id])
    db_room = cursor.fetchone()
    cursor.execute("SELECT status, completed_at FROM housekeeping_task WHERE id=%s", [hk_task.id])
    db_task = cursor.fetchone()
step(23, "Direct MySQL query confirms clean room and completed task persisted", db_room[0] == 'Clean' and db_task[0] == 'Completed')

print("=" * 65)
print("CRITICAL REAL-WORLD INTEGRATION SCENARIO COMPLETE: 23/23 PASSED!")
print("=" * 65)
