from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from apps.core.models import Complaint, Customer, Booking, Staff
from apps.core.utils import api_response, api_error
from apps.complaints.serializers import (
    ComplaintSerializer, ComplaintCreateSerializer, ComplaintStatusUpdateSerializer
)
from apps.complaints.permissions import ComplaintPermission, get_user_role


class ComplaintPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


STATUS_NORM_MAP = {
    'pending': 'Pending',
    'open': 'Pending',
    'in_progress': 'In Progress',
    'in progress': 'In Progress',
    'resolved': 'Resolved',
    'closed': 'Closed',
    'rejected': 'Rejected',
}

ALLOWED_TRANSITIONS = {
    'Pending': ['In Progress', 'Rejected', 'Closed'],
    'Open': ['In Progress', 'Rejected', 'Closed'],
    'In Progress': ['Resolved', 'Closed', 'Rejected'],
    'Resolved': ['Closed'],
    'Closed': [],
    'Rejected': [],
}


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related(
        'customer', 'customer__user', 'booking', 'assigned_to', 'assigned_to__user'
    ).order_by('-created_at')
    serializer_class = ComplaintSerializer
    permission_classes = [ComplaintPermission]
    pagination_class = ComplaintPagination

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_user_role(self.request.user)

        # Customer isolation
        if role == 'customer':
            customer = Customer.objects.filter(user=self.request.user).first()
            if not customer:
                return qs.none()
            return qs.filter(customer=customer)

        # Filtering for staff
        status_param = self.request.query_params.get('status')
        if status_param:
            norm_st = STATUS_NORM_MAP.get(status_param.lower(), status_param)
            if norm_st == 'Pending':
                qs = qs.filter(status__in=['Pending', 'Open'])
            else:
                qs = qs.filter(status__iexact=norm_st)

        priority = self.request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority__iexact=priority)

        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category__icontains=category)

        booking_id = self.request.query_params.get('booking_id')
        if booking_id:
            qs = qs.filter(booking_id=booking_id)

        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(subject__icontains=search) |
                Q(description__icontains=search) |
                Q(customer__user__first_name__icontains=search) |
                Q(customer__user__last_name__icontains=search)
            )

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        if 'page' in request.query_params:
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
        serializer = ComplaintCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(message="Invalid complaint data", errors=serializer.errors)

        # Derive customer from JWT
        customer = Customer.objects.filter(user=request.user).first()
        if not customer:
            return api_error("Customer profile not found for authenticated user", status_code=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        booking_id = validated_data.get('booking_id')
        booking = None
        if booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
                # Verify booking ownership if booking specified
                if booking.customer_id != customer.id:
                    return api_error("Specified booking does not belong to you.", status_code=status.HTTP_403_FORBIDDEN)
            except Booking.DoesNotExist:
                return api_error("Booking not found.", status_code=status.HTTP_404_NOT_FOUND)

        complaint = Complaint.objects.create(
            customer=customer,
            booking=booking,
            subject=validated_data['subject'],
            description=validated_data['description'],
            category=validated_data.get('category', 'General'),
            priority=validated_data.get('priority', 'Medium'),
            status='Pending',
            created_at=timezone.now()
        )

        return api_response(
            success=True,
            message="Complaint registered successfully.",
            data=ComplaintSerializer(complaint).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='my')
    def my(self, request):
        customer = Customer.objects.filter(user=request.user).first()
        if not customer:
            return api_response(success=True, data=[])

        complaints = Complaint.objects.filter(customer=customer).select_related(
            'customer', 'customer__user', 'booking', 'assigned_to', 'assigned_to__user'
        ).order_by('-created_at')

        serializer = self.get_serializer(complaints, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=True, methods=['patch', 'post'], url_path='status')
    def update_status(self, request, pk=None):
        complaint = self.get_object()
        role = get_user_role(request.user)

        target_status_raw = request.data.get('status')
        if not target_status_raw:
            return api_error("Status is required.")

        target_status = STATUS_NORM_MAP.get(target_status_raw.lower(), target_status_raw)
        curr_status = STATUS_NORM_MAP.get(complaint.status.lower(), complaint.status)

        # Validate workflow transition
        allowed = ALLOWED_TRANSITIONS.get(curr_status, [])
        if target_status not in allowed:
            return api_error(
                f"This complaint cannot be moved to the selected status. Transition from '{curr_status}' to '{target_status}' is invalid.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Permissions check on transition
        if target_status in ['Resolved', 'Closed', 'Rejected'] and role not in ['admin', 'manager']:
            return api_error("Only managerial staff can resolve or close complaints.", status_code=status.HTTP_403_FORBIDDEN)

        # Staff resolution handling
        staff = Staff.objects.filter(user=request.user).first()
        resolution = request.data.get('resolution') or request.data.get('resolution_notes')

        if target_status == 'Resolved':
            if not resolution or not str(resolution).strip():
                return api_error("Resolution notes are required when resolving a complaint.")
            complaint.resolution_notes = str(resolution).strip()
            complaint.resolved_at = timezone.now()
            if staff:
                complaint.assigned_to = staff
        elif target_status == 'In Progress':
            if staff and not complaint.assigned_to:
                complaint.assigned_to = staff

        complaint.status = target_status
        complaint.save()

        return api_response(
            success=True,
            message=f"Complaint status updated to {target_status}.",
            data=ComplaintSerializer(complaint).data
        )

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        complaint = self.get_object()
        role = get_user_role(request.user)

        if role not in ['admin', 'manager']:
            return api_error("Only managerial staff can resolve complaints.", status_code=status.HTTP_403_FORBIDDEN)

        curr_status = STATUS_NORM_MAP.get(complaint.status.lower(), complaint.status)
        if curr_status in ['Closed', 'Rejected']:
            return api_error(
                f"This complaint cannot be moved to the selected status. Cannot resolve a '{curr_status}' complaint.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        resolution = request.data.get('resolution') or request.data.get('resolution_notes')
        if not resolution or not str(resolution).strip():
            return api_error("Resolution notes are required.")

        staff = Staff.objects.filter(user=request.user).first()
        complaint.status = 'Resolved'
        complaint.resolution_notes = str(resolution).strip()
        complaint.resolved_at = timezone.now()
        if staff:
            complaint.assigned_to = staff
        complaint.save()

        return api_response(
            success=True,
            message="Complaint resolved and recorded.",
            data=ComplaintSerializer(complaint).data
        )
