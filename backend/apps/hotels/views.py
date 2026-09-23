from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import ProtectedError, RestrictedError
from apps.core.models import Hotel, HotelFacility, Gallery
from apps.hotels.serializers import (
    HotelSerializer, HotelDetailSerializer,
    HotelFacilitySerializer, GallerySerializer
)
from apps.core.permissions import IsAdmin, IsManager
from apps.core.utils import api_response, api_error


class HotelPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if view.action in ['destroy']:
            return role == 'ADMIN'
        return role in ['ADMIN', 'MANAGER']


class HotelViewSet(viewsets.ModelViewSet):
    queryset = Hotel.objects.prefetch_related('facilities', 'gallery_images', 'rooms').order_by('-star_rating', 'name')
    permission_classes = [HotelPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'city', 'state', 'tagline', 'description']
    ordering_fields = ['star_rating', 'name', 'created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HotelDetailSerializer
        return HotelSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        city = self.request.query_params.get('city')
        state_param = self.request.query_params.get('state')
        is_active = self.request.query_params.get('is_active')

        if city:
            qs = qs.filter(city__iexact=city)
        if state_param:
            qs = qs.filter(state__iexact=state_param)
        if is_active is not None:
            active_bool = is_active.lower() in ['true', '1']
            qs = qs.filter(is_active=active_bool)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Hotel validation failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        hotel = serializer.save()
        return api_response(
            success=True,
            message="Hotel created successfully.",
            data=HotelSerializer(hotel).data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return api_error("Hotel update failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        hotel = serializer.save()
        return api_response(
            success=True,
            message="Hotel updated successfully.",
            data=HotelSerializer(hotel).data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        hotel_name = instance.name
        try:
            instance.delete()
            return api_response(
                success=True,
                message=f"Hotel '{hotel_name}' deleted successfully."
            )
        except (ProtectedError, RestrictedError, Exception) as e:
            # Handle foreign key constraints safely
            return api_error(
                f"Cannot delete hotel '{hotel_name}' because it has active linked records (rooms, bookings, or staff). Consider deactivating it instead.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get', 'post'])
    def facilities(self, request, pk=None):
        hotel = self.get_object()
        if request.method == 'GET':
            facilities = hotel.facilities.all()
            return api_response(success=True, data=HotelFacilitySerializer(facilities, many=True).data)

        # POST facility
        serializer = HotelFacilitySerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Invalid facility data", errors=serializer.errors)
        facility = serializer.save(hotel=hotel)
        return api_response(
            success=True,
            message="Facility added successfully.",
            data=HotelFacilitySerializer(facility).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get', 'post'])
    def gallery(self, request, pk=None):
        hotel = self.get_object()
        if request.method == 'GET':
            images = hotel.gallery_images.all()
            return api_response(success=True, data=GallerySerializer(images, many=True).data)

        # POST gallery
        serializer = GallerySerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Invalid gallery image data", errors=serializer.errors)
        image = serializer.save(hotel=hotel)
        return api_response(
            success=True,
            message="Gallery image added successfully.",
            data=GallerySerializer(image).data,
            status_code=status.HTTP_201_CREATED
        )


class FacilityPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        return role in ['ADMIN', 'MANAGER']


class HotelFacilityViewSet(viewsets.ModelViewSet):
    queryset = HotelFacility.objects.all()
    serializer_class = HotelFacilitySerializer
    permission_classes = [FacilityPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        hotel_id = self.request.query_params.get('hotel_id') or self.request.query_params.get('hotel')
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Facility validation failed", errors=serializer.errors)
        facility = serializer.save()
        return api_response(success=True, message="Facility created successfully.", data=serializer.data, status_code=status.HTTP_201_CREATED)


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = Gallery.objects.all()
    serializer_class = GallerySerializer
    permission_classes = [FacilityPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        hotel_id = self.request.query_params.get('hotel_id') or self.request.query_params.get('hotel')
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Gallery image validation failed", errors=serializer.errors)
        image = serializer.save()
        return api_response(success=True, message="Gallery image added successfully.", data=serializer.data, status_code=status.HTTP_201_CREATED)
