from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.restaurant.views import RestaurantViewSet, FoodViewSet, FoodOrderViewSet

router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'foods', FoodViewSet, basename='food')
router.register(r'food-orders', FoodOrderViewSet, basename='food_order')
router.register(r'orders', FoodOrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
