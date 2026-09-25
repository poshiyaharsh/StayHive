from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from apps.core.models import Notification
from apps.core.utils import api_response, api_error
from apps.notifications.serializers import NotificationSerializer
from apps.notifications.permissions import NotificationPermission


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [NotificationPermission]
    pagination_class = NotificationPagination

    def get_queryset(self):
        if not self.request.user or not self.request.user.is_authenticated:
            return Notification.objects.none()
        # Strictly user isolated
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Paginate if page query param provided or default to paginated response
        if 'page' in request.query_params:
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        unread_count = queryset.filter(is_read=False).count()
        return api_response(
            success=True,
            data={
                "notifications": serializer.data,
                "unread_count": unread_count
            }
        )

    @action(detail=False, methods=['get'], url_path='unread')
    def unread(self, request):
        qs = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(qs, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"count": count})

    @action(detail=True, methods=['patch', 'post'], url_path='read')
    def mark_single_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=['is_read'])
        return api_response(
            success=True,
            message="Notification marked as read.",
            data=NotificationSerializer(notif).data
        )

    # Legacy alias support for frontend
    @action(detail=True, methods=['patch', 'post'], url_path='mark_read')
    def mark_read(self, request, pk=None):
        return self.mark_single_read(request, pk)

    @action(detail=False, methods=['patch', 'post'], url_path='read-all')
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return api_response(success=True, message="All notifications marked as read.")

    # Legacy alias support for frontend
    @action(detail=False, methods=['post'], url_path='mark_all_read')
    def legacy_mark_all_read(self, request):
        return self.mark_all_read(request)
