from rest_framework import serializers
from apps.core.models import Complaint, Customer, Booking, Staff


class ComplaintSerializer(serializers.ModelSerializer):
    complaint_id = serializers.IntegerField(source='id', read_only=True)
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='customer.user.email', read_only=True)
    assigned_name = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)
    resolved_by = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    complaint_date = serializers.DateTimeField(source='created_at', read_only=True)
    resolution = serializers.CharField(source='resolution_notes', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'complaint_id', 'customer_id', 'customer_name', 'customer_email',
            'booking_id', 'booking_number', 'subject', 'description', 'category',
            'priority', 'status', 'assigned_to', 'assigned_name', 'resolved_by',
            'resolution_notes', 'resolution', 'created_at', 'complaint_date', 'resolved_at'
        ]
        read_only_fields = [
            'id', 'complaint_id', 'customer_id', 'assigned_to', 'assigned_name',
            'resolved_by', 'created_at', 'complaint_date', 'resolved_at'
        ]


class ComplaintCreateSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200, required=True)
    description = serializers.CharField(required=True, allow_blank=False)
    booking_id = serializers.IntegerField(required=False, allow_null=True)
    category = serializers.CharField(max_length=100, required=False, default='General')
    priority = serializers.CharField(max_length=20, required=False, default='Medium')

    def validate_subject(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Subject is required.")
        return value.strip()

    def validate_description(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Description is required.")
        return value.strip()


class ComplaintStatusUpdateSerializer(serializers.Serializer):
    status = serializers.CharField(required=True)
    resolution = serializers.CharField(required=False, allow_blank=True)
    resolution_notes = serializers.CharField(required=False, allow_blank=True)
