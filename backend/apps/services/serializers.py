from decimal import Decimal
from rest_framework import serializers
from apps.core.models import Service, ServiceRequest, Booking, Customer, Staff, Hotel


class ServiceSerializer(serializers.ModelSerializer):
    service_id = serializers.IntegerField(source='id', read_only=True)
    service_name = serializers.CharField(source='name', required=False)
    is_active = serializers.BooleanField(source='is_available', required=False)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'service_id', 'hotel_id', 'hotel_name', 'name', 'service_name',
            'category', 'price', 'duration_minutes', 'is_available', 'is_active', 'description'
        ]

    def create(self, validated_data):
        # Default hotel if not provided
        if 'hotel' not in validated_data and 'hotel_id' not in validated_data:
            first_hotel = Hotel.objects.first()
            if first_hotel:
                validated_data['hotel'] = first_hotel
        return super().create(validated_data)


class ServiceRequestSerializer(serializers.ModelSerializer):
    request_id = serializers.IntegerField(source='id', read_only=True)
    request_date = serializers.DateTimeField(source='requested_at', read_only=True)
    request_status = serializers.SerializerMethodField()
    remarks = serializers.CharField(source='notes', required=False, allow_blank=True)
    
    # Nested representation matching CP7 specs
    service = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()

    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=10, decimal_places=2, read_only=True)
    service_category = serializers.CharField(source='service.category', read_only=True)
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    customer_name = serializers.SerializerMethodField()
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'request_id', 'booking_id', 'booking_number',
            'service_id', 'service_name', 'service_price', 'service_category', 'service',
            'customer', 'customer_name',
            'staff_id', 'staff_name',
            'requested_at', 'request_date',
            'status', 'request_status',
            'notes', 'remarks'
        ]

    def get_request_status(self, obj):
        # Canonical lowercase: 'pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'
        status_map = {
            'Pending': 'pending',
            'Accepted': 'accepted',
            'In Progress': 'in_progress',
            'Completed': 'completed',
            'Cancelled': 'cancelled',
            'Rejected': 'rejected'
        }
        return status_map.get(obj.status, obj.status.lower().replace(' ', '_'))

    def get_service(self, obj):
        if not obj.service:
            return None
        return {
            'service_id': obj.service.id,
            'service_name': obj.service.name,
            'price': float(obj.service.price)
        }

    def get_customer(self, obj):
        if not obj.booking or not obj.booking.customer:
            return None
        cust = obj.booking.customer
        full_name = f"{cust.user.first_name} {cust.user.last_name}".strip() if cust.user else "Guest"
        return {
            'customer_id': cust.id,
            'name': full_name or cust.user.username if cust.user else "Guest"
        }

    def get_customer_name(self, obj):
        c = self.get_customer(obj)
        return c['name'] if c else "Guest"
