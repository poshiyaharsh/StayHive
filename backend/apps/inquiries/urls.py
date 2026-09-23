from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.inquiries.views import InquiryViewSet

router = DefaultRouter()
router.register(r'inquiries', InquiryViewSet, basename='inquiry')

urlpatterns = [
    path('', include(router.urls)),
]
