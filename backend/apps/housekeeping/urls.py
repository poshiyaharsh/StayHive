from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.housekeeping.views import HousekeepingTaskViewSet

router = DefaultRouter()
# Support both /api/housekeeping/tasks/ and /api/housekeeping/
router.register(r'housekeeping/tasks', HousekeepingTaskViewSet, basename='housekeeping-tasks')
router.register(r'housekeeping', HousekeepingTaskViewSet, basename='housekeeping')

urlpatterns = [
    path('', include(router.urls)),
]
