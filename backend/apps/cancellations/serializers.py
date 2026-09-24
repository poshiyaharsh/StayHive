from decimal import Decimal
from rest_framework import serializers
from apps.core.models import CancellationRequest, Refund, Payment, Booking, Customer


class RefundSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='processed_by.user.get_full_name', read_only=True)
    booking_id = serializers.IntegerField(source='cancellation.booking_id', read_only=True)
    booking_number = serializers.CharField(source='cancellation.booking.booking_number', read_only=True)
    customer_name = serializers.CharField(source='cancellation.customer.user.get_full_name', read_only=True)
    transaction_id = serializers.CharField(source='payment.transaction_id', read_only=True)

    class Meta:
        model = Refund
        fields = [
            'id', 'cancellation_id', 'booking_id', 'booking_number', 'customer_name',
            'payment_id', 'transaction_id', 'amount', 'status',
            'processed_by', 'staff_name', 'processed_at', 'bank_reference'
        ]
        read_only_fields = ['id', 'status', 'processed_at', 'bank_reference']


class RefundCreateSerializer(serializers.Serializer):
    cancellation_id = serializers.IntegerField(required=True)
    payment_id = serializers.IntegerField(required=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, min_value=Decimal('0.01'))
    reason = serializers.CharField(required=False, allow_blank=True)


class CancellationRequestSerializer(serializers.ModelSerializer):
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)
    refunds = RefundSerializer(many=True, read_only=True)

    class Meta:
        model = CancellationRequest
        fields = [
            'id', 'booking_id', 'booking_number', 'customer_id', 'customer_name',
            'staff_id', 'staff_name', 'reason', 'requested_at', 'refund_applicable',
            'refund_amount', 'status', 'refunds'
        ]
        read_only_fields = ['id', 'customer_id', 'requested_at', 'staff_id', 'status', 'refunds']


class CancellationRequestCreateSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=True)
    reason = serializers.CharField(required=True, min_length=5)
