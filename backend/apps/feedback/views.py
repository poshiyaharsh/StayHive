from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action
from apps.core.models import Feedback
from apps.core.utils import api_response, api_error


class FeedbackSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    customer_avatar = serializers.CharField(source='customer.user.avatar', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Feedback
        fields = [
            'id', 'booking_id', 'customer_id', 'customer_name', 'customer_avatar',
            'hotel_id', 'hotel_name', 'rating', 'cleanliness_rating', 'service_rating',
            'comments', 'staff_response', 'created_at'
        ]


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().select_related('customer', 'customer__user', 'hotel').order_by('-created_at')
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        fb = self.get_object()
        reply_text = request.data.get('response')
        if not reply_text:
            return api_error("Response text is required")
        fb.staff_response = reply_text
        fb.save()
        return api_response(success=True, message="Response saved successfully", data=FeedbackSerializer(fb).data)
