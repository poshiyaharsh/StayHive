import csv
import io
from decimal import Decimal
from datetime import datetime, date
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import Coalesce
from django.http import HttpResponse

from apps.core.models import (
    Booking, Invoice, Payment, Refund, Room, FoodOrder, OrderItem,
    ServiceRequest, HousekeepingTask, Customer, Complaint, Inquiry, Feedback, Hotel
)


def export_csv(filename: str, fieldnames: list, rows: list) -> HttpResponse:
    """Streams backend-authoritative data formatted as RFC 4180 CSV."""
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}.csv"'

    writer = csv.DictWriter(response, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return response


def get_bookings_report(start_dt, end_dt, hotel_id=None):
    qs = Booking.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt).select_related(
        'customer', 'customer__user', 'hotel'
    ).prefetch_related('booking_rooms__room')

    if hotel_id:
        qs = qs.filter(hotel_id=hotel_id)

    total_bookings = qs.count()
    confirmed = qs.filter(status='Confirmed').count()
    cancelled = qs.filter(status='Cancelled').count()
    total_rev = qs.exclude(status='Cancelled').aggregate(
        s=Coalesce(Sum('total_amount'), Decimal('0.00'))
    )['s']

    rows = []
    for b in qs.order_by('-created_at', '-id')[:500]:
        guest = f"{b.customer.user.first_name} {b.customer.user.last_name}".strip() if b.customer and b.customer.user else "Guest"
        rooms = ", ".join([br.room.room_number for br in b.booking_rooms.all() if br.room]) or "N/A"
        rows.append({
            "booking_id": b.id,
            "booking_number": b.booking_number,
            "guest_name": guest,
            "hotel_name": b.hotel.name if b.hotel else "N/A",
            "room_number": rooms,
            "check_in": str(b.check_in_date),
            "check_out": str(b.check_out_date),
            "status": b.status,
            "total_amount": float(b.total_amount)
        })

    summary = {
        "total_bookings": total_bookings,
        "confirmed_count": confirmed,
        "cancelled_count": cancelled,
        "total_revenue": float(total_rev)
    }
    return summary, rows


def get_revenue_report(start_dt, end_dt, hotel_id=None):
    # Payments
    pay_qs = Payment.objects.filter(payment_date__gte=start_dt, payment_date__lte=end_dt, status='Success').select_related(
        'invoice', 'invoice__booking', 'invoice__booking__customer', 'invoice__booking__customer__user', 'payment_method'
    )
    if hotel_id:
        pay_qs = pay_qs.filter(invoice__booking__hotel_id=hotel_id)

    total_collected = pay_qs.aggregate(s=Coalesce(Sum('amount'), Decimal('0.00')))['s']

    # Refunds
    ref_qs = Refund.objects.filter(processed_at__gte=start_dt, processed_at__lte=end_dt, status='Completed').select_related(
        'cancellation', 'cancellation__booking', 'cancellation__booking__customer', 'cancellation__booking__customer__user'
    )
    if hotel_id:
        ref_qs = ref_qs.filter(cancellation__booking__hotel_id=hotel_id)

    total_refunded = ref_qs.aggregate(s=Coalesce(Sum('amount'), Decimal('0.00')))['s']
    net_revenue = max(Decimal('0.00'), total_collected - total_refunded)

    rows = []
    for p in pay_qs.order_by('-payment_date')[:300]:
        guest = f"{p.invoice.booking.customer.user.first_name} {p.invoice.booking.customer.user.last_name}".strip() if p.invoice and p.invoice.booking and p.invoice.booking.customer and p.invoice.booking.customer.user else "Guest"
        rows.append({
            "type": "Payment",
            "transaction_id": p.transaction_id,
            "date": p.payment_date.strftime('%Y-%m-%d %H:%M'),
            "invoice_number": p.invoice.invoice_number if p.invoice else "N/A",
            "guest_name": guest,
            "payment_method": p.payment_method.name if p.payment_method else "N/A",
            "amount": float(p.amount),
            "status": p.status
        })

    for r in ref_qs.order_by('-processed_at')[:200]:
        b = r.cancellation.booking if r.cancellation else None
        guest = f"{b.customer.user.first_name} {b.customer.user.last_name}".strip() if b and b.customer and b.customer.user else "Guest"
        rows.append({
            "type": "Refund",
            "transaction_id": r.bank_reference or f"REF-{r.id}",
            "date": r.processed_at.strftime('%Y-%m-%d %H:%M') if r.processed_at else "N/A",
            "invoice_number": b.booking_number if b else "N/A",
            "guest_name": guest,
            "payment_method": "Refund",
            "amount": -float(r.amount),
            "status": r.status
        })

    summary = {
        "collected_revenue": float(total_collected),
        "refunded_amount": float(total_refunded),
        "net_revenue": float(net_revenue),
        "total_transactions": len(rows)
    }
    return summary, rows


