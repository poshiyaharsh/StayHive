from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.housekeeping.views import HousekeepingTaskViewSet

router = DefaultRouter()
router.register(r'housekeeping', HousekeepingTaskViewSet, basename='housekeeping')

urlpatterns = [
    path('', include(router.urls)),
]
