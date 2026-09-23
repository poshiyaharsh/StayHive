from rest_framework import serializers
from apps.core.models import Customer, User


class CustomerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    phone = serializers.CharField(source='user.phone', required=False)
    avatar = serializers.CharField(source='user.avatar', required=False)

    class Meta:
        model = Customer
        fields = [
            'id', 'user_id', 'username', 'first_name', 'last_name', 'email', 'phone', 'avatar',
            'id_proof_type', 'id_proof_number', 'address', 'total_stays', 'total_spend',
            'loyalty_tier', 'created_at'
        ]
        read_only_fields = ['id', 'user_id', 'total_stays', 'total_spend', 'loyalty_tier', 'created_at']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user

        # Update user fields if provided
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()

        # Update customer fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class CustomerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', required=False)
    avatar = serializers.CharField(source='user.avatar', required=False)
    bookings_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'user_id', 'username', 'first_name', 'last_name', 'email', 'phone', 'avatar',
            'id_proof_type', 'id_proof_number', 'address', 'total_stays', 'total_spend',
            'loyalty_tier', 'created_at', 'bookings_count'
        ]
        read_only_fields = ['id', 'user_id', 'total_stays', 'total_spend', 'loyalty_tier', 'created_at']

    def get_bookings_count(self, obj):
        return obj.bookings.count()
