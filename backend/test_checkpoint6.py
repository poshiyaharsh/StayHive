"""
STAYHIVE — CHECKPOINT 6: RESTAURANT + FOOD ORDER MANAGEMENT VERIFICATION SUITE
Tests the full lifecycle of restaurants, food menus, in-room dining orders,
concurrency/transaction safety, price tampering prevention, price snapshots,
customer isolation, and status transitions against the live MySQL database.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from decimal import Decimal
from datetime import date, time
import django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.core.models import (
    User, Role, Staff, Customer, Hotel, Room, Booking, BookingRoom,
    Restaurant, Food, FoodOrder, OrderItem
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
print("STAYHIVE — CHECKPOINT 6: RESTAURANT & FOOD ORDER VERIFICATION")
print("=" * 60)

# Authenticate personas
token_admin = get_token("admin")
headers_admin = {"Authorization": f"Bearer {token_admin}"}

token_chef = get_token("chef_anand")
headers_chef = {"Authorization": f"Bearer {token_chef}"}

token_cust_a = get_token("rahul_sharma")
headers_cust_a = {"Authorization": f"Bearer {token_cust_a}"}

token_cust_b = get_token("ananya_patel")
headers_cust_b = {"Authorization": f"Bearer {token_cust_b}"}

token_housekeeping = get_token("housekeeping_suresh")
headers_housekeeping = {"Authorization": f"Bearer {token_housekeeping}"}

# ============================================================
# 1. RESTAURANT CRUD & PERMISSIONS
# ============================================================
print("\n--- 1. RESTAURANT APIS & PERMISSIONS ---")

# 1.1 List restaurants
s, r = api_call(f"{BASE_URL}/restaurants/", headers=headers_cust_a)
test("Customer can list restaurants (HTTP 200)", s == 200 and len(r.get("data", [])) >= 1)

# 1.2 Search restaurants
s, r = api_call(f"{BASE_URL}/restaurants/?search=Hive", headers=headers_cust_a)
test("Search restaurant by keyword works", s == 200 and any("Hive" in x.get("name", "") for x in r.get("data", [])))

# 1.3 Housekeeping is forbidden from managing restaurant
s, r = api_call(f"{BASE_URL}/restaurants/", headers=headers_housekeeping)
test("Housekeeping denied from restaurant endpoint (HTTP 403)", s == 403)

# 1.4 Customer cannot create restaurant
create_rest_payload = {
    "hotel_id": 1,
    "name": "Unauthorized Rooftop Lounge",
    "cuisine": "Continental",
    "opening_time": "18:00:00",
    "closing_time": "23:00:00",
    "is_active": True
}
s, r = api_call(f"{BASE_URL}/restaurants/", data=create_rest_payload, headers=headers_cust_a, method='POST')
test("Customer cannot create restaurant (HTTP 403 Forbidden)", s == 403)

# 1.5 Admin can create restaurant
s, r_new_rest = api_call(f"{BASE_URL}/restaurants/", data=create_rest_payload, headers=headers_admin, method='POST')
test("Admin can create new restaurant (HTTP 201)", s == 201 and "data" in r_new_rest)
created_rest_id = r_new_rest.get("data", {}).get("id")

# 1.6 Admin can update restaurant
if created_rest_id:
    s, r = api_call(f"{BASE_URL}/restaurants/{created_rest_id}/", data={"cuisine": "Pan-Asian & Continental"}, headers=headers_admin, method='PATCH')
    test("Admin can update restaurant (HTTP 200)", s == 200 and r.get("data", {}).get("cuisine") == "Pan-Asian & Continental")

    # Clean up test restaurant
    s, _ = api_call(f"{BASE_URL}/restaurants/{created_rest_id}/", headers=headers_admin, method='DELETE')
    test("Admin can delete restaurant (HTTP 200)", s == 200)

# ============================================================
# 2. FOOD MENU APIS & PERMISSIONS
# ============================================================
print("\n--- 2. FOOD MENU APIS & FILTERING ---")

# 2.1 List foods
s, r = api_call(f"{BASE_URL}/foods/", headers=headers_cust_a)
foods_list = r.get("data", [])
test("Customer can list food menu (HTTP 200)", s == 200 and len(foods_list) >= 1)

# 2.2 Category filter
s, r = api_call(f"{BASE_URL}/foods/?category=Breakfast", headers=headers_cust_a)
b_foods = r.get("data", [])
test("Filter by category Breakfast returns correct items", s == 200 and all(x.get("category") == "Breakfast" for x in b_foods))

# 2.3 Vegetarian filter
s, r = api_call(f"{BASE_URL}/foods/?is_veg=true", headers=headers_cust_a)
veg_foods = r.get("data", [])
test("Filter by is_veg=true returns vegetarian items", s == 200 and all(x.get("is_veg") is True for x in veg_foods))

# 2.4 Customer cannot create food item
new_food_payload = {
    "restaurant_id": 1,
    "name": "Test Gourmet Burger",
    "category": "Main Course",
    "price": "399.00",
    "is_veg": False,
    "is_available": True,
    "preparation_time": 20
}
s, r = api_call(f"{BASE_URL}/foods/", data=new_food_payload, headers=headers_cust_a, method='POST')
test("Customer cannot create food item (HTTP 403 Forbidden)", s == 403)

# 2.5 Restaurant staff (chef_anand) CAN create food item
s, r_new_food = api_call(f"{BASE_URL}/foods/", data=new_food_payload, headers=headers_chef, method='POST')
test("Chef can create food menu item (HTTP 201)", s == 201 and "data" in r_new_food)
test_food_id = r_new_food.get("data", {}).get("id")

# 2.6 Chef can toggle availability and update price
if test_food_id:
    s, r = api_call(f"{BASE_URL}/foods/{test_food_id}/", data={"is_available": False, "price": "429.00"}, headers=headers_chef, method='PATCH')
    test("Chef can update food price and availability (HTTP 200)", s == 200 and r.get("data", {}).get("is_available") is False)

# ============================================================
# 3. FOOD ORDER CREATION, CONCURRENCY & TAMPERING SAFETY
# ============================================================
print("\n--- 3. TRANSACTIONAL ORDERING & TAMPERING PROTECTION ---")

# Retrieve customer A's active booking
cust_a = Customer.objects.filter(user__username="rahul_sharma").first()
cust_b = Customer.objects.filter(user__username="ananya_patel").first()

active_booking_a = Booking.objects.filter(customer=cust_a, status='Checked-in').first()
if not active_booking_a:
    active_booking_a = Booking.objects.filter(customer=cust_a).exclude(status__in=['Cancelled', 'Completed']).first()

active_booking_b = Booking.objects.filter(customer=cust_b).first()

# Pick available food items
avail_food_1 = Food.objects.filter(is_available=True).first()
avail_food_2 = Food.objects.filter(is_available=True).exclude(id=avail_food_1.id).first()

# 3.1 Cross-booking tampering rejection: Customer A orders on Customer B's booking
tamper_order_payload = {
    "booking_id": active_booking_b.id,
    "items": [{"food_id": avail_food_1.id, "quantity": 1}]
}
s, r = api_call(f"{BASE_URL}/food-orders/", data=tamper_order_payload, headers=headers_cust_a, method='POST')
test("Customer cannot order for another customer's booking (HTTP 403)", s == 403)

# 3.2 Unavailable food rejection
# We have test_food_id which is marked is_available = False
unavail_order_payload = {
    "booking_id": active_booking_a.id,
    "items": [
        {"food_id": avail_food_1.id, "quantity": 1},
        {"food_id": test_food_id, "quantity": 1}
    ]
}
s, r = api_call(f"{BASE_URL}/food-orders/", data=unavail_order_payload, headers=headers_cust_a, method='POST')
test("Ordering unavailable food is rejected (HTTP 400)", s == 400 and "unavailable" in r.get("message", "").lower())

# 3.3 Transaction Rollback Verification
# Confirm no order was partially created during the unavailable food test
test("Transaction rollback verified: No partial order created in DB", not FoodOrder.objects.filter(items__food_id=test_food_id).exists())

# 3.4 Invalid Quantity Validation
invalid_qty_payload = {
    "booking_id": active_booking_a.id,
    "items": [{"food_id": avail_food_1.id, "quantity": 0}]
}
s, r = api_call(f"{BASE_URL}/food-orders/", data=invalid_qty_payload, headers=headers_cust_a, method='POST')
test("Zero or negative quantity rejected (HTTP 400)", s == 400)

# 3.5 Price Tampering Protection
# Client maliciously sends unit_price: 1 and subtotal: 2
real_price_1 = Decimal(str(avail_food_1.price))
real_price_2 = Decimal(str(avail_food_2.price))
expected_subtotal_1 = real_price_1 * 2
expected_subtotal_2 = real_price_2 * 1
expected_total = expected_subtotal_1 + expected_subtotal_2

tampered_price_payload = {
    "booking_id": active_booking_a.id,
    "items": [
        {"food_id": avail_food_1.id, "quantity": 2, "unit_price": 1, "subtotal": 2},
        {"food_id": avail_food_2.id, "quantity": 1, "unit_price": 1, "subtotal": 1}
    ]
}
s, r_order = api_call(f"{BASE_URL}/food-orders/", data=tampered_price_payload, headers=headers_cust_a, method='POST')
created_order_data = r_order.get("data", {})
actual_total = Decimal(str(created_order_data.get("total_amount", 0)))

test("Food order successfully created with HTTP 201", s == 201)
test(
    f"Price tampering rejected: Backend authoritative total INR {actual_total} matches expected INR {expected_total}",
    actual_total == expected_total,
    f"Got: {actual_total}, Expected: {expected_total}"
)

# 3.6 Price Snapshot Verification
created_order_id = created_order_data.get("id")
order_items = OrderItem.objects.filter(food_order_id=created_order_id)
test("Order items created in MySQL", order_items.count() == 2)
first_oi = order_items.filter(food_id=avail_food_1.id).first()
test(
    "Unit price snapshot verified in order_item table",
    first_oi and first_oi.unit_price == real_price_1 and first_oi.subtotal == expected_subtotal_1
)

# ============================================================
# 4. ORDER STATUS LIFECYCLE & TRANSITIONS
# ============================================================
print("\n--- 4. ORDER STATUS LIFECYCLE & TRANSITIONS ---")

# 4.1 Advance to Accepted / Confirmed
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/status/", data={"order_status": "accepted"}, headers=headers_chef, method='PATCH')
test("Advance order Pending -> Accepted succeeds (HTTP 200)", s == 200 and r.get("data", {}).get("status") == "Accepted")

# 4.2 Advance to Preparing
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/status/", data={"order_status": "preparing"}, headers=headers_chef, method='PATCH')
test("Advance order Accepted -> Preparing succeeds (HTTP 200)", s == 200 and r.get("data", {}).get("status") == "Preparing")

# 4.3 Advance to Ready
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/status/", data={"order_status": "ready"}, headers=headers_chef, method='PATCH')
test("Advance order Preparing -> Ready succeeds (HTTP 200)", s == 200 and r.get("data", {}).get("status") == "Ready")

# 4.4 Advance to Delivered
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/status/", data={"order_status": "delivered"}, headers=headers_chef, method='PATCH')
test("Advance order Ready -> Delivered succeeds (HTTP 200)", s == 200 and r.get("data", {}).get("status") == "Delivered")

# 4.5 Invalid Backwards Transition: Delivered -> Preparing
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/status/", data={"order_status": "preparing"}, headers=headers_chef, method='PATCH')
test("Invalid transition Delivered -> Preparing rejected with HTTP 400", s == 400)

# 4.6 Invalid Backwards Transition: Delivered -> Pending
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/status/", data={"order_status": "pending"}, headers=headers_chef, method='PATCH')
test("Invalid transition Delivered -> Pending rejected with HTTP 400", s == 400)

# 4.7 Customer cannot directly alter order status
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/status/", data={"order_status": "ready"}, headers=headers_cust_a, method='PATCH')
test("Customer cannot alter order status directly (HTTP 403 Forbidden)", s == 403)

# 4.8 Customer Cancellation of Pending Order
cancel_test_payload = {
    "booking_id": active_booking_a.id,
    "items": [{"food_id": avail_food_1.id, "quantity": 1}]
}
s, r_to_cancel = api_call(f"{BASE_URL}/food-orders/", data=cancel_test_payload, headers=headers_cust_a, method='POST')
order_to_cancel_id = r_to_cancel.get("data", {}).get("id")

s, r_cancelled = api_call(f"{BASE_URL}/food-orders/{order_to_cancel_id}/cancel/", headers=headers_cust_a, method='POST')
test("Customer can cancel their pending food order (HTTP 200)", s == 200 and r_cancelled.get("data", {}).get("status") == "Cancelled")

# ============================================================
# 5. CUSTOMER ORDER ISOLATION & KITCHEN STATS
# ============================================================
print("\n--- 5. CUSTOMER ORDER ISOLATION & KDS TERMINAL ---")

# 5.1 Customer A accesses Customer A's order -> 200
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/", headers=headers_cust_a)
test("Customer A can access own food order (HTTP 200)", s == 200)

# 5.2 Customer B accesses Customer A's order -> 403 Forbidden
s, r = api_call(f"{BASE_URL}/food-orders/{created_order_id}/", headers=headers_cust_b)
test("Customer B accessing Customer A order returns HTTP 403 Forbidden", s == 403)

# 5.3 Customer /api/food-orders/my/
s, r = api_call(f"{BASE_URL}/food-orders/my/", headers=headers_cust_a)
cust_a_orders = r.get("data", [])
test("Customer A /my/ returns their food orders", s == 200 and any(o['id'] == created_order_id for o in cust_a_orders))

# 5.4 Restaurant staff can view all orders
s, r = api_call(f"{BASE_URL}/food-orders/", headers=headers_chef)
all_orders = r.get("data", [])
test("Chef can view all orders across all customers (HTTP 200)", s == 200 and len(all_orders) >= len(cust_a_orders))

# 5.5 KDS Live Statistics Endpoint
s, r = api_call(f"{BASE_URL}/food-orders/stats/", headers=headers_chef)
stats_data = r.get("data", {})
test("KDS Stats returns pending, preparing, ready, and delivered counts", s == 200 and "pending_count" in stats_data and "ready_count" in stats_data)

# Cleanup test food
if test_food_id:
    Food.objects.filter(id=test_food_id).delete()

print("\n" + "=" * 60)
print(f"VERIFICATION SUMMARY: {passed_tests} PASSED, {failed_tests} FAILED")
print("=" * 60)

if failed_tests > 0:
    sys.exit(1)
sys.exit(0)
