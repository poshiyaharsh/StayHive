import uuid
from datetime import datetime, date
from decimal import Decimal
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from apps.core.models import (
    Booking, BookingRoom, CheckIn, Customer, Hotel, Room,
    Invoice, ServiceRequest, FoodOrder, OfferPackage, OfferApplication,
    HousekeepingTask, CancellationRequest, User
)
from apps.bookings.serializers import BookingSerializer, CheckInSerializer
from apps.core.utils import api_response, api_error


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all().select_related('customer', 'customer__user', 'hotel').order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['booking_number', 'customer__user__first_name', 'customer__user__last_name', 'hotel__name', 'status']
    ordering_fields = ['check_in_date', 'check_out_date', 'net_amount', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
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
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    def retrieve(self, request, *args, **kwargs):
        booking = self.get_object()
        serializer = self.get_serializer(booking)
        data = serializer.data

        # Also attach food orders and service requests for detailed view
        data['food_orders'] = list(booking.food_orders.values('id', 'order_time', 'total_amount', 'status'))
        data['service_requests'] = list(booking.service_requests.values('id', 'service__name', 'requested_at', 'status'))
        return api_response(success=True, data=data)

    def create(self, request, *args, **kwargs):
        """
        Comprehensive booking creation with overlap checking and auto-invoice.
        """
        data = request.data
        customer_id = data.get('customer_id')
        hotel_id = data.get('hotel_id')
        room_id = data.get('room_id')
        check_in_str = data.get('check_in_date')
        check_out_str = data.get('check_out_date')
        guests = int(data.get('total_guests', 2))
        adults = int(data.get('adults', 2))
        children = int(data.get('children', 0))
        offer_code = data.get('offer_code')

        if not all([customer_id, hotel_id, room_id, check_in_str, check_out_str]):
            return api_error("Missing required booking fields (customer_id, hotel_id, room_id, check_in_date, check_out_date)")

        try:
            check_in = datetime.strptime(check_in_str, '%Y-%m-%d').date()
            check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
        except ValueError:
            return api_error("Invalid date format. Use YYYY-MM-DD")

        if check_out <= check_in:
            return api_error("Check-out date must be after check-in date")

        # Overlapping booking check
        overlapping = BookingRoom.objects.filter(
            room_id=room_id,
            booking__status__in=['Confirmed', 'Checked-in'],
            booking__check_in_date__lt=check_out,
            booking__check_out_date__gt=check_in
        ).exists()

        if overlapping:
            return api_error("Selected room is already booked for these dates. Please choose another room.")

        customer = Customer.objects.get(id=customer_id)
        hotel = Hotel.objects.get(id=hotel_id)
        room = Room.objects.get(id=room_id)

        nights = max(1, (check_out - check_in).days)
        total_amount = room.price_per_night * Decimal(nights)
        discount_amount = Decimal('0.00')

        # Check offer
        applied_offer = None
        if offer_code:
            offer = OfferPackage.objects.filter(code__iexact=offer_code, is_active=True).first()
            if offer and total_amount >= offer.min_booking_amount:
                discount_amount = (total_amount * offer.discount_percentage) / Decimal(100)
                applied_offer = offer
                offer.usage_count += 1
                offer.save()

        net_amount = total_amount - discount_amount
        booking_num = f"SH-2026-{uuid.uuid4().hex[:6].upper()}"

        booking = Booking.objects.create(
            booking_number=booking_num,
            customer=customer,
            hotel=hotel,
            check_in_date=check_in,
            check_out_date=check_out,
            total_guests=guests,
            adults=adults,
            children=children,
            total_amount=total_amount,
            discount_amount=discount_amount,
            net_amount=net_amount,
            status='Confirmed'
        )

        # Allocate room
        BookingRoom.objects.create(booking=booking, room=room)

        # Save offer application
        if applied_offer:
            OfferApplication.objects.create(booking=booking, offer=applied_offer, discount_applied=discount_amount)

        # Generate GST Invoice (18% tax)
        tax = (net_amount * Decimal('0.18')).quantize(Decimal('0.01'))
        grand_total = net_amount + tax
        inv_num = f"INV-2026-{uuid.uuid4().hex[:6].upper()}"
        Invoice.objects.create(
            invoice_number=inv_num,
            booking=booking,
            room_charges=net_amount,
            subtotal=net_amount,
            discount_amount=discount_amount,
            tax_amount=tax,
            grand_total=grand_total,
            status='Unpaid'
        )

        return api_response(
            success=True,
            message="Booking confirmed successfully!",
            data=BookingSerializer(booking).data,
            status_code=status.HTTP_201_CREATED
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
        staff_id = request.data.get('staff_id', 3)  # default reception staff
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

        # Update room status to Cleaning and create Housekeeping task
        booking_room = booking.booking_rooms.first()
        if booking_room:
            room = booking_room.room
            room.status = 'Cleaning'
            room.housekeeping_status = 'Needs Cleaning'
            room.save()

            HousekeepingTask.objects.create(
                room=room,
                staff_id=4,  # Housekeeping staff
                task_type='Turnover Clean & Sanitize',
                priority='Urgent',
                status='Pending',
                notes=f"Checkout turnover for Booking {booking.booking_number}"
            )

        # Update customer stats
        customer = booking.customer
        customer.total_stays += 1
        customer.total_spend += booking.net_amount
        if customer.total_spend > Decimal('100000'):
            customer.loyalty_tier = 'Platinum'
        elif customer.total_spend > Decimal('40000'):
            customer.loyalty_tier = 'Gold'
        customer.save()

        return api_response(
            success=True,
            message=f"Booking {booking.booking_number} checked out successfully. Housekeeping dispatched.",
            data=BookingSerializer(booking).data
        )

    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        booking = self.get_object()
        if booking.status in ['Completed', 'Checked-out']:
            return api_error("Cannot cancel an already completed stay")

        reason = request.data.get('reason', 'Guest requested cancellation')
        booking.status = 'Cancelled'
        booking.save()

        # Release room status
        for br in booking.booking_rooms.all():
            br.room.status = 'Available'
            br.room.save()

        # Create cancellation request
        cancellation = CancellationRequest.objects.create(
            booking=booking,
            customer=booking.customer,
            reason=reason,
            refund_applicable=True,
            refund_amount=booking.net_amount,
            status='Pending'
        )

        return api_response(
            success=True,
            message="Booking cancelled and refund request initiated.",
            data={"cancellation_id": cancellation.id, "refund_amount": float(booking.net_amount)}
        )


class CheckInViewSet(viewsets.ModelViewSet):
    queryset = CheckIn.objects.all().order_by('-check_in_time')
    serializer_class = CheckInSerializer
    permission_classes = [permissions.AllowAny]
