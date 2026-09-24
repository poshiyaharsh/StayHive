from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination

from apps.core.models import Feedback, Booking, Customer, Complaint, Inquiry
from apps.core.utils import api_response, api_error
from apps.feedback.serializers import FeedbackSerializer, FeedbackCreateSerializer
from apps.feedback.permissions import FeedbackPermission, get_user_role


class FeedbackPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all().select_related(
        'customer', 'customer__user', 'hotel', 'booking'
    ).order_by('-created_at')
    serializer_class = FeedbackSerializer
    permission_classes = [FeedbackPermission]
    pagination_class = FeedbackPagination

    def get_queryset(self):
        qs = super().get_queryset()
        role = get_user_role(self.request.user)

        # Customer isolation
        if role == 'customer':
            customer = Customer.objects.filter(user=self.request.user).first()
            if not customer:
                return qs.none()
            return qs.filter(customer=customer)

        # Filtering for staff
        rating = self.request.query_params.get('rating')
        if rating:
            try:
                qs = qs.filter(rating=int(rating))
            except ValueError:
                pass

        booking_id = self.request.query_params.get('booking_id')
        if booking_id:
            qs = qs.filter(booking_id=booking_id)

        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            qs = qs.filter(customer_id=customer_id)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(comments__icontains=search) |
                Q(customer__user__first_name__icontains=search) |
                Q(customer__user__last_name__icontains=search) |
                Q(hotel__name__icontains=search)
            )

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Paginate only if 'page' parameter is provided or if requested
        if 'page' in request.query_params:
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
        serializer = FeedbackCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return api_error(message="Invalid feedback data", errors=serializer.errors)

        validated_data = serializer.validated_data
        booking_id = validated_data['booking_id']
        rating = validated_data['rating']
        comment = validated_data.get('comment') or validated_data.get('comments', '')
        cleanliness_rating = validated_data.get('cleanliness_rating', 5)
        service_rating = validated_data.get('service_rating', 5)

        # Derive customer from JWT
        customer = Customer.objects.filter(user=request.user).first()
        if not customer:
            return api_error("Customer profile not found for authenticated user", status_code=status.HTTP_400_BAD_REQUEST)

        # Verify booking exists
        try:
            booking = Booking.objects.select_related('hotel').get(id=booking_id)
        except Booking.DoesNotExist:
            return api_error("Booking not found", status_code=status.HTTP_404_NOT_FOUND)

        # Verify booking ownership
        if booking.customer_id != customer.id:
            return api_error("You are not authorized to submit feedback for this booking.", status_code=status.HTTP_403_FORBIDDEN)

        # Verify booking eligibility (Checked-in, Checked-out, Completed, or past stay)
        eligible_statuses = ['Checked-in', 'Checked-out', 'Completed', 'Confirmed']
        if booking.status not in eligible_statuses:
            return api_error(f"Cannot submit feedback for booking with status '{booking.status}'.", status_code=status.HTTP_400_BAD_REQUEST)

        # Duplicate feedback check
        if Feedback.objects.filter(customer=customer, booking=booking).exists():
            return api_error("You have already submitted feedback for this booking.", status_code=status.HTTP_400_BAD_REQUEST)

        feedback = Feedback.objects.create(
            customer=customer,
            booking=booking,
            hotel=booking.hotel,
            rating=rating,
            cleanliness_rating=cleanliness_rating,
            service_rating=service_rating,
            comments=comment,
            created_at=timezone.now()
        )

        return api_response(
            success=True,
            message="Feedback submitted successfully.",
            data=FeedbackSerializer(feedback).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], url_path='my')
    def my(self, request):
        customer = Customer.objects.filter(user=request.user).first()
        if not customer:
            return api_response(success=True, data=[])

        feedbacks = Feedback.objects.filter(customer=customer).select_related(
            'customer', 'customer__user', 'hotel', 'booking'
        ).order_by('-created_at')

        serializer = self.get_serializer(feedbacks, many=True)
        return api_response(success=True, data=serializer.data)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        total = Feedback.objects.count()
        avg_res = Feedback.objects.aggregate(avg=Avg('rating'))['avg']
        avg_rating = round(float(avg_res), 2) if avg_res is not None else 0.0

        # Distribution 1 to 5
        counts = Feedback.objects.values('rating').annotate(count=Count('id'))
        dist_map = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for item in counts:
            r = item['rating']
            if r in dist_map:
                dist_map[r] = item['count']

        data = {
            "total_feedback": total,
            "average_rating": avg_rating,
            "rating_distribution": {
                "5": dist_map[5],
                "4": dist_map[4],
                "3": dist_map[3],
                "2": dist_map[2],
                "1": dist_map[1],
            }
        }
        return api_response(success=True, data=data)

    @action(detail=True, methods=['post'], url_path='reply')
    def reply(self, request, pk=None):
        role = get_user_role(request.user)
        if role not in ['admin', 'manager', 'reception', 'staff']:
            return api_error("Only staff or administrators can reply to guest feedback.", status_code=status.HTTP_403_FORBIDDEN)

        feedback = self.get_object()
        reply_text = request.data.get('response') or request.data.get('staff_response')
        if not reply_text or not str(reply_text).strip():
            return api_error("Response text is required.")

        feedback.staff_response = str(reply_text).strip()
        feedback.save(update_fields=['staff_response'])

        return api_response(
            success=True,
            message="Response saved successfully.",
            data=FeedbackSerializer(feedback).data
        )


class SupportSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role = get_user_role(request.user)
        if role not in ['admin', 'manager', 'reception', 'staff']:
            return api_error("Access denied. Managerial permissions required.", status_code=status.HTTP_403_FORBIDDEN)

        # 1. Feedback aggregation
        fb_stats = Feedback.objects.aggregate(
            total=Count('id'),
            avg=Avg('rating')
        )
        total_fb = fb_stats['total'] or 0
        avg_rating = round(float(fb_stats['avg']), 2) if fb_stats['avg'] is not None else 0.0

        # 2. Complaints aggregation
        comp_total = Complaint.objects.count()
        comp_pending = Complaint.objects.filter(status__in=['Pending', 'Open']).count()
        comp_in_progress = Complaint.objects.filter(status='In Progress').count()
        comp_resolved = Complaint.objects.filter(status='Resolved').count()
        comp_closed = Complaint.objects.filter(status='Closed').count()
        comp_rejected = Complaint.objects.filter(status='Rejected').count()

        # 3. Inquiries aggregation
        inq_total = Inquiry.objects.count()
        inq_pending = Inquiry.objects.filter(status__in=['New', 'Pending']).count()
        inq_in_progress = Inquiry.objects.filter(status='In Progress').count()
        inq_responded = Inquiry.objects.filter(status='Responded').count()
        inq_closed = Inquiry.objects.filter(status='Closed').count()

        data = {
            "feedback": {
                "total": total_fb,
                "average_rating": avg_rating,
            },
            "complaints": {
                "total": comp_total,
                "pending": comp_pending,
                "in_progress": comp_in_progress,
                "resolved": comp_resolved,
                "closed": comp_closed,
                "rejected": comp_rejected,
            },
            "inquiries": {
                "total": inq_total,
                "pending": inq_pending,
                "in_progress": inq_in_progress,
                "responded": inq_responded,
                "closed": inq_closed,
            }
        }
        return api_response(success=True, data=data)

