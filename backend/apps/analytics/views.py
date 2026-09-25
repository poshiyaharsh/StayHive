from decimal import Decimal
from datetime import datetime, date, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import Coalesce, TruncDate
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response

from apps.core.models import (
    Hotel, Room, Booking, Invoice, FoodOrder, OrderItem, ServiceRequest,
    HousekeepingTask, Customer, Complaint, Inquiry, Feedback, Payment, Refund, Staff
)
from apps.core.utils import api_response, api_error
from apps.analytics.permissions import AnalyticsPermission


def parse_date_range(request):
    """
    Parses request query params into timezone-aware datetime bounds and date objects.
    Supports: today, yesterday, this_week, last_7_days, this_month, last_month, last_30_days, custom date_from/date_to.
    """
    period = (request.query_params.get('period') or request.query_params.get('range') or '').lower().strip()
    date_from_str = request.query_params.get('date_from')
    date_to_str = request.query_params.get('date_to')

    now = timezone.now()
    today = now.date()

    if date_from_str and date_to_str:
        try:
            start_date = datetime.strptime(date_from_str.strip(), '%Y-%m-%d').date()
            end_date = datetime.strptime(date_to_str.strip(), '%Y-%m-%d').date()
            start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
            end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
            return start_dt, end_dt, start_date, end_date
        except Exception:
            pass

    if period == 'today':
        start_date = today
        end_date = today
    elif period == 'yesterday':
        start_date = today - timedelta(days=1)
        end_date = start_date
    elif period in ['this_week', 'week']:
        start_date = today - timedelta(days=today.weekday())
        end_date = today
    elif period in ['last_7_days', '7_days', '7days']:
        start_date = today - timedelta(days=6)
        end_date = today
    elif period in ['this_month', 'month']:
        start_date = today.replace(day=1)
        end_date = today
    elif period == 'last_month':
        last_month_end = today.replace(day=1) - timedelta(days=1)
        start_date = last_month_end.replace(day=1)
        end_date = last_month_end
    elif period in ['last_30_days', '30_days', '30days']:
        start_date = today - timedelta(days=29)
        end_date = today
    elif period == 'all':
        start_date = date(2020, 1, 1)
        end_date = today + timedelta(days=365)
    else:
        # Default: 30 days window up to today
        start_date = today - timedelta(days=29)
        end_date = today

    start_dt = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
    end_dt = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))
    return start_dt, end_dt, start_date, end_date


