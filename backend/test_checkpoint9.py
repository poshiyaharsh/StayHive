"""
STAYHIVE — CHECKPOINT 9: FEEDBACK + COMPLAINTS + INQUIRIES VERIFICATION SUITE
Comprehensive automated tests covering:
- Feedback submission, integer rating bounds (1-5), duplicate prevention
- Booking ownership & eligibility checks
- Strict customer feedback isolation & staff reply management
- Authoritative backend feedback summary & rating distribution
- Complaint lifecycle (Pending -> In Progress -> Resolved -> Closed)
- Server-derived staff resolution audit (resolved_by, resolved_at)
- Invalid complaint status transitions rejection
- Public anonymous inquiries & authenticated customer inquiries
- Customer inquiry isolation (anonymous inquiries strictly hidden from customers)
- Server-derived inquiry response audit (responded_by, responded_at)
- Consolidated support dashboard summary aggregation (/api/support/summary/)
- Role security (Admin/Manager full, Reception operational, Housekeeping & Restaurant 403)
- 18-step Critical End-to-End Scenario
"""

import os
import sys
import json
import uuid
import urllib.request
import urllib.error
from datetime import date, timedelta
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
    Feedback, Complaint, Inquiry
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


def api_request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"error": body}
    except Exception as e:
        return 500, {"error": str(e)}


print("\n============================================================")
print("STAYHIVE — CHECKPOINT 9: SUPPORT VERIFICATION SUITE")
print("============================================================")

# Setup Test Fixtures
def get_user_token(username):
    user = User.objects.get(username=username)
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)

admin_token = get_user_token("admin")
manager_token = get_user_token("manager_vikram")
reception_token = get_user_token("reception_priya")
hk_token = get_user_token("housekeeping_suresh")
rest_token = get_user_token("chef_anand")

customer_a = Customer.objects.get(user__username="rahul_sharma")
customer_b = Customer.objects.get(user__username="ananya_patel")
cust_a_token = get_user_token("rahul_sharma")
cust_b_token = get_user_token("ananya_patel")

# Booking for Customer A
hotel = Hotel.objects.first()
room = Room.objects.filter(hotel=hotel, status='Available').first() or Room.objects.first()

booking_a = Booking.objects.create(
    booking_number=f"BK-TEST-CP9-{uuid.uuid4().hex[:6].upper()}",
    customer=customer_a,
    hotel=hotel,
    check_in_date=date.today() - timedelta(days=2),
    check_out_date=date.today() - timedelta(days=1),
    total_guests=2,
    adults=2,
    children=0,
    total_amount=5000.00,
    discount_amount=0.00,
    net_amount=5000.00,
    status='Checked-out'
)

booking_b = Booking.objects.create(
    booking_number=f"BK-TEST-CP9B-{uuid.uuid4().hex[:6].upper()}",
    customer=customer_b,
    hotel=hotel,
    check_in_date=date.today() - timedelta(days=3),
    check_out_date=date.today() - timedelta(days=2),
    total_guests=1,
    adults=1,
    children=0,
    total_amount=3000.00,
    discount_amount=0.00,
    net_amount=3000.00,
    status='Checked-out'
)

# --- 1. FEEDBACK API TESTS ---
print("\n--- 1. FEEDBACK API & VALIDATION TESTS ---")

# Invalid ratings: 0, 6, -1
s, res = api_request("/feedback/", method="POST", data={"booking_id": booking_a.id, "rating": 0, "comment": "Bad"}, token=cust_a_token)
test("Rating 0 rejected (HTTP 400)", s == 400, f"Got status {s}")

s, res = api_request("/feedback/", method="POST", data={"booking_id": booking_a.id, "rating": 6, "comment": "Super"}, token=cust_a_token)
test("Rating 6 rejected (HTTP 400)", s == 400, f"Got status {s}")

s, res = api_request("/feedback/", method="POST", data={"booking_id": booking_a.id, "rating": -1, "comment": "Negative"}, token=cust_a_token)
test("Rating -1 rejected (HTTP 400)", s == 400, f"Got status {s}")

