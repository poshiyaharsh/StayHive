from decimal import Decimal
from rest_framework import serializers
from apps.core.models import Invoice, PaymentMethod, Payment, Booking, Customer
from apps.billing.services import (
    calculate_paid_amount, calculate_outstanding_balance, quantize_money
)


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'code', 'is_active']


class PaymentSerializer(serializers.ModelSerializer):
    method_name = serializers.CharField(source='payment_method.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)
    booking_id = serializers.IntegerField(source='invoice.booking_id', read_only=True)
    booking_number = serializers.CharField(source='invoice.booking.booking_number', read_only=True)
    customer_name = serializers.CharField(source='invoice.booking.customer.user.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'invoice_id', 'invoice_number', 'booking_id', 'booking_number',
            'customer_name', 'payment_method_id', 'method_name', 'transaction_id',
            'amount', 'status', 'payment_date'
        ]
        read_only_fields = ['id', 'status', 'payment_date']


class PaymentCreateSerializer(serializers.Serializer):
    invoice_id = serializers.IntegerField(required=True)
    payment_method_id = serializers.IntegerField(required=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True, min_value=Decimal('0.01'))
    transaction_id = serializers.CharField(max_length=100, required=False, allow_blank=True)


class InvoiceSerializer(serializers.ModelSerializer):
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    customer_name = serializers.CharField(source='booking.customer.user.get_full_name', read_only=True)
    customer_email = serializers.CharField(source='booking.customer.user.email', read_only=True)
    customer_phone = serializers.CharField(source='booking.customer.user.phone', read_only=True)
    customer_address = serializers.CharField(source='booking.customer.address', read_only=True)
    hotel_name = serializers.CharField(source='booking.hotel.name', read_only=True)
    hotel_address = serializers.CharField(source='booking.hotel.address', read_only=True)
    hotel_city = serializers.CharField(source='booking.hotel.city', read_only=True)
    hotel_contact = serializers.CharField(source='booking.hotel.contact_number', read_only=True)
    check_in_date = serializers.DateField(source='booking.check_in_date', read_only=True)
    check_out_date = serializers.DateField(source='booking.check_out_date', read_only=True)
    number_of_nights = serializers.SerializerMethodField()
    paid_amount = serializers.SerializerMethodField()
    outstanding_balance = serializers.SerializerMethodField()
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'booking_id', 'booking_number', 'issue_date',
            'customer_name', 'customer_email', 'customer_phone', 'customer_address',
            'hotel_name', 'hotel_address', 'hotel_city', 'hotel_contact',
            'check_in_date', 'check_out_date', 'number_of_nights',
            'room_charges', 'food_charges', 'service_charges', 'subtotal',
            'discount_amount', 'tax_amount', 'grand_total', 'status',
            'paid_amount', 'outstanding_balance', 'payments'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'issue_date', 'room_charges', 'food_charges',
            'service_charges', 'subtotal', 'discount_amount', 'tax_amount',
            'grand_total', 'status', 'payments'
        ]

    def get_number_of_nights(self, obj) -> int:
        if obj.booking and obj.booking.check_in_date and obj.booking.check_out_date:
            return max(1, (obj.booking.check_out_date - obj.booking.check_in_date).days)
        return 1

    def get_paid_amount(self, obj) -> str:
        return str(calculate_paid_amount(obj))

    def get_outstanding_balance(self, obj) -> str:
        return str(calculate_outstanding_balance(obj))


class InvoiceCreateSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=True)
    force_recalculate = serializers.BooleanField(required=False, default=False)
