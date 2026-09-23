from rest_framework import serializers
from decimal import Decimal
from datetime import date, datetime
from apps.core.models import (
    Booking, BookingRoom, CheckIn, Customer, Hotel, Room,
    RoomType, Invoice, ServiceRequest, FoodOrder, OfferApplication, OfferPackage
)


class BookingRoomSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.room_type.type_name', read_only=True)
    floor = serializers.IntegerField(source='room.floor', read_only=True)
    price_per_night = serializers.DecimalField(source='room.price_per_night', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = BookingRoom
        fields = ['id', 'booking_id', 'room_id', 'room_number', 'room_type', 'floor', 'price_per_night', 'allocated_at']


class OfferApplicationSerializer(serializers.ModelSerializer):
    offer_code = serializers.CharField(source='offer.code', read_only=True)
    offer_title = serializers.CharField(source='offer.title', read_only=True)

    class Meta:
        model = OfferApplication
        fields = ['id', 'offer_id', 'offer_code', 'offer_title', 'discount_applied', 'applied_at']


class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.user.phone', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    hotel_city = serializers.CharField(source='hotel.city', read_only=True)
    rooms = serializers.SerializerMethodField()
    applied_offers = OfferApplicationSerializer(many=True, read_only=True)
    nights = serializers.SerializerMethodField()

    check_in_record = serializers.SerializerMethodField()
    cancellation_request = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_number', 'customer_id', 'customer_name', 'customer_email',
            'customer_phone', 'hotel_id', 'hotel_name', 'hotel_city',
            'check_in_date', 'check_out_date', 'nights', 'total_guests', 'adults', 'children',
            'total_amount', 'discount_amount', 'net_amount', 'status', 'created_at',
            'rooms', 'applied_offers', 'check_in_record', 'cancellation_request'
        ]

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip() or obj.customer.user.username
        return "Valued Guest"

    def get_nights(self, obj):
        if obj.check_in_date and obj.check_out_date:
            return max(1, (obj.check_out_date - obj.check_in_date).days)
        return 1

    def get_rooms(self, obj):
        booking_rooms = obj.booking_rooms.select_related('room', 'room__room_type').all()
        return BookingRoomSerializer(booking_rooms, many=True).data

    def get_check_in_record(self, obj):
        check_in = obj.check_ins.first()
        if check_in:
            return {
                'id': check_in.id,
                'key_card_issued': check_in.key_card_issued,
                'check_in_time': check_in.check_in_time,
                'notes': check_in.notes
            }
        return None

    def get_cancellation_request(self, obj):
        c = obj.cancellation_requests.first()
        if c:
            return {
                'id': c.id,
                'reason': c.reason,
                'status': c.status,
                'refund_amount': str(c.refund_amount),
                'requested_at': c.requested_at
            }
        return None


class CheckInSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    staff_name = serializers.SerializerMethodField()
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)

    class Meta:
        model = CheckIn
        fields = [
            'id', 'booking_id', 'booking_number', 'room_id', 'room_number',
            'staff_id', 'staff_name', 'check_in_time', 'id_verified',
            'key_card_issued', 'notes'
        ]

    def get_staff_name(self, obj):
        if obj.staff and obj.staff.user:
            return f"{obj.staff.user.first_name} {obj.staff.user.last_name}".strip()
        return "Staff"


class BookingCreateSerializer(serializers.Serializer):
    hotel_id = serializers.PrimaryKeyRelatedField(queryset=Hotel.objects.all(), source='hotel')
    room_type_id = serializers.PrimaryKeyRelatedField(queryset=RoomType.objects.all(), source='room_type', required=False)
    room_id = serializers.PrimaryKeyRelatedField(queryset=Room.objects.all(), source='room', required=False)
    customer_id = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), source='customer', required=False)
    check_in_date = serializers.DateField(required=True)
    check_out_date = serializers.DateField(required=True)
    total_guests = serializers.IntegerField(default=1, min_value=1)
    adults = serializers.IntegerField(default=1, min_value=1)
    children = serializers.IntegerField(default=0, min_value=0)
    offer_code = serializers.CharField(required=False, allow_blank=True, max_length=50)

    # Guest details if registering/updating during booking
    guest_name = serializers.CharField(required=False, allow_blank=True)
    guest_email = serializers.EmailField(required=False, allow_blank=True)
    guest_phone = serializers.CharField(required=False, allow_blank=True)
    id_proof_type = serializers.CharField(required=False, allow_blank=True)
    id_proof_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    special_notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        check_in = attrs.get('check_in_date')
        check_out = attrs.get('check_out_date')
        today = date.today()

        if check_in < today:
            raise serializers.ValidationError({"check_in_date": "Check-in date cannot be in the past."})

        if check_out <= check_in:
            raise serializers.ValidationError({"check_out_date": "Check-out date must be after check-in date."})

        room = attrs.get('room')
        room_type = attrs.get('room_type')
        if not room and not room_type:
            raise serializers.ValidationError("Either room_id or room_type_id must be provided.")

        total_guests = attrs.get('total_guests', 1)

        # Infer room_type from room if room is specified
        if room and not room_type:
            attrs['room_type'] = room.room_type
            room_type = room.room_type

        if room_type:
            if total_guests > room_type.capacity:
                raise serializers.ValidationError(
                    {"total_guests": f"Selected room type cannot accommodate {total_guests} guests (maximum capacity is {room_type.capacity})."}
                )

        return attrs