# Customer B cannot submit feedback for Customer A's booking
s, res = api_request("/feedback/", method="POST", data={"booking_id": booking_a.id, "rating": 5, "comment": "Not my booking"}, token=cust_b_token)
test("Booking ownership verified (Customer B denied Customer A's booking, HTTP 403)", s == 403, f"Got status {s}")

# Customer A submits valid 5-star feedback
s, res = api_request("/feedback/", method="POST", data={
    "booking_id": booking_a.id,
    "rating": 5,
    "cleanliness_rating": 5,
    "service_rating": 5,
    "comment": "Exceptional hospitality and pristine heritage suites."
}, token=cust_a_token)
test("Customer A submits valid feedback (HTTP 201)", s == 201 and res.get('success'), f"Got status {s}")
feedback_a_id = res.get('data', {}).get('id') if s == 201 else None

# Duplicate feedback check
s, res = api_request("/feedback/", method="POST", data={"booking_id": booking_a.id, "rating": 4, "comment": "Duplicate attempt"}, token=cust_a_token)
test("Duplicate feedback for same booking rejected (HTTP 400)", s == 400, f"Got status {s}")

# Customer isolation: Customer B calls /feedback/my/
s, res = api_request("/feedback/my/", method="GET", token=cust_b_token)
test("Customer B /feedback/my/ returns empty list (Customer A's feedback isolated)", s == 200 and len(res.get('data', [])) == 0, f"Got: {res}")

# Customer A calls /feedback/my/
s, res = api_request("/feedback/my/", method="GET", token=cust_a_token)
test("Customer A /feedback/my/ returns their feedback", s == 200 and len(res.get('data', [])) >= 1, f"Count: {len(res.get('data', []))}")

# Staff reply to feedback
s, res = api_request(f"/feedback/{feedback_a_id}/reply/", method="POST", data={
    "response": "Thank you for the glowing review! We look forward to welcoming you back."
}, token=reception_token)
test("Staff can post reply to feedback (HTTP 200)", s == 200 and res.get('data', {}).get('staff_response') is not None, f"Got: {res}")

# Feedback Summary & Analytics
s, res = api_request("/feedback/summary/", method="GET", token=admin_token)
summary_data = res.get('data', {})
test("Feedback summary endpoint returns data (HTTP 200)", s == 200 and "total_feedback" in summary_data, f"Got: {res}")
test("Feedback summary contains average_rating", "average_rating" in summary_data and summary_data["average_rating"] > 0)
test("Feedback summary contains rating_distribution (1-5 stars)", "rating_distribution" in summary_data and "5" in summary_data["rating_distribution"])

# --- 2. COMPLAINT API & WORKFLOW TESTS ---
print("\n--- 2. COMPLAINT API & WORKFLOW TESTS ---")

# Customer A creates complaint
s, res = api_request("/complaints/", method="POST", data={
    "subject": "Room AC cooling issue",
    "description": "The split AC in master suite is blowing ambient air and making a slight vibration sound.",
    "category": "Maintenance",
    "priority": "High",
    "booking_id": booking_a.id
}, token=cust_a_token)
test("Customer A creates complaint (HTTP 201)", s == 201 and res.get('success'), f"Got status {s}")
complaint_id = res.get('data', {}).get('id') if s == 201 else None
initial_status = res.get('data', {}).get('status')
test("Complaint initial status is 'Pending'", initial_status == 'Pending', f"Status: {initial_status}")

# Customer isolation: Customer B calls /complaints/my/
s, res = api_request("/complaints/my/", method="GET", token=cust_b_token)
test("Customer B /complaints/my/ does not contain Customer A's complaint", s == 200 and not any(c['id'] == complaint_id for c in res.get('data', [])))

# Customer B cannot access Customer A's complaint directly
s, res = api_request(f"/complaints/{complaint_id}/", method="GET", token=cust_b_token)
test("Customer B cannot view Customer A's complaint (HTTP 403/404)", s in [403, 404], f"Got status {s}")

# Reception moves complaint to In Progress
s, res = api_request(f"/complaints/{complaint_id}/status/", method="PATCH", data={
    "status": "in_progress"
}, token=reception_token)
test("Reception moves complaint to 'In Progress' (HTTP 200)", s == 200 and res.get('data', {}).get('status') == 'In Progress', f"Got: {res}")

