from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.rooms.views import RoomViewSet, RoomTypeViewSet, RoomAmenityViewSet

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'room-types', RoomTypeViewSet, basename='room-type')
router.register(r'room-amenities', RoomAmenityViewSet, basename='room-amenity')
router.register(r'amenities', RoomAmenityViewSet, basename='amenity')

urlpatterns = [
    path('', include(router.urls)),
]
