from rest_framework import permissions
from apps.billing.permissions import get_user_role
from apps.core.models import Customer


class CancellationPermission(permissions.BasePermission):
    """
    Role-based permission for Cancellation Requests and Refunds:
    - Admin, Manager: Full access.
    - Reception: View requests/refunds, view status.
    - Customer: View own requests/refunds, create requests for own bookings.
    - Housekeeping, Restaurant: Forbidden (403).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)
        if role in ['housekeeping', 'restaurant']:
            return False

        if role in ['admin', 'manager', 'reception', 'customer']:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)

        if role in ['admin', 'manager']:
            return True

        if role == 'reception':
            return request.method in permissions.SAFE_METHODS

        if role == 'customer':
            customer = Customer.objects.filter(user=request.user).first()
            if not customer:
                return False

            # Check if obj is CancellationRequest
            if hasattr(obj, 'customer_id'):
                return obj.customer_id == customer.id

            # Check if obj is Refund
            if hasattr(obj, 'cancellation') and obj.cancellation:
                return obj.cancellation.customer_id == customer.id

            return False

        return False
