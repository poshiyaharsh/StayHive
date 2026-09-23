from rest_framework import viewsets, permissions, filters
from apps.core.models import Hotel, HotelFacility, Gallery
from apps.hotels.serializers import HotelSerializer, HotelFacilitySerializer, GallerySerializer
from apps.core.utils import api_response


class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.all().order_by('-star_rating', 'name')
    serializer_class = HotelSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'city', 'state', 'tagline']
    ordering_fields = ['star_rating', 'name', 'created_at']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return api_response(success=True, data=response.data)


class HotelFacilityViewSet(viewsets.ModelViewSet):
    queryset = HotelFacility.objects.all()
    serializer_class = HotelFacilitySerializer
    permission_classes = [permissions.AllowAny]


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [permissions.AllowAny]
