from rest_framework import serializers
from apps.core.models import Feedback, Booking, Customer


class FeedbackSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    customer_avatar = serializers.CharField(source='customer.user.avatar', read_only=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    # Support alias 'comment' as well as 'comments'
    comment = serializers.CharField(source='comments', required=False, allow_blank=True)
    feedback_date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Feedback
        fields = [
            'id', 'booking_id', 'booking_number', 'customer_id', 'customer_name', 'customer_avatar',
            'hotel_id', 'hotel_name', 'rating', 'cleanliness_rating', 'service_rating',
            'comments', 'comment', 'staff_response', 'created_at', 'feedback_date'
        ]
        read_only_fields = [
            'id', 'customer_id', 'hotel_id', 'staff_response', 'created_at', 'feedback_date'
        ]


class FeedbackCreateSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=True)
    rating = serializers.IntegerField(required=True)
    comment = serializers.CharField(required=False, allow_blank=True)
    comments = serializers.CharField(required=False, allow_blank=True)
    cleanliness_rating = serializers.IntegerField(required=False, default=5)
    service_rating = serializers.IntegerField(required=False, default=5)

    def validate_rating(self, value):
        if not isinstance(value, int) or value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be an integer between 1 and 5.")
        return value

    def validate_cleanliness_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Cleanliness rating must be between 1 and 5.")
        return value

    def validate_service_rating(self, value):
        if value is not None and (value < 1 or value > 5):
            raise serializers.ValidationError("Service rating must be between 1 and 5.")
        return value
