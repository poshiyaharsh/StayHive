from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer, BaseRenderer

from apps.core.utils import api_response, api_error
from apps.analytics.views import parse_date_range
from apps.reports.permissions import ReportPermission
from apps.reports.services import (
    get_bookings_report, get_revenue_report, get_occupancy_report,
    get_food_report, get_services_report, get_housekeeping_report,
    get_customers_report, get_support_report, export_csv
)


class CSVRenderer(BaseRenderer):
    media_type = 'text/csv'
    format = 'csv'
    charset = 'utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        return data


class BookingReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'booking'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_bookings_report(start_dt, end_dt, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'booking_id', 'booking_number', 'guest_name', 'hotel_name',
                'room_number', 'check_in', 'check_out', 'status', 'total_amount'
            ]
            return export_csv(f"bookings_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })


class RevenueReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'revenue'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_revenue_report(start_dt, end_dt, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'type', 'transaction_id', 'date', 'invoice_number',
                'guest_name', 'payment_method', 'amount', 'status'
            ]
            return export_csv(f"revenue_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })


class OccupancyReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'occupancy'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_occupancy_report(start_date, end_date, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'room_id', 'room_number', 'hotel_name', 'room_type',
                'floor', 'occupancy_status', 'cleanliness_status'
            ]
            return export_csv(f"occupancy_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })


class FoodReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'food'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_food_report(start_dt, end_dt, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'order_id', 'order_time', 'room_number', 'guest_name',
                'item_count', 'total_amount', 'status', 'payment_status'
            ]
            return export_csv(f"food_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })


class ServiceReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'service'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_services_report(start_dt, end_dt, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'request_id', 'requested_at', 'service_name',
                'booking_number', 'guest_name', 'assigned_staff', 'status'
            ]
            return export_csv(f"services_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })


class HousekeepingReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'housekeeping'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_housekeeping_report(start_dt, end_dt, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'task_id', 'scheduled_time', 'room_number',
                'task_type', 'priority', 'assigned_staff', 'status'
            ]
            return export_csv(f"housekeeping_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })


class CustomerReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'customer'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_customers_report(start_dt, end_dt, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'customer_id', 'full_name', 'email', 'phone',
                'total_bookings', 'total_spent', 'joined_date'
            ]
            return export_csv(f"customers_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })


class SupportReportView(APIView):
    permission_classes = [ReportPermission]
    renderer_classes = [JSONRenderer, CSVRenderer]
    report_type = 'support'

    def get(self, request):
        start_dt, end_dt, start_date, end_date = parse_date_range(request)
        hotel_id = request.query_params.get('hotel_id')
        fmt = (request.query_params.get('format') or request.query_params.get('export') or '').lower()

        summary, rows = get_support_report(start_dt, end_dt, hotel_id)

        if fmt == 'csv':
            fieldnames = [
                'type', 'id', 'date', 'guest_name', 'category_or_subject', 'status_or_rating'
            ]
            return export_csv(f"support_report_{start_date}_{end_date}", fieldnames, rows)

        return Response({
            "period": {"from": str(start_date), "to": str(end_date)},
            "summary": summary,
            "rows": rows
        })