# Invalid status transition: Closed -> Pending or Rejected -> Resolved
# Let's test invalid transition from In Progress directly to Pending
s, res = api_request(f"/complaints/{complaint_id}/status/", method="PATCH", data={
    "status": "pending"
}, token=manager_token)
test("Invalid status transition (In Progress -> Pending) rejected (HTTP 400)", s == 400, f"Got status {s}")

# Manager resolves complaint
s, res = api_request(f"/complaints/{complaint_id}/resolve/", method="POST", data={
    "resolution": "HVAC engineer dispatched; replaced capacitor and refrigerant pressure re-calibrated. AC cooling verified."
}, token=manager_token)
test("Manager resolves complaint (HTTP 200)", s == 200 and res.get('data', {}).get('status') == 'Resolved', f"Got: {res}")
test("resolved_at timestamp is automatically populated", res.get('data', {}).get('resolved_at') is not None)
test("resolved_by / assigned_to is derived from authenticated staff", res.get('data', {}).get('assigned_to') is not None)

# Closing resolved complaint
s, res = api_request(f"/complaints/{complaint_id}/status/", method="PATCH", data={
    "status": "closed"
}, token=admin_token)
test("Admin can close resolved complaint (HTTP 200)", s == 200 and res.get('data', {}).get('status') == 'Closed')

# Invalid transition from Closed complaint
s, res = api_request(f"/complaints/{complaint_id}/status/", method="PATCH", data={
    "status": "in_progress"
}, token=admin_token)
test("Transition from Closed complaint rejected (HTTP 400)", s == 400, f"Got status {s}")

# Role protection: Housekeeping & Restaurant denied
if hk_token:
    s, res = api_request("/complaints/", method="GET", token=hk_token)
    test("Housekeeping denied complaint management (HTTP 403)", s == 403, f"Got status {s}")
if rest_token:
    s, res = api_request("/complaints/", method="GET", token=rest_token)
    test("Restaurant staff denied complaint management (HTTP 403)", s == 403, f"Got status {s}")

# --- 3. INQUIRY API TESTS ---
print("\n--- 3. INQUIRY API & CUSTOMER ISOLATION TESTS ---")

# 1. Anonymous visitor submits inquiry (no token)
s, res = api_request("/inquiries/", method="POST", data={
    "name": "Vikram Malhotra",
    "email": "vikram.m@corporategroup.com",
    "phone": "+91 98200 11223",
    "subject": "Corporate Annual Gala & 50 Executive Rooms",
    "message": "We wish to book the grand ballroom and 50 heritage suites for our annual conference in December."
})
test("Anonymous visitor can submit inquiry (HTTP 201)", s == 201 and res.get('success'), f"Got status {s}")
anon_inq_id = res.get('data', {}).get('id') if s == 201 else None
test("Anonymous inquiry has customer_id = None", res.get('data', {}).get('customer_id') is None)

# 2. Authenticated Customer A submits inquiry
s, res = api_request("/inquiries/", method="POST", data={
    "subject": "Late Checkout Request Policy",
    "message": "Is late checkout until 3 PM possible for my upcoming weekend reservation?",
    "email": customer_a.user.email,
    "name": customer_a.user.get_full_name() or "Customer A"
}, token=cust_a_token)
test("Authenticated customer submits inquiry (HTTP 201)", s == 201 and res.get('success'), f"Got status {s}")
cust_inq_id = res.get('data', {}).get('id') if s == 201 else None
test("Authenticated inquiry customer_id matches Customer A", res.get('data', {}).get('customer_id') == customer_a.id)

# 3. Customer Isolation on Inquiries:
# Customer A calls /inquiries/my/
s, res = api_request("/inquiries/my/", method="GET", token=cust_a_token)
cust_a_inqs = res.get('data', [])
test("Customer A /inquiries/my/ returns their inquiry", s == 200 and any(i['id'] == cust_inq_id for i in cust_a_inqs))
test("Customer A /inquiries/my/ strictly DOES NOT contain anonymous inquiries", not any(i['id'] == anon_inq_id for i in cust_a_inqs))

