from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import ProtectedError, RestrictedError
from apps.core.models import RoomType, Room, RoomAmenity, Booking
from apps.rooms.serializers import (
    RoomTypeSerializer, RoomSerializer, RoomAmenitySerializer,
    STATUS_MAP, HOUSEKEEPING_MAP
)
from apps.core.utils import api_response, api_error


class RoomPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if view.action == 'update_status':
            return role in ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING']
        if view.action in ['destroy']:
            return role == 'ADMIN'
        return role in ['ADMIN', 'MANAGER']


class RoomTypePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if view.action in ['destroy']:
            return role == 'ADMIN'
        return role in ['ADMIN', 'MANAGER']


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().select_related('hotel', 'room_type').prefetch_related('room_type__amenities').order_by('floor', 'room_number')
    serializer_class = RoomSerializer
    permission_classes = [RoomPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['room_number', 'hotel__name', 'room_type__type_name', 'status']
    ordering_fields = ['room_number', 'floor', 'price_per_night', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        hotel_id = params.get('hotel_id') or params.get('hotel')
        status_param = params.get('status')
        floor = params.get('floor')
        room_type_id = params.get('room_type_id') or params.get('room_type')
        housekeeping = params.get('housekeeping_status') or params.get('housekeeping')

        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        if status_param and status_param.lower() != 'all':
            norm_status = STATUS_MAP.get(status_param.lower(), status_param)
            qs = qs.filter(status__iexact=norm_status)
        if floor and floor.lower() != 'all':
            qs = qs.filter(floor=floor)
        if room_type_id:
            qs = qs.filter(room_type_id=room_type_id)
        if housekeeping and housekeeping.lower() != 'all':
            norm_hk = HOUSEKEEPING_MAP.get(housekeeping.lower(), housekeeping)
            qs = qs.filter(housekeeping_status__iexact=norm_hk)

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
            # Format friendly error for unique constraint
            err_msg = "Room validation failed"
            if "room_number" in serializer.errors:
                err_msg = str(serializer.errors["room_number"][0])
            return api_error(err_msg, errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        room = serializer.save()
        return api_response(
            success=True,
            message=f"Room {room.room_number} created successfully.",
            data=RoomSerializer(room).data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            err_msg = "Room update failed"
            if "room_number" in serializer.errors:
                err_msg = str(serializer.errors["room_number"][0])
            return api_error(err_msg, errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        room = serializer.save()
        return api_response(
            success=True,
            message=f"Room {room.room_number} updated successfully.",
            data=RoomSerializer(room).data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        room_num = instance.room_number
        try:
            instance.delete()
            return api_response(
                success=True,
                message=f"Room {room_num} deleted successfully."
            )
        except (ProtectedError, RestrictedError, Exception):
            return api_error(
                f"Cannot delete room {room_num} because it has active reservations or history records.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning
        """
        room = self.get_object()
        raw_status = request.data.get('status')
        raw_hk = request.data.get('housekeeping_status') or request.data.get('housekeeping')

        if raw_status:
            norm_status = STATUS_MAP.get(raw_status.lower(), raw_status)
            room.status = norm_status
        if raw_hk:
            norm_hk = HOUSEKEEPING_MAP.get(raw_hk.lower(), raw_hk)
            room.housekeeping_status = norm_hk

        room.save()
        return api_response(
            success=True,
            message=f"Room {room.room_number} status updated to {room.status} ({room.housekeeping_status}).",
            data=RoomSerializer(room).data
        )

    @action(detail=True, methods=['get', 'post'])
    def amenities(self, request, pk=None):
        room = self.get_object()
        if request.method == 'GET':
            amenities = room.room_type.amenities.all()
            return api_response(success=True, data=RoomAmenitySerializer(amenities, many=True).data)

        # POST amenity to the room's room_type
        serializer = RoomAmenitySerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Invalid amenity data", errors=serializer.errors)
        amenity = serializer.save(room_type=room.room_type)
        return api_response(
            success=True,
            message="Room amenity added successfully.",
            data=RoomAmenitySerializer(amenity).data,
            status_code=status.HTTP_201_CREATED
        )


class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.prefetch_related('amenities', 'rooms').order_by('base_price')
    serializer_class = RoomTypeSerializer
    permission_classes = [RoomTypePermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['type_name', 'description', 'bed_type']
    ordering_fields = ['base_price', 'capacity', 'type_name']

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Room type validation failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        room_type = serializer.save()
        return api_response(
            success=True,
            message=f"Room type '{room_type.type_name}' created successfully.",
            data=RoomTypeSerializer(room_type).data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return api_error("Room type update failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        room_type = serializer.save()
        return api_response(
            success=True,
            message=f"Room type '{room_type.type_name}' updated successfully.",
            data=RoomTypeSerializer(room_type).data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        type_name = instance.type_name
        try:
            instance.delete()
            return api_response(
                success=True,
                message=f"Room type '{type_name}' deleted successfully."
            )
        except (ProtectedError, RestrictedError, Exception):
            return api_error(
                f"Cannot delete room category '{type_name}' because rooms are currently assigned to it.",
                status_code=status.HTTP_400_BAD_REQUEST
            )


class RoomAmenityViewSet(viewsets.ModelViewSet):
    queryset = RoomAmenity.objects.all()
    serializer_class = RoomAmenitySerializer
    permission_classes = [RoomTypePermission]

    def get_queryset(self):
        qs = super().get_queryset()
        room_type_id = self.request.query_params.get('room_type_id') or self.request.query_params.get('room_type')
        room_id = self.request.query_params.get('room_id') or self.request.query_params.get('room')
        if room_type_id:
            qs = qs.filter(room_type_id=room_type_id)
        if room_id:
            qs = qs.filter(room_type__rooms__id=room_id).distinct()
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Room amenity validation failed", errors=serializer.errors)
        amenity = serializer.save()
        return api_response(
            success=True,
            message="Room amenity created successfully.",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED
        )
