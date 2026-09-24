from rest_framework import permissions
from apps.core.models import Staff, Customer


def get_user_role(user):
    """Resolve user role reliably."""
    if not user or not user.is_authenticated:
        return 'anonymous'
    if getattr(user, 'is_superuser', False):
        return 'admin'

    role = getattr(user, 'role', None)
    if role:
        return str(role).lower()

    staff = Staff.objects.filter(user=user).select_related('department').first()
    if staff:
        dept = staff.department.name.lower() if staff.department else ''
        desig = staff.designation.lower() if staff.designation else ''
        if 'admin' in desig or 'admin' in dept:
            return 'admin'
        if 'manager' in desig or 'manager' in dept:
            return 'manager'
        if 'reception' in desig or 'reception' in dept or 'front desk' in desig:
            return 'reception'
        if 'housekeeping' in desig or 'housekeeping' in dept:
            return 'housekeeping'
        if 'restaurant' in desig or 'kitchen' in desig or 'food' in dept:
            return 'restaurant'
        return 'staff'

    if Customer.objects.filter(user=user).exists():
        return 'customer'

    return 'user'


class FeedbackPermission(permissions.BasePermission):
    """
    Feedback Permissions:
    - Admin, Manager, Reception: Full view & management access.
    - Customer: Create feedback for own booking; view own feedbacks.
    - Housekeeping, Restaurant: 403 Forbidden.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)

        # Explicitly deny restricted staff roles
        if role in ['housekeeping', 'restaurant']:
            return False

        if role in ['admin', 'manager', 'reception']:
            return True

        if role == 'customer':
            # Customers can list their own via /my/, create via POST, or read summary
            if view.action in ['create', 'my', 'summary', 'retrieve']:
                return True
            # Deny listing all feedback to customers
            if view.action == 'list':
                return False
            return False

        return False

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)

        if role in ['admin', 'manager', 'reception']:
            return True

        if role == 'customer':
            customer = Customer.objects.filter(user=request.user).first()
            if not customer:
                return False
            return obj.customer_id == customer.id

        return False
