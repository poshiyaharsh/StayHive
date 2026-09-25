from django.urls import path
from apps.analytics.views import (
    AnalyticsOverviewView,
    BookingAnalyticsView,
    RoomAnalyticsView,
    FoodAnalyticsView,
    ServiceAnalyticsView,
    HousekeepingAnalyticsView,
    CustomerAnalyticsView,
    FeedbackAnalyticsView,
    ComplaintAnalyticsView,
    InquiryAnalyticsView,
    PaymentAnalyticsView,
    RefundAnalyticsView
)

urlpatterns = [
    path('analytics/overview/', AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('analytics/bookings/', BookingAnalyticsView.as_view(), name='analytics_bookings'),
    path('analytics/rooms/', RoomAnalyticsView.as_view(), name='analytics_rooms'),
    path('analytics/food/', FoodAnalyticsView.as_view(), name='analytics_food'),
    path('analytics/services/', ServiceAnalyticsView.as_view(), name='analytics_services'),
    path('analytics/housekeeping/', HousekeepingAnalyticsView.as_view(), name='analytics_housekeeping'),
    path('analytics/customers/', CustomerAnalyticsView.as_view(), name='analytics_customers'),
    path('analytics/feedback/', FeedbackAnalyticsView.as_view(), name='analytics_feedback'),
    path('analytics/complaints/', ComplaintAnalyticsView.as_view(), name='analytics_complaints'),
    path('analytics/inquiries/', InquiryAnalyticsView.as_view(), name='analytics_inquiries'),
    path('analytics/payments/', PaymentAnalyticsView.as_view(), name='analytics_payments'),
    path('analytics/refunds/', RefundAnalyticsView.as_view(), name='analytics_refunds'),
]
