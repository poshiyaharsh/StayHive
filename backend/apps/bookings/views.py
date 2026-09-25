import uuid
from datetime import datetime, date
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound

from apps.core.models import (
    Booking, BookingRoom, CheckIn, Customer, Hotel, Room, RoomType,
    Invoice, ServiceRequest, FoodOrder, OfferPackage, OfferApplication,
    HousekeepingTask, CancellationRequest, User, Role
)
from apps.bookings.serializers import (
    BookingSerializer, BookingCreateSerializer, CheckInSerializer, BookingRoomSerializer
)
from apps.rooms.serializers import RoomSerializer, RoomTypeSerializer
from apps.core.utils import api_response, api_error


class BookingPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action in ['availability']:
            return True
        if not (request.user and request.user.is_authenticated):
            return False

        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if view.action in ['check_in', 'check_out', 'confirm']:
            return role in ['ADMIN', 'MANAGER', 'RECEPTION']

        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['ADMIN', 'MANAGER', 'RECEPTION']:
            return True

        if view.action in ['check_in', 'check_out', 'confirm']:
            return False

        # Customer role can ONLY view and interact with their own booking
        if role == 'CUSTOMER':
            return bool(obj.customer and obj.customer.user_id == request.user.id)

        return False


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().select_related(
        'customer', 'customer__user', 'hotel'
    ).prefetch_related(
        'booking_rooms__room', 'booking_rooms__room__room_type', 'applied_offers__offer'
    ).order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [BookingPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['booking_number', 'customer__user__first_name', 'customer__user__last_name', 'hotel__name', 'status']
    ordering_fields = ['check_in_date', 'check_out_date', 'net_amount', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user or not user.is_authenticated:
            return qs.none()

        role = getattr(user.role, 'name', '') if getattr(user, 'role', None) else ''
        if role == 'CUSTOMER':
            return qs.filter(customer__user=user)

        status_param = self.request.query_params.get('status')
        hotel_id = self.request.query_params.get('hotel_id')
        customer_id = self.request.query_params.get('customer_id')

        if status_param:
            qs = qs.filter(status=status_param)
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        booking = Booking.objects.filter(pk=pk).select_related(
            'customer', 'customer__user', 'hotel'
        ).prefetch_related(
            'booking_rooms__room', 'booking_rooms__room__room_type', 'applied_offers__offer'
        ).first()

        if not booking:
            return api_error("Booking not found", status_code=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, booking)

        serializer = self.get_serializer(booking)
        data = serializer.data
        data['food_orders'] = list(booking.food_orders.values('id', 'order_time', 'total_amount', 'status'))
        data['service_requests'] = list(booking.service_requests.values('id', 'service__name', 'requested_at', 'status'))
        return api_response(success=True, data=data)

    def update(self, request, *args, **kwargs):
        if 'status' in request.data:
            return api_error("Direct booking status modification is prohibited. Use dedicated workflow actions (e.g., check-in, check-out, cancel).", status_code=status.HTTP_400_BAD_REQUEST)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if 'status' in request.data:
            return api_error("Direct booking status modification is prohibited. Use dedicated workflow actions (e.g., check-in, check-out, cancel).", status_code=status.HTTP_400_BAD_REQUEST)
        return super().partial_update(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        """
        Transactional booking creation with date overlap verification,
        room auto-allocation, offer discounts, and data isolation.
        """
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Booking validation failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        user = request.user
        role = getattr(user.role, 'name', '') if getattr(user, 'role', None) else ''

        # Determine Customer
        if role == 'CUSTOMER':
            customer, _ = Customer.objects.get_or_create(user=user)
        else:
            customer = validated_data.get('customer')
            if not customer:
                # If staff passes guest details, lookup or create customer
                guest_email = validated_data.get('guest_email')
                if guest_email:
                    cust_user, _ = User.objects.get_or_create(
                        email=guest_email,
                        defaults={
                            'username': guest_email,
                            'first_name': validated_data.get('guest_name', '').split(' ')[0],
                            'last_name': ' '.join(validated_data.get('guest_name', '').split(' ')[1:]) or 'Guest',
                            'phone': validated_data.get('guest_phone', ''),
                            'role': Role.objects.filter(name='CUSTOMER').first()
                        }
                    )
                    customer, _ = Customer.objects.get_or_create(
                        user=cust_user,
                        defaults={
                            'id_proof_type': validated_data.get('id_proof_type', 'Aadhaar Card'),
                            'id_proof_number': validated_data.get('id_proof_number', ''),
                            'address': validated_data.get('address', '')
                        }
                    )
                else:
                    return api_error("Customer is required for reservation.", status_code=status.HTTP_400_BAD_REQUEST)

        hotel = validated_data['hotel']
        check_in = validated_data['check_in_date']
        check_out = validated_data['check_out_date']
        total_guests = validated_data.get('total_guests', 1)
        adults = validated_data.get('adults', 1)
        children = validated_data.get('children', 0)
        offer_code = validated_data.get('offer_code', '').strip().upper()

        with transaction.atomic():
            # Room selection and lock
            if validated_data.get('room'):
                room = Room.objects.select_for_update().filter(id=validated_data['room'].id, hotel=hotel).first()
                if not room:
                    return api_error("Selected room does not belong to the chosen hotel.", status_code=status.HTTP_400_BAD_REQUEST)

                # Check strict overlap
                overlap = BookingRoom.objects.filter(
                    room_id=room.id,
                    booking__status__in=['Confirmed', 'Checked-in'],
                    booking__check_in_date__lt=check_out,
                    booking__check_out_date__gt=check_in
                ).exists()

                if overlap:
                    return api_error("Selected room is already booked for these dates. Please choose another room.", status_code=status.HTTP_400_BAD_REQUEST)
            else:
                room_type = validated_data['room_type']
                # Overlap check for all rooms of this type
                booked_room_ids = BookingRoom.objects.filter(
                    room__room_type=room_type,
                    room__hotel=hotel,
                    booking__status__in=['Confirmed', 'Checked-in'],
                    booking__check_in_date__lt=check_out,
                    booking__check_out_date__gt=check_in
                ).values_list('room_id', flat=True)

                room = Room.objects.select_for_update().filter(
                    hotel=hotel,
                    room_type=room_type
                ).exclude(status='Maintenance').exclude(id__in=booked_room_ids).first()

                if not room:
                    return api_error("No available rooms found for the selected category and dates.", status_code=status.HTTP_400_BAD_REQUEST)

                # Concurrency double check after acquiring row lock
                overlap_check = BookingRoom.objects.filter(
                    room_id=room.id,
                    booking__status__in=['Confirmed', 'Checked-in'],
                    booking__check_in_date__lt=check_out,
                    booking__check_out_date__gt=check_in
                ).exists()
                if overlap_check:
                    return api_error("The selected room has just been reserved. Please try again.", status_code=status.HTTP_409_CONFLICT)

            # Authoritative pricing
            nights = max(1, (check_out - check_in).days)
            total_amount = room.price_per_night * Decimal(nights)
            discount_amount = Decimal('0.00')
            applied_offer = None

            if offer_code:
                offer = OfferPackage.objects.filter(code__iexact=offer_code, is_active=True).first()
                if offer and total_amount >= offer.min_booking_amount:
                    today = date.today()
                    if (not offer.valid_from or offer.valid_from <= today) and (not offer.valid_to or offer.valid_to >= today):
                        discount_amount = (total_amount * offer.discount_percentage) / Decimal(100)
                        applied_offer = offer
                        offer.usage_count += 1
                        offer.save()

            net_amount = total_amount - discount_amount
            booking_number = f"SH-2026-{uuid.uuid4().hex[:6].upper()}"

            booking = Booking.objects.create(
                booking_number=booking_number,
                customer=customer,
                hotel=hotel,
                check_in_date=check_in,
                check_out_date=check_out,
                total_guests=total_guests,
                adults=adults,
                children=children,
                total_amount=total_amount,
                discount_amount=discount_amount,
                net_amount=net_amount,
                status='Confirmed'
            )

            BookingRoom.objects.create(booking=booking, room=room, room_rate=room.price_per_night)

            if applied_offer:
                OfferApplication.objects.create(
                    booking=booking,
                    offer=applied_offer,
                    discount_applied=discount_amount
                )

        from apps.notifications.services import notify_customer, notify_role
        from apps.notifications.constants import TYPE_BOOKING_CREATED, TYPE_BOOKING_CONFIRMED
        notify_customer(booking.customer, f"Your booking #{booking.booking_number} has been confirmed.", TYPE_BOOKING_CONFIRMED)
        notify_role('RECEPTION', f"New booking #{booking.booking_number} confirmed for {booking.customer.user.get_full_name()}.", TYPE_BOOKING_CREATED)

        return api_response(
            success=True,
            message="Booking confirmed successfully!",
            data=BookingSerializer(booking).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post', 'patch'], url_path='confirm')
    def confirm(self, request, pk=None):
        booking = self.get_object()
        booking.status = 'Confirmed'
        booking.save(update_fields=['status'])
        from apps.notifications.services import notify_customer
        from apps.notifications.constants import TYPE_BOOKING_CONFIRMED
        notify_customer(booking.customer, f"Your booking #{booking.booking_number} has been confirmed.", TYPE_BOOKING_CONFIRMED, title="Booking Confirmed")
        return api_response(
            success=True,
            message="Booking confirmed successfully!",
            data=BookingSerializer(booking).data
        )

    @action(detail=False, methods=['get'])
    def availability(self, request):
        """
        Public or authenticated endpoint to query available rooms and categories
        using the strict date-overlap formula:
        overlap: existing_check_in < req_check_out AND existing_check_out > req_check_in
        """
        hotel_id = request.query_params.get('hotel_id')
        room_type_id = request.query_params.get('room_type_id')
        check_in_str = request.query_params.get('check_in_date')
        check_out_str = request.query_params.get('check_out_date')
        guests_param = request.query_params.get('guests')

        if not check_in_str or not check_out_str:
            return api_error("Both check_in_date and check_out_date query parameters are required.")

        try:
            check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
            check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
        except ValueError:
            return api_error("Invalid date format. Use YYYY-MM-DD")

        if check_out <= check_in:
            return api_error("check_out_date must be after check_in_date")

        nights = max(1, (check_out - check_in).days)

        # Rooms booked during this date range
        booked_room_ids = BookingRoom.objects.filter(
            booking__status__in=['Confirmed', 'Checked-in'],
            booking__check_in_date__lt=check_out,
            booking__check_out_date__gt=check_in
        ).values_list('room_id', flat=True)

        rooms_qs = Room.objects.exclude(status='Maintenance').exclude(
            id__in=booked_room_ids
        ).select_related('hotel', 'room_type')

        if hotel_id:
            rooms_qs = rooms_qs.filter(hotel_id=hotel_id)
        if room_type_id:
            rooms_qs = rooms_qs.filter(room_type_id=room_type_id)
        if guests_param:
            try:
                rooms_qs = rooms_qs.filter(room_type__capacity__gte=int(guests_param))
            except ValueError:
                pass

        # Room types with available room counts
        all_room_types = RoomType.objects.all()
        room_types_summary = []
        for rt in all_room_types:
            matching_available = [r for r in rooms_qs if r.room_type_id == rt.id]
            if matching_available:
                lowest_price = min(r.price_per_night for r in matching_available)
                room_types_summary.append({
                    'id': rt.id,
                    'type_name': rt.type_name,
                    'description': rt.description,
                    'capacity': rt.capacity,
                    'available_count': len(matching_available),
                    'price_per_night': float(lowest_price),
                    'total_estimated': float(lowest_price * Decimal(nights)),
                    'nights': nights
                })

        return api_response(
            success=True,
            data={
                'check_in_date': check_in_str,
                'check_out_date': check_out_str,
                'nights': nights,
                'total_available_rooms': rooms_qs.count(),
                'room_types': room_types_summary,
                'available_rooms': RoomSerializer(rooms_qs, many=True).data
            }
        )

    @action(detail=False, methods=['get'])
    def my(self, request):
        """
        Returns the authenticated customer's own booking history.
        """
        if not request.user or not request.user.is_authenticated:
            return api_error("Authentication required", status_code=status.HTTP_401_UNAUTHORIZED)

        bookings = Booking.objects.filter(
            customer__user=request.user
        ).select_related(
            'hotel', 'customer__user'
        ).prefetch_related(
            'booking_rooms__room', 'booking_rooms__room__room_type', 'applied_offers__offer'
        ).order_by('-created_at')

        serializer = BookingSerializer(bookings, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        return self._do_cancel(request, pk)

    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        return self._do_cancel(request, pk)

    def _do_cancel(self, request, pk=None):
        booking = Booking.objects.filter(pk=pk).select_related('customer', 'customer__user').first()
        if not booking:
            return api_error("Booking not found", status_code=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, booking)

        if booking.status in ['Completed', 'Checked-out', 'Cancelled']:
            return api_error(f"Cannot cancel a booking that is already {booking.status.lower()}.")

        reason = request.data.get('reason', 'Guest requested cancellation via StayHive portal.')
        booking.status = 'Cancelled'
        booking.save()

        # Release any room status if was occupied
        for br in booking.booking_rooms.all():
            if br.room.status == 'Occupied':
                br.room.status = 'Available'
                br.room.save()

        cancellation = CancellationRequest.objects.create(
            booking=booking,
            customer=booking.customer,
            reason=reason,
            refund_applicable=True,
            refund_amount=booking.net_amount,
            status='Pending'
        )

        from apps.notifications.services import notify_customer, notify_role
        from apps.notifications.constants import TYPE_BOOKING_CANCELLED
        notify_customer(booking.customer, f"Your booking #{booking.booking_number} has been cancelled.", TYPE_BOOKING_CANCELLED)
        notify_role('RECEPTION', f"Booking #{booking.booking_number} cancelled by guest.", TYPE_BOOKING_CANCELLED)

        return api_response(
            success=True,
            message="Booking cancelled and refund request initiated successfully.",
            data={
                "booking_id": booking.id,
                "status": booking.status,
                "cancellation_id": cancellation.id,
                "refund_amount": float(booking.net_amount)
            }
        )

    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        booking = self.get_object()
        if booking.status not in ['Confirmed', 'Pending']:
            return api_error(f"Cannot check in booking with status {booking.status}")

        booking_room = booking.booking_rooms.first()
        if not booking_room:
            return api_error("No room allocated to this booking yet")

        room = booking_room.room
        staff_id = request.data.get('staff_id', 3)
        key_card = request.data.get('key_card_issued', f"KEY-{room.room_number}-A")
        notes = request.data.get('notes', 'Checked-in via reception desk')

        CheckIn.objects.create(
            booking=booking,
            room=room,
            staff_id=staff_id,
            id_verified=True,
            key_card_issued=key_card,
            notes=notes
        )

        booking.status = 'Checked-in'
        booking.save()

        room.status = 'Occupied'
        room.save()

        from apps.notifications.services import notify_customer
        from apps.notifications.constants import TYPE_CHECK_IN
        notify_customer(booking.customer, f"Check-in completed for booking #{booking.booking_number}. Room {room.room_number} assigned.", TYPE_CHECK_IN)

        return api_response(
            success=True,
            message=f"Guest checked into Room {room.room_number}. Keycard: {key_card}",
            data=BookingSerializer(booking).data
        )

    @action(detail=True, methods=['post'])
    def check_out(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'Checked-in':
            return api_error(f"Cannot check out booking with status {booking.status}")

        booking.status = 'Checked-out'
        booking.save()

        booking_room = booking.booking_rooms.first()
        if booking_room:
            room = booking_room.room
            room.status = 'Cleaning'
            room.housekeeping_status = 'Needs Cleaning'
            room.save()

            HousekeepingTask.objects.create(
                room=room,
                staff_id=4,
                task_type='Turnover Clean & Sanitize',
                priority='Urgent',
                status='Pending',
                notes=f"Checkout turnover for Booking {booking.booking_number}"
            )

        customer = booking.customer
        if customer:
            customer.total_stays += 1
            customer.total_spend += booking.net_amount
            if customer.total_spend > Decimal('100000'):
                customer.loyalty_tier = 'Platinum'
            elif customer.total_spend > Decimal('40000'):
                customer.loyalty_tier = 'Gold'
            customer.save()

        from apps.notifications.services import notify_customer, notify_department
        from apps.notifications.constants import TYPE_CHECK_OUT, TYPE_HOUSEKEEPING_TASK
        notify_customer(booking.customer, f"Checkout completed for booking #{booking.booking_number}. Thank you for staying with us!", TYPE_CHECK_OUT)
        notify_department('Housekeeping', f"Room {room.room_number if booking_room else 'suite'} vacated. Turnover cleaning required.", TYPE_HOUSEKEEPING_TASK)

        return api_response(
            success=True,
            message=f"Booking {booking.booking_number} checked out successfully. Housekeeping dispatched.",
            data=BookingSerializer(booking).data
        )


class CheckInViewSet(viewsets.ModelViewSet):
    queryset = CheckIn.objects.all().order_by('-check_in_time')
    serializer_class = CheckInSerializer
    permission_classes = [permissions.AllowAny]
