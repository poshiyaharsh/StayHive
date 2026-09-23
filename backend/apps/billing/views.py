import uuid
from decimal import Decimal
from rest_framework import serializers, viewsets, permissions, filters, status
from rest_framework.decorators import action
from apps.core.models import Invoice, PaymentMethod, Payment, Booking
from apps.core.utils import api_response, api_error


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'code', 'is_active']


class PaymentSerializer(serializers.ModelSerializer):
    method_name = serializers.CharField(source='payment_method.name', read_only=True)
    invoice_number = serializers.CharField(source='invoice.invoice_number', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'invoice_id', 'invoice_number', 'payment_method_id', 'method_name', 'transaction_id', 'amount', 'status', 'payment_date']


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
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'booking_id', 'booking_number', 'issue_date',
            'customer_name', 'customer_email', 'customer_phone', 'customer_address',
            'hotel_name', 'hotel_address', 'hotel_city', 'hotel_contact',
            'check_in_date', 'check_out_date',
            'room_charges', 'food_charges', 'service_charges', 'subtotal',
            'discount_amount', 'tax_amount', 'grand_total', 'status', 'payments'
        ]


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related('booking', 'booking__customer', 'booking__hotel').order_by('-issue_date')
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=True, methods=['post'])
    def pay_invoice(self, request, pk=None):
        invoice = self.get_object()
        payment_method_id = request.data.get('payment_method_id', 1)
        amount = Decimal(str(request.data.get('amount', invoice.grand_total)))
        txn_id = request.data.get('transaction_id', f"TXN-SH-{uuid.uuid4().hex[:8].upper()}")

        method = PaymentMethod.objects.get(id=payment_method_id)
        payment = Payment.objects.create(
            invoice=invoice,
            payment_method=method,
            transaction_id=txn_id,
            amount=amount,
            status='Success'
        )

        invoice.status = 'Paid'
        invoice.save()

        return api_response(
            success=True,
            message=f"Payment of ₹{amount} recorded successfully.",
            data={"payment_id": payment.id, "transaction_id": txn_id, "invoice_status": invoice.status}
        )


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.filter(is_active=True)
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.AllowAny]


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related('invoice', 'payment_method').order_by('-payment_date')
    serializer_class = PaymentSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)
