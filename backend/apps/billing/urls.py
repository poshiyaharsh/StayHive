from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.billing.views import InvoiceViewSet, PaymentMethodViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'payment-methods', PaymentMethodViewSet, basename='payment-method')

urlpatterns = [
    path('', include(router.urls)),
]
