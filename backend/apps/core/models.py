from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone


# 1. Role
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'role'
        managed = False

    def __str__(self):
        return self.name


# 2. Custom User Manager & User Model
class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        role, _ = Role.objects.get_or_create(name='ADMIN', defaults={'description': 'System Administrator'})
        extra_fields['role'] = role
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractBaseUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length=255)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.CharField(max_length=255, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.RESTRICT, db_column='role_id')
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']

    objects = CustomUserManager()

    class Meta:
        db_table = 'user'
        managed = False

    def __str__(self):
        return f"{self.username} ({self.role.name if self.role else 'No Role'})"


# 3. Department
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'department'
        managed = False

    def __str__(self):
        return self.name


# 4. Hotel
class Hotel(models.Model):
    name = models.CharField(max_length=150)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100, default='India')
    pincode = models.CharField(max_length=20)
    contact_number = models.CharField(max_length=20)
    email = models.CharField(max_length=150)
    star_rating = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    image = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'hotel'
        managed = False

    def __str__(self):
        return self.name


# 5. HotelFacility
class HotelFacility(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='facilities', db_column='hotel_id')
    facility_name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'hotel_facility'
        managed = False

    def __str__(self):
        return f"{self.hotel.name} - {self.facility_name}"


# 6. Gallery
class Gallery(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='gallery_images', db_column='hotel_id')
    image_url = models.CharField(max_length=255)
    title = models.CharField(max_length=150, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'gallery'
        managed = False


# 7. RoomType
class RoomType(models.Model):
    type_name = models.CharField(max_length=100)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.IntegerField(default=2)
    size_sqft = models.IntegerField(blank=True, null=True)
    bed_type = models.CharField(max_length=100, default='King Bed')
    description = models.TextField(blank=True, null=True)
    image_url = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'room_type'
        managed = False

    def __str__(self):
        return self.type_name


# 8. Room
class Room(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms', db_column='hotel_id')
    room_type = models.ForeignKey(RoomType, on_delete=models.RESTRICT, related_name='rooms', db_column='room_type_id')
    room_number = models.CharField(max_length=20)
    floor = models.IntegerField(default=1)
    status = models.CharField(max_length=20, default='Available')
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    housekeeping_status = models.CharField(max_length=20, default='Clean')

    class Meta:
        db_table = 'room'
        managed = False

    def __str__(self):
        return f"{self.hotel.name} - Room {self.room_number}"


# 9. RoomAmenity
class RoomAmenity(models.Model):
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name='amenities', db_column='room_type_id')
    amenity_name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'room_amenity'
        managed = False


# 10. Staff
class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile', db_column='user_id')
    department = models.ForeignKey(Department, on_delete=models.RESTRICT, related_name='staff_members', db_column='department_id')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='staff_members', db_column='hotel_id')
    designation = models.CharField(max_length=100)
    shift = models.CharField(max_length=20, default='Morning')
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    performance_score = models.DecimalField(max_digits=3, decimal_places=2, default=4.8)
    status = models.CharField(max_length=20, default='Active')
    joined_date = models.DateField()

    class Meta:
        db_table = 'staff'
        managed = False

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.designation})"


# 11. Customer
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile', db_column='user_id')
    id_proof_type = models.CharField(max_length=50, blank=True, null=True)
    id_proof_number = models.CharField(max_length=100, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    total_stays = models.IntegerField(default=0)
    total_spend = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    loyalty_tier = models.CharField(max_length=20, default='Silver')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'customer'
        managed = False

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.loyalty_tier})"


# 12. OfferPackage
class OfferPackage(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.SET_NULL, null=True, blank=True, related_name='offers', db_column='hotel_id')
    code = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    min_booking_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    valid_from = models.DateField()
    valid_to = models.DateField()
    is_active = models.BooleanField(default=True)
    usage_count = models.IntegerField(default=0)

    class Meta:
        db_table = 'offer_package'
        managed = False

    def __str__(self):
        return f"{self.code} - {self.title}"


# 13. Booking
class Booking(models.Model):
    booking_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='bookings', db_column='customer_id')
    hotel = models.ForeignKey(Hotel, on_delete=models.RESTRICT, related_name='bookings', db_column='hotel_id')
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    total_guests = models.IntegerField(default=1)
    adults = models.IntegerField(default=1)
    children = models.IntegerField(default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='Confirmed')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'booking'
        managed = False

    def __str__(self):
        return f"{self.booking_number} ({self.status})"


# 14. BookingRoom
class BookingRoom(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booking_rooms', db_column='booking_id')
    room = models.ForeignKey(Room, on_delete=models.RESTRICT, related_name='room_bookings', db_column='room_id')
    room_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    allocated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'booking_room'
        managed = False


# 15. OfferApplication
class OfferApplication(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='applied_offers', db_column='booking_id')
    offer = models.ForeignKey(OfferPackage, on_delete=models.RESTRICT, related_name='applications', db_column='offer_id')
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2)
    applied_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'offer_application'
        managed = False


# 16. CheckIn
class CheckIn(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='check_ins', db_column='booking_id')
    room = models.ForeignKey(Room, on_delete=models.RESTRICT, related_name='check_in_records', db_column='room_id')
    staff = models.ForeignKey(Staff, on_delete=models.RESTRICT, related_name='processed_checkins', db_column='staff_id')
    check_in_time = models.DateTimeField(default=timezone.now)
    id_verified = models.BooleanField(default=True)
    key_card_issued = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'check_in'
        managed = False


