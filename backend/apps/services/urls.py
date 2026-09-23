from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.services.views import ServiceViewSet, ServiceRequestViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet, basename='service')
router.register(r'service-requests', ServiceRequestViewSet, basename='service-request')

urlpatterns = [
    path('', include(router.urls)),
]
