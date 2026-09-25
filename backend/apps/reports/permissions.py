from rest_framework import permissions

def get_role_name(user):
    if not user or not user.is_authenticated:
        return None
    if getattr(user, 'role', None):
        return str(user.role.name).upper()
    return None


class ReportPermission(permissions.BasePermission):
    """
    Strict role permissions for operational & management reports:
    - CUSTOMER: 403 Forbidden
    - ADMIN, MANAGER: Full access to all reports
    - RECEPTION: bookings, occupancy, customers, services, housekeeping, support
    - RESTAURANT: food reports
    - HOUSEKEEPING: housekeeping reports
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_role_name(request.user)
        if not role or role == 'CUSTOMER':
            return False

        if role in ['ADMIN', 'MANAGER']:
            return True

        report_type = getattr(view, 'report_type', '') or request.path.lower()

        if role == 'RECEPTION':
            allowed = ['booking', 'occupancy', 'customer', 'service', 'housekeeping', 'support']
            return any(k in report_type for k in allowed)

        if role == 'RESTAURANT':
            return 'food' in report_type

        if role == 'HOUSEKEEPING':
            return 'housekeeping' in report_type

        return False
