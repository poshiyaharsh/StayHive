from decimal import Decimal
from rest_framework import serializers
from apps.core.models import RoomType, Room, RoomAmenity, Hotel


STATUS_MAP = {
    'available': 'Available',
    'occupied': 'Occupied',
    'reserved': 'Reserved',
    'maintenance': 'Maintenance',
    'cleaning': 'Cleaning',
}

HOUSEKEEPING_MAP = {
    'clean': 'Clean',
    'needs cleaning': 'Needs Cleaning',
    'dirty': 'Needs Cleaning',
    'cleaning': 'In Progress',
    'in progress': 'In Progress',
    'inspected': 'Inspected',
    'inspection': 'Inspected',
}


class RoomAmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomAmenity
        fields = ['id', 'room_type_id', 'amenity_name', 'icon']
        extra_kwargs = {
            'amenity_name': {'required': True},
            'room_type_id': {'required': False}
        }


class RoomTypeSerializer(serializers.ModelSerializer):
    amenities = RoomAmenitySerializer(many=True, read_only=True)
    rooms_count = serializers.SerializerMethodField()

    class Meta:
        model = RoomType
        fields = [
            'id', 'type_name', 'base_price', 'capacity', 'size_sqft',
            'bed_type', 'description', 'image_url', 'amenities', 'rooms_count'
        ]
        extra_kwargs = {
            'type_name': {'required': True, 'error_messages': {'required': 'Room type name is required.'}},
            'base_price': {'required': True, 'error_messages': {'required': 'Base price is required.'}},
            'capacity': {'required': True, 'error_messages': {'required': 'Capacity is required.'}},
        }

    def validate_type_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Room type name cannot be empty.")
        return value.strip()

    def validate_capacity(self, value):
        if value is None or int(value) <= 0:
            raise serializers.ValidationError("Capacity must be greater than 0.")
        return int(value)

    def validate_base_price(self, value):
        if value is None or Decimal(str(value)) < 0:
            raise serializers.ValidationError("Base price must be greater than or equal to 0.")
        return Decimal(str(value))

    def get_rooms_count(self, obj):
        return obj.rooms.count()


class RoomSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    room_type_name = serializers.CharField(source='room_type.type_name', read_only=True)
    capacity = serializers.IntegerField(source='room_type.capacity', read_only=True)
    amenities = RoomAmenitySerializer(source='room_type.amenities', many=True, read_only=True)

    hotel_id = serializers.PrimaryKeyRelatedField(
        queryset=Hotel.objects.all(), source='hotel', write_only=True, required=True,
        error_messages={'required': 'Hotel is required.'}
    )
    room_type_id = serializers.PrimaryKeyRelatedField(
        queryset=RoomType.objects.all(), source='room_type', write_only=True, required=True,
        error_messages={'required': 'Room type is required.'}
    )

    class Meta:
        model = Room
        fields = [
            'id', 'hotel_id', 'room_type_id', 'hotel_name', 'room_type_name',
            'room_number', 'floor', 'status', 'price_per_night',
            'housekeeping_status', 'capacity', 'amenities'
        ]
        extra_kwargs = {
            'room_number': {'required': True, 'error_messages': {'required': 'Room number is required.'}},
            'floor': {'required': True, 'error_messages': {'required': 'Floor number is required.'}},
            'price_per_night': {'required': False},
            'status': {'required': False},
            'housekeeping_status': {'required': False},
        }

    def validate_status(self, value):
        if not value:
            return 'Available'
        norm = STATUS_MAP.get(value.strip().lower())
        if not norm:
            valid_statuses = list(STATUS_MAP.values())
            raise serializers.ValidationError(f"Invalid status '{value}'. Allowed: {', '.join(valid_statuses)}.")
        return norm

    def validate_housekeeping_status(self, value):
        if not value:
            return 'Clean'
        norm = HOUSEKEEPING_MAP.get(value.strip().lower())
        if not norm:
            valid_hk = ['Clean', 'Needs Cleaning', 'In Progress', 'Inspected']
            raise serializers.ValidationError(f"Invalid housekeeping status '{value}'. Allowed: {', '.join(valid_hk)}.")
        return norm

    def validate(self, attrs):
        hotel = attrs.get('hotel') or (self.instance.hotel if self.instance else None)
        room_number = attrs.get('room_number') or (self.instance.room_number if self.instance else None)
        room_type = attrs.get('room_type') or (self.instance.room_type if self.instance else None)

        if not hotel:
            raise serializers.ValidationError({"hotel_id": "Hotel must be specified."})
        if not room_type:
            raise serializers.ValidationError({"room_type_id": "Room type must be specified."})

        # Default price from room_type if not specified
        if 'price_per_night' not in attrs or attrs['price_per_night'] is None:
            if not self.instance:
                attrs['price_per_night'] = room_type.base_price

        # Check unique constraint (hotel_id, room_number)
        if hotel and room_number:
            query = Room.objects.filter(hotel=hotel, room_number=str(room_number).strip())
            if self.instance:
                query = query.exclude(id=self.instance.id)
            if query.exists():
                raise serializers.ValidationError({
                    "room_number": f"Room {room_number} already exists in this hotel."
                })

        return attrs