# 17. Restaurant
class Restaurant(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='restaurants', db_column='hotel_id')
    name = models.CharField(max_length=150)
    cuisine = models.CharField(max_length=100)
    opening_time = models.TimeField()
    closing_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'restaurant'
        managed = False

    def __str__(self):
        return f"{self.name} - {self.hotel.name}"


# 18. Food
class Food(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='foods', db_column='restaurant_id')
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_veg = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    image_url = models.CharField(max_length=255, blank=True, null=True)
    preparation_time = models.IntegerField(default=20)

    class Meta:
        db_table = 'food'
        managed = False

    def __str__(self):
        return self.name


# 19. FoodOrder
class FoodOrder(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='food_orders', db_column='booking_id')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='food_orders', db_column='customer_id')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, db_column='room_id')
    order_time = models.DateTimeField(default=timezone.now)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='Pending')
    payment_status = models.CharField(max_length=20, default='Billed to Room')

    class Meta:
        db_table = 'food_order'
        managed = False


# 20. OrderItem
class OrderItem(models.Model):
    food_order = models.ForeignKey(FoodOrder, on_delete=models.CASCADE, related_name='items', db_column='food_order_id')
    food = models.ForeignKey(Food, on_delete=models.RESTRICT, db_column='food_id')
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'order_item'
        managed = False


# 21. Service
class Service(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='services', db_column='hotel_id')
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_minutes = models.IntegerField(default=60)
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'service'
        managed = False

    def __str__(self):
        return f"{self.name} (₹{self.price})"


# 22. ServiceRequest
class ServiceRequest(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='service_requests', db_column='booking_id')
    service = models.ForeignKey(Service, on_delete=models.RESTRICT, related_name='requests', db_column='service_id')
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_services', db_column='staff_id')
    requested_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, default='Pending')
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'service_request'
        managed = False


# 23. HousekeepingTask
class HousekeepingTask(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='housekeeping_tasks', db_column='room_id')
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='cleaning_tasks', db_column='staff_id')
    task_type = models.CharField(max_length=100, default='Daily Clean')
    priority = models.CharField(max_length=20, default='Medium')
    status = models.CharField(max_length=20, default='Pending')
    scheduled_time = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'housekeeping_task'
        managed = False


# 24. Invoice
class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='invoices', db_column='booking_id')
    issue_date = models.DateTimeField(default=timezone.now)
    room_charges = models.DecimalField(max_digits=10, decimal_places=2)
    food_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    service_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='Unpaid')

    class Meta:
        db_table = 'invoice'
        managed = False


# 25. PaymentMethod
class PaymentMethod(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'payment_method'
        managed = False

    def __str__(self):
        return self.name


# 26. Payment
class Payment(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments', db_column='invoice_id')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.RESTRICT, db_column='payment_method_id')
    transaction_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='Success')
    payment_date = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'payment'
        managed = False


# 27. CancellationRequest
class CancellationRequest(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='cancellation_requests', db_column='booking_id')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, db_column='customer_id')
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, db_column='staff_id')
    reason = models.TextField()
    requested_at = models.DateTimeField(default=timezone.now)
    refund_applicable = models.BooleanField(default=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, default='Pending')

    class Meta:
        db_table = 'cancellation_request'
        managed = False


# 28. Refund
class Refund(models.Model):
    cancellation = models.ForeignKey(CancellationRequest, on_delete=models.CASCADE, related_name='refunds', db_column='cancellation_id')
    payment = models.ForeignKey(Payment, on_delete=models.RESTRICT, db_column='payment_id')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='Completed')
    processed_by = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, db_column='processed_by')
    processed_at = models.DateTimeField(default=timezone.now)
    bank_reference = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'refund'
        managed = False


# 29. Feedback
class Feedback(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='feedbacks', db_column='booking_id')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='feedbacks', db_column='customer_id')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='feedbacks', db_column='hotel_id')
    rating = models.IntegerField()
    cleanliness_rating = models.IntegerField(default=5)
    service_rating = models.IntegerField(default=5)
    comments = models.TextField(blank=True, null=True)
    staff_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'feedback'
        managed = False


# 30. Complaint
class Complaint(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='complaints', db_column='customer_id')
    booking = models.ForeignKey(Booking, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints', db_column='booking_id')
    subject = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    priority = models.CharField(max_length=20, default='Medium')
    status = models.CharField(max_length=20, default='Open')
    assigned_to = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints_assigned', db_column='assigned_to')
    resolution_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    resolved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'complaint'
        managed = False


# 31. Inquiry
class Inquiry(models.Model):
    customer_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, default='New')
    assigned_to = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='inquiries_assigned', db_column='assigned_to')
    response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'inquiry'
        managed = False


# 32. Notification
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', db_column='user_id')
    title = models.CharField(max_length=150)
    message = models.TextField()
    type = models.CharField(max_length=50, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'notification'
        managed = False


# 33. Interaction
class Interaction(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='interactions', db_column='customer_id')
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True, blank=True, related_name='interactions', db_column='staff_id')
    type = models.CharField(max_length=50, default='Inquiry')
    notes = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'interaction'
        managed = False
