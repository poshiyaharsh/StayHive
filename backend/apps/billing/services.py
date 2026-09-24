import uuid
from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum

from apps.core.models import (
    Booking, Invoice, Payment, PaymentMethod,
    FoodOrder, ServiceRequest, OfferApplication, Refund
)

TAX_RATE = Decimal('0.18')  # 18% GST (9% CGST + 9% SGST)
PRECISION = Decimal('0.01')


def quantize_money(amount) -> Decimal:
    """Format decimal to standard 2-decimal currency precision."""
    if amount is None:
        return Decimal('0.00')
    return Decimal(str(amount)).quantize(PRECISION, rounding=ROUND_HALF_UP)


def calculate_room_charges(booking: Booking) -> Decimal:
    """
    Calculate room charges based on number_of_nights * room_rate snapshot.
    Uses booking_room.room_rate when allocated.
    """
    if not booking.check_in_date or not booking.check_out_date:
        nights = 1
    else:
        nights = (booking.check_out_date - booking.check_in_date).days
        if nights <= 0:
            nights = 1

    br = booking.booking_rooms.select_related('room', 'room__room_type').first()
    if br and getattr(br, 'room_rate', None) and br.room_rate > 0:
        room_rate = br.room_rate
    elif br and br.room and getattr(br.room, 'price_per_night', None):
        room_rate = br.room.price_per_night
    elif br and br.room and br.room.room_type and getattr(br.room.room_type, 'price_per_night', None):
        room_rate = br.room.room_type.price_per_night
    elif booking.total_amount and booking.total_amount > 0:
        room_rate = booking.total_amount / Decimal(nights)
    else:
        room_rate = Decimal('0.00')

    charges = Decimal(nights) * Decimal(str(room_rate))
    return quantize_money(charges)


def calculate_food_charges(booking: Booking) -> Decimal:
    """
    Calculate food charges from actual food orders for the booking.
    Uses historical food_order.total_amount for valid orders.
    """
    orders = FoodOrder.objects.filter(
        booking=booking
    ).exclude(
        status='Cancelled'
    )
    total = sum((order.total_amount for order in orders), Decimal('0.00'))
    return quantize_money(total)


def calculate_service_charges(booking: Booking) -> Decimal:
    """
    Calculate service charges from actual service requests.
    Uses service_request -> service -> service.price for non-cancelled requests.
    """
    requests = ServiceRequest.objects.filter(
        booking=booking
    ).exclude(
        status__in=['Cancelled', 'Rejected']
    ).select_related('service')

    total = sum((sr.service.price for sr in requests if sr.service and sr.service.price), Decimal('0.00'))
    return quantize_money(total)


def calculate_discount(booking: Booking, room_charges: Decimal, subtotal: Decimal) -> Decimal:
    """
    Calculate discount amount from offer application and offer package.
    Validates offer applicability, dates, and thresholds.
    """
    offer_app = OfferApplication.objects.filter(
        booking=booking
    ).select_related('offer').first()

    if not offer_app or not offer_app.offer:
        # Fallback to booking.discount_amount if snapshot exists
        if booking.discount_amount and booking.discount_amount > 0:
            return min(quantize_money(booking.discount_amount), subtotal)
        return Decimal('0.00')

    offer = offer_app.offer
    today = date.today()

    # Validate active flag and date window
    if not offer.is_active:
        return Decimal('0.00')
    if offer.valid_from and offer.valid_to:
        if not (offer.valid_from <= today <= offer.valid_to):
            # If the booking was confirmed while the offer was valid, respect the applied discount snapshot
            if offer_app.discount_applied and offer_app.discount_applied > 0:
                return min(quantize_money(offer_app.discount_applied), subtotal)
            return Decimal('0.00')

    # Validate min booking amount
    if offer.min_booking_amount and subtotal < offer.min_booking_amount:
        return Decimal('0.00')

    # Calculate percentage or use applied snapshot
    if offer.discount_percentage and offer.discount_percentage > 0:
        disc = (room_charges * (offer.discount_percentage / Decimal('100.0'))).quantize(PRECISION, rounding=ROUND_HALF_UP)
        return min(disc, subtotal)

    if offer_app.discount_applied and offer_app.discount_applied > 0:
        return min(quantize_money(offer_app.discount_applied), subtotal)

    return Decimal('0.00')


