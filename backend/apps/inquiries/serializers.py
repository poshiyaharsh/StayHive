from rest_framework import serializers
from apps.core.models import Inquiry, Staff, Customer


class InquirySerializer(serializers.ModelSerializer):
    inquiry_id = serializers.IntegerField(source='id', read_only=True)
    name = serializers.CharField(source='customer_name', required=False)
    inquiry_date = serializers.DateTimeField(source='created_at', read_only=True)
    responded_by = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)
    assigned_name = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)

    class Meta:
        model = Inquiry
        fields = [
            'id', 'inquiry_id', 'customer_id', 'customer_name', 'name', 'email', 'phone',
            'subject', 'message', 'status', 'assigned_to', 'assigned_name', 'responded_by',
            'response', 'created_at', 'inquiry_date', 'responded_at'
        ]
        read_only_fields = [
            'id', 'inquiry_id', 'customer_id', 'assigned_to', 'assigned_name',
            'responded_by', 'created_at', 'inquiry_date', 'responded_at'
        ]


class InquiryCreateSerializer(serializers.Serializer):
    # Support both 'name' and 'customer_name'
    name = serializers.CharField(max_length=150, required=False)
    customer_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(max_length=150, required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    subject = serializers.CharField(max_length=200, required=True)
    message = serializers.CharField(required=True, allow_blank=False)

    def validate(self, attrs):
        name = attrs.get('name') or attrs.get('customer_name')
        if not name or not name.strip():
            raise serializers.ValidationError({"name": "Name is required."})
        attrs['customer_name'] = name.strip()
        if not attrs.get('subject', '').strip():
            raise serializers.ValidationError({"subject": "Subject is required."})
        if not attrs.get('message', '').strip():
            raise serializers.ValidationError({"message": "Message is required."})
        return attrs


class InquiryReplySerializer(serializers.Serializer):
    response = serializers.CharField(required=True, allow_blank=False)
    status = serializers.CharField(required=False, default='Responded')
