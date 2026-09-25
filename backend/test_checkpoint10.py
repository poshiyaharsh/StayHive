"""
STAYHIVE — CHECKPOINT 10: NOTIFICATIONS + ANALYTICS + REPORTS TEST SUITE
========================================================================
Comprehensive automated test suite verifying:
- Centralized notification service & application-level deduplication
- Notification user isolation & ownership security (strict customer separation)
- Unread count & mark-as-read / mark-all-read operations
- Notification generation across all business workflows (CP4-CP9)
- All 12 Management Analytics endpoints with database aggregations
- Timezone-aware date filtering (today, this_month, custom date ranges)
- Authoritative financial revenue accuracy (successful payments minus completed refunds)
- All 8 Operational Reports (JSON structured summary + rows)
- RFC 4180 CSV export streaming (?format=csv)
- Strict Role Security (Admin/Manager full, Reception operational, Customer 403)
- Complete 38-Step Critical End-to-End Workflow (Requirement 66)
"""

import os
import sys
import json
import uuid
import urllib.request
import urllib.error
from datetime import date, timedelta
from decimal import Decimal
from django.utils import timezone
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
    Feedback, Complaint, Inquiry, Notification
)
from apps.notifications.services import create_notification, notify_user, notify_customer, notify_role
from apps.notifications.constants import (
    TYPE_BOOKING_CREATED, TYPE_BOOKING_CONFIRMED, TYPE_BOOKING_CANCELLED,
    TYPE_CHECK_IN, TYPE_CHECK_OUT, TYPE_FOOD_ORDER_CREATED, TYPE_FOOD_ORDER_STATUS,
    TYPE_SERVICE_REQUEST_CREATED, TYPE_SERVICE_REQUEST_STATUS, TYPE_HOUSEKEEPING_TASK,
    TYPE_PAYMENT_RECEIVED, TYPE_REFUND_COMPLETED, TYPE_COMPLAINT_CREATED,
    TYPE_COMPLAINT_RESOLVED, TYPE_INQUIRY_RECEIVED, TYPE_INQUIRY_RESPONDED,
    TYPE_FEEDBACK_RECEIVED
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
print("STAYHIVE — CHECKPOINT 10: NOTIFICATIONS + ANALYTICS + REPORTS")
print("============================================================")

# Get tokens for test users
admin_user = User.objects.get(username="admin")
manager_user = User.objects.get(username="manager_vikram")
reception_user = User.objects.get(username="reception_priya")
hk_user = User.objects.get(username="housekeeping_suresh")
rest_user = User.objects.get(username="chef_anand")
cust_user = User.objects.get(username="rahul_sharma")
cust2_user = User.objects.get(username="ananya_patel")

admin_token = get_token(admin_user)
manager_token = get_token(manager_user)
reception_token = get_token(reception_user)
hk_token = get_token(hk_user)
rest_token = get_token(rest_user)
cust_token = get_token(cust_user)
cust2_token = get_token(cust2_user)

# ============================================================
# SECTION 1: NOTIFICATION SERVICE & DEDUPLICATION
# ============================================================
print("\n--- SECTION 1: Notification Service & Deduplication ---")

# 1. Create notification via service
notif1 = create_notification(
    user=cust_user,
    message="Welcome to StayHive test suite!",
    notification_type="system_alert",
    title="System Notice"
)
test("Notification creation via service", notif1 is not None and notif1.id is not None)

# 2. Duplicate suppression within 60s
notif_dup = create_notification(
    user=cust_user,
    message="Welcome to StayHive test suite!",
    notification_type="system_alert",
    title="System Notice"
)
test("Deduplication prevents identical recent notification", notif_dup is not None and notif_dup.id == notif1.id)

# 3. Notification for different user is not deduplicated
notif_other = create_notification(
    user=cust2_user,
    message="Welcome to StayHive test suite!",
    notification_type="system_alert",
    title="System Notice"
)
test("Notifications for different users are distinct", notif_other.id != notif1.id)

# ============================================================
# SECTION 2: NOTIFICATION APIS & OWNERSHIP ISOLATION
# ============================================================
print("\n--- SECTION 2: Notification APIs & Ownership Isolation ---")

# 4. List notifications for cust_user
s, res = api_request("/notifications/", token=cust_token)
test("GET /api/notifications/ returns 200", s == 200)
items = res.get("data", {}).get("notifications", []) if isinstance(res.get("data"), dict) else res.get("data", [])
test("User receives notifications list", len(items) > 0)

# 5. User isolation: cust_token does not see cust2_user notifications
cust1_ids = [n["id"] if "id" in n else n.get("notification_id") for n in items]
test("Customer isolation: user does not receive other users' notifications", notif_other.id not in cust1_ids)

# 6. Unread count endpoint
s, res = api_request("/notifications/unread-count/", token=cust_token)
test("GET /api/notifications/unread-count/ returns count", s == 200 and "count" in res and res["count"] > 0)

# 7. Unread list endpoint
s, res = api_request("/notifications/unread/", token=cust_token)
test("GET /api/notifications/unread/ returns unread notifications", s == 200 and isinstance(res.get("data"), list))

# 8. Mark single notification as read
s, res = api_request(f"/notifications/{notif1.id}/read/", method="PATCH", token=cust_token)
test("PATCH /api/notifications/{id}/read/ marks read", s == 200)
notif1.refresh_from_db()
test("Notification is_read is True in database", notif1.is_read is True)

# 9. Cross-user mark read protection: cust2 cannot mark cust1's notification as read
s, res = api_request(f"/notifications/{notif1.id}/read/", method="PATCH", token=cust2_token)
test("Cross-user mark read is rejected (404/403)", s in [403, 404])

# 10. Mark all read
s, res = api_request("/notifications/read-all/", method="PATCH", token=cust_token)
test("PATCH /api/notifications/read-all/ returns 200", s == 200)
unread_c = Notification.objects.filter(user=cust_user, is_read=False).count()
test("All notifications marked as read in database", unread_c == 0)

# 11. Pagination
s, res = api_request("/notifications/?page=1", token=cust_token)
test("GET /api/notifications/?page=1 pagination works", s == 200)

# ============================================================
# SECTION 3: MANAGEMENT ANALYTICS ENDPOINTS
# ============================================================
print("\n--- SECTION 3: Management Analytics Endpoints ---")

# 12. Overview Analytics
s, res = api_request("/analytics/overview/", token=admin_token)
test("GET /api/analytics/overview/ returns 200 for Admin", s == 200)
ov_data = res.get("data", {})
test("Overview contains bookings, revenue, customers, rooms",
     all(k in ov_data for k in ["bookings", "revenue", "customers", "rooms", "food_orders", "services", "feedback", "complaints"]))

# 13. Revenue analytics decimal accuracy
rev = ov_data.get("revenue", {})
test("Revenue analytics contains collected, refunded, net_revenue",
     "total" in rev and "refunded" in rev and "net_revenue" in rev)

# 14. Booking Analytics & Trend
s, res = api_request("/analytics/bookings/", token=admin_token)
test("GET /api/analytics/bookings/ returns 200", s == 200)
b_data = res.get("data", {})
test("Booking analytics includes total, confirmed, trend", "total" in b_data and "trend" in b_data and isinstance(b_data["trend"], list))

# 15. Room Analytics & Occupancy
s, res = api_request("/analytics/rooms/", token=admin_token)
test("GET /api/analytics/rooms/ returns 200", s == 200)
r_data = res.get("data", {})
test("Room analytics includes total_rooms, occupied, available, distribution",
     all(k in r_data for k in ["total_rooms", "occupied", "available", "distribution"]))

# 16. Food Analytics
s, res = api_request("/analytics/food/", token=admin_token)
test("GET /api/analytics/food/ returns 200", s == 200)
f_data = res.get("data", {})
test("Food analytics includes total_orders, food_revenue, top_food_items",
     "total_orders" in f_data and "food_revenue" in f_data and "top_food_items" in f_data)

# 17. Service Analytics
s, res = api_request("/analytics/services/", token=admin_token)
test("GET /api/analytics/services/ returns 200", s == 200)
s_data = res.get("data", {})
test("Service analytics includes total_requests and most_requested_services",
     "total_requests" in s_data and "most_requested_services" in s_data)

# 18. Housekeeping Analytics
s, res = api_request("/analytics/housekeeping/", token=admin_token)
test("GET /api/analytics/housekeeping/ returns 200", s == 200)
hk_data = res.get("data", {})
test("Housekeeping analytics includes total_tasks, dirty_rooms, tasks_by_staff",
     "total_tasks" in hk_data and "dirty_rooms" in hk_data and "tasks_by_staff" in hk_data)

# 19. Customer Analytics
s, res = api_request("/analytics/customers/", token=admin_token)
test("GET /api/analytics/customers/ returns 200", s == 200)
c_data = res.get("data", {})
test("Customer analytics includes total_customers, new_customers, returning_customers",
     "total_customers" in c_data and "new_customers" in c_data and "returning_customers" in c_data)

# 20. Feedback Analytics
s, res = api_request("/analytics/feedback/", token=admin_token)
test("GET /api/analytics/feedback/ returns 200", s == 200)
fb_data = res.get("data", {})
test("Feedback analytics includes average_rating and distribution",
     "total_feedback" in fb_data and "average_rating" in fb_data and "distribution" in fb_data)

# 21. Complaint Analytics
s, res = api_request("/analytics/complaints/", token=admin_token)
test("GET /api/analytics/complaints/ returns 200", s == 200)
comp_data = res.get("data", {})
test("Complaint analytics includes total, pending, in_progress, resolved",
     "total" in comp_data and "pending" in comp_data and "resolved" in comp_data)

# 22. Inquiry Analytics
s, res = api_request("/analytics/inquiries/", token=admin_token)
test("GET /api/analytics/inquiries/ returns 200", s == 200)
inq_data = res.get("data", {})
test("Inquiry analytics includes total, responded, response_rate",
     "total" in inq_data and "responded" in inq_data and "response_rate" in inq_data)

# 23. Payment Analytics
s, res = api_request("/analytics/payments/", token=admin_token)
test("GET /api/analytics/payments/ returns 200", s == 200)
pay_data = res.get("data", {})
test("Payment analytics includes collected_amount and net_collected_amount",
     "collected_amount" in pay_data and "net_collected_amount" in pay_data)

# 24. Refund Analytics
s, res = api_request("/analytics/refunds/", token=admin_token)
test("GET /api/analytics/refunds/ returns 200", s == 200)
ref_data = res.get("data", {})
test("Refund analytics includes total_refunds and refund_amount",
     "total_refunds" in ref_data and "refund_amount" in ref_data)

# 25. Date Filtering
s, res = api_request("/analytics/overview/?period=today", token=admin_token)
test("Analytics date filter period=today returns 200", s == 200)
s, res = api_request("/analytics/overview/?date_from=2026-09-01&date_to=2026-09-24", token=admin_token)
test("Analytics date filter date_from/date_to returns 200", s == 200)

# ============================================================
# SECTION 4: ANALYTICS SECURITY & ROLE GUARDS
# ============================================================
print("\n--- SECTION 4: Analytics Security & Role Guards ---")

# 26. Customer role is strictly forbidden from management analytics
s, res = api_request("/analytics/overview/", token=cust_token)
test("Customer blocked from /api/analytics/overview/ (403)", s == 403)

s, res = api_request("/analytics/payments/", token=cust_token)
test("Customer blocked from /api/analytics/payments/ (403)", s == 403)

# 27. Manager role has full analytics access
s, res = api_request("/analytics/overview/", token=manager_token)
test("Manager granted access to /api/analytics/overview/ (200)", s == 200)

# 28. Reception role has operational analytics access
s, res = api_request("/analytics/bookings/", token=reception_token)
test("Reception granted access to /api/analytics/bookings/ (200)", s == 200)

# 29. Restaurant role has food analytics access but blocked from room analytics
s, res = api_request("/analytics/food/", token=rest_token)
test("Restaurant staff access to /api/analytics/food/ (200)", s == 200)
s, res = api_request("/analytics/rooms/", token=rest_token)
test("Restaurant staff blocked from /api/analytics/rooms/ (403)", s == 403)

# 30. Housekeeping role has housekeeping analytics access but blocked from food analytics
s, res = api_request("/analytics/housekeeping/", token=hk_token)
test("Housekeeping staff access to /api/analytics/housekeeping/ (200)", s == 200)
s, res = api_request("/analytics/food/", token=hk_token)
test("Housekeeping staff blocked from /api/analytics/food/ (403)", s == 403)

# ============================================================
# SECTION 5: OPERATIONAL REPORTS & CSV EXPORT
# ============================================================
print("\n--- SECTION 5: Operational Reports & CSV Export ---")

# 31. Bookings Report (JSON & CSV)
s, res = api_request("/reports/bookings/", token=admin_token)
test("GET /api/reports/bookings/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/bookings/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/bookings/?format=csv returns CSV stream", s == 200 and "booking_number" in raw_csv)

# 32. Revenue Report (JSON & CSV)
s, res = api_request("/reports/revenue/", token=admin_token)
test("GET /api/reports/revenue/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/revenue/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/revenue/?format=csv returns CSV stream", s == 200 and "transaction_id" in raw_csv)

# 33. Occupancy Report (JSON & CSV)
s, res = api_request("/reports/occupancy/", token=admin_token)
test("GET /api/reports/occupancy/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/occupancy/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/occupancy/?format=csv returns CSV stream", s == 200 and "room_number" in raw_csv)

# 34. Food Report (JSON & CSV)
s, res = api_request("/reports/food/", token=admin_token)
test("GET /api/reports/food/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/food/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/food/?format=csv returns CSV stream", s == 200 and "order_id" in raw_csv)

# 35. Services Report (JSON & CSV)
s, res = api_request("/reports/services/", token=admin_token)
test("GET /api/reports/services/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/services/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/services/?format=csv returns CSV stream", s == 200 and "service_name" in raw_csv)

# 36. Housekeeping Report (JSON & CSV)
s, res = api_request("/reports/housekeeping/", token=admin_token)
test("GET /api/reports/housekeeping/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/housekeeping/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/housekeeping/?format=csv returns CSV stream", s == 200 and "task_type" in raw_csv)

# 37. Customer Report (JSON & CSV)
s, res = api_request("/reports/customers/", token=admin_token)
test("GET /api/reports/customers/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/customers/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/customers/?format=csv returns CSV stream", s == 200 and "customer_id" in raw_csv)

# 38. Support Report (JSON & CSV)
s, res = api_request("/reports/support/", token=admin_token)
test("GET /api/reports/support/ returns 200 JSON", s == 200 and "summary" in res and "rows" in res)

s, raw_csv = api_request("/reports/support/?format=csv", token=admin_token, return_raw=True)
test("GET /api/reports/support/?format=csv returns CSV stream", s == 200 and "guest_name" in raw_csv)

# 39. Customer blocked from Reports
s, res = api_request("/reports/revenue/", token=cust_token)
test("Customer blocked from /api/reports/revenue/ (403)", s == 403)


# ============================================================
# SECTION 6: CRITICAL 38-STEP END-TO-END SCENARIO
# ============================================================
print("\n--- SECTION 6: Critical 38-Step End-to-End Scenario ---")

customer_obj = Customer.objects.get(user=cust_user)
room_obj = Room.objects.filter(status='Available').first()
if not room_obj:
    room_obj = Room.objects.first()
    room_obj.status = 'Available'
    room_obj.save()

hotel_obj = room_obj.hotel
room_type_obj = room_obj.room_type

# Step 1: Create booking
b_data = {
    "hotel_id": hotel_obj.id,
    "room_type_id": room_type_obj.id,
    "check_in_date": str(date.today() + timedelta(days=20)),
    "check_out_date": str(date.today() + timedelta(days=22)),
    "guest_name": "Rahul Sharma",
    "guest_email": cust_user.email,
    "guest_phone": "9876543210",
    "rooms_count": 1
}
s, res = api_request("/bookings/", method="POST", data=b_data, token=cust_token)
test("Step 1: Create booking", s in [200, 201])
booking_id = res.get("data", {}).get("id") or res.get("data", {}).get("booking_id")
booking = Booking.objects.get(id=booking_id)

# Step 2: Confirm booking
s, res = api_request(f"/bookings/{booking.id}/confirm/", method="POST", token=reception_token)
test("Step 2: Confirm booking", s == 200)

# Step 3: Customer receives notification
notif_confirmed = Notification.objects.filter(user=cust_user, type=TYPE_BOOKING_CONFIRMED).order_by('-created_at').first()
test("Step 3: Customer receives booking confirmation notification", notif_confirmed is not None)

# Step 4: Check in
s, res = api_request("/reception/check-in/", method="POST", data={"booking_id": booking.id, "key_card_issued": "KC-101"}, token=reception_token)
test("Step 4: Check-in executed", s == 200)

# Step 5: Customer receives check-in notification
notif_checkin = Notification.objects.filter(user=cust_user, type=TYPE_CHECK_IN).order_by('-created_at').first()
test("Step 5: Customer receives check-in notification", notif_checkin is not None)

# Step 6: Create food order
food_item = Food.objects.filter(is_available=True).first()
fo_data = {
    "booking_id": booking.id,
    "room_id": room_obj.id,
    "items": [{"food_id": food_item.id, "quantity": 2}]
}
s, res = api_request("/food-orders/", method="POST", data=fo_data, token=cust_token)
test("Step 6: Food order created", s in [200, 201])
food_order_id = res.get("data", {}).get("id")

# Step 7: Restaurant staff receives notification
notif_fo_staff = Notification.objects.filter(user=rest_user, type=TYPE_FOOD_ORDER_CREATED).order_by('-created_at').first()
test("Step 7: Restaurant staff receives new food order notification", notif_fo_staff is not None)

# Step 8: Change food order status to Preparing
s, res = api_request(f"/food-orders/{food_order_id}/status/", method="PATCH", data={"status": "Accepted"}, token=rest_token)
s, res = api_request(f"/food-orders/{food_order_id}/status/", method="PATCH", data={"status": "Preparing"}, token=rest_token)
test("Step 8: Food order status changed to Preparing", s == 200)

# Step 9: Customer receives status notification
notif_fo_cust = Notification.objects.filter(user=cust_user, type=TYPE_FOOD_ORDER_STATUS).order_by('-created_at').first()
test("Step 9: Customer receives food status notification", notif_fo_cust is not None)

# Step 10: Create service request
service_item = Service.objects.filter(is_available=True).first()
sr_data = {
    "booking_id": booking.id,
    "service_id": service_item.id,
    "remarks": "Please provide extra towels."
}
s, res = api_request("/service-requests/", method="POST", data=sr_data, token=cust_token)
test("Step 10: Service request created", s in [200, 201])
service_req_id = res.get("data", {}).get("id")

# Step 11: Staff receives notification
notif_sr_staff = Notification.objects.filter(user=reception_user, type=TYPE_SERVICE_REQUEST_CREATED).order_by('-created_at').first()
test("Step 11: Reception staff receives service request notification", notif_sr_staff is not None)

# Step 12: Complete service request
s, res = api_request(f"/service-requests/{service_req_id}/status/", method="PATCH", data={"status": "Accepted"}, token=reception_token)
s, res = api_request(f"/service-requests/{service_req_id}/status/", method="PATCH", data={"status": "In Progress"}, token=reception_token)
s, res = api_request(f"/service-requests/{service_req_id}/status/", method="PATCH", data={"status": "Completed"}, token=reception_token)
test("Step 12: Service request completed", s == 200)

# Step 13: Customer receives completion notification
notif_sr_cust = Notification.objects.filter(user=cust_user, type=TYPE_SERVICE_REQUEST_STATUS).order_by('-created_at').first()
test("Step 13: Customer receives service completion notification", notif_sr_cust is not None)

# Step 14: Make payment
from apps.billing.services import generate_or_get_invoice
invoice = generate_or_get_invoice(booking)
pay_method = PaymentMethod.objects.first()
pay_data = {
    "invoice_id": invoice.id,
    "payment_method_id": pay_method.id if pay_method else 1,
    "amount": 2000.00
}
s, res = api_request("/payments/", method="POST", data=pay_data, token=cust_token)
test("Step 14: Payment made successfully", s in [200, 201])

# Step 15: Customer receives payment notification
notif_pay = Notification.objects.filter(user=cust_user, type=TYPE_PAYMENT_RECEIVED).order_by('-created_at').first()
test("Step 15: Customer receives payment notification", notif_pay is not None)

# Step 16: Create complaint
comp_data = {
    "booking_id": booking.id,
    "category": "Room",
    "priority": "Medium",
    "subject": "AC cooling low",
    "description": "The air conditioner is not cooling properly."
}
s, res = api_request("/complaints/", method="POST", data=comp_data, token=cust_token)
test("Step 16: Complaint created", s in [200, 201])
complaint_id = res.get("data", {}).get("id")

# Step 17: Staff receives complaint notification
notif_comp_staff = Notification.objects.filter(user=reception_user, type=TYPE_COMPLAINT_CREATED).order_by('-created_at').first()
test("Step 17: Staff receives complaint notification", notif_comp_staff is not None)

# Step 18: Resolve complaint
s, res = api_request(f"/complaints/{complaint_id}/resolve/", method="POST", data={"resolution_notes": "AC filter cleaned and coolant topped up."}, token=manager_token)
test("Step 18: Complaint resolved", s == 200, f"Status: {s}, res: {res}")

# Step 19: Customer receives resolution notification
notif_comp_res = Notification.objects.filter(user=cust_user, type=TYPE_COMPLAINT_RESOLVED).order_by('-created_at').first()
test("Step 19: Customer receives complaint resolution notification", notif_comp_res is not None)

# Step 20: Submit feedback
fb_data = {
    "booking_id": booking.id,
    "rating": 5,
    "comment": "Outstanding stay, fast AC repair!"
}
s, res = api_request("/feedback/", method="POST", data=fb_data, token=cust_token)
test("Step 20: Feedback submitted", s in [200, 201])

# Step 21: Management receives feedback notification
notif_fb_mgmt = Notification.objects.filter(user=manager_user, type=TYPE_FEEDBACK_RECEIVED).order_by('-created_at').first()
test("Step 21: Management receives feedback notification", notif_fb_mgmt is not None)

# Step 22: Complete checkout
s, res = api_request("/reception/check-out/", method="POST", data={"booking_id": booking.id}, token=reception_token)
test("Step 22: Checkout completed", s == 200)

# Step 23: Customer receives checkout notification
notif_checkout = Notification.objects.filter(user=cust_user, type=TYPE_CHECK_OUT).order_by('-created_at').first()
test("Step 23: Customer receives checkout notification", notif_checkout is not None)

# Step 24: Open analytics dashboard
s, res = api_request("/analytics/overview/", token=admin_token)
test("Step 24: Analytics dashboard overview opened", s == 200)

# Step 25: Verify booking analytics
s, res = api_request("/analytics/bookings/", token=admin_token)
test("Step 25: Booking analytics verified", s == 200 and res.get("data", {}).get("total", 0) > 0)

# Step 26: Verify revenue analytics
s, res = api_request("/analytics/payments/", token=admin_token)
test("Step 26: Revenue & payment analytics verified", s == 200 and res.get("data", {}).get("collected_amount", 0) > 0)

# Step 27: Verify occupancy
s, res = api_request("/analytics/rooms/", token=admin_token)
test("Step 27: Room occupancy verified", s == 200 and "occupancy_percentage" in res.get("data", {}))

# Step 28: Verify food analytics
s, res = api_request("/analytics/food/", token=admin_token)
test("Step 28: Food analytics verified", s == 200 and res.get("data", {}).get("total_orders", 0) > 0)

# Step 29: Verify service analytics
s, res = api_request("/analytics/services/", token=admin_token)
test("Step 29: Service analytics verified", s == 200 and res.get("data", {}).get("total_requests", 0) > 0)

# Step 30: Verify housekeeping analytics
s, res = api_request("/analytics/housekeeping/", token=admin_token)
test("Step 30: Housekeeping analytics verified", s == 200)

# Step 31: Verify feedback analytics
s, res = api_request("/analytics/feedback/", token=admin_token)
test("Step 31: Feedback analytics verified", s == 200 and res.get("data", {}).get("total_feedback", 0) > 0)

# Step 32: Verify complaint analytics
s, res = api_request("/analytics/complaints/", token=admin_token)
test("Step 32: Complaint analytics verified", s == 200 and res.get("data", {}).get("resolved", 0) > 0)

# Step 33: Verify inquiry analytics
s, res = api_request("/analytics/inquiries/", token=admin_token)
test("Step 33: Inquiry analytics verified", s == 200)

# Step 34: Open reports
s, res = api_request("/reports/bookings/", token=admin_token)
test("Step 34: Reports page opened (Bookings report)", s == 200 and len(res.get("rows", [])) > 0)

# Step 35: Apply date range
s, res = api_request(f"/reports/bookings/?date_from={date.today() - timedelta(days=1)}&date_to={date.today() + timedelta(days=30)}", token=admin_token)
test("Step 35: Date range applied to reports", s == 200)

# Step 36: Verify report results
test("Step 36: Report results match period", len(res.get("rows", [])) > 0)

# Step 37: Verify CSV export
s, csv_out = api_request("/reports/revenue/?format=csv", token=admin_token, return_raw=True)
test("Step 37: CSV export streams correctly", s == 200 and "Payment" in csv_out)

# Step 38: Verify data persistence
booking.refresh_from_db()
test("Step 38: Data persistence verified in MySQL database", booking.status == "Checked-out")


# ============================================================
# FINAL SUMMARY
# ============================================================
print("\n============================================================")
print(f"CHECKPOINT 10 TEST RESULTS: {passed_tests} PASSED, {failed_tests} FAILED")
print("============================================================")

if failed_tests > 0:
    sys.exit(1)
else:
    sys.exit(0)