# Customer A tries direct object access to anonymous inquiry
s, res = api_request(f"/inquiries/{anon_inq_id}/", method="GET", token=cust_a_token)
test("Customer cannot access anonymous inquiry directly (HTTP 403/404)", s in [403, 404], f"Got status {s}")

# Staff responds to inquiry
s, res = api_request(f"/inquiries/{anon_inq_id}/reply/", method="POST", data={
    "response": "Dear Mr. Malhotra, our corporate banquet team has emailed the complete tariff sheet and ballroom floor plan."
}, token=reception_token)
test("Reception staff can respond to inquiry (HTTP 200)", s == 200 and res.get('data', {}).get('status') == 'Responded', f"Got: {res}")
test("responded_at timestamp is generated by server", res.get('data', {}).get('responded_at') is not None)
test("responded_by / assigned_to is derived from staff", res.get('data', {}).get('assigned_to') is not None)

# --- 4. CONSOLIDATED SUPPORT DASHBOARD SUMMARY API ---
print("\n--- 4. CONSOLIDATED SUPPORT SUMMARY (/api/support/summary/) ---")

s, res = api_request("/support/summary/", method="GET", token=admin_token)
test("Admin can access /api/support/summary/ (HTTP 200)", s == 200 and res.get('success'), f"Got status {s}")
sup_data = res.get('data', {})

test("Summary contains 'feedback' block", "feedback" in sup_data and "total" in sup_data["feedback"] and "average_rating" in sup_data["feedback"])
test("Summary contains 'complaints' block with status breakdown", "complaints" in sup_data and "pending" in sup_data["complaints"] and "resolved" in sup_data["complaints"])
test("Summary contains 'inquiries' block with status breakdown", "inquiries" in sup_data and "pending" in sup_data["inquiries"] and "responded" in sup_data["inquiries"])

# Customer denied access to overall support summary
s, res = api_request("/support/summary/", method="GET", token=cust_a_token)
test("Customer denied managerial support summary (HTTP 403)", s == 403, f"Got status {s}")


# --- 5. CRITICAL 18-STEP END-TO-END SCENARIO (SECTION 52) ---
print("\n--- 5. CRITICAL 18-STEP END-TO-END SCENARIO (SECTION 52) ---")

# Step 1: Customer has completed booking
e2e_booking = Booking.objects.create(
    booking_number=f"BK-E2E-CP9-{uuid.uuid4().hex[:6].upper()}",
    customer=customer_a,
    hotel=hotel,
    check_in_date=date.today() - timedelta(days=2),
    check_out_date=date.today() - timedelta(days=1),
    total_guests=2,
    adults=2,
    children=0,
    total_amount=7500.00,
    discount_amount=0.00,
    net_amount=7500.00,
    status='Checked-out'
)
test("E2E Step 1: Completed booking established", e2e_booking.id is not None)

# Step 2: Customer submits 5-star feedback
s, res = api_request("/feedback/", method="POST", data={
    "booking_id": e2e_booking.id,
    "rating": 5,
    "comment": "Flawless royal heritage experience! The culinary service was unmatched."
}, token=cust_a_token)
e2e_fb_id = res.get('data', {}).get('id') if s == 201 else None
test("E2E Step 2: Customer submits 5-star feedback", s == 201 and e2e_fb_id is not None)

# Step 3: Feedback appears in admin dashboard / list
s, res = api_request("/feedback/", method="GET", token=admin_token)
test("E2E Step 3: Feedback appears in admin feedback list", s == 200 and any(f['id'] == e2e_fb_id for f in res.get('data', [])))

# Step 4: Customer creates complaint
s, res = api_request("/complaints/", method="POST", data={
    "subject": "Elevator sensor glitch on 3rd floor",
    "description": "Lift door delayed in closing automatically when departing 3rd floor wing.",
    "category": "Maintenance",
    "priority": "Medium",
    "booking_id": e2e_booking.id
}, token=cust_a_token)
e2e_comp_id = res.get('data', {}).get('id') if s == 201 else None
test("E2E Step 4: Customer creates complaint", s == 201 and e2e_comp_id is not None)

# Step 5: Reception sees complaint
s, res = api_request("/complaints/", method="GET", token=reception_token)
test("E2E Step 5: Reception sees complaint in list", s == 200 and any(c['id'] == e2e_comp_id for c in res.get('data', [])))