def calculate_tax(taxable_amount: Decimal) -> Decimal:
    """Calculate 18% GST on taxable amount with Decimal precision."""
    if taxable_amount <= Decimal('0.00'):
        return Decimal('0.00')
    return quantize_money(taxable_amount * TAX_RATE)


def calculate_invoice_totals(booking: Booking) -> dict:
    """
    Calculate authoritative backend totals for an invoice:
    room_charges, food_charges, service_charges, subtotal, discount, tax, grand_total.
    """
    room_chg = calculate_room_charges(booking)
    food_chg = calculate_food_charges(booking)
    serv_chg = calculate_service_charges(booking)

    subtotal = quantize_money(room_chg + food_chg + serv_chg)
    discount = calculate_discount(booking, room_chg, subtotal)
    taxable = max(Decimal('0.00'), subtotal - discount)
    tax = calculate_tax(taxable)
    grand_total = quantize_money(taxable + tax)

    return {
        'room_charges': room_chg,
        'food_charges': food_chg,
        'service_charges': serv_chg,
        'subtotal': subtotal,
        'discount_amount': discount,
        'taxable_amount': taxable,
        'tax_amount': tax,
        'grand_total': grand_total
    }


def generate_or_get_invoice(booking: Booking, force_recalculate: bool = False) -> Invoice:
    """
    Idempotent invoice creation/retrieval for a booking.
    - If invoice already exists:
        - If Paid, Refunded, or Partially Refunded: returns existing invoice without changing historical financials.
        - If Unpaid or Partially Paid: recalculates to include newly added food/services if requested or needed.
    - If no invoice exists: generates new unique invoice.
    """
    existing_invoice = Invoice.objects.filter(booking=booking).order_by('-id').first()
    if existing_invoice:
        # If already financially settled or refunded, do not alter historical records
        if existing_invoice.status in ['Paid', 'Refunded', 'Partially Refunded']:
            return existing_invoice

        # If unpaid or draft, recalculate latest totals
        totals = calculate_invoice_totals(booking)
        existing_invoice.room_charges = totals['room_charges']
        existing_invoice.food_charges = totals['food_charges']
        existing_invoice.service_charges = totals['service_charges']
        existing_invoice.subtotal = totals['subtotal']
        existing_invoice.discount_amount = totals['discount_amount']
        existing_invoice.tax_amount = totals['tax_amount']
        existing_invoice.grand_total = totals['grand_total']
        existing_invoice.save()
        return existing_invoice

    # Create new invoice
    totals = calculate_invoice_totals(booking)
    unique_suffix = uuid.uuid4().hex[:6].upper()
    invoice_number = f"INV-{timezone.now().year}-{unique_suffix}"

    invoice = Invoice.objects.create(
        invoice_number=invoice_number,
        booking=booking,
        issue_date=timezone.now(),
        room_charges=totals['room_charges'],
        food_charges=totals['food_charges'],
        service_charges=totals['service_charges'],
        subtotal=totals['subtotal'],
        discount_amount=totals['discount_amount'],
        tax_amount=totals['tax_amount'],
        grand_total=totals['grand_total'],
        status='Unpaid'
    )
    return invoice


def calculate_paid_amount(invoice: Invoice) -> Decimal:
    """Sum of all successful payments for the invoice."""
    total = Payment.objects.filter(
        invoice=invoice,
        status='Success'
    ).aggregate(total=Sum('amount'))['total']
    return quantize_money(total or Decimal('0.00'))


def calculate_outstanding_balance(invoice: Invoice) -> Decimal:
    """Calculate remaining unpaid balance for the invoice."""
    paid = calculate_paid_amount(invoice)
    balance = max(Decimal('0.00'), invoice.grand_total - paid)
    return quantize_money(balance)


def calculate_refunded_amount(payment: Payment) -> Decimal:
    """Sum of completed/initiated refunds for a payment."""
    total = Refund.objects.filter(
        payment=payment,
        status__in=['Completed', 'Initiated', 'Processing']
    ).aggregate(total=Sum('amount'))['total']
    return quantize_money(total or Decimal('0.00'))


def calculate_refundable_amount(payment: Payment) -> Decimal:
    """Maximum refundable amount remaining on a payment."""
    already_refunded = calculate_refunded_amount(payment)
    max_refundable = max(Decimal('0.00'), payment.amount - already_refunded)
    return quantize_money(max_refundable)