def get_occupancy_report(start_date, end_date, hotel_id=None):
    rooms_qs = Room.objects.all().select_related('hotel', 'room_type')
    if hotel_id:
        rooms_qs = rooms_qs.filter(hotel_id=hotel_id)

    total_rooms = rooms_qs.count()
    occupied_rooms = rooms_qs.filter(status='Occupied').count()
    available_rooms = rooms_qs.filter(status='Available').count()
    dirty_rooms = rooms_qs.filter(housekeeping_status='Dirty').count()
    clean_rooms = rooms_qs.filter(housekeeping_status__in=['Clean', 'Inspected']).count()
    occupancy_rate = round((occupied_rooms / total_rooms * 100), 2) if total_rooms > 0 else 0.0

    rows = []
    for r in rooms_qs.order_by('floor', 'room_number')[:500]:
        rows.append({
            "room_id": r.id,
            "room_number": r.room_number,
            "hotel_name": r.hotel.name if r.hotel else "N/A",
            "room_type": r.room_type.type_name if r.room_type else "N/A",
            "floor": r.floor or "1",
            "occupancy_status": r.status,
            "cleanliness_status": r.housekeeping_status
        })

    summary = {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "available_rooms": available_rooms,
        "dirty_rooms": dirty_rooms,
        "clean_rooms": clean_rooms,
        "occupancy_rate": occupancy_rate
    }
    return summary, rows


def get_food_report(start_dt, end_dt, hotel_id=None):
    qs = FoodOrder.objects.filter(order_time__gte=start_dt, order_time__lte=end_dt).select_related(
        'customer', 'customer__user', 'room'
    ).prefetch_related('items')

    if hotel_id:
        qs = qs.filter(room__hotel_id=hotel_id)

    total_orders = qs.count()
    delivered_count = qs.filter(status='Delivered').count()
    cancelled_count = qs.filter(status='Cancelled').count()
    total_rev = qs.exclude(status='Cancelled').aggregate(
        s=Coalesce(Sum('total_amount'), Decimal('0.00'))
    )['s']

    rows = []
    for o in qs.order_by('-order_time')[:500]:
        guest = f"{o.customer.user.first_name} {o.customer.user.last_name}".strip() if o.customer and o.customer.user else "Guest"
        rows.append({
            "order_id": o.id,
            "order_time": o.order_time.strftime('%Y-%m-%d %H:%M') if o.order_time else "N/A",
            "room_number": o.room.room_number if o.room else "N/A",
            "guest_name": guest,
            "item_count": o.items.count(),
            "total_amount": float(o.total_amount),
            "status": o.status,
            "payment_status": o.payment_status or "Billed to Room"
        })

    summary = {
        "total_orders": total_orders,
        "delivered_count": delivered_count,
        "cancelled_count": cancelled_count,
        "total_food_revenue": float(total_rev)
    }
    return summary, rows


def get_services_report(start_dt, end_dt, hotel_id=None):
    qs = ServiceRequest.objects.filter(requested_at__gte=start_dt, requested_at__lte=end_dt).select_related(
        'service', 'booking', 'booking__customer', 'booking__customer__user', 'staff', 'staff__user'
    )
    if hotel_id:
        qs = qs.filter(booking__hotel_id=hotel_id)

    total_requests = qs.count()
    completed_requests = qs.filter(status='Completed').count()
    pending_requests = qs.filter(status='Pending').count()

    rows = []
    for s in qs.order_by('-requested_at')[:500]:
        guest = f"{s.booking.customer.user.first_name} {s.booking.customer.user.last_name}".strip() if s.booking and s.booking.customer and s.booking.customer.user else "Guest"
        staff_name = f"{s.staff.user.first_name} {s.staff.user.last_name}".strip() if s.staff and s.staff.user else "Unassigned"
        rows.append({
            "request_id": s.id,
            "requested_at": s.requested_at.strftime('%Y-%m-%d %H:%M') if s.requested_at else "N/A",
            "service_name": s.service.name if s.service else "N/A",
            "booking_number": s.booking.booking_number if s.booking else "N/A",
            "guest_name": guest,
            "assigned_staff": staff_name,
            "status": s.status
        })

    summary = {
        "total_requests": total_requests,
        "completed_requests": completed_requests,
        "pending_requests": pending_requests
    }
    return summary, rows


