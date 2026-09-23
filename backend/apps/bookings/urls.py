from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.bookings.views import BookingViewSet, CheckInViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'check-ins', CheckInViewSet, basename='check-in')

urlpatterns = [
    path('', include(router.urls)),
]
