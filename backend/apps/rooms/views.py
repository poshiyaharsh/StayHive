from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.models import RoomType, Room, RoomAmenity, Booking
from apps.rooms.serializers import RoomTypeSerializer, RoomSerializer, RoomAmenitySerializer
from apps.core.utils import api_response, api_error


class RoomTypeViewSet(viewsets.ModelViewSet):
    queryset = RoomType.objects.all().order_by('base_price')
    serializer_class = RoomTypeSerializer
    permission_classes = [permissions.AllowAny]


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().select_related('hotel', 'room_type').order_by('floor', 'room_number')
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['room_number', 'hotel__name', 'room_type__type_name', 'status']
    ordering_fields = ['room_number', 'floor', 'price_per_night', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        hotel_id = self.request.query_params.get('hotel_id')
        status_param = self.request.query_params.get('status')
        floor = self.request.query_params.get('floor')
        room_type_id = self.request.query_params.get('room_type_id')
        housekeeping = self.request.query_params.get('housekeeping_status')

        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        if status_param:
            qs = qs.filter(status=status_param)
        if floor:
            qs = qs.filter(floor=floor)
        if room_type_id:
            qs = qs.filter(room_type_id=room_type_id)
        if housekeeping:
            qs = qs.filter(housekeeping_status=housekeeping)
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=False, methods=['get'])
    def check_availability(self, request):
        """
        Check rooms available between check_in and check_out dates for a hotel.
        """
        hotel_id = request.query_params.get('hotel_id')
        check_in = request.query_params.get('check_in')
        check_out = request.query_params.get('check_out')
        guests = int(request.query_params.get('guests', 1))

        rooms = Room.objects.filter(status__in=['Available', 'Cleaning']).select_related('hotel', 'room_type')
        if hotel_id:
            rooms = rooms.filter(hotel_id=hotel_id)

        if check_in and check_out:
            # Exclude rooms with overlapping bookings
            occupied_room_ids = Booking.objects.filter(
                status__in=['Confirmed', 'Checked-in'],
                check_in_date__lt=check_out,
                check_out_date__gt=check_in
            ).values_list('booking_rooms__room_id', flat=True)

            rooms = rooms.exclude(id__in=occupied_room_ids)

        if guests:
            rooms = rooms.filter(room_type__capacity__gte=guests)

        serializer = RoomSerializer(rooms, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Fast status transition: Available, Occupied, Reserved, Maintenance, Cleaning
        """
        room = self.get_object()
        new_status = request.data.get('status')
        new_housekeeping = request.data.get('housekeeping_status')

        if new_status:
            room.status = new_status
        if new_housekeeping:
            room.housekeeping_status = new_housekeeping
        
        room.save()
        return api_response(
            success=True,
            message=f"Room {room.room_number} status updated to {room.status}",
            data=RoomSerializer(room).data
        )


class RoomAmenityViewSet(viewsets.ModelViewSet):
    queryset = RoomAmenity.objects.all()
    serializer_class = RoomAmenitySerializer
    permission_classes = [permissions.AllowAny]