def get_housekeeping_report(start_dt, end_dt, hotel_id=None):
    qs = HousekeepingTask.objects.filter(scheduled_time__gte=start_dt, scheduled_time__lte=end_dt).select_related(
        'room', 'staff', 'staff__user'
    )
    if hotel_id:
        qs = qs.filter(room__hotel_id=hotel_id)

    total_tasks = qs.count()
    completed_tasks = qs.filter(status='Completed').count()
    in_progress = qs.filter(status__in=['Cleaning', 'In Progress', 'Inspection']).count()

    dirty_rooms = Room.objects.filter(housekeeping_status='Dirty')
    if hotel_id:
        dirty_rooms = dirty_rooms.filter(hotel_id=hotel_id)
    dirty_count = dirty_rooms.count()

    rows = []
    for t in qs.order_by('-scheduled_time')[:500]:
        staff_name = f"{t.staff.user.first_name} {t.staff.user.last_name}".strip() if t.staff and t.staff.user else "Unassigned"
        rows.append({
            "task_id": t.id,
            "scheduled_time": t.scheduled_time.strftime('%Y-%m-%d %H:%M') if t.scheduled_time else "N/A",
            "room_number": t.room.room_number if t.room else "N/A",
            "task_type": t.task_type or "Cleaning",
            "priority": t.priority or "Normal",
            "assigned_staff": staff_name,
            "status": t.status
        })

    summary = {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress,
        "dirty_rooms": dirty_count
    }
    return summary, rows


def get_customers_report(start_dt, end_dt, hotel_id=None):
    qs = Customer.objects.all().select_related('user').annotate(
        total_bookings=Count('bookings'),
        total_spent=Coalesce(Sum('bookings__total_amount'), Decimal('0.00'))
    )

    total_customers = qs.count()
    new_customers = qs.filter(created_at__gte=start_dt, created_at__lte=end_dt).count()
    returning_customers = qs.filter(total_bookings__gt=1).count()

    rows = []
    for c in qs.order_by('-total_spent', '-created_at')[:500]:
        full_name = f"{c.user.first_name} {c.user.last_name}".strip() if c.user else "Guest"
        rows.append({
            "customer_id": c.id,
            "full_name": full_name,
            "email": c.user.email if c.user else "N/A",
            "phone": c.user.phone if (c.user and c.user.phone) else "N/A",
            "total_bookings": c.total_bookings,
            "total_spent": float(c.total_spent),
            "joined_date": c.created_at.strftime('%Y-%m-%d') if c.created_at else "N/A"
        })

    summary = {
        "total_customers": total_customers,
        "new_customers": new_customers,
        "returning_customers": returning_customers
    }
    return summary, rows


def get_support_report(start_dt, end_dt, hotel_id=None):
    comp_qs = Complaint.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt).select_related(
        'customer', 'customer__user'
    )
    inq_qs = Inquiry.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt).select_related(
        'customer', 'customer__user'
    )
    fb_qs = Feedback.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt).select_related(
        'customer', 'customer__user'
    )

    if hotel_id:
        comp_qs = comp_qs.filter(booking__hotel_id=hotel_id)
        fb_qs = fb_qs.filter(booking__hotel_id=hotel_id)

    total_complaints = comp_qs.count()
    resolved_complaints = comp_qs.filter(status='Resolved').count()
    total_inquiries = inq_qs.count()
    total_feedback = fb_qs.count()
    avg_rating = fb_qs.aggregate(a=Avg('rating'))['a'] or 0.0

    rows = []
    for c in comp_qs.order_by('-created_at')[:200]:
        guest = f"{c.customer.user.first_name} {c.customer.user.last_name}".strip() if c.customer and c.customer.user else "Guest"
        rows.append({
            "type": "Complaint",
            "id": c.id,
            "date": c.created_at.strftime('%Y-%m-%d %H:%M') if c.created_at else "N/A",
            "guest_name": guest,
            "category_or_subject": c.category or "General",
            "status_or_rating": c.status
        })

    for i in inq_qs.order_by('-created_at')[:150]:
        guest = f"{i.customer.user.first_name} {i.customer.user.last_name}".strip() if i.customer and i.customer.user else (i.customer_name or "Anonymous")
        rows.append({
            "type": "Inquiry",
            "id": i.id,
            "date": i.created_at.strftime('%Y-%m-%d %H:%M') if i.created_at else "N/A",
            "guest_name": guest,
            "category_or_subject": i.subject or "Inquiry",
            "status_or_rating": i.status
        })

    for f in fb_qs.order_by('-created_at')[:150]:
        guest = f"{f.customer.user.first_name} {f.customer.user.last_name}".strip() if f.customer and f.customer.user else "Guest"
        rows.append({
            "type": "Feedback",
            "id": f.id,
            "date": f.created_at.strftime('%Y-%m-%d %H:%M') if f.created_at else "N/A",
            "guest_name": guest,
            "category_or_subject": "Guest Review",
            "status_or_rating": f"Rating: {f.rating}/5"
        })

    summary = {
        "total_complaints": total_complaints,
        "resolved_complaints": resolved_complaints,
        "total_inquiries": total_inquiries,
        "total_feedback": total_feedback,
        "average_rating": round(float(avg_rating), 2)
    }
    return summary, rows
