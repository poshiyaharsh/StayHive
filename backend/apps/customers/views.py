from rest_framework import serializers, viewsets, permissions, filters
from apps.core.models import Customer, User
from apps.core.utils import api_response


class CustomerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    avatar = serializers.CharField(source='user.avatar', read_only=True)

    class Meta:
        model = Customer
        fields = [
            'id', 'user_id', 'username', 'first_name', 'last_name', 'email', 'phone', 'avatar',
            'id_proof_type', 'id_proof_number', 'address', 'total_stays', 'total_spend',
            'loyalty_tier', 'created_at'
        ]


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().select_related('user').order_by('-total_spend')
    serializer_class = CustomerSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'user__phone', 'loyalty_tier']
    ordering_fields = ['total_stays', 'total_spend', 'created_at']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    def retrieve(self, request, *args, **kwargs):
        customer = self.get_object()
        data = self.get_serializer(customer).data
        data['bookings'] = list(customer.bookings.values('id', 'booking_number', 'check_in_date', 'check_out_date', 'net_amount', 'status'))
        data['interactions'] = list(customer.interactions.values('id', 'type', 'notes', 'created_at'))
        return api_response(success=True, data=data)
