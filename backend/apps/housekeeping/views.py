from rest_framework import serializers, viewsets, permissions, filters, status
from rest_framework.decorators import action
from django.utils import timezone
from apps.core.models import HousekeepingTask, Room, Staff
from apps.core.utils import api_response, api_error


class HousekeepingTaskSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_floor = serializers.IntegerField(source='room.floor', read_only=True)
    room_type = serializers.CharField(source='room.room_type.type_name', read_only=True)
    hotel_name = serializers.CharField(source='room.hotel.name', read_only=True)
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)

    class Meta:
        model = HousekeepingTask
        fields = [
            'id', 'room_id', 'room_number', 'room_floor', 'room_type', 'hotel_name',
            'staff_id', 'staff_name', 'task_type', 'priority', 'status',
            'scheduled_time', 'completed_at', 'notes'
        ]


class HousekeepingTaskViewSet(viewsets.ModelViewSet):
    queryset = HousekeepingTask.objects.all().select_related('room', 'room__hotel', 'room__room_type', 'staff').order_by('-priority', '-scheduled_time')
    serializer_class = HousekeepingTaskSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        priority = self.request.query_params.get('priority')
        staff_id = self.request.query_params.get('staff_id')
        room_id = self.request.query_params.get('room_id')

        if status_param:
            qs = qs.filter(status=status_param)
        if priority:
            qs = qs.filter(priority=priority)
        if staff_id:
            qs = qs.filter(staff_id=staff_id)
        if room_id:
            qs = qs.filter(room_id=room_id)
        return qs

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return api_response(success=True, data=response.data)

    @action(detail=True, methods=['patch'])
    def update_task_status(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        staff_id = request.data.get('staff_id')

        if new_status:
            task.status = new_status
            if new_status == 'Completed':
                task.completed_at = timezone.now()
                # Update room status
                room = task.room
                room.housekeeping_status = 'Clean'
                if room.status == 'Cleaning':
                    room.status = 'Available'
                room.save()
            elif new_status == 'Cleaning':
                room = task.room
                room.housekeeping_status = 'In Progress'
                room.save()

        if staff_id:
            task.staff_id = staff_id

        task.save()
        return api_response(
            success=True,
            message=f"Housekeeping task for Room {task.room.room_number} updated to {task.status}",
            data=HousekeepingTaskSerializer(task).data
        )
