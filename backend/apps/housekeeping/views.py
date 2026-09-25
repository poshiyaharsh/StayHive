from datetime import datetime, date
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response

from apps.core.models import HousekeepingTask, Room, Staff, Department
from apps.core.utils import api_response, api_error
from apps.housekeeping.serializers import HousekeepingTaskSerializer
from apps.housekeeping.permissions import HousekeepingPermission
from apps.notifications.services import notify_user, notify_role
from apps.notifications.constants import TYPE_HOUSEKEEPING_TASK



HK_STATUS_NORM = {
    'scheduled': 'Scheduled',
    'pending': 'Pending',
    'assigned': 'Assigned',
    'in_progress': 'In Progress',
    'in progress': 'In Progress',
    'cleaning': 'Cleaning',
    'inspection': 'Inspection',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'canceled': 'Cancelled',
}

HK_TRANSITIONS = {
    'Pending': ['Assigned', 'Scheduled', 'Cleaning', 'In Progress', 'Cancelled'],
    'Assigned': ['Scheduled', 'Cleaning', 'In Progress', 'Cancelled'],
    'Scheduled': ['Cleaning', 'In Progress', 'Cancelled'],
    'Cleaning': ['In Progress', 'Inspection', 'Completed', 'Cancelled'],
    'In Progress': ['Inspection', 'Completed', 'Cancelled'],
    'Inspection': ['Completed', 'Cleaning', 'In Progress', 'Cancelled'],
    'Completed': [],
    'Cancelled': [],
}

ACTIVE_HK_STATUSES = ['Pending', 'Assigned', 'Scheduled', 'Cleaning', 'In Progress', 'Inspection']


