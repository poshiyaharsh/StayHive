from rest_framework import serializers
from apps.core.models import Hotel, HotelFacility, Gallery


class HotelFacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelFacility
        fields = ['id', 'hotel_id', 'facility_name', 'icon', 'description']


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = ['id', 'hotel_id', 'image_url', 'title', 'is_featured', 'created_at']


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

    def get_rooms_count(self, obj):
        return obj.rooms.count()

    def get_available_rooms_count(self, obj):
        return obj.rooms.filter(status='Available').count()
