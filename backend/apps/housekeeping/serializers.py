from rest_framework import serializers
from apps.core.models import HousekeepingTask, Room, Staff


class HousekeepingTaskSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source='id', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_floor = serializers.IntegerField(source='room.floor', read_only=True)
    floor_number = serializers.IntegerField(source='room.floor', read_only=True)
    room_type = serializers.CharField(source='room.room_type.type_name', read_only=True)
    hotel_name = serializers.CharField(source='room.hotel.name', read_only=True)
    hotel_id = serializers.IntegerField(source='room.hotel_id', read_only=True)
    staff_name = serializers.CharField(source='staff.user.get_full_name', read_only=True)
    staff_department = serializers.CharField(source='staff.department.name', read_only=True)
    
    scheduled_date = serializers.SerializerMethodField()
    completed_date = serializers.SerializerMethodField()
    remarks = serializers.CharField(source='notes', required=False, allow_blank=True, allow_null=True)
    task_status = serializers.SerializerMethodField()

    class Meta:
        model = HousekeepingTask
        fields = [
            'id', 'task_id', 'room_id', 'room_number', 'room_floor', 'floor_number',
            'room_type', 'hotel_name', 'hotel_id',
            'staff_id', 'staff_name', 'staff_department',
            'task_type', 'priority', 'status', 'task_status',
            'scheduled_time', 'scheduled_date',
            'completed_at', 'completed_date',
            'notes', 'remarks'
        ]

    def get_scheduled_date(self, obj):
        if not obj.scheduled_time:
            return None
        return obj.scheduled_time.strftime('%Y-%m-%d')

    def get_completed_date(self, obj):
        if not obj.completed_at:
            return None
        return obj.completed_at.strftime('%Y-%m-%d')

    def get_task_status(self, obj):
        status_map = {
            'Pending': 'scheduled',
            'Assigned': 'scheduled',
            'Scheduled': 'scheduled',
            'Cleaning': 'in_progress',
            'In Progress': 'in_progress',
            'Inspection': 'in_progress',
            'Completed': 'completed',
            'Cancelled': 'cancelled'
        }
        return status_map.get(obj.status, obj.status.lower().replace(' ', '_'))
