from rest_framework import serializers, viewsets, permissions, filters, status
from rest_framework.decorators import action
from apps.core.models import Service, ServiceRequest, Booking, Staff
from apps.core.utils import api_response, api_error


class ServiceSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'hotel_id', 'hotel_name', 'name', 'category', 'price', 'duration_minutes', 'is_available', 'description']


class ServiceRequestSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=10, decimal_places=2, read_only=True)
    service_category = serializers.CharField(source='service.category', read_only=True)
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    customer_name = serializers.CharField(source='booking.customer.user.get_full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'booking_id', 'booking_number', 'customer_name', 'service_id', 'service_name',
            'service_category', 'service_price', 'staff_id', 'staff_name', 'requested_at',
            'status', 'notes'
        ]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by('category', 'name')
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all().select_related('service', 'booking', 'staff').order_by('-requested_at')
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    def create(self, request, *args, **kwargs):
        booking_id = request.data.get('booking_id')
        service_id = request.data.get('service_id')
        notes = request.data.get('notes', '')

        booking = Booking.objects.get(id=booking_id)
        service = Service.objects.get(id=service_id)

        sr = ServiceRequest.objects.create(
            booking=booking,
            service=service,
            notes=notes,
            status='Pending'
        )
        return api_response(
            success=True,
            message=f"{service.name} requested successfully!",
            data=ServiceRequestSerializer(sr).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        sr = self.get_object()
        new_status = request.data.get('status')
        staff_id = request.data.get('staff_id')
        if new_status:
            sr.status = new_status
        if staff_id:
            sr.staff_id = staff_id
        sr.save()
        return api_response(
            success=True,
            message=f"Service request status updated to {sr.status}",
            data=ServiceRequestSerializer(sr).data
        )
