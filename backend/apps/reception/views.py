from datetime import date, datetime
from decimal import Decimal
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.core.models import (
    Booking, BookingRoom, CheckIn, Customer, Room, RoomType, Hotel, Staff, User, CancellationRequest
)
from apps.core.utils import api_response, api_error
from apps.reception.serializers import (
    ReceptionArrivalSerializer, ReceptionDepartureSerializer,
    ReceptionActiveStaySerializer, CheckInRequestSerializer,
    CheckOutRequestSerializer, RoomStatusBoardSerializer,
    ReceptionCancellationSerializer
)
from apps.bookings.serializers import BookingSerializer


class ReceptionPermission(permissions.BasePermission):
    """
    Ensures only FRONT DESK (RECEPTION, MANAGER, ADMIN) can access reception operations.
    CUSTOMERS, HOUSEKEEPING, RESTAURANT are strictly forbidden (HTTP 403).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        return role in ['ADMIN', 'MANAGER', 'RECEPTION']


class ArrivalsView(APIView):
    permission_classes = [ReceptionPermission]

    def get(self, request):
        today = date.today()
        hotel_id = request.query_params.get('hotel_id')
        date_param = request.query_params.get('date')

        target_date = today
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                pass

        qs = Booking.objects.filter(
            check_in_date=target_date,
            status='Confirmed'
        ).select_related(
            'customer', 'customer__user', 'hotel'
        ).prefetch_related(
            'booking_rooms__room', 'booking_rooms__room__room_type'
        ).order_by('check_in_date', 'id')

        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)

        serializer = ReceptionArrivalSerializer(qs, many=True)
        return api_response(success=True, data=serializer.data)


class DeparturesView(APIView):
    permission_classes = [ReceptionPermission]

    def get(self, request):
        today = date.today()
        hotel_id = request.query_params.get('hotel_id')
        date_param = request.query_params.get('date')

        target_date = today
        if date_param:
            try:
                target_date = datetime.strptime(date_param, '%Y-%m-%d').date()
            except ValueError:
                pass

        qs = Booking.objects.filter(
            check_out_date=target_date,
            status='Checked-in'
        ).select_related(
            'customer', 'customer__user', 'hotel'
        ).prefetch_related(
            'booking_rooms__room', 'booking_rooms__room__room_type', 'check_ins'
        ).order_by('check_out_date', 'id')

        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)

        serializer = ReceptionDepartureSerializer(qs, many=True)
        return api_response(success=True, data=serializer.data)


class ActiveStaysView(APIView):
    permission_classes = [ReceptionPermission]

    def get(self, request):
        hotel_id = request.query_params.get('hotel_id')
        qs = Booking.objects.filter(
            status='Checked-in'
        ).select_related(
            'customer', 'customer__user', 'hotel'
        ).prefetch_related(
            'booking_rooms__room', 'booking_rooms__room__room_type', 'check_ins__staff__user'
        ).order_by('-check_in_date', '-id')

        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)

        serializer = ReceptionActiveStaySerializer(qs, many=True)
        return api_response(success=True, data=serializer.data)


class CheckInView(APIView):
    permission_classes = [ReceptionPermission]

    def post(self, request):
        serializer = CheckInRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Check-in data invalid", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data['booking_id']
        key_card_issued = serializer.validated_data.get('key_card_issued', '').strip()
        remarks = serializer.validated_data.get('remarks', '').strip()

        with transaction.atomic():
            # 1. Lock/retrieve booking
            booking = Booking.objects.select_for_update().filter(id=booking_id).first()
            if not booking:
                return api_error("Booking not found", status_code=status.HTTP_404_NOT_FOUND)

            # 2. Verify status
            if booking.status == 'Checked-in':
                return api_error("Guest is already checked in.", status_code=status.HTTP_400_BAD_REQUEST)

            if booking.status != 'Confirmed':
                return api_error(f"Cannot check in booking with status '{booking.status}'.", status_code=status.HTTP_400_BAD_REQUEST)

            # 3. Verify room
            booking_room = booking.booking_rooms.select_related('room').first()
            if not booking_room or not booking_room.room:
                return api_error("No room allocated to this booking.", status_code=status.HTTP_400_BAD_REQUEST)

            # 4. Verify room availability & lock
            room = Room.objects.select_for_update().filter(id=booking_room.room.id).first()
            if not room:
                return api_error("Allocated room does not exist.", status_code=status.HTTP_400_BAD_REQUEST)

            if room.status == 'Occupied':
                return api_error(f"Room {room.room_number} is already occupied.", status_code=status.HTTP_400_BAD_REQUEST)

            # 5. Resolve staff ID from authenticated user (never trust React client)
            staff = Staff.objects.filter(user=request.user).first()
            if not staff:
                # Fallback to designated reception staff if admin/superuser
                staff = Staff.objects.filter(designation__icontains='Reception').first() or Staff.objects.first()

            now = timezone.now()
            assigned_key = key_card_issued or f"KEY-{room.room_number}-A"
            final_remarks = remarks or "Guest checked in via front desk reception"

            # 6. Create check_in record
            check_in = CheckIn.objects.create(
                booking=booking,
                room=room,
                staff=staff,
                check_in_time=now,
                id_verified=True,
                key_card_issued=assigned_key,
                notes=final_remarks
            )

            # 7. Update booking and room status
            booking.status = 'Checked-in'
            booking.save()

            room.status = 'Occupied'
            room.save()

        return api_response(
            success=True,
            message="Guest checked in successfully.",
            data={
                "booking_id": booking.id,
                "check_in_id": check_in.id,
                "room_number": room.room_number,
                "actual_check_in": check_in.check_in_time.isoformat(),
                "status": "Checked-in",
                "key_card_issued": check_in.key_card_issued,
                "guest_name": f"{booking.customer.user.first_name} {booking.customer.user.last_name}".strip() if booking.customer and booking.customer.user else "Guest"
            },
            status_code=status.HTTP_200_OK
        )


class CheckOutView(APIView):
    permission_classes = [ReceptionPermission]

    def post(self, request):
        serializer = CheckOutRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Check-out data invalid", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data['booking_id']
        remarks = serializer.validated_data.get('remarks', 'Guest checked out normally.')

        with transaction.atomic():
            # 1. Lock/retrieve booking
            booking = Booking.objects.select_for_update().filter(id=booking_id).first()
            if not booking:
                return api_error("Booking not found", status_code=status.HTTP_404_NOT_FOUND)

            # 2. Check duplicate / already checked out
            if booking.status in ['Checked-out', 'Completed']:
                return api_error("Guest has already checked out.", status_code=status.HTTP_400_BAD_REQUEST)

            if booking.status != 'Checked-in':
                return api_error(f"Cannot check out booking with status '{booking.status}'. Only checked-in bookings can be checked out.", status_code=status.HTTP_400_BAD_REQUEST)

            # 3. Identify allocated room
            booking_room = booking.booking_rooms.select_related('room').first()
            if not booking_room or not booking_room.room:
                return api_error("No room allocated to this booking.", status_code=status.HTTP_400_BAD_REQUEST)

            room = Room.objects.select_for_update().filter(id=booking_room.room.id).first()
            if not room:
                return api_error("Allocated room does not exist.", status_code=status.HTTP_400_BAD_REQUEST)

            # 4. Update booking to checked_out
            booking.status = 'Checked-out'
            booking.save()

            # 5. Update room to Available / Cleaning and housekeeping to Needs Cleaning (dirty)
            room.status = 'Available'
            room.housekeeping_status = 'Needs Cleaning'
            room.save()

            # 6. Update customer lifetime statistics
            customer = booking.customer
            if customer:
                customer.total_stays += 1
                customer.total_spend += booking.net_amount
                if customer.total_spend > Decimal('100000'):
                    customer.loyalty_tier = 'Platinum'
                elif customer.total_spend > Decimal('40000'):
                    customer.loyalty_tier = 'Gold'
                customer.save()

        return api_response(
            success=True,
            message="Guest checked out successfully.",
            data={
                "booking_id": booking.id,
                "status": "checked_out",
                "room_number": room.room_number,
                "room_status": "available",
                "housekeeping_status": "dirty"
            },
            status_code=status.HTTP_200_OK
        )


class ReceptionSearchView(APIView):
    permission_classes = [ReceptionPermission]

    def get(self, request):
        query = request.query_params.get('q', '').strip() or request.query_params.get('search', '').strip()
        status_param = request.query_params.get('status')
        hotel_id = request.query_params.get('hotel_id')
        arrivals_today = request.query_params.get('arrivals_today')
        departures_today = request.query_params.get('departures_today')

        today = date.today()
        qs = Booking.objects.all().select_related(
            'customer', 'customer__user', 'hotel'
        ).prefetch_related(
            'booking_rooms__room', 'booking_rooms__room__room_type', 'check_ins'
        ).order_by('-created_at')

        if query:
            qs = qs.filter(
                Q(booking_number__icontains=query) |
                Q(customer__user__first_name__icontains=query) |
                Q(customer__user__last_name__icontains=query) |
                Q(customer__user__email__icontains=query) |
                Q(customer__user__phone__icontains=query) |
                Q(booking_rooms__room__room_number__icontains=query)
            ).distinct()

        if status_param and status_param.lower() != 'all':
            qs = qs.filter(status__iexact=status_param)

        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)

        if arrivals_today == 'true':
            qs = qs.filter(check_in_date=today, status='Confirmed')

        if departures_today == 'true':
            qs = qs.filter(check_out_date=today, status='Checked-in')

        serializer = BookingSerializer(qs[:50], many=True)
        return api_response(success=True, data=serializer.data)


class RoomStatusBoardView(APIView):
    permission_classes = [ReceptionPermission]

    def get(self, request):
        hotel_id = request.query_params.get('hotel_id')
        status_param = request.query_params.get('status')
        floor = request.query_params.get('floor')

        qs = Room.objects.all().select_related(
            'hotel', 'room_type'
        ).prefetch_related(
            'room_bookings__booking__customer__user'
        ).order_by('floor', 'room_number')

        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        if status_param and status_param.lower() != 'all':
            qs = qs.filter(status__iexact=status_param)
        if floor and floor.lower() != 'all':
            qs = qs.filter(floor=floor)

        serializer = RoomStatusBoardSerializer(qs, many=True)
        return api_response(success=True, data=serializer.data)


class ReceptionDashboardStatsView(APIView):
    permission_classes = [ReceptionPermission]

    def get(self, request):
        today = date.today()
        hotel_id = request.query_params.get('hotel_id')

        bookings_qs = Booking.objects.all()
        rooms_qs = Room.objects.all()

        if hotel_id:
            bookings_qs = bookings_qs.filter(hotel_id=hotel_id)
            rooms_qs = rooms_qs.filter(hotel_id=hotel_id)

        today_arrivals_qs = bookings_qs.filter(check_in_date=today, status='Confirmed')
        today_departures_qs = bookings_qs.filter(check_out_date=today, status='Checked-in')
        in_house_qs = bookings_qs.filter(status='Checked-in')

        available_rooms_count = rooms_qs.filter(status='Available').count()
        occupied_rooms_count = rooms_qs.filter(status='Occupied').count()
        cleaning_rooms_count = rooms_qs.filter(status='Cleaning').count()
        maintenance_rooms_count = rooms_qs.filter(status='Maintenance').count()

        recent_bookings = bookings_qs.select_related('customer', 'customer__user', 'hotel').prefetch_related('booking_rooms__room').order_by('-created_at')[:5]

        data = {
            "today_arrivals_count": today_arrivals_qs.count(),
            "today_departures_count": today_departures_qs.count(),
            "in_house_count": in_house_qs.count(),
            "available_rooms_count": available_rooms_count,
            "occupied_rooms_count": occupied_rooms_count,
            "cleaning_rooms_count": cleaning_rooms_count,
            "maintenance_rooms_count": maintenance_rooms_count,
            "pending_checkins": today_arrivals_qs.count(),
            "pending_checkouts": today_departures_qs.count(),
            "today_arrivals": ReceptionArrivalSerializer(today_arrivals_qs[:10], many=True).data,
            "today_departures": ReceptionDepartureSerializer(today_departures_qs[:10], many=True).data,
            "recent_bookings": BookingSerializer(recent_bookings, many=True).data,
        }

        return api_response(success=True, data=data)


class ReceptionCancellationRequestsView(APIView):
    permission_classes = [ReceptionPermission]

    def get(self, request):
        hotel_id = request.query_params.get('hotel_id')
        qs = CancellationRequest.objects.all().select_related(
            'booking', 'customer', 'customer__user'
        ).prefetch_related('booking__booking_rooms__room').order_by('-requested_at')

        if hotel_id:
            qs = qs.filter(booking__hotel_id=hotel_id)

        serializer = ReceptionCancellationSerializer(qs, many=True)
        return api_response(success=True, data=serializer.data)

    def post(self, request, pk=None):
        if not pk:
            return api_error("Cancellation ID is required.")
        cancellation = CancellationRequest.objects.filter(id=pk).first()
        if not cancellation:
            return api_error("Cancellation request not found.", status_code=status.HTTP_404_NOT_FOUND)

        action_param = request.data.get('action', 'approve').lower()
        if action_param == 'approve':
            cancellation.status = 'Approved'
            cancellation.save()
            return api_response(success=True, message=f"Cancellation request #{cancellation.id} approved.")
        else:
            cancellation.status = 'Rejected'
            cancellation.save()
            return api_response(success=True, message=f"Cancellation request #{cancellation.id} rejected.")
