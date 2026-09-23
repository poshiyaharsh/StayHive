from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.hotels.views import HotelViewSet, HotelFacilityViewSet, GalleryViewSet

router = DefaultRouter()
router.register(r'hotels', HotelViewSet, basename='hotel')
router.register(r'hotel-facilities', HotelFacilityViewSet, basename='hotel-facility')
router.register(r'facilities', HotelFacilityViewSet, basename='facility')
router.register(r'gallery', GalleryViewSet, basename='gallery')

urlpatterns = [
    path('', include(router.urls)),
]