# Step 6: Reception moves complaint to in_progress
s, res = api_request(f"/complaints/{e2e_comp_id}/status/", method="PATCH", data={
    "status": "in_progress"
}, token=reception_token)
test("E2E Step 6: Reception moves complaint to in_progress", s == 200 and res.get('data', {}).get('status') == 'In Progress')

# Step 7: Manager resolves complaint
s, res = api_request(f"/complaints/{e2e_comp_id}/resolve/", method="POST", data={
    "resolution": "Otis technicians inspected infrared sensors; cleaned photoelectric lens and recalibrated safety timer."
}, token=manager_token)
test("E2E Step 7: Manager resolves complaint", s == 200 and res.get('data', {}).get('status') == 'Resolved')

# Step 8: Customer sees resolved complaint
s, res = api_request("/complaints/my/", method="GET", token=cust_a_token)
resolved_c = next((c for c in res.get('data', []) if c['id'] == e2e_comp_id), None)
test("E2E Step 8: Customer sees resolved complaint with resolution note", resolved_c is not None and resolved_c['status'] == 'Resolved' and "Otis" in str(resolved_c.get('resolution_notes') or ''))

# Step 9: Anonymous visitor submits inquiry
s, res = api_request("/inquiries/", method="POST", data={
    "name": "Ananya Sen",
    "email": "ananya.sen@luxuryweddings.in",
    "phone": "+91 97110 55443",
    "subject": "Destination Wedding Inquiry for 250 Guests",
    "message": "Looking to host a 2-day palace wedding in January with royal decor and full banquet."
})
e2e_inq_id = res.get('data', {}).get('id') if s == 201 else None
test("E2E Step 9: Anonymous visitor submits inquiry", s == 201 and e2e_inq_id is not None)

# Step 10: Reception sees inquiry
s, res = api_request("/inquiries/", method="GET", token=reception_token)
test("E2E Step 10: Reception sees inquiry in inbox", s == 200 and any(i['id'] == e2e_inq_id for i in res.get('data', [])))

# Step 11: Reception responds
s, res = api_request(f"/inquiries/{e2e_inq_id}/reply/", method="POST", data={
    "response": "Greetings Ms. Sen, our royal wedding specialist has sent our bespoke celebration brochure and palace package details."
}, token=reception_token)
test("E2E Step 11: Reception responds to inquiry", s == 200 and res.get('success'))

# Step 12: Inquiry becomes responded
test("E2E Step 12: Inquiry status transitioned to 'Responded'", res.get('data', {}).get('status') == 'Responded')

# Step 13: Admin sees support dashboard
s, res = api_request("/support/summary/", method="GET", token=admin_token)
test("E2E Step 13: Admin accesses support dashboard summary", s == 200 and res.get('success'))
final_summary = res.get('data', {})

# Step 14: Feedback statistics update
test("E2E Step 14: Feedback statistics reflected in summary", final_summary.get('feedback', {}).get('total', 0) > 0)

# Step 15: Complaint counts update
test("E2E Step 15: Complaint resolved counts updated", final_summary.get('complaints', {}).get('resolved', 0) > 0)

# Step 16: Inquiry counts update
test("E2E Step 16: Inquiry responded counts updated", final_summary.get('inquiries', {}).get('responded', 0) > 0)

# Step 17 & 18: Database persistence & data integrity
fb_db = Feedback.objects.filter(id=e2e_fb_id).first()
comp_db = Complaint.objects.filter(id=e2e_comp_id).first()
inq_db = Inquiry.objects.filter(id=e2e_inq_id).first()

test("E2E Step 17: Database persistence for Feedback record verified", fb_db is not None and fb_db.rating == 5)
test("E2E Step 18: Database persistence for Complaint & Inquiry resolution verified",
     comp_db is not None and comp_db.status == 'Resolved' and inq_db is not None and inq_db.status == 'Responded')

print(f"\n============================================================")
print(f"CHECKPOINT 9 VERIFICATION COMPLETE: {passed_tests} PASSED, {failed_tests} FAILED")
print(f"============================================================")
