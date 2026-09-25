from rest_framework import permissions

def get_role_name(user):
    if not user or not user.is_authenticated:
        return None
    if getattr(user, 'role', None):
        return str(user.role.name).upper()
    return None


class AnalyticsPermission(permissions.BasePermission):
    """
    Role-based permissions for Analytics:
    - CUSTOMER: 403 Forbidden (No access to management analytics)
    - ADMIN, MANAGER: Full access to all analytics
    - RECEPTION: Access to operational analytics (bookings, rooms, customers, services, housekeeping, support)
    - RESTAURANT: Access to food analytics
    - HOUSEKEEPING: Access to housekeeping analytics
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_role_name(request.user)
        if not role or role == 'CUSTOMER':
            return False

        if role in ['ADMIN', 'MANAGER']:
            return True

        # Departmental permissions based on view action or endpoint
        endpoint = getattr(view, 'endpoint_name', '') or request.path

        if role == 'RECEPTION':
            # Reception can see operational dashboards: bookings, rooms, services, housekeeping, customers, complaints, inquiries, feedback
            allowed_keywords = ['overview', 'booking', 'room', 'service', 'housekeeping', 'customer', 'complaint', 'inquiry', 'feedback']
            return any(k in endpoint.lower() for k in allowed_keywords)

        if role == 'RESTAURANT':
            # Restaurant staff can only see food analytics
            return 'food' in endpoint.lower()

        if role == 'HOUSEKEEPING':
            # Housekeeping staff can only see housekeeping & room analytics
            return 'housekeeping' in endpoint.lower() or 'room' in endpoint.lower()

        return False
