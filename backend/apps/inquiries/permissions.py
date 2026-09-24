from rest_framework import permissions
from apps.core.models import Staff, Customer
from apps.feedback.permissions import get_user_role


class InquiryPermission(permissions.BasePermission):
    """
    Inquiry Permissions:
    - Public / Unauthenticated: Allowed to submit inquiry (POST /api/inquiries/).
    - Customer: Allowed to submit inquiry (POST), view own inquiries via /api/inquiries/my/ or detail.
    - Reception, Manager, Admin: View all inquiries, respond to inquiries.
    - Housekeeping, Restaurant: 403 Forbidden.
    """

    def has_permission(self, request, view):
        # Public submission allowed
        if view.action == 'create':
            # But deny restricted staff from calling create if authenticated as housekeeping/restaurant
            if request.user and request.user.is_authenticated:
                role = get_user_role(request.user)
                if role in ['housekeeping', 'restaurant']:
                    return False
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)

        if role in ['housekeeping', 'restaurant']:
            return False

        if role in ['admin', 'manager', 'reception']:
            return True

        if role == 'customer':
            if view.action in ['my', 'retrieve']:
                return True
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
            # Anonymous inquiries (customer_id is None) must NEVER be accessible to customers
            if obj.customer_id is None:
                return False
            return obj.customer_id == customer.id

        return False
