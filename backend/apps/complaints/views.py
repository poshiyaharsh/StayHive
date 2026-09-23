from rest_framework import serializers, viewsets, permissions, filters
from rest_framework.decorators import action
from django.utils import timezone
from apps.core.models import Complaint
from apps.core.utils import api_response, api_error


class ComplaintSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    assigned_name = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'customer_id', 'customer_name', 'booking_id', 'booking_number',
            'subject', 'category', 'priority', 'status', 'assigned_to', 'assigned_name',
            'resolution_notes', 'created_at', 'resolved_at'
        ]


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related('customer', 'customer__user', 'assigned_to', 'assigned_to__user').order_by('-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        complaint = self.get_object()
        notes = request.data.get('resolution_notes', 'Resolved by staff')
        staff_id = request.data.get('assigned_to', 3)

        complaint.status = 'Resolved'
        complaint.resolution_notes = notes
        complaint.assigned_to_id = staff_id
        complaint.resolved_at = timezone.now()
        complaint.save()

        return api_response(success=True, message="Complaint marked as resolved.", data=ComplaintSerializer(complaint).data)
