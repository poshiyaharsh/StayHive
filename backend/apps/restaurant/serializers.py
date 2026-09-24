from decimal import Decimal
from rest_framework import serializers
from apps.core.models import Restaurant, Food, FoodOrder, OrderItem, Booking, Customer, Room, Hotel


class RestaurantSerializer(serializers.ModelSerializer):
    restaurant_id = serializers.IntegerField(source='id', read_only=True)
    restaurant_name = serializers.CharField(source='name', required=False)
    description = serializers.CharField(source='cuisine', required=False, allow_blank=True)
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)
    hotel_id = serializers.PrimaryKeyRelatedField(queryset=Hotel.objects.all(), source='hotel')
    foods_count = serializers.SerializerMethodField()

    class Meta:
        model = Restaurant
        fields = [
            'id', 'restaurant_id', 'hotel_id', 'hotel_name', 'name', 'restaurant_name',
            'cuisine', 'description', 'opening_time', 'closing_time', 'is_active', 'foods_count'
        ]

    def get_foods_count(self, obj):
        return obj.foods.filter(is_available=True).count()


class FoodSerializer(serializers.ModelSerializer):
    food_id = serializers.IntegerField(source='id', read_only=True)
    food_name = serializers.CharField(source='name', required=False)
    description = serializers.SerializerMethodField()
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_id = serializers.PrimaryKeyRelatedField(queryset=Restaurant.objects.all(), source='restaurant')

    class Meta:
        model = Food
        fields = [
            'id', 'food_id', 'restaurant_id', 'restaurant_name', 'name', 'food_name',
            'category', 'description', 'price', 'is_veg', 'is_available', 'image_url', 'preparation_time'
        ]

    def get_description(self, obj):
        return f"Chef-special {obj.name} prepared fresh with authentic ingredients."

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Food price cannot be negative.")
        return value

    def validate_preparation_time(self, value):
        if value < 0:
            raise serializers.ValidationError("Preparation time cannot be negative.")
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    order_item_id = serializers.IntegerField(source='id', read_only=True)
    food_name = serializers.CharField(source='food.name', read_only=True)
    food_image = serializers.CharField(source='food.image_url', read_only=True)
    is_veg = serializers.BooleanField(source='food.is_veg', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order_item_id', 'food_order_id', 'food_id', 'food_name',
            'food_image', 'is_veg', 'quantity', 'unit_price', 'subtotal'
        ]


class FoodOrderSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='id', read_only=True)
    order_date = serializers.DateTimeField(source='order_time', read_only=True)
    order_status = serializers.CharField(source='status', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.SerializerMethodField()
    customer_id = serializers.IntegerField(source='customer.id', read_only=True)
    customer_name = serializers.SerializerMethodField()
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)
    restaurant = serializers.SerializerMethodField()

    class Meta:
        model = FoodOrder
        fields = [
            'id', 'order_id', 'booking_id', 'booking_number', 'customer_id',
            'customer_name', 'customer', 'restaurant', 'room_id', 'room_number',
            'order_time', 'order_date', 'total_amount', 'status', 'order_status',
            'payment_status', 'items'
        ]

    def get_customer(self, obj):
        if obj.customer and obj.customer.user:
            return {
                'customer_id': obj.customer.id,
                'name': f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip() or obj.customer.user.username,
                'email': obj.customer.user.email,
                'phone': obj.customer.user.phone,
            }
        return {'customer_id': obj.customer_id, 'name': 'Valued Guest'}

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}".strip() or obj.customer.user.username
        return 'Valued Guest'

    def get_restaurant(self, obj):
        first_item = obj.items.select_related('food__restaurant').first()
        if first_item and first_item.food and first_item.food.restaurant:
            return {
                'restaurant_id': first_item.food.restaurant.id,
                'restaurant_name': first_item.food.restaurant.name,
            }
        return {'restaurant_id': 1, 'restaurant_name': 'StayHive Dining'}


class CreateOrderItemInputSerializer(serializers.Serializer):
    food_id = serializers.IntegerField(required=True)
    quantity = serializers.IntegerField(required=True, min_value=1)
    # Intentionally do not accept or trust unit_price, subtotal from client


class CreateFoodOrderSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField(required=True)
    room_id = serializers.IntegerField(required=False, allow_null=True)
    items = CreateOrderItemInputSerializer(many=True, required=True)
    payment_status = serializers.CharField(required=False, default='Billed to Room')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        return value


class UpdateOrderStatusSerializer(serializers.Serializer):
    order_status = serializers.CharField(required=False)
    status = serializers.CharField(required=False)

    def validate(self, attrs):
        new_status = attrs.get('order_status') or attrs.get('status')
        if not new_status:
            raise serializers.ValidationError({"status": "order_status or status is required."})
        return {'status': new_status}
