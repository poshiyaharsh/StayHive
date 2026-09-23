from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.offers.views import OfferPackageViewSet

router = DefaultRouter()
router.register(r'offers', OfferPackageViewSet, basename='offer')

urlpatterns = [
    path('', include(router.urls)),
]
