from rest_framework import permissions


class RolePermissionBase(permissions.BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superuser / ADMIN always has permission
        if getattr(request.user, 'role', None) and request.user.role.name == 'ADMIN':
            return True
        
        user_role = getattr(request.user, 'role', None)
        if not user_role:
            return False
        
        return user_role.name in self.allowed_roles


class IsAdmin(RolePermissionBase):
    allowed_roles = ['ADMIN']


class IsManager(RolePermissionBase):
    allowed_roles = ['ADMIN', 'MANAGER']


class IsReception(RolePermissionBase):
    allowed_roles = ['ADMIN', 'MANAGER', 'RECEPTION']


class IsHousekeeping(RolePermissionBase):
    allowed_roles = ['ADMIN', 'MANAGER', 'HOUSEKEEPING']


class IsRestaurant(RolePermissionBase):
    allowed_roles = ['ADMIN', 'MANAGER', 'RESTAURANT']


class IsCustomer(RolePermissionBase):
    allowed_roles = ['CUSTOMER']


class IsStaffMember(RolePermissionBase):
    allowed_roles = ['ADMIN', 'MANAGER', 'RECEPTION', 'HOUSEKEEPING', 'RESTAURANT']
