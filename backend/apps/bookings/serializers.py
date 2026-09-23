from rest_framework import serializers
from datetime import datetime
from apps.core.models import (
    Booking, BookingRoom, CheckIn, Customer, Hotel, Room,
    Invoice, ServiceRequest, FoodOrder, OfferApplication, OfferPackage
)


class BookingRoomSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_type = serializers.CharField(source='room.room_type.type_name', read_only=True)
    floor = serializers.IntegerField(source='room.floor', read_only=True)

    class Meta:
        model = BookingRoom
        fields = ['id', 'booking_id', 'room_id', 'room_number', 'room_type', 'floor', 'allocated_at']


class CheckInSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)

    class Meta:
        model = CheckIn
        fields = ['id', 'booking_id', 'room_id', 'staff_id', 'room_number', 'staff_name', 'check_in_time', 'id_verified', 'key_card_issued', 'notes']


class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.user.phone', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    hotel_city = serializers.CharField(source='hotel.city', read_only=True)
    rooms = serializers.SerializerMethodField()
    check_in_record = serializers.SerializerMethodField()
    invoices = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_number', 'customer_id', 'customer_name', 'customer_email',
            'customer_phone', 'hotel_id', 'hotel_name', 'hotel_city',
            'check_in_date', 'check_out_date', 'total_guests', 'adults', 'children',
            'total_amount', 'discount_amount', 'net_amount', 'status', 'created_at',
            'rooms', 'check_in_record', 'invoices'
        ]

    def get_customer_name(self, obj):
        return f"{obj.customer.user.first_name} {obj.customer.user.last_name}"

    def get_rooms(self, obj):
        booking_rooms = obj.booking_rooms.select_related('room', 'room__room_type').all()
        return BookingRoomSerializer(booking_rooms, many=True).data

    def get_check_in_record(self, obj):
        ci = obj.check_ins.select_related('staff', 'room').first()
        return CheckInSerializer(ci).data if ci else None

    def get_invoices(self, obj):
        return list(obj.invoices.values('id', 'invoice_number', 'grand_total', 'status', 'issue_date'))
