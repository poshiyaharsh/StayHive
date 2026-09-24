from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.cancellations.views import CancellationRequestViewSet, RefundViewSet

router = DefaultRouter()
router.register(r'cancellations', CancellationRequestViewSet, basename='cancellation')
router.register(r'cancellation-requests', CancellationRequestViewSet, basename='cancellation-request')
router.register(r'refunds', RefundViewSet, basename='refund')

urlpatterns = [
    path('', include(router.urls)),
]
