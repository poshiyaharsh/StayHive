from django.contrib import admin
from django.urls import path, include
from apps.accounts.views import HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='api_health'),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.hotels.urls')),
    path('api/', include('apps.rooms.urls')),
    path('api/', include('apps.bookings.urls')),
    path('api/', include('apps.customers.urls')),
    path('api/reception/', include('apps.reception.urls')),
    path('api/', include('apps.staff.urls')),
    path('api/', include('apps.restaurant.urls')),
    path('api/', include('apps.services.urls')),
    path('api/', include('apps.housekeeping.urls')),
    path('api/', include('apps.billing.urls')),
    path('api/', include('apps.offers.urls')),
    path('api/', include('apps.cancellations.urls')),
    path('api/', include('apps.feedback.urls')),
    path('api/', include('apps.complaints.urls')),
    path('api/', include('apps.inquiries.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.analytics.urls')),
]
