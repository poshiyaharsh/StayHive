import uuid
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from django.db.models import Sum, Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.models import CancellationRequest, Refund, Payment, Booking, Room, Staff, Customer, Invoice
from apps.core.utils import api_response, api_error
from apps.billing.services import (
    calculate_paid_amount, calculate_refunded_amount,
    calculate_refundable_amount, quantize_money
)
from apps.billing.permissions import get_user_role
from apps.cancellations.permissions import CancellationPermission
from apps.cancellations.serializers import (
    CancellationRequestSerializer, CancellationRequestCreateSerializer,
    RefundSerializer, RefundCreateSerializer
)
from apps.notifications.services import notify_role, notify_customer
from apps.notifications.constants import TYPE_REFUND_COMPLETED, TYPE_BOOKING_CANCELLED



class CancellationRequestViewSet(viewsets.ModelViewSet):
    queryset = CancellationRequest.objects.all().select_related(
        'booking', 'customer', 'customer__user', 'staff', 'staff__user'
    ).prefetch_related(
        'refunds', 'refunds__payment'
    ).order_by('-requested_at')
    serializer_class = CancellationRequestSerializer
    permission_classes = [CancellationPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_user_role(self.request.user)

        if role == 'customer':
            qs = qs.filter(customer__user=self.request.user)

        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status__iexact=status_param)

        booking_id = self.request.query_params.get('booking_id')
        if booking_id:
            qs = qs.filter(booking_id=booking_id)

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
        """Customer or staff creates a cancellation request."""
        serializer = CancellationRequestCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Cancellation request data invalid.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        booking_id = serializer.validated_data['booking_id']
        reason = serializer.validated_data['reason']

        booking = Booking.objects.select_related('customer').filter(id=booking_id).first()
        if not booking:
            return api_error("Booking not found.", status_code=status.HTTP_404_NOT_FOUND)

        role = get_user_role(request.user)
        if role == 'customer':
            customer = Customer.objects.filter(user=request.user).first()
            if not customer or booking.customer_id != customer.id:
                return api_error("You are not authorized to cancel this booking.", status_code=status.HTTP_403_FORBIDDEN)
        else:
            customer = booking.customer

        # Validate booking status
        if booking.status == 'Cancelled':
            return api_error("This booking has already been cancelled.", status_code=status.HTTP_400_BAD_REQUEST)
        if booking.status in ['Checked-in', 'Checked-out', 'Completed']:
            return api_error(f"Cannot cancel a booking with status '{booking.status}'.", status_code=status.HTTP_400_BAD_REQUEST)

        # Check existing pending cancellation
        existing = CancellationRequest.objects.filter(booking=booking, status='Pending').first()
        if existing:
            return api_error("A cancellation request is already pending for this booking.", status_code=status.HTTP_400_BAD_REQUEST)

        # Determine potential refundable amount from payments
        invoice = Invoice.objects.filter(booking=booking).first()
        total_paid = calculate_paid_amount(invoice) if invoice else Decimal('0.00')

        cancel_req = CancellationRequest.objects.create(
            booking=booking,
            customer=customer,
            reason=reason,
            requested_at=timezone.now(),
            refund_applicable=(total_paid > Decimal('0.00')),
            refund_amount=total_paid,
            status='Pending'
        )

        # Notify staff of cancellation request
        notify_role("RECEPTION", f"Cancellation requested for booking #{booking.booking_number or booking.id}.", notification_type=TYPE_BOOKING_CANCELLED, title="Cancellation Requested")
        notify_role("ADMIN", f"Cancellation requested for booking #{booking.booking_number or booking.id}.", notification_type=TYPE_BOOKING_CANCELLED, title="Cancellation Requested")
        notify_role("MANAGER", f"Cancellation requested for booking #{booking.booking_number or booking.id}.", notification_type=TYPE_BOOKING_CANCELLED, title="Cancellation Requested")

        return api_response(
            success=True,
            message="Cancellation request submitted successfully.",
            data=CancellationRequestSerializer(cancel_req).data,
            status_code=status.HTTP_201_CREATED
        )

    def partial_update(self, request, *args, **kwargs):
        """Staff action: approve or reject cancellation request."""
        cancel_req = self.get_object()
        role = get_user_role(request.user)
        if role not in ['admin', 'manager']:
            return api_error("Only Admin or Manager can process cancellation requests.", status_code=status.HTTP_403_FORBIDDEN)

        status_input = request.data.get('status', '').capitalize()
        if status_input == 'Approved':
            return self._approve_cancellation(request, cancel_req)
        elif status_input == 'Rejected':
            return self._reject_cancellation(request, cancel_req)
        else:
            return api_error("Invalid status. Supported: Approved, Rejected.", status_code=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        cancel_req = self.get_object()
        return self._approve_cancellation(request, cancel_req)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        cancel_req = self.get_object()
        return self._reject_cancellation(request, cancel_req)

    def _approve_cancellation(self, request, cancel_req):
        role = get_user_role(request.user)
        if role not in ['admin', 'manager', 'reception']:
            return api_error("Only staff can approve cancellation requests.", status_code=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            cancel_req = CancellationRequest.objects.select_for_update().get(id=cancel_req.id)
            if cancel_req.status != 'Pending':
                return api_error(f"Cannot approve request with current status '{cancel_req.status}'.", status_code=status.HTTP_400_BAD_REQUEST)

            booking = Booking.objects.select_for_update().get(id=cancel_req.booking_id)

            staff = Staff.objects.filter(user=request.user).first()
            if not staff:
                staff = Staff.objects.first()

            cancel_req.status = 'Approved'
            cancel_req.staff = staff
            cancel_req.save()

            booking.status = 'Cancelled'
            booking.save()

            # Release rooms to available
            for br in booking.booking_rooms.select_related('room').all():
                if br.room:
                    br.room.status = 'Available'
                    br.room.save(update_fields=['status'])

            # Refund calculation
            created_refund = None
            invoice = Invoice.objects.select_for_update().filter(booking=booking).first()
            if invoice:
                # Find successful payments
                payments = Payment.objects.select_for_update().filter(invoice=invoice, status='Success').order_by('id')
                total_paid = sum((p.amount for p in payments), Decimal('0.00'))

                already_refunded = Refund.objects.filter(
                    payment__invoice=invoice,
                    status__in=['Completed', 'Initiated', 'Processing']
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

                max_refundable = max(Decimal('0.00'), total_paid - already_refunded)

                # Determine refund amount
                req_refund = cancel_req.refund_amount if cancel_req.refund_applicable else Decimal('0.00')
                refund_amount = min(req_refund, max_refundable)

                if refund_amount > Decimal('0.00'):
                    # Find payment to attach refund
                    target_payment = None
                    for p in payments:
                        rem = calculate_refundable_amount(p)
                        if rem > Decimal('0.00'):
                            target_payment = p
                            break

                    if not target_payment:
                        target_payment = payments.first()

                    if target_payment:
                        bank_ref = f"REF-{uuid.uuid4().hex[:8].upper()}"
                        created_refund = Refund.objects.create(
                            cancellation=cancel_req,
                            payment=target_payment,
                            amount=refund_amount,
                            status='Completed',
                            processed_by=staff,
                            processed_at=timezone.now(),
                            bank_reference=bank_ref
                        )

                        # Update invoice status
                        new_total_refunded = already_refunded + refund_amount
                        if new_total_refunded >= total_paid:
                            invoice.status = 'Refunded'
                        else:
                            invoice.status = 'Partially Refunded'
                        invoice.save(update_fields=['status'])

        if created_refund and booking.customer:
            notify_customer(
                booking.customer,
                f"Refund of ₹{created_refund.amount} for booking #{booking.booking_number or booking.id} has been completed.",
                notification_type=TYPE_REFUND_COMPLETED,
                title="Refund Completed"
            )

        return api_response(
            success=True,
            message="Cancellation approved and refund processed successfully.",
            data={
                "cancellation_id": cancel_req.id,
                "booking_status": booking.status,
                "refund": RefundSerializer(created_refund).data if created_refund else None
            }
        )

    def _reject_cancellation(self, request, cancel_req):
        role = get_user_role(request.user)
        if role not in ['admin', 'manager', 'reception']:
            return api_error("Only staff can reject cancellation requests.", status_code=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            cancel_req = CancellationRequest.objects.select_for_update().get(id=cancel_req.id)
            if cancel_req.status != 'Pending':
                return api_error(f"Cannot reject request with current status '{cancel_req.status}'.", status_code=status.HTTP_400_BAD_REQUEST)

            staff = Staff.objects.filter(user=request.user).first() or Staff.objects.first()
            cancel_req.status = 'Rejected'
            cancel_req.staff = staff
            cancel_req.save()

        return api_response(
            success=True,
            message="Cancellation request has been rejected."
        )


class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all().select_related(
        'cancellation', 'cancellation__booking', 'cancellation__customer',
        'cancellation__customer__user', 'payment', 'processed_by', 'processed_by__user'
    ).order_by('-processed_at')
    serializer_class = RefundSerializer
    permission_classes = [CancellationPermission]

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_user_role(self.request.user)

        if role == 'customer':
            qs = qs.filter(cancellation__customer__user=self.request.user)

        cancellation_id = self.request.query_params.get('cancellation_id')
        if cancellation_id:
            qs = qs.filter(cancellation_id=cancellation_id)

        payment_id = self.request.query_params.get('payment_id')
        if payment_id:
            qs = qs.filter(payment_id=payment_id)

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
        """Staff manually creates/processes a refund."""
        role = get_user_role(request.user)
        if role not in ['admin', 'manager', 'reception']:
            return api_error("Only staff can process refunds.", status_code=status.HTTP_403_FORBIDDEN)

        serializer = RefundCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Refund data invalid.", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

        cancellation_id = serializer.validated_data['cancellation_id']

        with transaction.atomic():
            cancel_req = CancellationRequest.objects.select_for_update().filter(id=cancellation_id).first()
            if not cancel_req:
                return api_error("Cancellation request not found.", status_code=status.HTTP_404_NOT_FOUND)

            if cancel_req.status != 'Approved':
                return api_error("Cannot issue refund for non-approved cancellation request.", status_code=status.HTTP_400_BAD_REQUEST)

            booking = cancel_req.booking
            invoice = Invoice.objects.select_for_update().filter(booking=booking).first()
            if not invoice:
                return api_error("No invoice found for this booking.", status_code=status.HTTP_400_BAD_REQUEST)

            # Determine payment to refund against
            payment_id = serializer.validated_data.get('payment_id')
            if payment_id:
                payment = Payment.objects.select_for_update().filter(id=payment_id, invoice=invoice).first()
                if not payment:
                    return api_error("Payment not found for this invoice.", status_code=status.HTTP_400_BAD_REQUEST)
            else:
                payment = Payment.objects.select_for_update().filter(invoice=invoice, status='Success').first()
                if not payment:
                    return api_error("No successful payment found to refund.", status_code=status.HTTP_400_BAD_REQUEST)

            # Calculate refundable amount
            refundable = calculate_refundable_amount(payment)
            if refundable <= Decimal('0.00'):
                return api_error("Refund has already been processed for this payment.", status_code=status.HTTP_400_BAD_REQUEST)

            requested_amount = serializer.validated_data.get('amount')
            refund_amount = quantize_money(requested_amount) if requested_amount else refundable

            if refund_amount > refundable:
                return api_error("Refund amount exceeds the refundable amount.", status_code=status.HTTP_400_BAD_REQUEST)

            staff = Staff.objects.filter(user=request.user).first() or Staff.objects.first()
            bank_ref = f"REF-{uuid.uuid4().hex[:8].upper()}"

            refund = Refund.objects.create(
                cancellation=cancel_req,
                payment=payment,
                amount=refund_amount,
                status='Completed',
                processed_by=staff,
                processed_at=timezone.now(),
                bank_reference=bank_ref
            )

            # Update invoice payment status
            total_paid = calculate_paid_amount(invoice)
            total_refunded = Refund.objects.filter(
                payment__invoice=invoice,
                status__in=['Completed', 'Initiated', 'Processing']
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            if total_refunded >= total_paid:
                invoice.status = 'Refunded'
            else:
                invoice.status = 'Partially Refunded'
            invoice.save(update_fields=['status'])

        if cancel_req.booking and cancel_req.booking.customer:
            notify_customer(
                cancel_req.booking.customer,
                f"Refund of ₹{refund.amount} for booking #{cancel_req.booking.booking_number or cancel_req.booking.id} has been completed.",
                notification_type=TYPE_REFUND_COMPLETED,
                title="Refund Completed"
            )

        return api_response(
            success=True,
            message="Refund processed successfully.",
            data=RefundSerializer(refund).data,
            status_code=status.HTTP_201_CREATED
        )
