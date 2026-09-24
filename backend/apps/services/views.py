from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.core.models import Service, ServiceRequest, Booking, Customer, Staff, Hotel
from apps.core.utils import api_response, api_error
from apps.services.serializers import ServiceSerializer, ServiceRequestSerializer
from apps.services.permissions import ServicePermission, ServiceRequestPermission


STATUS_TRANSITION_MAP = {
    'Pending': ['Accepted', 'Cancelled', 'Rejected'],
    'Accepted': ['In Progress', 'Cancelled'],
    'In Progress': ['Completed'],
    'Completed': [],
    'Cancelled': [],
    'Rejected': [],
}

STATUS_INPUT_NORM = {
    'pending': 'Pending',
    'accepted': 'Accepted',
    'in_progress': 'In Progress',
    'in progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled',
    'rejected': 'Rejected',
}


class ServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD for Hotel Services:
    - ADMIN, MANAGER: Full CRUD
    - RECEPTION: View services
    - CUSTOMER: View active services
    - HOUSEKEEPING, RESTAURANT: 403 Forbidden
    """
    queryset = Service.objects.all().select_related('hotel').order_by('category', 'name')
    serializer_class = ServiceSerializer
    permission_classes = [ServicePermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'category', 'description']
    ordering_fields = ['price', 'name', 'id']

    def get_queryset(self):
        qs = super().get_queryset()
        role = getattr(self.request.user.role, 'name', '') if getattr(self.request.user, 'role', None) else ''
        
        # Customers only see active/available services
        if role == 'CUSTOMER':
            qs = qs.filter(is_available=True)
            
        is_active_param = self.request.query_params.get('is_active')
        if is_active_param is not None:
            is_active_val = is_active_param.lower() in ['true', '1']
            qs = qs.filter(is_available=is_active_val)

        hotel_id = self.request.query_params.get('hotel_id')
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        # Support service_name and is_active inputs
        if 'service_name' in data and 'name' not in data:
            data['name'] = data['service_name']
        if 'is_active' in data and 'is_available' not in data:
            data['is_available'] = data['is_active']

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(
            success=True,
            message="Service created successfully!",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        if 'service_name' in data and 'name' not in data:
            data['name'] = data['service_name']
        if 'is_active' in data and 'is_available' not in data:
            data['is_available'] = data['is_active']

        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            success=True,
            message="Service updated successfully!",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return api_response(
            success=True,
            message=f"Service '{instance.name}' deleted successfully.",
            status_code=status.HTTP_200_OK
        )


class ServiceRequestViewSet(viewsets.ModelViewSet):
    """
    CRUD and status transitions for Guest Service Requests:
    - ADMIN, MANAGER, RECEPTION: Full management
    - CUSTOMER: Create for own active booking, view own, cancel own pending
    - HOUSEKEEPING, RESTAURANT: 403 Forbidden
    """
    queryset = ServiceRequest.objects.all().select_related(
        'service', 'booking', 'booking__customer', 'booking__customer__user', 'staff', 'staff__user'
    ).order_by('-requested_at')
    serializer_class = ServiceRequestSerializer
    permission_classes = [ServiceRequestPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['service__name', 'notes', 'booking__booking_number']
    ordering_fields = ['requested_at', 'id', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        role = getattr(self.request.user.role, 'name', '') if getattr(self.request.user, 'role', None) else ''
        
        # Enforce Customer Isolation on list: Customer can only ever see their own service requests
        if role == 'CUSTOMER' and self.action in ['list', None]:
            customer = getattr(self.request.user, 'customer_profile', None)
            if not customer:
                customer = Customer.objects.filter(user=self.request.user).first()
            if customer:
                qs = qs.filter(booking__customer=customer)
            else:
                qs = qs.none()

        status_param = self.request.query_params.get('status') or self.request.query_params.get('request_status')
        if status_param and status_param.lower() != 'all':
            norm = STATUS_INPUT_NORM.get(status_param.lower(), status_param)
            qs = qs.filter(status__iexact=norm)

        booking_id = self.request.query_params.get('booking_id')
        if booking_id:
            qs = qs.filter(booking_id=booking_id)

        service_id = self.request.query_params.get('service_id')
        if service_id:
            qs = qs.filter(service_id=service_id)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role == 'CUSTOMER':
            customer = getattr(request.user, 'customer_profile', None) or Customer.objects.filter(user=request.user).first()
            if not customer or instance.booking.customer_id != customer.id:
                return api_error("You do not have permission to view this service request.", status_code=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        booking_id = request.data.get('booking_id')
        service_id = request.data.get('service_id')
        notes = request.data.get('remarks') or request.data.get('notes', '')

        if not booking_id or not service_id:
            return api_error("Both booking_id and service_id are required.", status_code=status.HTTP_400_BAD_REQUEST)

        # 1. Booking validation
        booking = Booking.objects.filter(id=booking_id).select_related('customer', 'customer__user').first()
        if not booking:
            return api_error("Booking not found.", status_code=status.HTTP_404_NOT_FOUND)

        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role == 'CUSTOMER':
            customer = getattr(request.user, 'customer_profile', None) or Customer.objects.filter(user=request.user).first()
            if not customer or booking.customer_id != customer.id:
                return api_error("You can only request services for your own booking.", status_code=status.HTTP_403_FORBIDDEN)

        # Booking must not be cancelled, checked out, or completed
        if booking.status in ['Cancelled', 'Checked-out', 'Completed']:
            return api_error("Service requests are available only for an active stay.", status_code=status.HTTP_400_BAD_REQUEST)

        # 2. Service validation
        service = Service.objects.filter(id=service_id).first()
        if not service or not service.is_available:
            return api_error("This service is currently unavailable.", status_code=status.HTTP_400_BAD_REQUEST)

        # 3. Create service request transactionally
        with transaction.atomic():
            sr = ServiceRequest.objects.create(
                booking=booking,
                service=service,
                notes=notes,
                status='Pending',
                requested_at=timezone.now()
            )

        serializer = self.get_serializer(sr)
        return api_response(
            success=True,
            message=f"{service.name} requested successfully!",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''

        # Handle status transitions safely
        new_status_raw = request.data.get('request_status') or request.data.get('status')
        if new_status_raw:
            err = self._handle_status_transition(instance, new_status_raw, role)
            if err:
                return err

        # Remarks update if provided
        notes = request.data.get('remarks') or request.data.get('notes')
        if notes is not None:
            instance.notes = notes

        staff_id = request.data.get('staff_id')
        if staff_id and role in ['ADMIN', 'MANAGER', 'RECEPTION']:
            instance.staff_id = staff_id

        instance.save()
        serializer = self.get_serializer(instance)
        return api_response(
            success=True,
            message=f"Service request updated successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        instance = self.get_object()
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        new_status_raw = request.data.get('request_status') or request.data.get('status')
        if not new_status_raw:
            return api_error("Status is required.", status_code=status.HTTP_400_BAD_REQUEST)

        err = self._handle_status_transition(instance, new_status_raw, role)
        if err:
            return err

        staff_id = request.data.get('staff_id')
        if staff_id and role in ['ADMIN', 'MANAGER', 'RECEPTION']:
            instance.staff_id = staff_id

        instance.save()
        return api_response(
            success=True,
            message=f"Service request status updated to {instance.status}.",
            data=self.get_serializer(instance).data,
            status_code=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'], url_path='status')
    def status(self, request, pk=None):
        return self.update_status(request, pk=pk)

    @action(detail=True, methods=['patch', 'post'])
    def cancel(self, request, pk=None):
        instance = self.get_object()
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''

        if role == 'CUSTOMER':
            customer = getattr(request.user, 'customer_profile', None) or Customer.objects.filter(user=request.user).first()
            if not customer or instance.booking.customer_id != customer.id:
                return api_error("You can only cancel your own service requests.", status_code=status.HTTP_403_FORBIDDEN)
            if instance.status != 'Pending':
                return api_error("Only pending service requests can be cancelled by guest.", status_code=status.HTTP_400_BAD_REQUEST)

        err = self._handle_status_transition(instance, 'Cancelled', role)
        if err:
            return err

        instance.save()
        return api_response(
            success=True,
            message="Service request cancelled successfully.",
            data=self.get_serializer(instance).data,
            status_code=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def my(self, request):
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role != 'CUSTOMER':
            return api_error("Only customers have personal service requests.", status_code=status.HTTP_403_FORBIDDEN)

        customer = getattr(request.user, 'customer_profile', None) or Customer.objects.filter(user=request.user).first()
        if not customer:
            return api_response(success=True, data=[])

        qs = ServiceRequest.objects.filter(
            booking__customer=customer
        ).select_related(
            'service', 'booking', 'booking__customer', 'booking__customer__user', 'staff', 'staff__user'
        ).order_by('-requested_at')

        serializer = self.get_serializer(qs, many=True)
        return api_response(success=True, data=serializer.data)

    def _handle_status_transition(self, instance, new_status_raw, role):
        norm_status = STATUS_INPUT_NORM.get(new_status_raw.strip().lower())
        if not norm_status:
            return api_error(f"Invalid status '{new_status_raw}'.", status_code=status.HTTP_400_BAD_REQUEST)

        current_status = instance.status

        # Customer role cannot perform operational transitions (accept, reject, start, complete)
        if role == 'CUSTOMER':
            if norm_status != 'Cancelled':
                return api_error("Customers cannot modify operational status directly.", status_code=status.HTTP_403_FORBIDDEN)
            if current_status != 'Pending':
                return api_error("Only pending requests can be cancelled.", status_code=status.HTTP_400_BAD_REQUEST)

        if current_status in ['Completed', 'Cancelled', 'Rejected']:
            return api_error(f"Cannot transition from terminal status '{current_status}'.", status_code=status.HTTP_400_BAD_REQUEST)

        allowed_next = STATUS_TRANSITION_MAP.get(current_status, [])
        if norm_status not in allowed_next:
            return api_error(
                f"Invalid transition from '{current_status}' to '{norm_status}'. Allowed: {', '.join(allowed_next)}.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        instance.status = norm_status
        return None
