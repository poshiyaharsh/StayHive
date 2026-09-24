import uuid
from decimal import Decimal
from datetime import date
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Q, Count
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.models import Invoice, PaymentMethod, Payment, Booking, Customer, Staff, Refund
from apps.core.utils import api_response, api_error
from apps.billing.services import (
    generate_or_get_invoice, calculate_invoice_totals,
    calculate_paid_amount, calculate_outstanding_balance,
    quantize_money
)
from apps.billing.serializers import (
    InvoiceSerializer, InvoiceCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer,
    PaymentMethodSerializer
)
from apps.billing.permissions import (
    BillingPermission, PaymentMethodPermission, get_user_role
)


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related(
        'booking', 'booking__customer', 'booking__customer__user', 'booking__hotel'
    ).prefetch_related(
        'payments', 'payments__payment_method', 'booking__booking_rooms__room'
    ).order_by('-issue_date', '-id')
    serializer_class = InvoiceSerializer
    permission_classes = [BillingPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_user_role(self.request.user)

        # Customer isolation
        if role == 'customer':
            qs = qs.filter(booking__customer__user=self.request.user)

        # Filters
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status__iexact=status_param.replace('_', ' '))

        booking_id = self.request.query_params.get('booking_id')
        if booking_id:
            qs = qs.filter(booking_id=booking_id)

        customer_id = self.request.query_params.get('customer_id')
        if customer_id and role in ['admin', 'manager', 'reception']:
            qs = qs.filter(booking__customer_id=customer_id)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(invoice_number__icontains=search) |
                Q(booking__booking_number__icontains=search) |
                Q(booking__customer__user__first_name__icontains=search) |
                Q(booking__customer__user__last_name__icontains=search)
            )

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(issue_date__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(issue_date__date__lte=date_to)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        """Idempotent invoice creation/generation."""
        serializer = InvoiceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Invoice creation data invalid", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data['booking_id']
        force_recalc = serializer.validated_data.get('force_recalculate', False)

        booking = Booking.objects.filter(id=booking_id).first()
        if not booking:
            return api_error("Booking not found.", status_code=status.HTTP_404_NOT_FOUND)

        role = get_user_role(request.user)
        if role == 'customer':
            customer = Customer.objects.filter(user=request.user).first()
            if not customer or booking.customer_id != customer.id:
                return api_error("You are not authorized to create invoices for this booking.", status_code=status.HTTP_403_FORBIDDEN)

        invoice = generate_or_get_invoice(booking, force_recalculate=force_recalc)
        out_serializer = InvoiceSerializer(invoice)
        return api_response(
            success=True,
            message="Invoice ready.",
            data=out_serializer.data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='generate')
    def generate(self, request, pk=None):
        """Explicitly regenerate / recalculate an invoice."""
        invoice = self.get_object()
        if invoice.status in ['Paid', 'Refunded', 'Partially Refunded']:
            return api_error("Cannot recalculate settled or refunded invoices.", status_code=status.HTTP_400_BAD_REQUEST)

        invoice = generate_or_get_invoice(invoice.booking, force_recalculate=True)
        return api_response(
            success=True,
            message="Invoice recalculated successfully.",
            data=InvoiceSerializer(invoice).data
        )

    @action(detail=False, methods=['get'], url_path='my')
    def my_invoices(self, request):
        """Customer-specific invoice list."""
        customer = Customer.objects.filter(user=request.user).first()
        if not customer:
            return api_response(success=True, data=[])

        invoices = Invoice.objects.filter(
            booking__customer=customer
        ).select_related(
            'booking', 'booking__hotel'
        ).prefetch_related(
            'payments', 'payments__payment_method'
        ).order_by('-issue_date')

        serializer = InvoiceSerializer(invoices, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=True, methods=['get'], url_path='payments')
    def invoice_payments(self, request, pk=None):
        """List all payments for a specific invoice."""
        invoice = self.get_object()
        payments = invoice.payments.select_related('payment_method').order_by('-payment_date')
        serializer = PaymentSerializer(payments, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=False, methods=['get'], url_path='stats')
    def billing_stats(self, request):
        """Admin/Manager dashboard financial analytics."""
        role = get_user_role(request.user)
        if role not in ['admin', 'manager', 'reception']:
            return api_error("Access denied to billing statistics.", status_code=status.HTTP_403_FORBIDDEN)

        today = date.today()

        invoices_today = Invoice.objects.filter(issue_date__date=today).count()
        total_invoices = Invoice.objects.count()

        payments_today = Payment.objects.filter(
            payment_date__date=today,
            status='Success'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_collected = Payment.objects.filter(
            status='Success'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        total_billed = Invoice.objects.aggregate(total=Sum('grand_total'))['total'] or Decimal('0.00')
        outstanding = max(Decimal('0.00'), total_billed - total_collected)

        refunds_total = Refund.objects.filter(
            status__in=['Completed', 'Initiated']
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        status_counts = {
            'paid': Invoice.objects.filter(status='Paid').count(),
            'partially_paid': Invoice.objects.filter(status='Partially Paid').count(),
            'unpaid': Invoice.objects.filter(status='Unpaid').count(),
            'refunded': Invoice.objects.filter(status='Refunded').count(),
            'partially_refunded': Invoice.objects.filter(status='Partially Refunded').count(),
        }

        data = {
            'invoices_today': invoices_today,
            'total_invoices': total_invoices,
            'collected_today': float(quantize_money(payments_today)),
            'total_collected': float(quantize_money(total_collected)),
            'total_outstanding': float(quantize_money(outstanding)),
            'total_refunds': float(quantize_money(refunds_total)),
            'status_counts': status_counts
        }
        return api_response(success=True, data=data)

    @action(detail=True, methods=['post'], url_path='pay')
    def pay_invoice(self, request, pk=None):
        """Direct payment action on invoice."""
        invoice = self.get_object()
        serializer = PaymentCreateSerializer(data={
            'invoice_id': invoice.id,
            'payment_method_id': request.data.get('payment_method_id', 1),
            'amount': request.data.get('amount', invoice.grand_total),
            'transaction_id': request.data.get('transaction_id', '')
        })
        if not serializer.is_valid():
            return api_error("Payment data invalid.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        # Delegate to common payment creation logic
        return _process_payment(request, serializer.validated_data)

    @action(detail=True, methods=['post'], url_path='pay_invoice')
    def pay_invoice_alias(self, request, pk=None):
        return self.pay_invoice(request, pk=pk)


def _process_payment(request, validated_data):
    """Atomic payment processing with select_for_update and overpayment check."""
    invoice_id = validated_data['invoice_id']
    payment_method_id = validated_data['payment_method_id']
    amount = quantize_money(validated_data['amount'])
    txn_id_input = validated_data.get('transaction_id', '').strip()

    if amount <= Decimal('0.00'):
        return api_error("Payment amount must be greater than zero.", status_code=status.HTTP_400_BAD_REQUEST)

    role = get_user_role(request.user)

    with transaction.atomic():
        # 1. Lock invoice row
        invoice = Invoice.objects.select_for_update().filter(id=invoice_id).select_related(
            'booking', 'booking__customer'
        ).first()

        if not invoice:
            return api_error("Invoice not found.", status_code=status.HTTP_404_NOT_FOUND)

        # 2. Check customer authorization
        if role == 'customer':
            customer = Customer.objects.filter(user=request.user).first()
            if not customer or invoice.booking.customer_id != customer.id:
                return api_error("You are not authorized to make payments for this invoice.", status_code=status.HTTP_403_FORBIDDEN)

        # 3. Check status
        if invoice.status == 'Paid':
            return api_error("This invoice has already been fully paid.", status_code=status.HTTP_400_BAD_REQUEST)
        if invoice.status == 'Cancelled':
            return api_error("This invoice has been cancelled.", status_code=status.HTTP_400_BAD_REQUEST)

        # 4. Check payment method
        method = PaymentMethod.objects.filter(id=payment_method_id, is_active=True).first()
        if not method:
            return api_error("Invalid or inactive payment method.", status_code=status.HTTP_400_BAD_REQUEST)

        # 5. Check outstanding balance
        outstanding = calculate_outstanding_balance(invoice)
        if outstanding <= Decimal('0.00'):
            invoice.status = 'Paid'
            invoice.save(update_fields=['status'])
            return api_error("This invoice has already been fully paid.", status_code=status.HTTP_400_BAD_REQUEST)

        if amount > outstanding:
            return api_error("Payment exceeds the outstanding balance.", status_code=status.HTTP_400_BAD_REQUEST)

        # 6. Generate transaction ID if omitted
        txn_id = txn_id_input or f"TXN-{method.code}-{uuid.uuid4().hex[:8].upper()}"

        # 7. Create payment
        payment = Payment.objects.create(
            invoice=invoice,
            payment_method=method,
            transaction_id=txn_id,
            amount=amount,
            status='Success',
            payment_date=timezone.now()
        )

        # 8. Recalculate total paid
        total_paid = calculate_paid_amount(invoice)
        if total_paid >= invoice.grand_total:
            invoice.status = 'Paid'
        else:
            invoice.status = 'Partially Paid'
        invoice.save(update_fields=['status'])

    return api_response(
        success=True,
        message=f"Payment of ₹{amount} recorded successfully.",
        data={
            "payment_id": payment.id,
            "invoice_id": invoice.id,
            "invoice_number": invoice.invoice_number,
            "transaction_id": payment.transaction_id,
            "amount": float(payment.amount),
            "invoice_status": invoice.status,
            "outstanding_balance": float(calculate_outstanding_balance(invoice))
        },
        status_code=status.HTTP_201_CREATED
    )


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().select_related(
        'invoice', 'payment_method', 'invoice__booking',
        'invoice__booking__customer', 'invoice__booking__customer__user'
    ).order_by('-payment_date', '-id')
    serializer_class = PaymentSerializer
    permission_classes = [BillingPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_user_role(self.request.user)

        if role == 'customer':
            qs = qs.filter(invoice__booking__customer__user=self.request.user)

        invoice_id = self.request.query_params.get('invoice_id')
        if invoice_id:
            qs = qs.filter(invoice_id=invoice_id)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = PaymentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Payment data invalid", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        return _process_payment(request, serializer.validated_data)


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.filter(is_active=True).order_by('id')
    serializer_class = PaymentMethodSerializer
    permission_classes = [PaymentMethodPermission]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)
