from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from apps.core.models import User, Role, Customer
from apps.accounts.serializers import UserSerializer, RoleSerializer, LoginSerializer, RegisterSerializer
from apps.accounts.auth import authenticate_stayhive_user, get_tokens_for_user
from apps.core.utils import api_response, api_error


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Invalid credentials format", errors=serializer.errors)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate_stayhive_user(username, password)
        if not user:
            return api_error("Invalid username or password", status_code=status.HTTP_401_UNAUTHORIZED)
        
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        
        # Permissions list based on role
        role_name = user.role.name if user.role else 'CUSTOMER'
        role_permissions = {
            'ADMIN': ['all'],
            'MANAGER': ['hotels.view', 'rooms.view', 'bookings.manage', 'reports.view', 'staff.view', 'billing.manage'],
            'RECEPTION': ['bookings.create', 'bookings.manage', 'checkin.manage', 'rooms.view', 'guests.view'],
            'HOUSEKEEPING': ['housekeeping.manage', 'rooms.status_update'],
            'RESTAURANT': ['orders.manage', 'menu.manage'],
            'CUSTOMER': ['bookings.create_self', 'services.request', 'orders.create_self', 'invoices.view_self']
        }.get(role_name, ['basic.view'])

        return api_response(
            success=True,
            message="Login successful",
            data={
                "access": tokens['access'],
                "refresh": tokens['refresh'],
                "user": user_data,
                "role": role_name,
                "permissions": role_permissions
            }
        )


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error("Registration validation failed", errors=serializer.errors)
        
        user = serializer.save()
        
        # If customer role, also create Customer entry
        if user.role.name == 'CUSTOMER':
            Customer.objects.create(
                user=user,
                address=request.data.get('address', ''),
                id_proof_type=request.data.get('id_proof_type', 'Aadhaar Card'),
                id_proof_number=request.data.get('id_proof_number', '')
            )

        tokens = get_tokens_for_user(user)
        return api_response(
            success=True,
            message="User registered successfully",
            data={
                "access": tokens['access'],
                "refresh": tokens['refresh'],
                "user": UserSerializer(user).data,
                "role": user.role.name
            },
            status_code=status.HTTP_201_CREATED
        )


class CurrentUserView(APIView):
    permission_classes = [permissions.AllowAny]  # Let header parse Bearer or demo token

    def get(self, request):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                from rest_framework_simplejwt.tokens import AccessToken
                access = AccessToken(token)
                user_id = access['user_id']
                user = User.objects.get(id=user_id)
                return api_response(success=True, data=UserSerializer(user).data)
            except Exception as e:
                pass
        
        # Fallback to query param or default admin for demo convenience
        user_id = request.query_params.get('user_id', 1)
        try:
            user = User.objects.get(id=user_id)
            return api_response(success=True, data=UserSerializer(user).data)
        except User.DoesNotExist:
            return api_error("User not found", status_code=status.HTTP_404_NOT_FOUND)


class RoleListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        roles = Role.objects.all()
        return api_response(success=True, data=RoleSerializer(roles, many=True).data)
