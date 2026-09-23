from decimal import Decimal
from rest_framework import serializers, viewsets, permissions, filters, status
from rest_framework.decorators import action
from apps.core.models import Restaurant, Food, FoodOrder, OrderItem, Booking, Customer, Room
from apps.core.utils import api_response, api_error


class RestaurantSerializer(serializers.ModelSerializer):
    hotel_name = serializers.CharField(source='hotel.name', read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'hotel_id', 'hotel_name', 'name', 'cuisine', 'opening_time', 'closing_time', 'is_active']


class FoodSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = Food
        fields = ['id', 'restaurant_id', 'restaurant_name', 'name', 'category', 'price', 'is_veg', 'is_available', 'image_url', 'preparation_time']


class OrderItemSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source='food.name', read_only=True)
    food_image = serializers.CharField(source='food.image_url', read_only=True)
    is_veg = serializers.BooleanField(source='food.is_veg', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'food_order_id', 'food_id', 'food_name', 'food_image', 'is_veg', 'quantity', 'unit_price', 'subtotal']


class FoodOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.user.get_full_name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    booking_number = serializers.CharField(source='booking.booking_number', read_only=True)

    class Meta:
        model = FoodOrder
        fields = [
            'id', 'booking_id', 'booking_number', 'customer_id', 'customer_name',
            'room_id', 'room_number', 'order_time', 'total_amount', 'status',
            'payment_status', 'items'
        ]


class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.AllowAny]


class FoodViewSet(viewsets.ModelViewSet):
    queryset = Food.objects.all().order_by('category', 'name')
    serializer_class = FoodSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'category', 'restaurant__name']
    ordering_fields = ['price', 'preparation_time', 'name']

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        is_veg = self.request.query_params.get('is_veg')
        restaurant_id = self.request.query_params.get('restaurant_id')

        if category:
            qs = qs.filter(category=category)
        if is_veg is not None:
            qs = qs.filter(is_veg=(is_veg.lower() in ['true', '1']))
        if restaurant_id:
            qs = qs.filter(restaurant_id=restaurant_id)
        return qs


class FoodOrderViewSet(viewsets.ModelViewSet):
    queryset = FoodOrder.objects.all().prefetch_related('items', 'items__food').order_by('-order_time')
    serializer_class = FoodOrderSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    def create(self, request, *args, **kwargs):
        data = request.data
        booking_id = data.get('booking_id')
        customer_id = data.get('customer_id')
        room_id = data.get('room_id')
        items_data = data.get('items', [])

        if not items_data:
            return api_error("Order items list cannot be empty")

        booking = Booking.objects.get(id=booking_id) if booking_id else None
        customer = Customer.objects.get(id=customer_id) if customer_id else (booking.customer if booking else None)
        room = Room.objects.get(id=room_id) if room_id else (booking.booking_rooms.first().room if booking else None)

        if not customer:
            return api_error("Valid customer or booking required")

        total_amount = Decimal('0.00')
        order = FoodOrder.objects.create(
            booking=booking,
            customer=customer,
            room=room,
            total_amount=Decimal('0.00'),
            status='Pending',
            payment_status=data.get('payment_status', 'Billed to Room')
        )

        for item in items_data:
            food_id = item.get('food_id')
            qty = int(item.get('quantity', 1))
            food = Food.objects.get(id=food_id)
            subtotal = food.price * qty
            total_amount += subtotal
            OrderItem.objects.create(
                food_order=order,
                food=food,
                quantity=qty,
                unit_price=food.price,
                subtotal=subtotal
            )

        order.total_amount = total_amount
        order.save()

        return api_response(
            success=True,
            message="Food order placed successfully!",
            data=FoodOrderSerializer(order).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Transition order status: Pending -> Accepted -> Preparing -> Ready -> Delivered -> Cancelled
        """
        order = self.get_object()
        new_status = request.data.get('status')
        if not new_status:
            return api_error("New status is required")

        order.status = new_status
        order.save()
        return api_response(
            success=True,
            message=f"Order #{order.id} status updated to {order.status}",
            data=FoodOrderSerializer(order).data
        )
