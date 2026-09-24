from rest_framework import serializers
from decimal import Decimal
from apps.core.models import (
    Booking, BookingRoom, CheckIn, Customer, Room, RoomType, Hotel, Staff, User, CancellationRequest
)


class ReceptionArrivalSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.user.phone', read_only=True)
    id_proof_type = serializers.CharField(source='customer.id_proof_type', read_only=True)
    id_proof_number = serializers.CharField(source='customer.id_proof_number', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    room_number = serializers.SerializerMethodField()
    room_type = serializers.SerializerMethodField()
    room_id = serializers.SerializerMethodField()
    nights = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_number', 'customer_id', 'customer_name', 'customer_email',
            'customer_phone', 'id_proof_type', 'id_proof_number', 'hotel_id', 'hotel_name',
            'room_id', 'room_number', 'room_type', 'check_in_date', 'check_out_date',
            'nights', 'total_guests', 'adults', 'children', 'total_amount', 'net_amount',
            'status', 'created_at'
        ]

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip() or obj.customer.user.username
        return "Valued Guest"

    def get_room_number(self, obj):
        br = obj.booking_rooms.select_related('room').first()
        return br.room.room_number if br and br.room else "Unassigned"

    def get_room_type(self, obj):
        br = obj.booking_rooms.select_related('room__room_type').first()
        return br.room.room_type.type_name if br and br.room and br.room.room_type else "Standard"

    def get_room_id(self, obj):
        br = obj.booking_rooms.first()
        return br.room_id if br else None

    def get_nights(self, obj):
        if obj.check_in_date and obj.check_out_date:
            return max(1, (obj.check_out_date - obj.check_in_date).days)
        return 1


class ReceptionDepartureSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.user.phone', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    room_number = serializers.SerializerMethodField()
    room_type = serializers.SerializerMethodField()
    room_id = serializers.SerializerMethodField()
    key_card_issued = serializers.SerializerMethodField()
    actual_check_in = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_number', 'customer_id', 'customer_name', 'customer_email',
            'customer_phone', 'hotel_id', 'hotel_name', 'room_id', 'room_number',
            'room_type', 'check_in_date', 'check_out_date', 'actual_check_in',
            'key_card_issued', 'total_guests', 'net_amount', 'status'
        ]

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip()
        return "Valued Guest"

    def get_room_number(self, obj):
        br = obj.booking_rooms.select_related('room').first()
        return br.room.room_number if br and br.room else "101"

    def get_room_type(self, obj):
        br = obj.booking_rooms.select_related('room__room_type').first()
        return br.room.room_type.type_name if br and br.room and br.room.room_type else "Suite"

    def get_room_id(self, obj):
        br = obj.booking_rooms.first()
        return br.room_id if br else None

    def get_key_card_issued(self, obj):
        ci = obj.check_ins.first()
        return ci.key_card_issued if ci else None

    def get_actual_check_in(self, obj):
        ci = obj.check_ins.first()
        return ci.check_in_time if ci else None


class ReceptionActiveStaySerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source='customer.user.phone', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    room_number = serializers.SerializerMethodField()
    room_type = serializers.SerializerMethodField()
    room_id = serializers.SerializerMethodField()
    key_card_issued = serializers.SerializerMethodField()
    actual_check_in = serializers.SerializerMethodField()
    checked_in_by = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_number', 'customer_id', 'customer_name', 'customer_phone',
            'customer_email', 'hotel_id', 'hotel_name', 'room_id', 'room_number',
            'room_type', 'check_in_date', 'check_out_date', 'actual_check_in',
            'checked_in_by', 'key_card_issued', 'total_guests', 'adults', 'children',
            'net_amount', 'status'
        ]

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip()
        return "Valued Guest"

    def get_room_number(self, obj):
        br = obj.booking_rooms.select_related('room').first()
        return br.room.room_number if br and br.room else "101"

    def get_room_type(self, obj):
        br = obj.booking_rooms.select_related('room__room_type').first()
        return br.room.room_type.type_name if br and br.room and br.room.room_type else "Deluxe Suite"

    def get_room_id(self, obj):
        br = obj.booking_rooms.first()
        return br.room_id if br else None

    def get_key_card_issued(self, obj):
        ci = obj.check_ins.first()
        return ci.key_card_issued if ci else None

    def get_actual_check_in(self, obj):
        ci = obj.check_ins.first()
        return ci.check_in_time if ci else None

    def get_checked_in_by(self, obj):
        ci = obj.check_ins.select_related('staff__user').first()
        if ci and ci.staff and ci.staff.user:
            return f"{ci.staff.user.first_name} {ci.staff.user.last_name}".strip()
        return "Front Desk"


class CheckInRequestSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=True)
    key_card_issued = serializers.CharField(required=False, allow_blank=True, max_length=50)
    remarks = serializers.CharField(required=False, allow_blank=True)


class CheckOutRequestSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    enforce_settlement = serializers.BooleanField(required=False, default=False)


class RoomStatusBoardSerializer(serializers.ModelSerializer):
    room_type_name = serializers.CharField(source='room_type.type_name', read_only=True)
    capacity = serializers.IntegerField(source='room_type.capacity', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    current_occupant = serializers.SerializerMethodField()
    active_booking_id = serializers.SerializerMethodField()
    expected_checkout = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'hotel_id', 'hotel_name', 'room_number', 'floor', 'status',
            'housekeeping_status', 'price_per_night', 'room_type_id', 'room_type_name',
            'capacity', 'current_occupant', 'active_booking_id', 'expected_checkout'
        ]

    def get_current_occupant(self, obj):
        active_br = obj.room_bookings.filter(booking__status='Checked-in').select_related('booking__customer__user').first()
        if active_br and active_br.booking.customer and active_br.booking.customer.user:
            return f"{active_br.booking.customer.user.first_name} {active_br.booking.customer.user.last_name}".strip()
        return None

    def get_active_booking_id(self, obj):
        active_br = obj.room_bookings.filter(booking__status='Checked-in').first()
        return active_br.booking_id if active_br else None

    def get_expected_checkout(self, obj):
        active_br = obj.room_bookings.filter(booking__status='Checked-in').first()
        if active_br:
            return active_br.booking.check_out_date
        return None


class ReceptionCancellationSerializer(serializers.ModelSerializer):
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    customer_name = serializers.SerializerMethodField()
    room_number = serializers.SerializerMethodField()

    class Meta:
        model = CancellationRequest
        fields = [
            'id', 'booking_id', 'booking_number', 'customer_id', 'customer_name',
            'room_number', 'reason', 'requested_at', 'refund_applicable',
            'refund_amount', 'status'
        ]

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip()
        return "Customer"

    def get_room_number(self, obj):
        br = obj.booking.booking_rooms.select_related('room').first()
        return br.room.room_number if br and br.room else None
