from rest_framework import serializers, viewsets, permissions
from rest_framework.decorators import action
from apps.core.models import Inquiry
from apps.core.utils import api_response, api_error


class InquirySerializer(serializers.ModelSerializer):
    assigned_name = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)

    class Meta:
        model = Inquiry
        fields = [
            'id', 'customer_name', 'email', 'phone', 'subject', 'message',
            'status', 'assigned_to', 'assigned_name', 'response', 'created_at'
        ]


class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all().order_by('-created_at')
    serializer_class = InquirySerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        inquiry = self.get_object()
        reply_message = request.data.get('response')
        staff_id = request.data.get('assigned_to', 2)

        if not reply_message:
            return api_error("Response message is required")

        inquiry.status = 'Responded'
        inquiry.response = reply_message
        inquiry.assigned_to_id = staff_id
        inquiry.save()

        return api_response(
            success=True,
            message="Inquiry response sent successfully.",
            data=InquirySerializer(inquiry).data
        )
