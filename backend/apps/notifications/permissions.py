from rest_framework import permissions


class NotificationPermission(permissions.BasePermission):
    """
    Strict Notification Permission:
    - User must be authenticated.
    - User can only view, access, or mutate their own notifications.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        return obj.user_id == request.user.id
