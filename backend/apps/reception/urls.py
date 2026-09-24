from django.urls import path
from apps.reception.views import (
    ArrivalsView, DeparturesView, ActiveStaysView,
    CheckInView, CheckOutView, ReceptionSearchView,
    RoomStatusBoardView, ReceptionDashboardStatsView,
    ReceptionCancellationRequestsView
)

urlpatterns = [
    path('arrivals/', ArrivalsView.as_view(), name='reception_arrivals'),
    path('departures/', DeparturesView.as_view(), name='reception_departures'),
    path('active-stays/', ActiveStaysView.as_view(), name='reception_active_stays'),
    path('check-in/', CheckInView.as_view(), name='reception_check_in'),
    path('checkin/', CheckInView.as_view(), name='reception_checkin_alias'),
    path('check-out/', CheckOutView.as_view(), name='reception_check_out'),
    path('checkout/', CheckOutView.as_view(), name='reception_checkout_alias'),
    path('search/', ReceptionSearchView.as_view(), name='reception_search'),
    path('room-status/', RoomStatusBoardView.as_view(), name='reception_room_status'),
    path('dashboard/', ReceptionDashboardStatsView.as_view(), name='reception_dashboard'),
    path('cancellation-requests/', ReceptionCancellationRequestsView.as_view(), name='reception_cancellations'),
    path('cancellation-requests/<int:pk>/approve/', ReceptionCancellationRequestsView.as_view(), name='reception_cancellation_approve'),
]
