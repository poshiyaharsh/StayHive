from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from apps.core.models import Inquiry, Customer, Staff
from apps.core.utils import api_response, api_error
from apps.inquiries.serializers import (
    InquirySerializer, InquiryCreateSerializer, InquiryReplySerializer
)
from apps.inquiries.permissions import InquiryPermission, get_user_role


class InquiryPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all().select_related(
        'customer', 'customer__user', 'assigned_to', 'assigned_to__user'
    ).order_by('-created_at')
    serializer_class = InquirySerializer
    permission_classes = [InquiryPermission]
    pagination_class = InquiryPagination

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_user_role(self.request.user)

        # Customer isolation: customers only see their own inquiries (never anonymous)
        if role == 'customer':
            customer = Customer.objects.filter(user=self.request.user).first()
            if not customer:
                return qs.none()
            return qs.filter(customer=customer)

        # Anonymous users cannot list inquiries
        if not self.request.user or not self.request.user.is_authenticated:
            return qs.none()

        # Staff filters
        status_param = self.request.query_params.get('status')
        if status_param:
            st = status_param.lower()
            if st in ['pending', 'new']:
                qs = qs.filter(status__in=['New', 'Pending'])
            else:
                qs = qs.filter(status__iexact=status_param)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(customer_name__icontains=search) |
                Q(email__icontains=search) |
                Q(subject__icontains=search) |
                Q(message__icontains=search)
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
        serializer = InquiryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(message="Invalid inquiry details", errors=serializer.errors)

        validated_data = serializer.validated_data

        # Determine customer from authentication (never trust frontend customer_id)
        customer = None
        if request.user and request.user.is_authenticated:
            customer = Customer.objects.filter(user=request.user).first()

        inquiry = Inquiry.objects.create(
            customer=customer,
            customer_name=validated_data['customer_name'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            subject=validated_data['subject'],
            message=validated_data['message'],
            status='New',
            created_at=timezone.now()
        )

        from apps.notifications.services import notify_role
        from apps.notifications.constants import TYPE_INQUIRY_RECEIVED
        notify_role('RECEPTION', f"New customer inquiry from {inquiry.customer_name}: '{inquiry.subject}'.", TYPE_INQUIRY_RECEIVED)

        return api_response(
            success=True,
            message="Your inquiry has been submitted successfully.",
            data=InquirySerializer(inquiry).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='my')
    def my(self, request):
        if not request.user or not request.user.is_authenticated:
            return api_error("Authentication required.", status_code=status.HTTP_401_UNAUTHORIZED)

        customer = Customer.objects.filter(user=request.user).first()
        if not customer:
            return api_response(success=True, data=[])

        # Strictly customer's own inquiries, never anonymous (customer_id is null)
        inquiries = Inquiry.objects.filter(customer=customer).select_related(
            'customer', 'customer__user', 'assigned_to', 'assigned_to__user'
        ).order_by('-created_at')

        serializer = self.get_serializer(inquiries, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        role = get_user_role(request.user)
        if role not in ['admin', 'manager', 'reception', 'staff']:
            return api_error("Only staff or administrators can respond to inquiries.", status_code=status.HTTP_403_FORBIDDEN)

        inquiry = self.get_object()
        serializer = InquiryReplySerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(message="Invalid response data", errors=serializer.errors)

        reply_message = serializer.validated_data['response']
        staff = Staff.objects.filter(user=request.user).first()

        inquiry.response = str(reply_message).strip()
        inquiry.status = 'Responded'
        if staff:
            inquiry.assigned_to = staff
        inquiry.responded_at = timezone.now()
        inquiry.save()

        if inquiry.customer:
            from apps.notifications.services import notify_customer
            from apps.notifications.constants import TYPE_INQUIRY_RESPONDED
            notify_customer(inquiry.customer, f"Your inquiry '{inquiry.subject}' has received an official response.", TYPE_INQUIRY_RESPONDED)

        return api_response(
            success=True,
            message="Inquiry response sent successfully.",
            data=InquirySerializer(inquiry).data
        )
