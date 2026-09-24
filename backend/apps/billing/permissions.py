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

    # Check staff record
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

    # Check customer record
    if Customer.objects.filter(user=user).exists():
        return 'customer'

    return 'user'


class BillingPermission(permissions.BasePermission):
    """
    Role-based billing permission:
    - Admin, Manager: Full access.
    - Reception: Can view invoices/payments, record payments.
    - Customer: Can view own invoices/payments, create payments on own invoices.
    - Housekeeping, Restaurant: Forbidden (403).
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)

        # Deny housekeeping and restaurant
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
            # Reception has read-only or payment-creation permissions
            return True

        if role == 'customer':
            customer = Customer.objects.filter(user=request.user).first()
            if not customer:
                return False

            # Check if obj is Invoice
            if hasattr(obj, 'booking') and obj.booking:
                return obj.booking.customer_id == customer.id

            # Check if obj is Payment
            if hasattr(obj, 'invoice') and obj.invoice and obj.invoice.booking:
                return obj.invoice.booking.customer_id == customer.id

            return False

        return False


class PaymentMethodPermission(permissions.BasePermission):
    """
    Payment methods can be read by authenticated users.
    Only Admin/Manager can create/modify them.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = get_user_role(request.user)
        if role in ['housekeeping', 'restaurant']:
            return False

        if request.method in permissions.SAFE_METHODS:
            return True

        return role in ['admin', 'manager']
