from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.models import Customer, User
from apps.customers.serializers import CustomerSerializer, CustomerProfileSerializer
from apps.core.utils import api_response, api_error


class CustomerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['ADMIN', 'MANAGER', 'RECEPTION']:
            return True

        # Customer role can ONLY view and update their own record
        if role == 'CUSTOMER':
            return obj.user_id == request.user.id

        return False


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().select_related('user').order_by('-total_spend')
    serializer_class = CustomerSerializer
    permission_classes = [CustomerPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'user__phone', 'loyalty_tier']
    ordering_fields = ['total_stays', 'total_spend', 'created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user or not user.is_authenticated:
            return qs.none()

        role = getattr(user.role, 'name', '') if getattr(user, 'role', None) else ''
        # Customer is strictly isolated to their own customer profile
        if role == 'CUSTOMER':
            return qs.filter(user=user)

        city = self.request.query_params.get('city')
        loyalty = self.request.query_params.get('loyalty_tier')
        if city:
            qs = qs.filter(user__first_name__icontains=city) | qs.filter(address__icontains=city)
        if loyalty:
            qs = qs.filter(loyalty_tier__iexact=loyalty)
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
        pk = kwargs.get('pk')
        customer = Customer.objects.filter(pk=pk).select_related('user').first()
        if not customer:
            return api_error("Customer not found", status_code=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, customer)
        data = self.get_serializer(customer).data
        data['bookings'] = list(customer.bookings.values('id', 'booking_number', 'check_in_date', 'check_out_date', 'net_amount', 'status'))
        return api_response(success=True, data=data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        pk = kwargs.get('pk')
        customer = Customer.objects.filter(pk=pk).select_related('user').first()
        if not customer:
            return api_error("Customer not found", status_code=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, customer)
        serializer = self.get_serializer(customer, data=request.data, partial=partial)
        if not serializer.is_valid():
            return api_error("Customer update failed", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)
        customer = serializer.save()
        return api_response(
            success=True,
            message="Customer profile updated successfully.",
            data=self.get_serializer(customer).data
        )

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """
        Returns or updates the authenticated customer's own profile.
        """
        if not request.user or not request.user.is_authenticated:
            return api_error("Authentication required", status_code=status.HTTP_401_UNAUTHORIZED)

        customer = getattr(request.user, 'customer_profile', None)
        if not customer:
            # If user has no customer profile, create one
            customer = Customer.objects.create(user=request.user)

        if request.method == 'PATCH':
            serializer = CustomerSerializer(customer, data=request.data, partial=True)
            if not serializer.is_valid():
                return api_error("Profile update failed", errors=serializer.errors)
            customer = serializer.save()
            return api_response(
                success=True,
                message="Profile updated successfully.",
                data=CustomerProfileSerializer(customer).data
            )

        serializer = CustomerProfileSerializer(customer)
        data = serializer.data
        data['recent_bookings'] = list(customer.bookings.order_by('-created_at')[:5].values(
            'id', 'booking_number', 'hotel__name', 'check_in_date', 'check_out_date', 'net_amount', 'status'
        ))
        return api_response(success=True, data=data)
