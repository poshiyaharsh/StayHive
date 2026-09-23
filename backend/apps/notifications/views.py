from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action
from apps.core.models import Notification
from apps.core.utils import api_response


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user_id', 'title', 'message', 'type', 'is_read', 'created_at']


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        user_id = request.query_params.get('user_id')
        qs = self.get_queryset()
        if user_id:
            qs = qs.filter(user_id=user_id)
        serializer = self.get_serializer(qs, many=True)
        unread_count = qs.filter(is_read=False).count()
        return api_response(success=True, data={"notifications": serializer.data, "unread_count": unread_count})

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return api_response(success=True, message="Marked as read", data=NotificationSerializer(notif).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        user_id = request.data.get('user_id')
        qs = Notification.objects.filter(is_read=False)
        if user_id:
            qs = qs.filter(user_id=user_id)
        qs.update(is_read=True)
        return api_response(success=True, message="All notifications marked as read")
