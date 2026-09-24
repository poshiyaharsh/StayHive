from rest_framework import permissions
from apps.core.models import Staff


class HousekeepingPermission(permissions.BasePermission):
    """
    Permissions for Housekeeping Tasks:
    - ADMIN, MANAGER: Full access (create, assign, update, view all).
    - RECEPTION: View tasks, view room housekeeping status, create tasks.
    - HOUSEKEEPING:
      - Can view assigned tasks (my tasks)
      - Can start and complete tasks assigned to them
      - Cannot manage tasks assigned to other staff (HTTP 403)
    - CUSTOMER, RESTAURANT: 403 Forbidden
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['CUSTOMER', 'RESTAURANT']:
            return False
        if role in ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING']:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['ADMIN', 'MANAGER']:
            return True
        if role == 'RECEPTION':
            return request.method in permissions.SAFE_METHODS
        if role == 'HOUSEKEEPING':
            # Housekeeping staff can only access/modify tasks assigned to their staff profile
            staff = Staff.objects.filter(user=request.user).first()
            if not staff:
                return False
            # Check if task is assigned to this staff member
            return obj.staff_id == staff.id
        return False
