from rest_framework import serializers
from apps.core.models import RoomType, Room, RoomAmenity, Hotel


class RoomAmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomAmenity
        fields = ['id', 'room_type_id', 'amenity_name', 'icon']


class RoomTypeSerializer(serializers.ModelSerializer):
    amenities = RoomAmenitySerializer(many=True, read_only=True)
    rooms_count = serializers.SerializerMethodField()

    class Meta:
        model = RoomType
        fields = ['id', 'type_name', 'base_price', 'capacity', 'size_sqft', 'bed_type', 'description', 'image_url', 'amenities', 'rooms_count']

    def get_rooms_count(self, obj):
        return obj.rooms.count()


class RoomSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    room_type_name = serializers.CharField(source='room_type.type_name', read_only=True)
    capacity = serializers.IntegerField(source='room_type.capacity', read_only=True)
    amenities = RoomAmenitySerializer(source='room_type.amenities', many=True, read_only=True)

    hotel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.all(), source='hotel', write_only=True, required=False
    )
    room_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RoomType.objects.all(), source='room_type', write_only=True, required=False
    )

    class Meta:
        model = Room
        fields = [
            'id', 'hotel_id', 'room_type_id', 'hotel_name', 'room_type_name',
            'room_number', 'floor', 'status', 'price_per_night',
            'housekeeping_status', 'capacity', 'amenities'
        ]
