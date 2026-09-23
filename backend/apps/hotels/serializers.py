from rest_framework import serializers
from apps.core.models import Hotel, HotelFacility, Gallery, RoomType


class HotelFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelFacility
        fields = ['id', 'hotel_id', 'facility_name', 'icon', 'description']
        extra_kwargs = {
            'facility_name': {'required': True},
            'hotel_id': {'required': False}
        }


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ['id', 'hotel_id', 'image_url', 'title', 'is_featured', 'created_at']
        extra_kwargs = {
            'image_url': {'required': True},
            'hotel_id': {'required': False}
        }


class HotelSerializer(serializers.ModelSerializer):
    facilities = HotelFacilitySerializer(many=True, read_only=True)
    gallery_images = GallerySerializer(many=True, read_only=True)
    rooms_count = serializers.SerializerMethodField()
    available_rooms_count = serializers.SerializerMethodField()

    class Meta:
        model = Hotel
        fields = [
            'id', 'name', 'tagline', 'description', 'address', 'city', 'state',
            'country', 'pincode', 'contact_number', 'email', 'star_rating',
            'image', 'is_active', 'created_at', 'facilities', 'gallery_images',
            'rooms_count', 'available_rooms_count'
        ]
        extra_kwargs = {
            'name': {'required': True, 'error_messages': {'required': 'Hotel name is required.'}},
            'address': {'required': True, 'error_messages': {'required': 'Address is required.'}},
            'city': {'required': True, 'error_messages': {'required': 'City is required.'}},
            'state': {'required': False},
            'contact_number': {'required': False},
            'email': {'required': False},
        }

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Hotel name cannot be empty.")
        return value.strip()

    def validate_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Address cannot be empty.")
        return value.strip()

    def validate_city(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("City cannot be empty.")
        return value.strip()

    def get_rooms_count(self, obj):
        return obj.rooms.count()

    def get_available_rooms_count(self, obj):
        return obj.rooms.filter(status='Available').count()


class HotelDetailSerializer(HotelSerializer):
    room_types = serializers.SerializerMethodField()

    class Meta(HotelSerializer.Meta):
        fields = HotelSerializer.Meta.fields + ['room_types']

    def get_room_types(self, obj):
        room_types = RoomType.objects.filter(rooms__hotel=obj).distinct()
        return [
            {
                'id': rt.id,
                'type_name': rt.type_name,
                'base_price': str(rt.base_price),
                'capacity': rt.capacity,
                'bed_type': rt.bed_type,
                'rooms_count': obj.rooms.filter(room_type=rt).count()
            }
            for rt in room_types
        ]