class AnalyticsOverviewView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'overview'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        # Base filtered querysets
        bookings_qs = Booking.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
        if hotel_id:
            bookings_qs = bookings_qs.filter(hotel_id=hotel_id)

        # Revenue: Authoritative successful payments
        payments_qs = Payment.objects.filter(payment_date__gte=start_dt, payment_date__lte=end_dt, status='Success')
        refunds_qs = Refund.objects.filter(processed_at__gte=start_dt, processed_at__lte=end_dt, status='Completed')
        if hotel_id:
            payments_qs = payments_qs.filter(invoice__booking__hotel_id=hotel_id)
            refunds_qs = refunds_qs.filter(cancellation__booking__hotel_id=hotel_id)

        collected_rev = payments_qs.aggregate(s=Coalesce(Sum('amount'), Decimal('0.00')))['s']
        refunded_rev = refunds_qs.aggregate(s=Coalesce(Sum('amount'), Decimal('0.00')))['s']
        net_rev = max(Decimal('0.00'), collected_rev - refunded_rev)

        # Today's & this month's revenue
        today = timezone.now().date()
        month_start = today.replace(day=1)
        today_start_dt = timezone.make_aware(datetime.combine(today, datetime.min.time()))
        today_end_dt = timezone.make_aware(datetime.combine(today, datetime.max.time()))
        month_start_dt = timezone.make_aware(datetime.combine(month_start, datetime.min.time()))

        today_rev = Payment.objects.filter(
            payment_date__gte=today_start_dt, payment_date__lte=today_end_dt, status='Success'
        ).aggregate(s=Coalesce(Sum('amount'), Decimal('0.00')))['s']

        month_rev = Payment.objects.filter(
            payment_date__gte=month_start_dt, status='Success'
        ).aggregate(s=Coalesce(Sum('amount'), Decimal('0.00')))['s']

        # Outstanding balance from non-cancelled invoices
        invoices_qs = Invoice.objects.filter(issue_date__gte=start_dt, issue_date__lte=end_dt).exclude(status='Cancelled')
        if hotel_id:
            invoices_qs = invoices_qs.filter(booking__hotel_id=hotel_id)
        total_billed = invoices_qs.aggregate(s=Coalesce(Sum('grand_total'), Decimal('0.00')))['s']
        outstanding = max(Decimal('0.00'), total_billed - collected_rev)

        # Bookings aggregation
        b_total = bookings_qs.count()
        b_confirmed = bookings_qs.filter(status='Confirmed').count()
        b_cancelled = bookings_qs.filter(status='Cancelled').count()
        b_checked_in = bookings_qs.filter(status='Checked-in').count()
        b_checked_out = bookings_qs.filter(status='Checked-out').count()

        # Customers
        total_customers = Customer.objects.count()
        new_this_month = Customer.objects.filter(created_at__gte=month_start_dt).count()

        # Food Orders
        food_qs = FoodOrder.objects.filter(order_time__gte=start_dt, order_time__lte=end_dt)
        if hotel_id:
            food_qs = food_qs.filter(room__hotel_id=hotel_id)
        total_food_orders = food_qs.count()
        today_food_orders = FoodOrder.objects.filter(order_time__gte=today_start_dt, order_time__lte=today_end_dt).count()

        # Services
        srv_qs = ServiceRequest.objects.filter(requested_at__gte=start_dt, requested_at__lte=end_dt)
        if hotel_id:
            srv_qs = srv_qs.filter(booking__hotel_id=hotel_id)
        total_srv_requests = srv_qs.count()
        completed_srv_requests = srv_qs.filter(status='Completed').count()

        # Complaints
        comp_qs = Complaint.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
        if hotel_id:
            comp_qs = comp_qs.filter(booking__hotel_id=hotel_id)
        total_complaints = comp_qs.count()
        open_complaints = comp_qs.filter(status__in=['Pending', 'Open', 'In Progress']).count()

        # Feedback
        fb_qs = Feedback.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
        if hotel_id:
            fb_qs = fb_qs.filter(booking__hotel_id=hotel_id)
        total_feedback = fb_qs.count()
        avg_rating = fb_qs.aggregate(a=Avg('rating'))['a'] or 0.0

        # Rooms & Occupancy
        rooms_qs = Room.objects.all()
        if hotel_id:
            rooms_qs = rooms_qs.filter(hotel_id=hotel_id)
        total_rooms = rooms_qs.count()
        occupied_rooms = rooms_qs.filter(status='Occupied').count()
        available_rooms = rooms_qs.filter(status='Available').count()
        dirty_rooms = rooms_qs.filter(housekeeping_status='Dirty').count()
        clean_rooms = rooms_qs.filter(housekeeping_status__in=['Clean', 'Inspected']).count()
        occupancy_rate = round((occupied_rooms / total_rooms * 100), 2) if total_rooms > 0 else 0.0

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "bookings": {
                "total": b_total,
                "confirmed": b_confirmed,
                "cancelled": b_cancelled,
                "checked_in": b_checked_in,
                "checked_out": b_checked_out,
            },
            "revenue": {
                "total": float(collected_rev),
                "refunded": float(refunded_rev),
                "net_revenue": float(net_rev),
                "today": float(today_rev),
                "this_month": float(month_rev),
                "outstanding": float(outstanding)
            },
            "customers": {
                "total": total_customers,
                "new_this_month": new_this_month
            },
            "food_orders": {
                "total": total_food_orders,
                "today": today_food_orders
            },
            "services": {
                "requests": total_srv_requests,
                "completed": completed_srv_requests
            },
            "complaints": {
                "total": total_complaints,
                "open": open_complaints
            },
            "feedback": {
                "total": total_feedback,
                "average_rating": round(float(avg_rating), 2)
            },
            "rooms": {
                "total_rooms": total_rooms,
                "occupied": occupied_rooms,
                "available": available_rooms,
                "dirty": dirty_rooms,
                "clean": clean_rooms,
                "occupancy_rate": occupancy_rate
            }
        }
        return api_response(success=True, data=data)


class BookingAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'bookings'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = Booking.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)

        total = qs.count()
        confirmed = qs.filter(status='Confirmed').count()
        pending = qs.filter(status='Pending').count()
        cancelled = qs.filter(status='Cancelled').count()
        checked_in = qs.filter(status='Checked-in').count()
        checked_out = qs.filter(status='Checked-out').count()
        completed = qs.filter(status='Completed').count()

        # Daily Trend grouped by created_at date
        trend_qs = (
            qs.annotate(date=TruncDate('created_at'))
            .values('date')
            .annotate(bookings=Count('id'))
            .order_by('date')
        )
        trend = [
            {"date": str(item['date']), "bookings": item['bookings']}
            for item in trend_qs
        ]

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total": total,
            "confirmed": confirmed,
            "pending": pending,
            "cancelled": cancelled,
            "checked_in": checked_in,
            "checked_out": checked_out,
            "completed": completed,
            "trend": trend
        }
        return api_response(success=True, data=data)


class RoomAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'rooms'

    def get(self, request):
        hotel_id = request.query_params.get('hotel_id')
        qs = Room.objects.all()
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)

        total_rooms = qs.count()
        occupied = qs.filter(status='Occupied').count()
        available = qs.filter(status='Available').count()
        dirty = qs.filter(housekeeping_status='Dirty').count()
        clean = qs.filter(housekeeping_status__in=['Clean', 'Inspected']).count()
        maintenance = qs.filter(status='Maintenance').count()

        occupancy_percentage = round((occupied / total_rooms * 100), 2) if total_rooms > 0 else 0.0

        # Status distribution for charts
        distribution = [
            {"name": "Occupied", "value": occupied, "color": "#2563EB"},
            {"name": "Available", "value": available, "color": "#10B981"},
            {"name": "Dirty", "value": dirty, "color": "#EF4444"},
            {"name": "Clean", "value": clean, "color": "#06B6D4"},
            {"name": "Maintenance", "value": maintenance, "color": "#F59E0B"},
        ]

        data = {
            "total_rooms": total_rooms,
            "occupied": occupied,
            "available": available,
            "dirty": dirty,
            "clean": clean,
            "maintenance": maintenance,
            "occupancy_percentage": occupancy_percentage,
            "distribution": distribution
        }
        return api_response(success=True, data=data)


class FoodAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'food'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = FoodOrder.objects.filter(order_time__gte=start_dt, order_time__lte=end_dt)
        if hotel_id:
            qs = qs.filter(room__hotel_id=hotel_id)

        total_orders = qs.count()
        pending = qs.filter(status='Pending').count()
        confirmed = qs.filter(status='Accepted').count()
        preparing = qs.filter(status='Preparing').count()
        ready = qs.filter(status='Ready').count()
        delivered = qs.filter(status='Delivered').count()
        cancelled = qs.filter(status='Cancelled').count()

        # Food revenue from FoodOrder.total_amount
        food_revenue = qs.exclude(status='Cancelled').aggregate(
            s=Coalesce(Sum('total_amount'), Decimal('0.00'))
        )['s']

        # Top 5 food items by quantity sold
        top_items_qs = (
            OrderItem.objects.filter(food_order__in=qs.exclude(status='Cancelled'))
            .values('food_id', 'food__name')
            .annotate(
                total_qty=Sum('quantity'),
                total_sales=Sum('subtotal')
            )
            .order_by('-total_qty')[:5]
        )

        top_food_items = [
            {
                "food_id": item['food_id'],
                "name": item['food__name'],
                "quantity": item['total_qty'],
                "revenue": float(item['total_sales'] or 0.0)
            }
            for item in top_items_qs
        ]

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total_orders": total_orders,
            "pending": pending,
            "confirmed": confirmed,
            "preparing": preparing,
            "ready": ready,
            "delivered": delivered,
            "cancelled": cancelled,
            "food_revenue": float(food_revenue),
            "top_food_items": top_food_items
        }
        return api_response(success=True, data=data)


class ServiceAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'services'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = ServiceRequest.objects.filter(requested_at__gte=start_dt, requested_at__lte=end_dt)
        if hotel_id:
            qs = qs.filter(booking__hotel_id=hotel_id)

        total_requests = qs.count()
        pending = qs.filter(status='Pending').count()
        accepted = qs.filter(status='Accepted').count()
        in_progress = qs.filter(status='In Progress').count()
        completed = qs.filter(status='Completed').count()
        cancelled = qs.filter(status__in=['Cancelled', 'Rejected']).count()

        # Most requested services
        most_req_qs = (
            qs.values('service_id', 'service__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        most_requested_services = [
            {"service_id": item['service_id'], "name": item['service__name'], "requests": item['count']}
            for item in most_req_qs
        ]

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total_requests": total_requests,
            "pending": pending,
            "accepted": accepted,
            "in_progress": in_progress,
            "completed": completed,
            "cancelled": cancelled,
            "most_requested_services": most_requested_services
        }
        return api_response(success=True, data=data)


class HousekeepingAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'housekeeping'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = HousekeepingTask.objects.filter(scheduled_time__gte=start_dt, scheduled_time__lte=end_dt)
        if hotel_id:
            qs = qs.filter(room__hotel_id=hotel_id)

        total_tasks = qs.count()
        scheduled = qs.filter(status__in=['Scheduled', 'Pending', 'Assigned']).count()
        in_progress = qs.filter(status__in=['Cleaning', 'In Progress', 'Inspection']).count()
        completed = qs.filter(status='Completed').count()
        cancelled = qs.filter(status='Cancelled').count()

        # Dirty rooms count
        rooms_qs = Room.objects.all()
        if hotel_id:
            rooms_qs = rooms_qs.filter(hotel_id=hotel_id)
        dirty_rooms = rooms_qs.filter(housekeeping_status='Dirty').count()

        # Tasks by staff
        staff_qs = (
            qs.filter(staff__isnull=False)
            .values('staff_id', 'staff__user__first_name', 'staff__user__last_name')
            .annotate(tasks=Count('id'))
            .order_by('-tasks')[:5]
        )
        tasks_by_staff = [
            {
                "staff_id": item['staff_id'],
                "staff_name": f"{item['staff__user__first_name'] or ''} {item['staff__user__last_name'] or ''}".strip(),
                "tasks": item['tasks']
            }
            for item in staff_qs
        ]

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total_tasks": total_tasks,
            "scheduled": scheduled,
            "in_progress": in_progress,
            "completed": completed,
            "cancelled": cancelled,
            "dirty_rooms": dirty_rooms,
            "tasks_by_staff": tasks_by_staff
        }
        return api_response(success=True, data=data)


class CustomerAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'customers'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)

        total_customers = Customer.objects.count()
        new_customers = Customer.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt).count()

        # Returning customers: customers with >= 2 bookings in total
        returning_customers = (
            Customer.objects.annotate(booking_count=Count('bookings'))
            .filter(booking_count__gt=1)
            .count()
        )

        # Active customers: customers with bookings in the requested period
        active_customers = (
            Customer.objects.filter(
                bookings__created_at__gte=start_dt,
                bookings__created_at__lte=end_dt
            )
            .distinct()
            .count()
        )

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total_customers": total_customers,
            "new_customers": new_customers,
            "returning_customers": returning_customers,
            "active_customers": active_customers
        }
        return api_response(success=True, data=data)


class FeedbackAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'feedback'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = Feedback.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
        if hotel_id:
            qs = qs.filter(booking__hotel_id=hotel_id)

        total_feedback = qs.count()
        avg_rating = qs.aggregate(a=Avg('rating'))['a'] or 0.0

        # Distribution 1 to 5
        dist_qs = qs.values('rating').annotate(c=Count('id'))
        dist_map = {item['rating']: item['c'] for item in dist_qs}
        distribution = {
            str(r): dist_map.get(r, 0)
            for r in range(1, 6)
        }

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total_feedback": total_feedback,
            "average_rating": round(float(avg_rating), 2),
            "distribution": distribution
        }
        return api_response(success=True, data=data)


class ComplaintAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'complaints'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = Complaint.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
        if hotel_id:
            qs = qs.filter(booking__hotel_id=hotel_id)

        total = qs.count()
        pending = qs.filter(status__in=['Pending', 'Open']).count()
        in_progress = qs.filter(status='In Progress').count()
        resolved = qs.filter(status='Resolved').count()
        closed = qs.filter(status='Closed').count()
        rejected = qs.filter(status='Rejected').count()

        # Resolution time for resolved complaints (if resolved_at is set)
        resolved_qs = qs.filter(status='Resolved', resolved_at__isnull=False)
        avg_hours = None
        if resolved_qs.exists():
            diffs = []
            for c in resolved_qs:
                if c.resolved_at and c.created_at:
                    hrs = (c.resolved_at - c.created_at).total_seconds() / 3600.0
                    diffs.append(hrs)
            if diffs:
                avg_hours = round(sum(diffs) / len(diffs), 1)

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total": total,
            "pending": pending,
            "in_progress": in_progress,
            "resolved": resolved,
            "closed": closed,
            "rejected": rejected,
            "average_resolution_time_hours": avg_hours
        }
        return api_response(success=True, data=data)


class InquiryAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'inquiries'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        qs = Inquiry.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)

        total = qs.count()
        pending = qs.filter(status='Pending').count()
        in_progress = qs.filter(status='In Progress').count()
        responded = qs.filter(status='Responded').count()
        closed = qs.filter(status='Closed').count()

        answered = responded + closed
        response_rate = round((answered / total * 100), 2) if total > 0 else 0.0

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total": total,
            "pending": pending,
            "in_progress": in_progress,
            "responded": responded,
            "closed": closed,
            "response_rate": response_rate
        }
        return api_response(success=True, data=data)


class PaymentAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'payments'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = Payment.objects.filter(payment_date__gte=start_dt, payment_date__lte=end_dt)
        if hotel_id:
            qs = qs.filter(invoice__booking__hotel_id=hotel_id)

        total_successful = qs.filter(status='Success').count()
        total_failed = qs.filter(status='Failed').count()
        total_pending = qs.filter(status='Pending').count()

        collected_amount = qs.filter(status='Success').aggregate(
            s=Coalesce(Sum('amount'), Decimal('0.00'))
        )['s']

        refunds_qs = Refund.objects.filter(processed_at__gte=start_dt, processed_at__lte=end_dt, status='Completed')
        if hotel_id:
            refunds_qs = refunds_qs.filter(cancellation__booking__hotel_id=hotel_id)
        refunded_amount = refunds_qs.aggregate(
            s=Coalesce(Sum('amount'), Decimal('0.00'))
        )['s']

        net_collected_amount = max(Decimal('0.00'), collected_amount - refunded_amount)

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total_successful": total_successful,
            "total_failed": total_failed,
            "total_pending": total_pending,
            "collected_amount": float(collected_amount),
            "refunded_amount": float(refunded_amount),
            "net_collected_amount": float(net_collected_amount)
        }
        return api_response(success=True, data=data)


class RefundAnalyticsView(APIView):
    permission_classes = [AnalyticsPermission]
    endpoint_name = 'refunds'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')

        qs = Refund.objects.filter(processed_at__gte=start_dt, processed_at__lte=end_dt)
        if hotel_id:
            qs = qs.filter(cancellation__booking__hotel_id=hotel_id)

        total_refunds = qs.count()
        completed_refunds = qs.filter(status='Completed').count()
        pending_refunds = qs.filter(status__in=['Pending', 'Initiated', 'Processing']).count()
        failed_refunds = qs.filter(status='Failed').count()

        refund_amount = qs.filter(status='Completed').aggregate(
            s=Coalesce(Sum('amount'), Decimal('0.00'))
        )['s']

        data = {
            "period": {"from": str(start_date), "to": str(end_date)},
            "total_refunds": total_refunds,
            "completed_refunds": completed_refunds,
            "pending_refunds": pending_refunds,
            "failed_refunds": failed_refunds,
            "refund_amount": float(refund_amount)
        }
        return api_response(success=True, data=data)
