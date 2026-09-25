from decimal import Decimal
from datetime import date
from django.db import transaction
from django.utils import timezone
from django.db.models import Sum, Q
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.core.models import Restaurant, Food, FoodOrder, OrderItem, Booking, Customer, Room
from apps.core.utils import api_response, api_error
from apps.restaurant.serializers import (
    RestaurantSerializer, FoodSerializer, OrderItemSerializer,
    FoodOrderSerializer, CreateFoodOrderSerializer, UpdateOrderStatusSerializer
)
from apps.restaurant.permissions import RestaurantPermission, FoodMenuPermission, FoodOrderPermission
from apps.notifications.services import notify_role, notify_customer
from apps.notifications.constants import TYPE_FOOD_ORDER_CREATED, TYPE_FOOD_ORDER_STATUS



class RestaurantViewSet(viewsets.ModelViewSet):
    """
    CRUD for Hotel Restaurants.
    - ADMIN, MANAGER: full CRUD
    - RESTAURANT, RECEPTION, CUSTOMER: read-only
    - HOUSEKEEPING: 403 Forbidden
    """
    queryset = Restaurant.objects.all().select_related('hotel').prefetch_related('foods')
    serializer_class = RestaurantSerializer
    permission_classes = [RestaurantPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'cuisine', 'hotel__name']
    ordering_fields = ['name', 'id']

    def get_queryset(self):
        qs = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        hotel_id = self.request.query_params.get('hotel_id')

        if is_active is not None:
            qs = qs.filter(is_active=(is_active.lower() in ['true', '1']))
        if hotel_id:
            qs = qs.filter(hotel_id=hotel_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(
            success=True,
            message="Restaurant created successfully!",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            success=True,
            message="Restaurant updated successfully!",
            data=serializer.data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        self.perform_destroy(instance)
        return api_response(
            success=True,
            message=f"Restaurant '{name}' deleted successfully."
        )


class FoodViewSet(viewsets.ModelViewSet):
    """
    CRUD for Food Menu Items.
    - ADMIN, MANAGER, RESTAURANT: full CRUD
    - RECEPTION, CUSTOMER: read-only
    - HOUSEKEEPING: 403 Forbidden
    """
    queryset = Food.objects.all().select_related('restaurant').order_by('category', 'name')
    serializer_class = FoodSerializer
    permission_classes = [FoodMenuPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'category', 'restaurant__name']
    ordering_fields = ['price', 'preparation_time', 'name']

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        is_veg = self.request.query_params.get('is_veg')
        is_available = self.request.query_params.get('is_available')
        restaurant_id = self.request.query_params.get('restaurant_id')

        if category and category.lower() != 'all':
            qs = qs.filter(category__iexact=category)
        if is_veg is not None:
            qs = qs.filter(is_veg=(is_veg.lower() in ['true', '1']))
        if is_available is not None:
            qs = qs.filter(is_available=(is_available.lower() in ['true', '1']))
        if restaurant_id:
            qs = qs.filter(restaurant_id=restaurant_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return api_response(
            success=True,
            message="Food item created successfully!",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return api_response(
            success=True,
            message="Food item updated successfully!",
            data=serializer.data
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        self.perform_destroy(instance)
        return api_response(
            success=True,
            message=f"Food item '{name}' deleted successfully."
        )


class FoodOrderViewSet(viewsets.ModelViewSet):
    """
    Food Order operations with strict transactional safety, price snapshotting,
    customer data isolation, and canonical status transitions.
    """
    queryset = FoodOrder.objects.all().select_related(
        'booking', 'customer', 'customer__user', 'room'
    ).prefetch_related(
        'items', 'items__food', 'items__food__restaurant'
    ).order_by('-order_time')
    serializer_class = FoodOrderSerializer
    permission_classes = [FoodOrderPermission]

    # Status mapping to MySQL enum
    STATUS_MAP = {
        'pending': 'Pending',
        'accepted': 'Accepted',
        'confirmed': 'Accepted',
        'preparing': 'Preparing',
        'ready': 'Ready',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
    }

    # Allowed forward transitions
    VALID_TRANSITIONS = {
        'Pending': ['Accepted', 'Cancelled'],
        'Accepted': ['Preparing', 'Cancelled'],
        'Preparing': ['Ready'],
        'Ready': ['Delivered'],
        'Delivered': [],
        'Cancelled': [],
    }

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        role = getattr(user.role, 'name', '') if getattr(user, 'role', None) else ''

        # Customers can ONLY view their own orders
        if role == 'CUSTOMER':
            customer = Customer.objects.filter(user=user).first()
            if not customer:
                return qs.none()
            qs = qs.filter(customer=customer)
        else:
            # Staff can filter by customer, booking, status, room
            customer_id = self.request.query_params.get('customer_id')
            booking_id = self.request.query_params.get('booking_id')
            status_param = self.request.query_params.get('status')
            room_id = self.request.query_params.get('room_id')

            if customer_id:
                qs = qs.filter(customer_id=customer_id)
            if booking_id:
                qs = qs.filter(booking_id=booking_id)
            if status_param and status_param.lower() != 'all':
                normalized = self.STATUS_MAP.get(status_param.lower(), status_param)
                qs = qs.filter(status=normalized)
            if room_id:
                qs = qs.filter(room_id=room_id)

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get('pk')
        instance = FoodOrder.objects.filter(pk=pk).select_related(
            'booking', 'customer', 'customer__user', 'room'
        ).prefetch_related('items', 'items__food', 'items__food__restaurant').first()

        if not instance:
            return api_error("Food order not found.", status_code=status.HTTP_404_NOT_FOUND)

        self.check_object_permissions(request, instance)
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Create a new food order with atomic transaction, price snapshotting,
        and strict customer / booking validation.
        """
        serializer = CreateFoodOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data

        booking_id = validated['booking_id']
        room_id = validated.get('room_id')
        items_data = validated['items']
        payment_status = validated.get('payment_status', 'Billed to Room')

        user = request.user
        role = getattr(user.role, 'name', '') if getattr(user, 'role', None) else ''

        # 1. Resolve Customer
        if role == 'CUSTOMER':
            customer = Customer.objects.filter(user=user).first()
            if not customer:
                return api_error("Customer profile not found for authenticated user.", status_code=status.HTTP_400_BAD_REQUEST)
        else:
            # Staff placing order for a booking
            booking_obj = Booking.objects.filter(id=booking_id).first()
            customer = booking_obj.customer if booking_obj else None

        # 2. Validate Booking
        booking = Booking.objects.filter(id=booking_id).select_related('customer', 'customer__user').first()
        if not booking:
            return api_error("Booking not found.", status_code=status.HTTP_400_BAD_REQUEST)

        # Validate customer ownership
        if role == 'CUSTOMER' and booking.customer_id != customer.id:
            return api_error(
                "You cannot create food orders for another customer's booking.",
                status_code=status.HTTP_403_FORBIDDEN
            )

        # Validate booking status
        # Must not be cancelled, checked out, or completed
        if booking.status in ['Cancelled', 'Completed', 'Checked-out']:
            return api_error(
                "Food orders are available only for an active hotel stay.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # 3. Resolve Room
        room = None
        if room_id:
            room = Room.objects.filter(id=room_id).first()
        if not room:
            # Infer from booking's room assignment
            first_br = booking.booking_rooms.select_related('room').first()
            room = first_br.room if first_br else None

        # 4. Atomic Transaction: Validate Items, Snapshot Prices, Create Order
        try:
            with transaction.atomic():
                order = FoodOrder.objects.create(
                    booking=booking,
                    customer=customer,
                    room=room,
                    total_amount=Decimal('0.00'),
                    status='Pending',
                    payment_status=payment_status
                )

                total_amount = Decimal('0.00')

                for item in items_data:
                    food_id = item['food_id']
                    qty = int(item['quantity'])

                    if qty <= 0:
                        raise ValueError("Quantity must be greater than zero.")

                    food = Food.objects.filter(id=food_id).first()
                    if not food:
                        raise ValueError(f"Food item #{food_id} not found.")

                    if not food.is_available:
                        raise ValueError(f"{food.name} is currently unavailable.")

                    # PRICE SNAPSHOT & TAMPERING PROTECTION:
                    # Ignore any client-sent price; strictly use current Food.price
                    unit_price = Decimal(str(food.price))
                    subtotal = unit_price * Decimal(qty)
                    total_amount += subtotal

                    OrderItem.objects.create(
                        food_order=order,
                        food=food,
                        quantity=qty,
                        unit_price=unit_price,
                        subtotal=subtotal
                    )

                order.total_amount = total_amount
                order.save()

        except ValueError as e:
            return api_error(str(e), status_code=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return api_error(f"Failed to place food order: {str(e)}", status_code=status.HTTP_400_BAD_REQUEST)

        # Reload with relations for response
        reloaded_order = FoodOrder.objects.filter(id=order.id).select_related(
            'booking', 'customer', 'customer__user', 'room'
        ).prefetch_related('items', 'items__food', 'items__food__restaurant').first()

        # Notify restaurant staff and management
        notify_role('RESTAURANT', f"New food order #{order.id} has been placed.", notification_type=TYPE_FOOD_ORDER_CREATED, title="New Food Order")
        notify_role('ADMIN', f"New food order #{order.id} has been placed.", notification_type=TYPE_FOOD_ORDER_CREATED, title="New Food Order")
        notify_role('MANAGER', f"New food order #{order.id} has been placed.", notification_type=TYPE_FOOD_ORDER_CREATED, title="New Food Order")

        return api_response(
            success=True,
            message="Food order placed successfully!",
            data=FoodOrderSerializer(reloaded_order).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='my')
    def my(self, request):
        """
        GET /api/food-orders/my/
        Returns only the food orders belonging to the authenticated customer.
        """
        user = request.user
        customer = Customer.objects.filter(user=user).first()
        if not customer:
            return api_response(success=True, data=[])

        orders = FoodOrder.objects.filter(customer=customer).select_related(
            'booking', 'customer', 'customer__user', 'room'
        ).prefetch_related('items', 'items__food', 'items__food__restaurant').order_by('-order_time')

        serializer = FoodOrderSerializer(orders, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=True, methods=['patch', 'post'], url_path='status')
    def status_update(self, request, pk=None):
        """
        PATCH /api/food-orders/{id}/status/
        Advance order status according to canonical transition rules.
        """
        order = self.get_object()
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        raw_status = serializer.validated_data['status']
        normalized_new = self.STATUS_MAP.get(raw_status.lower(), raw_status)

        current_status = order.status
        allowed_next = self.VALID_TRANSITIONS.get(current_status, [])

        if normalized_new != current_status and normalized_new not in allowed_next:
            return api_error(
                f"Order cannot be moved from {current_status.lower()} to {raw_status.lower()}.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        order.status = normalized_new
        order.save()

        # Notify customer of status change
        status_msgs = {
            'Accepted': f"Food order #{order.id} has been confirmed.",
            'Preparing': f"Food order #{order.id} is being prepared.",
            'Ready': f"Food order #{order.id} is ready.",
            'Delivered': f"Food order #{order.id} has been delivered.",
        }
        msg = status_msgs.get(normalized_new, f"Food order #{order.id} is now {normalized_new.lower()}.")
        if order.customer:
            notify_customer(order.customer, msg, notification_type=TYPE_FOOD_ORDER_STATUS, title="Food Order Update")

        reloaded = FoodOrder.objects.filter(id=order.id).select_related(
            'booking', 'customer', 'customer__user', 'room'
        ).prefetch_related('items', 'items__food', 'items__food__restaurant').first()

        return api_response(
            success=True,
            message=f"Order #{order.id} status updated to {order.status}",
            data=FoodOrderSerializer(reloaded).data
        )

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """
        POST /api/food-orders/{id}/cancel/
        Customer or staff cancels a pending food order.
        """
        order = self.get_object()
        self.check_object_permissions(request, order)

        if order.status not in ['Pending', 'Accepted']:
            return api_error(
                f"Order cannot be cancelled once it is in {order.status.lower()} stage.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        order.status = 'Cancelled'
        order.save()

        if order.customer:
            notify_customer(order.customer, f"Food order #{order.id} has been cancelled.", notification_type=TYPE_FOOD_ORDER_STATUS, title="Food Order Cancelled")

        return api_response(
            success=True,
            message=f"Order #{order.id} has been cancelled.",
            data=FoodOrderSerializer(order).data
        )

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        GET /api/food-orders/stats/
        Live Kitchen Display System (KDS) & Order statistics.
        """
        today = date.today()
        hotel_id = request.query_params.get('hotel_id')

        qs = FoodOrder.objects.all()
        if hotel_id:
            qs = qs.filter(booking__hotel_id=hotel_id)

        pending_count = qs.filter(status='Pending').count()
        accepted_count = qs.filter(status='Accepted').count()
        preparing_count = qs.filter(status='Preparing').count()
        ready_count = qs.filter(status='Ready').count()
        delivered_today = qs.filter(status='Delivered', order_time__date=today).count()
        delivered_total = qs.filter(status='Delivered').count()

        today_revenue = qs.filter(
            order_time__date=today
        ).exclude(status='Cancelled').aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        data = {
            'pending_count': pending_count,
            'confirmed_count': accepted_count,
            'accepted_count': accepted_count,
            'preparing_count': preparing_count,
            'ready_count': ready_count,
            'delivered_today_count': delivered_today,
            'delivered_total_count': delivered_total,
            'today_food_revenue': float(today_revenue),
        }
        return api_response(success=True, data=data)
