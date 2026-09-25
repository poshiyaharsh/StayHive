import logging
from datetime import timedelta
from django.utils import timezone
from apps.core.models import Notification, User, Customer, Staff
from apps.notifications.constants import DEFAULT_TITLES, TYPE_SYSTEM

logger = logging.getLogger(__name__)


def create_notification(user, message, notification_type=TYPE_SYSTEM, title=None):
    """
    Central, safe, and deduplicated notification creator.
    """
    if not user:
        return None

    try:
        # Title resolution
        if not title:
            title = DEFAULT_TITLES.get(notification_type, "Notification")

        # Deduplication check: prevent identical notification within 60 seconds
        cutoff = timezone.now() - timedelta(seconds=60)
        existing = Notification.objects.filter(
            user=user,
            type=notification_type,
            message=message,
            created_at__gte=cutoff
        ).first()

        if existing:
            return existing

        notif = Notification.objects.create(
            user=user,
            title=title[:150],
            message=message,
            type=notification_type[:50],
            is_read=False,
            created_at=timezone.now()
        )
        return notif
    except Exception as e:
        logger.error(f"Failed to create notification for user {user.id}: {e}")
        return None


def notify_user(user, message, notification_type=TYPE_SYSTEM, title=None):
    return create_notification(user, message, notification_type, title)


def notify_users(users, message, notification_type=TYPE_SYSTEM, title=None):
    results = []
    for u in users:
        n = create_notification(u, message, notification_type, title)
        if n:
            results.append(n)
    return results


def notify_customer(customer, message, notification_type=TYPE_SYSTEM, title=None):
    if not customer:
        return None
    user = getattr(customer, 'user', None)
    if user:
        return create_notification(user, message, notification_type, title)
    return None


def notify_role(role_name, message, notification_type=TYPE_SYSTEM, title=None):
    """
    Notify all active users with a specified role (e.g. 'ADMIN', 'MANAGER', 'RECEPTION').
    """
    try:
        users = User.objects.filter(role__name__iexact=role_name, is_active=True)
        return notify_users(users, message, notification_type, title)
    except Exception as e:
        logger.error(f"Failed to notify role {role_name}: {e}")
        return []


def notify_department(dept_name, message, notification_type=TYPE_SYSTEM, title=None):
    """
    Notify staff members belonging to a department (e.g. 'Restaurant', 'Housekeeping').
    """
    try:
        staff_members = Staff.objects.filter(
            department__name__icontains=dept_name,
            status='Active'
        ).select_related('user')
        users = [s.user for s in staff_members if s.user and s.user.is_active]
        return notify_users(users, message, notification_type, title)
    except Exception as e:
        logger.error(f"Failed to notify department {dept_name}: {e}")
        return []
