from rest_framework import serializers
from apps.core.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    notification_id = serializers.IntegerField(source='id', read_only=True)
    notification_type = serializers.CharField(source='type', required=False)

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_id', 'user_id', 'title', 'message',
            'type', 'notification_type', 'is_read', 'created_at'
        ]
        read_only_fields = [
            'id', 'notification_id', 'user_id', 'created_at'
        ]
