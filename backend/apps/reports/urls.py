from django.urls import path
from apps.reports.views import (
    BookingReportView, RevenueReportView, OccupancyReportView,
    FoodReportView, ServiceReportView, HousekeepingReportView,
    CustomerReportView, SupportReportView
)

urlpatterns = [
    path('reports/bookings/', BookingReportView.as_view(), name='report_bookings'),
    path('reports/revenue/', RevenueReportView.as_view(), name='report_revenue'),
    path('reports/occupancy/', OccupancyReportView.as_view(), name='report_occupancy'),
    path('reports/food/', FoodReportView.as_view(), name='report_food'),
    path('reports/services/', ServiceReportView.as_view(), name='report_services'),
    path('reports/housekeeping/', HousekeepingReportView.as_view(), name='report_housekeeping'),
    path('reports/customers/', CustomerReportView.as_view(), name='report_customers'),
    path('reports/support/', SupportReportView.as_view(), name='report_support'),
]
