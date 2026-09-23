from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.staff.views import StaffViewSet, DepartmentViewSet

router = DefaultRouter()
router.register(r'staff', StaffViewSet, basename='staff')
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    path('', include(router.urls)),
]
