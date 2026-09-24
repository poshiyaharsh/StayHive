from rest_framework import permissions
from apps.core.models import Staff, Customer
from apps.feedback.permissions import get_user_role


class ComplaintPermission(permissions.BasePermission):
    """
    Complaint Permissions:
    - Customer: Create complaint, view own complaints via /my/ or detail.
    - Reception: View complaints, update operational status ('In Progress').
    - Manager, Admin: View all, update status, resolve complaints.
    - Housekeeping, Restaurant: 403 Forbidden.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)

        # Deny housekeeping and restaurant
        if role in ['housekeeping', 'restaurant']:
            return False

        if role in ['admin', 'manager']:
            return True

        if role == 'reception':
            return True

        if role == 'customer':
            if view.action in ['create', 'my', 'retrieve']:
                return True
            if view.action == 'list':
                return False
            return False

        return False

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)

        if role in ['admin', 'manager']:
            return True

        if role == 'reception':
            # Reception can read and move to in_progress
            if request.method in permissions.SAFE_METHODS or view.action in ['update_status', 'partial_update']:
                return True
            return True

        if role == 'customer':
            customer = Customer.objects.filter(user=request.user).first()
            if not customer:
                return False
            # Customer can only access their own complaint
            return obj.customer_id == customer.id

        return False
