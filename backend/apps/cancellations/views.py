import uuid
from rest_framework import serializers, viewsets, permissions, filters, status
from rest_framework.decorators import action
from django.utils import timezone
from apps.core.models import CancellationRequest, Refund, Payment
from apps.core.utils import api_response, api_error


class RefundSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='processed_by.user.get_full_name', read_only=True)

    class Meta:
        model = Refund
        fields = ['id', 'cancellation_id', 'payment_id', 'amount', 'status', 'processed_by', 'staff_name', 'processed_at', 'bank_reference']


class CancellationRequestSerializer(serializers.ModelSerializer):
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    refund = RefundSerializer(source='refunds.first', read_only=True)

    class Meta:
        model = CancellationRequest
        fields = [
            'id', 'booking_id', 'booking_number', 'customer_id', 'customer_name',
            'staff_id', 'reason', 'requested_at', 'refund_applicable',
            'refund_amount', 'status', 'refund'
        ]


class CancellationRequestViewSet(viewsets.ModelViewSet):
    queryset = CancellationRequest.objects.all().select_related('booking', 'customer', 'customer__user').order_by('-requested_at')
    serializer_class = CancellationRequestSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        cancel_req = self.get_object()
        cancel_req.status = 'Approved'
        cancel_req.staff_id = request.data.get('staff_id', 2)
        cancel_req.save()

        # Update booking
        booking = cancel_req.booking
        booking.status = 'Cancelled'
        booking.save()

        # Release rooms
        for br in booking.booking_rooms.all():
            br.room.status = 'Available'
            br.room.save()

        # Issue Refund record
        first_payment = Payment.objects.filter(invoice__booking=booking).first()
        payment_id = first_payment.id if first_payment else 1
        bank_ref = f"REF-HDFC-{uuid.uuid4().hex[:6].upper()}"

        refund = Refund.objects.create(
            cancellation=cancel_req,
            payment_id=payment_id,
            amount=cancel_req.refund_amount,
            status='Completed',
            processed_by_id=cancel_req.staff_id,
            bank_reference=bank_ref
        )

        return api_response(
            success=True,
            message="Cancellation approved and refund processed successfully.",
            data={"refund_id": refund.id, "bank_reference": bank_ref, "amount": float(refund.amount)}
        )

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        cancel_req = self.get_object()
        cancel_req.status = 'Rejected'
        cancel_req.staff_id = request.data.get('staff_id', 2)
        cancel_req.save()
        return api_response(
            success=True,
            message="Cancellation request has been rejected."
        )


class RefundViewSet(viewsets.ModelViewSet):
    queryset = Refund.objects.all().order_by('-processed_at')
    serializer_class = RefundSerializer
    permission_classes = [permissions.AllowAny]
