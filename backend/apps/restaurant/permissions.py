from rest_framework import permissions


class RestaurantPermission(permissions.BasePermission):
    """
    Permissions for Restaurant management:
    - Safe methods (GET, HEAD, OPTIONS): Accessible by ADMIN, MANAGER, RESTAURANT, RECEPTION, CUSTOMER.
    - Modifying methods (POST, PUT, PATCH, DELETE): Accessible by ADMIN, MANAGER.
    - HOUSEKEEPING is denied.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role == 'HOUSEKEEPING':
            return False
        if request.method in permissions.SAFE_METHODS:
            return role in ['ADMIN', 'MANAGER', 'RESTAURANT', 'RECEPTION', 'CUSTOMER']
        return role in ['ADMIN', 'MANAGER']


class FoodMenuPermission(permissions.BasePermission):
    """
    Permissions for Food Menu items:
    - Safe methods: Accessible by ADMIN, MANAGER, RESTAURANT, RECEPTION, CUSTOMER.
    - Modifying methods: Accessible by ADMIN, MANAGER, RESTAURANT.
    - HOUSEKEEPING is denied.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role == 'HOUSEKEEPING':
            return False
        if request.method in permissions.SAFE_METHODS:
            return role in ['ADMIN', 'MANAGER', 'RESTAURANT', 'RECEPTION', 'CUSTOMER']
        return role in ['ADMIN', 'MANAGER', 'RESTAURANT']


class FoodOrderPermission(permissions.BasePermission):
    """
    Permissions for Food Orders:
    - ADMIN, MANAGER, RESTAURANT: Full access to view, advance status, view stats.
    - RECEPTION: Read-only access.
    - CUSTOMER: Can create orders for own stay, view own orders, cancel own pending orders.
    - HOUSEKEEPING: Denied access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role == 'HOUSEKEEPING':
            return False
        if role in ['ADMIN', 'MANAGER', 'RESTAURANT']:
            return True
        if role == 'RECEPTION':
            return request.method in permissions.SAFE_METHODS
        if role == 'CUSTOMER':
            # Customers can list (filtered to own), retrieve (own only), create, or cancel
            if view.action in ['list', 'retrieve', 'create', 'my', 'cancel']:
                return True
            if request.method in permissions.SAFE_METHODS or request.method == 'POST':
                return True
            return False
        return False

    def has_object_permission(self, request, view, obj):
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role in ['ADMIN', 'MANAGER', 'RESTAURANT']:
            return True
        if role == 'RECEPTION':
            return request.method in permissions.SAFE_METHODS
        if role == 'CUSTOMER':
            # Check customer ownership
            if obj.customer and obj.customer.user == request.user:
                return True
            return False
        return False
