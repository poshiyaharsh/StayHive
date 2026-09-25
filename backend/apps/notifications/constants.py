"""
Notification type constants and mappings for StayHive
"""

TYPE_BOOKING_CREATED = 'booking_created'
TYPE_BOOKING_CONFIRMED = 'booking_confirmed'
TYPE_BOOKING_CANCELLED = 'booking_cancelled'
TYPE_CHECK_IN = 'check_in'
TYPE_CHECK_OUT = 'check_out'
TYPE_FOOD_ORDER_CREATED = 'food_order_created'
TYPE_FOOD_ORDER_STATUS = 'food_order_status'
TYPE_SERVICE_REQUEST_CREATED = 'service_request_created'
TYPE_SERVICE_REQUEST_STATUS = 'service_request_status'
TYPE_HOUSEKEEPING_TASK = 'housekeeping_task'
TYPE_PAYMENT_RECEIVED = 'payment_received'
TYPE_PAYMENT_FAILED = 'payment_failed'
TYPE_REFUND_CREATED = 'refund_created'
TYPE_REFUND_COMPLETED = 'refund_completed'
TYPE_COMPLAINT_CREATED = 'complaint_created'
TYPE_COMPLAINT_RESOLVED = 'complaint_resolved'
TYPE_INQUIRY_RECEIVED = 'inquiry_received'
TYPE_INQUIRY_RESPONDED = 'inquiry_responded'
TYPE_FEEDBACK_RECEIVED = 'feedback_received'
TYPE_SYSTEM = 'system'

DEFAULT_TITLES = {
    TYPE_BOOKING_CREATED: "New Booking Created",
    TYPE_BOOKING_CONFIRMED: "Booking Confirmed",
    TYPE_BOOKING_CANCELLED: "Booking Cancelled",
    TYPE_CHECK_IN: "Check-in Successful",
    TYPE_CHECK_OUT: "Checkout Completed",
    TYPE_FOOD_ORDER_CREATED: "New Food Order Placed",
    TYPE_FOOD_ORDER_STATUS: "Food Order Update",
    TYPE_SERVICE_REQUEST_CREATED: "Service Request Received",
    TYPE_SERVICE_REQUEST_STATUS: "Service Request Update",
    TYPE_HOUSEKEEPING_TASK: "Housekeeping Task Dispatch",
    TYPE_PAYMENT_RECEIVED: "Payment Received",
    TYPE_PAYMENT_FAILED: "Payment Failed",
    TYPE_REFUND_CREATED: "Refund Initiated",
    TYPE_REFUND_COMPLETED: "Refund Completed",
    TYPE_COMPLAINT_CREATED: "Complaint Ticket Logged",
    TYPE_COMPLAINT_RESOLVED: "Complaint Resolved",
    TYPE_INQUIRY_RECEIVED: "Customer Inquiry Received",
    TYPE_INQUIRY_RESPONDED: "Inquiry Response Dispatched",
    TYPE_FEEDBACK_RECEIVED: "Guest Feedback Received",
    TYPE_SYSTEM: "System Notification",
}
