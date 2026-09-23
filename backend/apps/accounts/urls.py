from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from apps.accounts.views import LoginView, RegisterView, CurrentUserView, RoleListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth_login'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
    path('roles/', RoleListView.as_view(), name='auth_roles'),
]