class HousekeepingTaskViewSet(viewsets.ModelViewSet):
    """
    CRUD and status workflows for Housekeeping Tasks:
    - ADMIN, MANAGER: Full control
    - RECEPTION: View and create tasks
    - HOUSEKEEPING: View assigned tasks, start cleaning, complete cleaning
    - CUSTOMER, RESTAURANT: 403 Forbidden
    """
    queryset = HousekeepingTask.objects.all().select_related(
        'room', 'room__hotel', 'room__room_type', 'staff', 'staff__user', 'staff__department'
    ).order_by('-scheduled_time', '-id')
    serializer_class = HousekeepingTaskSerializer
    permission_classes = [HousekeepingPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['room__room_number', 'notes', 'task_type', 'staff__user__first_name', 'staff__user__last_name']
    ordering_fields = ['scheduled_time', 'priority', 'status', 'id']

    def get_queryset(self):
        qs = super().get_queryset()
        role = getattr(self.request.user.role, 'name', '') if getattr(self.request.user, 'role', None) else ''

        # Staff isolation: Housekeeping staff can only view tasks assigned to them by default on list
        if role == 'HOUSEKEEPING' and self.action in ['list', None]:
            staff = Staff.objects.filter(user=self.request.user).first()
            if staff:
                qs = qs.filter(staff=staff)
            else:
                qs = qs.none()

        status_param = self.request.query_params.get('status')
        if status_param and status_param.lower() != 'all':
            norm_status = HK_STATUS_NORM.get(status_param.lower(), status_param)
            # Match both normalized status and variations
            if norm_status in ['In Progress', 'Cleaning']:
                qs = qs.filter(status__in=['Cleaning', 'In Progress', 'Inspection'])
            elif norm_status in ['Scheduled', 'Pending', 'Assigned']:
                qs = qs.filter(status__in=['Pending', 'Assigned', 'Scheduled'])
            else:
                qs = qs.filter(status__iexact=norm_status)

        staff_id = self.request.query_params.get('staff_id')
        if staff_id:
            qs = qs.filter(staff_id=staff_id)

        room_id = self.request.query_params.get('room_id')
        if room_id:
            qs = qs.filter(room_id=room_id)

        floor = self.request.query_params.get('floor_number') or self.request.query_params.get('floor')
        if floor and floor.lower() != 'all':
            qs = qs.filter(room__floor=floor)

        scheduled_date = self.request.query_params.get('scheduled_date')
        if scheduled_date:
            try:
                dt = datetime.strptime(scheduled_date, '%Y-%m-%d').date()
                qs = qs.filter(scheduled_time__date=dt)
            except ValueError:
                pass

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
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role == 'HOUSEKEEPING':
            staff = Staff.objects.filter(user=request.user).first()
            if not staff or instance.staff_id != staff.id:
                return api_error("You are not assigned to this housekeeping task.", status_code=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance)
        return api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        room_id = request.data.get('room_id')
        staff_id = request.data.get('staff_id')
        remarks = request.data.get('remarks') or request.data.get('notes', '')
        task_type = request.data.get('task_type', 'Daily Clean')
        priority = request.data.get('priority', 'Medium')
        scheduled_date_raw = request.data.get('scheduled_date') or request.data.get('scheduled_time')

        if not room_id:
            return api_error("room_id is required.", status_code=status.HTTP_400_BAD_REQUEST)

        # 1. Room validation
        room = Room.objects.filter(id=room_id).first()
        if not room:
            return api_error("Room not found.", status_code=status.HTTP_404_NOT_FOUND)

        # 2. Staff validation (Department & Active status)
        staff = None
        if staff_id:
            staff = Staff.objects.filter(id=staff_id).select_related('department', 'user').first()
            if not staff:
                return api_error("Staff member not found.", status_code=status.HTTP_404_NOT_FOUND)

            # Validate staff is active
            if staff.status != 'Active':
                return api_error("Only active staff can be assigned to housekeeping tasks.", status_code=status.HTTP_400_BAD_REQUEST)

            # Validate staff belongs to Housekeeping department
            if not staff.department or 'housekeeping' not in staff.department.name.lower():
                return api_error("Only housekeeping staff can be assigned to housekeeping tasks.", status_code=status.HTTP_400_BAD_REQUEST)

        # 3. Scheduled time parsing
        scheduled_time = timezone.now()
        if scheduled_date_raw:
            try:
                if 'T' in str(scheduled_date_raw):
                    scheduled_time = datetime.fromisoformat(str(scheduled_date_raw).replace('Z', '+00:00'))
                else:
                    d = datetime.strptime(str(scheduled_date_raw), '%Y-%m-%d').date()
                    scheduled_time = timezone.make_aware(datetime.combine(d, datetime.min.time()))
            except Exception:
                return api_error("Invalid scheduled date format. Use YYYY-MM-DD.", status_code=status.HTTP_400_BAD_REQUEST)

        # 4. Duplicate task prevention
        with transaction.atomic():
            existing_active_task = HousekeepingTask.objects.filter(
                room=room,
                status__in=ACTIVE_HK_STATUSES
            ).first()
            if existing_active_task:
                return api_error(
                    "An active housekeeping task already exists for this room.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

            task = HousekeepingTask.objects.create(
                room=room,
                staff=staff,
                task_type=task_type,
                priority=priority,
                status='Scheduled' if staff else 'Pending',
                scheduled_time=scheduled_time,
                notes=remarks
            )

        # Notify assigned staff member
        if task.staff and task.staff.user:
            notify_user(
                task.staff.user,
                f"Room {room.room_number} has been assigned to you for housekeeping.",
                notification_type=TYPE_HOUSEKEEPING_TASK,
                title="Housekeeping Assignment"
            )

        serializer = self.get_serializer(task)
        return api_response(
            success=True,
            message=f"Housekeeping task for Room {room.room_number} created successfully!",
            data=serializer.data,
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''

        # Staff isolation: Housekeeping staff can only modify their own task
        if role == 'HOUSEKEEPING':
            staff = Staff.objects.filter(user=request.user).first()
            if not staff or instance.staff_id != staff.id:
                return api_error("You are not assigned to this housekeeping task.", status_code=status.HTTP_403_FORBIDDEN)

        new_status_raw = request.data.get('status') or request.data.get('task_status')
        if new_status_raw:
            err = self._apply_status_transition(instance, new_status_raw)
            if err:
                return err

        # Handle staff reassignment by Admin/Manager
        staff_id = request.data.get('staff_id')
        if staff_id and role in ['ADMIN', 'MANAGER']:
            new_staff = Staff.objects.filter(id=staff_id).select_related('department', 'user').first()
            if not new_staff or new_staff.status != 'Active':
                return api_error("Only active staff can be assigned.", status_code=status.HTTP_400_BAD_REQUEST)
            if not new_staff.department or 'housekeeping' not in new_staff.department.name.lower():
                return api_error("Only housekeeping staff can be assigned to housekeeping tasks.", status_code=status.HTTP_400_BAD_REQUEST)
            instance.staff = new_staff
            if new_staff.user:
                notify_user(
                    new_staff.user,
                    f"Room {instance.room.room_number} has been assigned to you for housekeeping.",
                    notification_type=TYPE_HOUSEKEEPING_TASK,
                    title="Housekeeping Assignment"
                )

        remarks = request.data.get('remarks') or request.data.get('notes')
        if remarks is not None:
            instance.notes = remarks

        instance.save()

        # If completed, notify reception and management
        if instance.status == 'Completed':
            notify_role("RECEPTION", f"Room {instance.room.room_number} housekeeping task has been completed.", notification_type=TYPE_HOUSEKEEPING_TASK, title="Housekeeping Completed")
            notify_role("MANAGER", f"Room {instance.room.room_number} housekeeping task has been completed.", notification_type=TYPE_HOUSEKEEPING_TASK, title="Housekeeping Completed")

        serializer = self.get_serializer(instance)
        return api_response(
            success=True,
            message=f"Housekeeping task for Room {instance.room.room_number} updated successfully.",
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'], url_path='status')
    def status_action(self, request, pk=None):
        return self.update_task_status(request, pk=pk)

    @action(detail=True, methods=['patch'])
    def update_task_status(self, request, pk=None):
        instance = self.get_object()
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''

        # Staff isolation check
        if role == 'HOUSEKEEPING':
            staff = Staff.objects.filter(user=request.user).first()
            if not staff or instance.staff_id != staff.id:
                return api_error("You are not assigned to this housekeeping task.", status_code=status.HTTP_403_FORBIDDEN)

        new_status_raw = request.data.get('status') or request.data.get('task_status')
        if not new_status_raw:
            return api_error("Status is required.", status_code=status.HTTP_400_BAD_REQUEST)

        err = self._apply_status_transition(instance, new_status_raw)
        if err:
            return err

        instance.save()

        # If completed, notify reception and management
        if instance.status == 'Completed':
            notify_role("RECEPTION", f"Room {instance.room.room_number} housekeeping task has been completed.", notification_type=TYPE_HOUSEKEEPING_TASK, title="Housekeeping Completed")
            notify_role("MANAGER", f"Room {instance.room.room_number} housekeeping task has been completed.", notification_type=TYPE_HOUSEKEEPING_TASK, title="Housekeeping Completed")

        return api_response(
            success=True,
            message=f"Housekeeping task for Room {instance.room.room_number} updated to {instance.status}.",
            data=self.get_serializer(instance).data,
            status_code=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def my(self, request):
        role = getattr(request.user.role, 'name', '') if getattr(request.user, 'role', None) else ''
        if role != 'HOUSEKEEPING':
            # For admin/manager returning all is fine, but for staff isolation:
            staff = Staff.objects.filter(user=request.user).first()
        else:
            staff = Staff.objects.filter(user=request.user).first()

        if not staff:
            return api_response(success=True, data=[])

        qs = HousekeepingTask.objects.filter(
            staff=staff
        ).select_related(
            'room', 'room__hotel', 'room__room_type', 'staff', 'staff__user', 'staff__department'
        ).order_by('-scheduled_time', '-id')

        serializer = self.get_serializer(qs, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=False, methods=['get'], url_path='room-board')
    def room_board(self, request):
        """
        Room Housekeeping Board with operational and cleanliness statuses.
        """
        rooms = Room.objects.all().select_related('hotel', 'room_type').order_by('floor', 'room_number')
        
        floor = request.query_params.get('floor')
        if floor and floor.lower() != 'all':
            rooms = rooms.filter(floor=floor)

        hk_status = request.query_params.get('housekeeping_status')
        if hk_status and hk_status.lower() != 'all':
            rooms = rooms.filter(housekeeping_status__iexact=hk_status)

        data = []
        for r in rooms:
            data.append({
                "room_id": r.id,
                "room_number": r.room_number,
                "floor": r.floor,
                "room_type": r.room_type.type_name if r.room_type else "Standard",
                "room_status": r.status,
                "housekeeping_status": r.housekeeping_status,
                "is_dirty": r.housekeeping_status == 'Needs Cleaning',
                "is_clean": r.housekeeping_status == 'Clean',
            })
        return api_response(success=True, data=data)

    def _apply_status_transition(self, instance, new_status_raw):
        norm_status = HK_STATUS_NORM.get(new_status_raw.strip().lower(), new_status_raw)
        current_status = instance.status

        if current_status == 'Completed' and norm_status != 'Completed':
            return api_error("Completed tasks cannot be moved back to in progress.", status_code=status.HTTP_400_BAD_REQUEST)

        if current_status == 'Cancelled' and norm_status != 'Cancelled':
            return api_error("Cancelled tasks cannot be reopened.", status_code=status.HTTP_400_BAD_REQUEST)

        # Allow legitimate transitions or staying in same status
        if norm_status != current_status:
            allowed = HK_TRANSITIONS.get(current_status, [])
            if norm_status not in allowed:
                return api_error(
                    f"Invalid transition from '{current_status}' to '{norm_status}'.",
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        instance.status = norm_status

        # Room cleanliness synchronization
        with transaction.atomic():
            room = instance.room
            if norm_status in ['Cleaning', 'In Progress']:
                room.housekeeping_status = 'In Progress'
                room.save()
            elif norm_status == 'Completed':
                instance.completed_at = timezone.now()
                room.housekeeping_status = 'Clean'
                # DO NOT alter room.status if occupied or another operational state
                room.save()

        return None
