from rest_framework import permissions


class ServicePermission(permissions.BasePermission):
    """
    Permissions for Service Management:
    - Safe methods (GET, HEAD, OPTIONS): ADMIN, MANAGER, RECEPTION, CUSTOMER.
    - Modifying methods (POST, PUT, PATCH, DELETE): ADMIN, MANAGER.
    - HOUSEKEEPING, RESTAURANT: 403 Forbidden.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['HOUSEKEEPING', 'RESTAURANT']:
            return False
        if request.method in permissions.SAFE_METHODS:
            return role in ['ADMIN', 'MANAGER', 'RECEPTION', 'CUSTOMER']
        return role in ['ADMIN', 'MANAGER']


class ServiceRequestPermission(permissions.BasePermission):
    """
    Permissions for Service Requests:
    - ADMIN, MANAGER, RECEPTION: Full management of requests.
    - CUSTOMER: View own requests, create request for own stay, cancel pending request.
    - HOUSEKEEPING, RESTAURANT: 403 Forbidden.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['HOUSEKEEPING', 'RESTAURANT']:
            return False
        if role in ['ADMIN', 'MANAGER', 'RECEPTION']:
            return True
        if role == 'CUSTOMER':
            if view.action in ['list', 'retrieve', 'create', 'my', 'cancel']:
                return True
            return False
        return False

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['ADMIN', 'MANAGER', 'RECEPTION']:
            return True
        if role == 'CUSTOMER':
            customer = getattr(request.user, 'customer_profile', None)
            return customer and obj.booking.customer_id == customer.id
        return False
