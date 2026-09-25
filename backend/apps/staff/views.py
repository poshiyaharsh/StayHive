from rest_framework import serializers, viewsets, permissions, filters
from apps.core.models import Staff, Department, User
from apps.core.utils import api_response


class DepartmentSerializer(serializers.ModelSerializer):
    staff_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'description', 'staff_count']

    def get_staff_count(self, obj):
        return obj.staff_members.count()


class StaffSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='user.get_full_name', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    avatar = serializers.CharField(source='user.avatar', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Staff
        fields = [
            'id', 'user_id', 'name', 'first_name', 'last_name', 'email', 'phone', 'avatar',
            'department_id', 'department_name', 'hotel_id', 'hotel_name',
            'designation', 'shift', 'salary', 'performance_score', 'status', 'joined_date'
        ]


class StaffPermission(permissions.BasePermission):
    """
    Staff management permission:
    - ADMIN, MANAGER: Full access.
    - RECEPTION: Read-only access to view staff roster.
    - CUSTOMER and unauthenticated: Denied (Phase 68).
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['ADMIN', 'MANAGER']:
            return True
        if role == 'RECEPTION':
            return request.method in permissions.SAFE_METHODS
        return False


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [StaffPermission]


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().select_related('user', 'department', 'hotel').order_by('-performance_score')
    serializer_class = StaffSerializer
    permission_classes = [StaffPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'designation', 'department__name']
    ordering_fields = ['performance_score', 'salary', 'joined_date']

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)
