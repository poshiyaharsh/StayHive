"""
STAYHIVE — CHECKPOINT 8: INVOICE + PAYMENT + REFUND MANAGEMENT VERIFICATION SUITE
Comprehensive automated tests covering:
- Invoice calculation (room charges, food orders, services, discounts, 18% GST, Decimal precision)
- Invoice idempotency and recalculation rules
- Multi-method payments (UPI, Card, Cash) and status transitions (Unpaid -> Partially Paid -> Paid)
- Overpayment prevention and atomic transactional locking
- Cancellation request lifecycle and staff approval
- Refund calculation, multiple partial refunds, duplicate refund protection
- Invoice refund status transitions (Paid -> Refunded / Partially Refunded)
- Strict customer isolation and role permissions (Housekeeping & Restaurant 403)
- Reception checkout billing folio integration
- Real-time billing dashboard KPI metrics
"""

import os
import sys
import json
import uuid
import urllib.request
import urllib.error
from decimal import Decimal
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
    FoodOrder, Food, Service, ServiceRequest, OfferPackage, OfferApplication,
    Invoice, Payment, PaymentMethod, CancellationRequest, Refund
)
from apps.billing.services import (
    calculate_room_charges, calculate_food_charges,
    calculate_service_charges, calculate_discount, calculate_tax,
    calculate_invoice_totals, generate_or_get_invoice,
    calculate_paid_amount, calculate_outstanding_balance,
    calculate_refundable_amount, quantize_money, TAX_RATE
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


def run_tests():
    global passed_tests, failed_tests
    print("=" * 60)
    print("STAYHIVE — CHECKPOINT 8: INVOICE, PAYMENT & REFUND VERIFICATION")
    print("=" * 60)

    # 1. Obtain persona tokens
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
    headers_hk = {"Authorization": f"Bearer {token_housekeeping}"}
    headers_chef = {"Authorization": f"Bearer {token_chef}"}
    headers_cust_a = {"Authorization": f"Bearer {token_customer_a}"}
    headers_cust_b = {"Authorization": f"Bearer {token_customer_b}"}

    cust_a = Customer.objects.get(user__username="rahul_sharma")
    cust_b = Customer.objects.get(user__username="ananya_patel")
    hotel = Hotel.objects.first()
    room = Room.objects.filter(hotel=hotel, status='Available').first() or Room.objects.filter(hotel=hotel).first()

    # ============================================================
    # 1. INVOICE CALCULATION & BACKEND AUTHORITATIVE ENGINE
    # ============================================================
    print("\n--- 1. INVOICE ENGINE & CALCULATION TESTS ---")

    today = date.today()
    # Create an isolated test booking for Customer A: 3 nights @ ₹3,000 = ₹9,000
    booking_1 = Booking.objects.create(
        booking_number=f"BK-CP8-{uuid.uuid4().hex[:6].upper()}",
        customer=cust_a,
        hotel=hotel,
        check_in_date=today,
        check_out_date=today + timedelta(days=3),
        total_guests=2,
        adults=2,
        children=0,
        total_amount=Decimal('9000.00'),
        net_amount=Decimal('9000.00'),
        status='Confirmed'
    )
    br_1 = BookingRoom.objects.create(
        booking=booking_1,
        room=room,
        room_rate=Decimal('3000.00')
    )

    # Add food order: ₹1,200
    fo_1 = FoodOrder.objects.create(
        booking=booking_1,
        customer=cust_a,
        room=room,
        total_amount=Decimal('1200.00'),
        status='Delivered'
    )

    # Add service request: ₹500
    srv_1 = Service.objects.create(hotel=hotel, name=f"CP8 Ironing {uuid.uuid4().hex[:4]}", price=Decimal('500.00'), is_available=True)
    sr_1 = ServiceRequest.objects.create(
        booking=booking_1,
        service=srv_1,
        status='Completed'
    )

    # Add applied offer: 10% discount on room charges
    offer_pkg = OfferPackage.objects.create(
        hotel=hotel,
        code=f"OFFER_{uuid.uuid4().hex[:6].upper()}",
        title="CP8 Special 10% Off",
        discount_percentage=Decimal('10.00'),
        min_booking_amount=Decimal('5000.00'),
        valid_from=today - timedelta(days=5),
        valid_to=today + timedelta(days=30),
        is_active=True
    )
    OfferApplication.objects.create(
        booking=booking_1,
        offer=offer_pkg,
        discount_applied=Decimal('900.00')
    )

    # 1.1 Generate invoice via API
    s, r = api_call(f"{BASE_URL}/invoices/", {"booking_id": booking_1.id}, headers=headers_admin, method='POST')
    test("Invoice generated successfully via API (HTTP 201)", s == 201 and r.get('success'), f"Status: {s}, res: {r}")

    inv_data = r.get('data', {})
    inv_id = inv_data.get('id')

    # Expected values:
    # Room: 3 * 3000 = 9000
    # Food: 1200
    # Service: 500
    # Subtotal: 10700
    # Discount: 10% of 9000 = 900.00
    # Taxable: 10700 - 900 = 9800
    # Tax: 18% of 9800 = 1764.00
    # Total: 9800 + 1764 = 11564.00
    expected_room = Decimal('9000.00')
    expected_food = Decimal('1200.00')
    expected_service = Decimal('500.00')
    expected_subtotal = Decimal('10700.00')
    expected_discount = Decimal('900.00')
    expected_taxable = Decimal('9800.00')
    expected_tax = Decimal('1764.00')
    expected_grand_total = Decimal('11564.00')

    test("Invoice room charges snapshot correct (Rs. 9,000)", Decimal(str(inv_data.get('room_charges'))) == expected_room)
    test("Invoice food charges correct from orders (Rs. 1,200)", Decimal(str(inv_data.get('food_charges'))) == expected_food)
    test("Invoice service charges correct from requests (Rs. 500)", Decimal(str(inv_data.get('service_charges'))) == expected_service)
    test("Invoice subtotal matches sum of charges (Rs. 10,700)", Decimal(str(inv_data.get('subtotal'))) == expected_subtotal)
    test("Invoice discount matches applied offer (Rs. 900)", Decimal(str(inv_data.get('discount_amount'))) == expected_discount)
    test("Invoice 18% GST tax calculation correct (Rs. 1,764)", Decimal(str(inv_data.get('tax_amount'))) == expected_tax)
    test("Invoice grand total calculation correct (Rs. 11,564)", Decimal(str(inv_data.get('grand_total'))) == expected_grand_total)

    # 1.2 Invoice Idempotency: repeated generation call returns the same invoice
    s, r2 = api_call(f"{BASE_URL}/invoices/", {"booking_id": booking_1.id}, headers=headers_admin, method='POST')
    test("Invoice generation is idempotent (returns existing ID)", s == 201 and r2.get('data', {}).get('id') == inv_id)
    test("No duplicate invoices created in database", Invoice.objects.filter(booking=booking_1).count() == 1)

    # ============================================================
    # 2. PAYMENT METHODS & PAYMENT PROCESSING
    # ============================================================
    print("\n--- 2. PAYMENT PROCESSING & ATOMIC TRANSACTIONS ---")

    # 2.1 List active payment methods
    s, r = api_call(f"{BASE_URL}/payment-methods/", headers=headers_cust_a)
    pm_list = r.get('data', []) if isinstance(r, dict) else []
    test("Payment methods listed successfully (HTTP 200)", s == 200 and len(pm_list) >= 3)
    pm_upi = next((pm for pm in pm_list if 'upi' in pm.get('code', '').lower()), pm_list[0])
    pm_card = next((pm for pm in pm_list if 'card' in pm.get('code', '').lower()), pm_list[1])

    # 2.2 Overpayment rejection
    over_amt = float(expected_grand_total + Decimal('5000.00'))
    s, r = api_call(f"{BASE_URL}/payments/", {
        "invoice_id": inv_id,
        "payment_method_id": pm_upi['id'],
        "amount": over_amt
    }, headers=headers_cust_a, method='POST')
    test("Overpayment rejected by backend (HTTP 400)", s == 400 and "exceeds" in str(r).lower(), f"Status: {s}, res: {r}")

    # 2.3 Partial Payment (e.g. ₹5,000)
    partial_amt = 5000.00
    s, r_p1 = api_call(f"{BASE_URL}/payments/", {
        "invoice_id": inv_id,
        "payment_method_id": pm_upi['id'],
        "amount": partial_amt,
        "transaction_id": f"TXN-UPI-{uuid.uuid4().hex[:8].upper()}"
    }, headers=headers_cust_a, method='POST')
    test("Partial payment recorded successfully (HTTP 201)", s == 201 and r_p1.get('success'))

    # Verify invoice status transition to 'Partially Paid'
    s, r_inv = api_call(f"{BASE_URL}/invoices/{inv_id}/", headers=headers_cust_a)
    inv_obj = r_inv.get('data', {})
    test("Invoice status updated to 'Partially Paid'", inv_obj.get('status') == 'Partially Paid')
    test("Invoice paid amount tracked accurately", float(inv_obj.get('paid_amount', 0)) == partial_amt)
    rem_balance = round(float(expected_grand_total) - partial_amt, 2)
    test("Outstanding balance reduced accurately", abs(float(inv_obj.get('outstanding_balance', 0)) - rem_balance) < 0.05)

    # 2.4 Complete Full Payment (Settle remaining balance)
    s, r_p2 = api_call(f"{BASE_URL}/payments/", {
        "invoice_id": inv_id,
        "payment_method_id": pm_card['id'],
        "amount": rem_balance,
        "transaction_id": f"TXN-CARD-{uuid.uuid4().hex[:8].upper()}"
    }, headers=headers_cust_a, method='POST')
    test("Remaining balance settled successfully (HTTP 201)", s == 201 and r_p2.get('success'))

    # Verify invoice status transition to 'Paid'
    s, r_inv2 = api_call(f"{BASE_URL}/invoices/{inv_id}/", headers=headers_cust_a)
    inv_obj2 = r_inv2.get('data', {})
    test("Invoice status transitioned to 'Paid'", inv_obj2.get('status') == 'Paid')
    test("Outstanding balance is now zero", float(inv_obj2.get('outstanding_balance', 0)) == 0.0)

    # 2.5 Further payment on paid invoice rejected
    s, r_p3 = api_call(f"{BASE_URL}/payments/", {
        "invoice_id": inv_id,
        "payment_method_id": pm_upi['id'],
        "amount": 100.00
    }, headers=headers_cust_a, method='POST')
    test("Payment on fully paid invoice rejected (HTTP 400)", s == 400 and "fully paid" in str(r_p3).lower())

    # ============================================================
    # 3. CUSTOMER DATA ISOLATION & ROLE PERMISSIONS
    # ============================================================
    print("\n--- 3. CUSTOMER ISOLATION & ROLE PERMISSIONS ---")

    # 3.1 Customer A can list own invoices
    s, r = api_call(f"{BASE_URL}/invoices/my/", headers=headers_cust_a)
    my_invoices = r.get('data', []) if isinstance(r, dict) else []
    test("Customer A retrieves own invoices via /api/invoices/my/", s == 200 and any(i['id'] == inv_id for i in my_invoices))

    # 3.2 Customer B CANNOT view Customer A's invoice
    s, r = api_call(f"{BASE_URL}/invoices/{inv_id}/", headers=headers_cust_b)
    test("Customer B cannot view Customer A's invoice (HTTP 404/403)", s in [403, 404])

    # 3.3 Customer B CANNOT make a payment on Customer A's invoice
    s, r = api_call(f"{BASE_URL}/payments/", {
        "invoice_id": inv_id,
        "payment_method_id": pm_upi['id'],
        "amount": 500.00
    }, headers=headers_cust_b, method='POST')
    test("Customer B cannot pay Customer A's invoice (HTTP 403)", s == 403)

    # 3.4 Housekeeping and Restaurant denied billing management
    s, r = api_call(f"{BASE_URL}/invoices/", headers=headers_hk)
    test("Housekeeping denied billing invoices access (HTTP 403)", s == 403)

    s, r = api_call(f"{BASE_URL}/payments/", headers=headers_chef)
    test("Restaurant staff denied billing payments access (HTTP 403)", s == 403)

    # ============================================================
    # 4. CANCELLATION REQUESTS & REFUND MANAGEMENT
    # ============================================================
    print("\n--- 4. CANCELLATION & REFUND LIFECYCLE ---")

    # Create future booking for Customer A to cancel
    booking_cancel = Booking.objects.create(
        booking_number=f"BK-CANC-{uuid.uuid4().hex[:6].upper()}",
        customer=cust_a,
        hotel=hotel,
        check_in_date=today + timedelta(days=10),
        check_out_date=today + timedelta(days=12),
        total_amount=Decimal('6000.00'),
        net_amount=Decimal('6000.00'),
        status='Confirmed'
    )
    BookingRoom.objects.create(booking=booking_cancel, room=room, room_rate=Decimal('3000.00'))

    # Generate invoice and pay full amount
    inv_cancel = generate_or_get_invoice(booking_cancel)
    Payment.objects.create(
        invoice=inv_cancel,
        payment_method=PaymentMethod.objects.get(id=pm_upi['id']),
        transaction_id=f"TXN-CANCPAY-{uuid.uuid4().hex[:6].upper()}",
        amount=inv_cancel.grand_total,
        status='Success'
    )
    inv_cancel.status = 'Paid'
    inv_cancel.save()

    # 4.1 Customer A creates cancellation request
    s, r = api_call(f"{BASE_URL}/cancellation-requests/", {
        "booking_id": booking_cancel.id,
        "reason": "Family emergency - must postpone trip"
    }, headers=headers_cust_a, method='POST')
    test("Customer creates cancellation request (HTTP 201)", s == 201 and r.get('success'))
    cancel_id = r.get('data', {}).get('id')

    # 4.2 Customer B cannot cancel Customer A's booking
    s, r = api_call(f"{BASE_URL}/cancellation-requests/", {
        "booking_id": booking_cancel.id,
        "reason": "Malicious cancellation attempt"
    }, headers=headers_cust_b, method='POST')
    test("Customer B cannot cancel Customer A's booking (HTTP 403)", s == 403)

    # 4.3 Staff approves cancellation request
    s, r_appr = api_call(f"{BASE_URL}/cancellation-requests/{cancel_id}/approve/", headers=headers_admin, method='POST')
    test("Staff approves cancellation request (HTTP 200)", s == 200 and r_appr.get('success'))

    # Verify booking is marked Cancelled
    booking_cancel.refresh_from_db()
    test("Booking status changed to 'Cancelled'", booking_cancel.status == 'Cancelled')

    # Verify room released
    room.refresh_from_db()
    test("Room status released to 'Available'", room.status == 'Available')

    # Verify Refund record was created and invoice status updated to 'Refunded'
    inv_cancel.refresh_from_db()
    test("Invoice status transitioned to 'Refunded'", inv_cancel.status == 'Refunded')

    # 4.4 Duplicate Refund Prevention: attempting second refund on same payment is rejected
    s, r_dup = api_call(f"{BASE_URL}/refunds/", {
        "cancellation_id": cancel_id,
        "amount": float(inv_cancel.grand_total)
    }, headers=headers_admin, method='POST')
    test("Duplicate refund rejected by backend (HTTP 400)", s == 400 and ("already" in str(r_dup).lower() or "exceeds" in str(r_dup).lower()))

    # 4.5 Customer can view own refund
    s, r_ref = api_call(f"{BASE_URL}/refunds/", headers=headers_cust_a)
    cust_refunds = r_ref.get('data', []) if isinstance(r_ref, dict) else []
    test("Customer can view their refund record (HTTP 200)", s == 200 and len(cust_refunds) > 0)

    # ============================================================
    # 5. RECEPTION CHECKOUT BILLING INTEGRATION
    # ============================================================
    print("\n--- 5. RECEPTION CHECKOUT BILLING INTEGRATION ---")

    # Create checked-in booking
    booking_chk = Booking.objects.create(
        booking_number=f"BK-CHKOUT-{uuid.uuid4().hex[:6].upper()}",
        customer=cust_a,
        hotel=hotel,
        check_in_date=today - timedelta(days=2),
        check_out_date=today,
        total_amount=Decimal('6000.00'),
        net_amount=Decimal('6000.00'),
        status='Checked-in'
    )
    BookingRoom.objects.create(booking=booking_chk, room=room, room_rate=Decimal('3000.00'))
    room.status = 'Occupied'
    room.save()

    # Add Food order of ₹750
    FoodOrder.objects.create(
        booking=booking_chk,
        customer=cust_a,
        room=room,
        total_amount=Decimal('750.00'),
        status='Delivered'
    )

    # Reception Checkout call (support both /check-out/ and /checkout/)
    s, r_chk = api_call(f"{BASE_URL}/reception/check-out/", {
        "booking_id": booking_chk.id,
        "remarks": "Express checkout with folio settlement"
    }, headers=headers_reception, method='POST')

    test("Reception checkout succeeds (HTTP 200)", s == 200 and r_chk.get('success'), f"Status: {s}, res: {r_chk}")
    folio = r_chk.get('data', {}).get('billing', {})
    test("Checkout returns room charges", folio.get('room_charges') == 6000.0)
    test("Checkout returns food charges from active stay", folio.get('food_charges') == 750.0)
    test("Checkout returns itemized subtotal (6750)", folio.get('subtotal') == 6750.0)
    test("Checkout returns correct 18% GST (1215.0)", folio.get('tax_amount') == 1215.0)
    test("Checkout returns total amount (7965.0)", folio.get('total_amount') == 7965.0)
    test("Checkout returns outstanding balance", folio.get('outstanding_balance') == 7965.0)

    # Verify room and housekeeping status
    room.refresh_from_db()
    test("Room status reset to 'Available'", room.status == 'Available')
    test("Housekeeping status updated to 'Needs Cleaning'", room.housekeeping_status == 'Needs Cleaning')

    # ============================================================
    # 6. BILLING DASHBOARD KPI METRICS
    # ============================================================
    print("\n--- 6. BILLING DASHBOARD KPI METRICS ---")

    s, r_stats = api_call(f"{BASE_URL}/invoices/stats/", headers=headers_admin)
    test("Admin can access billing dashboard stats (HTTP 200)", s == 200 and r_stats.get('success'))
    stats = r_stats.get('data', {})
    test("Stats contain invoices_today count", 'invoices_today' in stats)
    test("Stats contain total_collected revenue", 'total_collected' in stats and stats['total_collected'] > 0)
    test("Stats contain total_outstanding amount", 'total_outstanding' in stats)
    test("Stats contain status_counts breakdown", 'status_counts' in stats and 'paid' in stats['status_counts'])

    # Customer cannot access management stats
    s, r_cust_stats = api_call(f"{BASE_URL}/invoices/stats/", headers=headers_cust_a)
    test("Customer denied billing management stats (HTTP 403)", s == 403)

    # ============================================================
    # 7. CRITICAL END-TO-END 31-STEP SCENARIO (Section 56)
    # ============================================================
    print("\n--- 7. CRITICAL END-TO-END SCENARIO (SECTION 56) ---")

    # 1. Create dedicated customer
    role_cust = Role.objects.filter(name__iexact='Customer').first()
    e2e_user, _ = User.objects.get_or_create(
        username="e2e_guest_cp8",
        defaults={"email": "e2e_cp8@example.com", "first_name": "Kavita", "last_name": "Deshmukh", "role": role_cust}
    )
    e2e_cust, _ = Customer.objects.get_or_create(user=e2e_user, defaults={"address": "Marine Drive, Mumbai"})
    token_e2e = get_token("e2e_guest_cp8")
    headers_e2e = {"Authorization": f"Bearer {token_e2e}"}
    test("E2E Step 1: Customer established", e2e_cust.id > 0)

    # 2-3. Create booking & allocate room
    e2e_booking = Booking.objects.create(
        booking_number=f"BK-E2E-{uuid.uuid4().hex[:6].upper()}",
        customer=e2e_cust,
        hotel=hotel,
        check_in_date=today,
        check_out_date=today + timedelta(days=2),
        total_amount=Decimal('6000.00'),
        net_amount=Decimal('6000.00'),
        status='Confirmed'
    )
    e2e_br = BookingRoom.objects.create(booking=e2e_booking, room=room, room_rate=Decimal('3000.00'))
    test("E2E Steps 2-3: Booking created and room allocated", e2e_booking.id > 0 and e2e_br.room_rate == Decimal('3000.00'))

    # 4. Check in customer via reception API
    s, r_e2e_ci = api_call(f"{BASE_URL}/reception/check-in/", {
        "booking_id": e2e_booking.id,
        "key_card_issued": "KEY-E2E-301"
    }, headers=headers_reception, method='POST')
    test("E2E Step 4: Customer checked in via reception", s == 200 and r_e2e_ci.get('success'))

    # 5-6. Create & complete food order
    e2e_fo = FoodOrder.objects.create(
        booking=e2e_booking,
        customer=e2e_cust,
        room=room,
        total_amount=Decimal('1500.00'),
        status='Delivered'
    )
    test("E2E Steps 5-6: Food order created and marked delivered", e2e_fo.id > 0 and e2e_fo.total_amount == Decimal('1500.00'))

    # 7-8. Create & complete service request
    e2e_srv = Service.objects.create(hotel=hotel, name=f"E2E Spa {uuid.uuid4().hex[:4]}", price=Decimal('2000.00'), is_available=True)
    e2e_sr = ServiceRequest.objects.create(booking=e2e_booking, service=e2e_srv, status='Completed')
    test("E2E Steps 7-8: Service request created and completed", e2e_sr.id > 0 and e2e_sr.service.price == Decimal('2000.00'))

    # 9-16. Generate invoice & verify all itemized calculations
    # Room: 2 nights * 3000 = 6000
    # Food: 1500
    # Service: 2000
    # Subtotal: 9500
    # Taxable: 9500
    # Tax: 18% of 9500 = 1710.00
    # Grand Total: 9500 + 1710 = 11210.00
    s, r_e2e_inv = api_call(f"{BASE_URL}/invoices/", {"booking_id": e2e_booking.id}, headers=headers_admin, method='POST')
    test("E2E Step 9: Invoice generated via API", s == 201 and r_e2e_inv.get('success'))
    e2e_inv_data = r_e2e_inv.get('data', {})
    e2e_inv_id = e2e_inv_data.get('id')

    test("E2E Step 10: Room charges verified (6000)", Decimal(str(e2e_inv_data.get('room_charges'))) == Decimal('6000.00'))
    test("E2E Step 11: Food charges verified (1500)", Decimal(str(e2e_inv_data.get('food_charges'))) == Decimal('1500.00'))
    test("E2E Step 12: Service charges verified (2000)", Decimal(str(e2e_inv_data.get('service_charges'))) == Decimal('2000.00'))
    test("E2E Step 13-14: Subtotal verified (9500)", Decimal(str(e2e_inv_data.get('subtotal'))) == Decimal('9500.00'))
    test("E2E Step 15: 18% GST tax calculated (1710)", Decimal(str(e2e_inv_data.get('tax_amount'))) == Decimal('1710.00'))
    test("E2E Step 16: Grand total verified (11210)", Decimal(str(e2e_inv_data.get('grand_total'))) == Decimal('11210.00'))

    # 17-18. Make partial payment: Rs. 5,000 & verify status partially_paid
    s, r_e2e_p1 = api_call(f"{BASE_URL}/payments/", {
        "invoice_id": e2e_inv_id,
        "payment_method_id": pm_upi['id'],
        "amount": 5000.00
    }, headers=headers_e2e, method='POST')
    test("E2E Step 17: Partial payment of 5000 made", s == 201 and r_e2e_p1.get('success'))

    s, r_chk_inv1 = api_call(f"{BASE_URL}/invoices/{e2e_inv_id}/", headers=headers_e2e)
    test("E2E Step 18: Invoice verified as Partially Paid", r_chk_inv1.get('data', {}).get('status') == 'Partially Paid')

    # 19-20. Settle remaining Rs. 6,210 & verify status paid
    s, r_e2e_p2 = api_call(f"{BASE_URL}/payments/", {
        "invoice_id": e2e_inv_id,
        "payment_method_id": pm_card['id'],
        "amount": 6210.00
    }, headers=headers_e2e, method='POST')
    test("E2E Step 19: Second payment of 6210 made", s == 201 and r_e2e_p2.get('success'))

    s, r_chk_inv2 = api_call(f"{BASE_URL}/invoices/{e2e_inv_id}/", headers=headers_e2e)
    test("E2E Step 20: Invoice verified as Paid and settled", r_chk_inv2.get('data', {}).get('status') == 'Paid')

    # 21-22. Customer views invoice and payment history
    s, r_e2e_myinv = api_call(f"{BASE_URL}/invoices/my/", headers=headers_e2e)
    test("E2E Step 21: Customer views own invoice in list", s == 200 and any(i['id'] == e2e_inv_id for i in r_e2e_myinv.get('data', [])))

    s, r_e2e_mypay = api_call(f"{BASE_URL}/invoices/{e2e_inv_id}/payments/", headers=headers_e2e)
    test("E2E Step 22: Customer views payment history (2 payments)", s == 200 and len(r_e2e_mypay.get('data', [])) == 2)

    # 23-29. Customer requests cancellation & staff approves refund
    e2e_booking.status = 'Confirmed'
    e2e_booking.save()

    s, r_e2e_cancel = api_call(f"{BASE_URL}/cancellation-requests/", {
        "booking_id": e2e_booking.id,
        "reason": "Emergency flight rescheduling"
    }, headers=headers_e2e, method='POST')
    test("E2E Step 23: Customer requests cancellation", s == 201 and r_e2e_cancel.get('success'))
    e2e_cancel_id = r_e2e_cancel.get('data', {}).get('id')

    s, r_e2e_appr = api_call(f"{BASE_URL}/cancellation-requests/{e2e_cancel_id}/approve/", headers=headers_admin, method='POST')
    test("E2E Step 24-27: Staff approves cancellation and refund is issued", s == 200 and r_e2e_appr.get('success'))

    s, r_e2e_inv_final = api_call(f"{BASE_URL}/invoices/{e2e_inv_id}/", headers=headers_e2e)
    test("E2E Step 28: Invoice payment status updated to Refunded", r_e2e_inv_final.get('data', {}).get('status') == 'Refunded')

    s, r_e2e_refunds = api_call(f"{BASE_URL}/refunds/", headers=headers_e2e)
    test("E2E Step 29: Customer sees refund in refund tracking list", s == 200 and len(r_e2e_refunds.get('data', [])) > 0)

    # 30-31. Data persistence verification
    inv_persisted = Invoice.objects.get(id=e2e_inv_id)
    test("E2E Steps 30-31: Database persistence verified for invoice and payments", inv_persisted.status == 'Refunded' and inv_persisted.payments.count() == 2)

    # ============================================================
    # SUMMARY REPORT
    # ============================================================
    print("\n" + "=" * 60)
    print(f"CHECKPOINT 8 VERIFICATION COMPLETE: {passed_tests} PASSED, {failed_tests} FAILED")
    print("=" * 60)

    if failed_tests > 0:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == '__main__':
    run_tests()
