from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from apps.core.models import User, Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.name', read_only=True)
    role_detail = RoleSerializer(source='role', read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True, required=False
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'avatar', 'role', 'role_detail', 'role_id', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role_name = serializers.CharField(write_only=True, required=False, default='CUSTOMER')

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'role_name']

    def create(self, validated_data):
        requested_role = validated_data.pop('role_name', 'CUSTOMER')
        request = self.context.get('request')
        is_admin = bool(
            request and request.user and request.user.is_authenticated and
            getattr(request.user.role, 'name', '') == 'ADMIN'
        )
        role_name = requested_role if is_admin else 'CUSTOMER'
        role, _ = Role.objects.get_or_create(name=role_name)
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['role'] = role
        return User.objects.create(**validated_data)
