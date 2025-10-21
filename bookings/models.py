from django.db import models
from accounts.models import User
from hotels.models import Hotel, Room
from django.core.validators import MaxValueValidator, MinValueValidator
import uuid

# Create your models here.

class Booking (models.Model):

    """
    Generate a unique booking ID (hint: use UUID and override the save method)
    Foreign keys to User and Room
    Check-in and check-out date fields
    Number of adults and children
    Total price
    Status field with choices (pending, confirmed, checked_in, checked_out, cancelled)
    Special requests text field
    Timestamps

    Add these helpful properties using @property decorator:

    Calculate total nights (check_out - check_in)
    Calculate total guests (adults + children)
    """

    booking_id = models.UUIDField(primary_key=True, default= uuid.uuid4, editable=False)
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user booking")
    to_hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="hotel booking")

    # Check in and out date field
    check_in_date = models.DateField(auto_add=True)
    check_out_date = models.DateField(auto_add=True)

    # number of adults and children
    num_of_children = models.PositiveSmallIntegerField()
    num_of_adults = models.PositiveSmallIntegerField()

    total_price = models.IntegerField()

    # Status Field
    class BookingStatus(models.TextChoices):

        PENDING = 'PENDING', 'Pending Comfirmation'
        CONFIRMED = 'CONFIRMED', 'BOOKING COMFIRMED'
        CHECKED_IN = 'CHECKED IN'
        CHECKED_OUT = 'CHECKED OUT'
        CANCELLED = 'CANCELLED', 'Booking Cancelled'

    bookingstatus = models.CharField(max_length=10, 
                                     choices=BookingStatus.choices, 
                                     default=BookingStatus.PENDING, 
                                     help_text="current status of booking process")

    specia_request = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total_night(self):
        return self.check_out_date - self.check_in_date
    
    @property
    def total_guest(self):
        return self.num_of_adults + self.num_of_children
    

class Payment(models.Model):
    """
    One-to-one relationship with Booking
    Amount field
    Payment method (choices: credit_card, debit_card, paypal, etc.)
    Transaction ID (from payment processor)
    Status (pending, completed, failed, refunded)
    Payment timestamp
    Created timestamp
    """

    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="payment")

    amount = models.DecimalField(validators=[MinValueValidator(0)])

    # Payment method
    class Payment_method():

        CREDIT_CARD = 'Credit Card'
        DEBIT_CARD = 'Debit Card'
        PAYPAL = 'PayPal'
        CASH = "Cash"
        GUEST_CHECKOUT = 'Guest Checkout'

    payment_method = models.TextField(choices=Payment_method, default=Payment_method.CREDIT_CARD, help_text="how customer are going to pay")

    # Transaction ID 
    payment_transaction_id = models.CharField(unique=255)

    # Payment Status
    class Payment_Status(models.TextChoices):
        PENDING = "Payment Pending"
        COMPLETED = "Payment Completed "
        FAILED = "Payment Failed"
        REFUNDED = "Payment Refunded"

    payment_status = models.TextField(choices=Payment_Status, default=Payment_Status.PENDING, help_text="current status of payment")

    payment_time = models.DateTimeField(auto_now_add=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField (auto_now=True)


class Review(models.Model):
    """
    Foreign keys to User and Hotel
    Optional one-to-one link to Booking
    Rating (1-5 stars)
    Title and comment fields
    Optional detailed ratings (cleanliness, location, service, value)
    Verification flag (true if user actually stayed)
    Timestamps
    Make it unique_together for user and booking (one review per stay)
    """

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, help_text="review to hotel maybe", related_name = 'hotel review')
    user = models.ForeignKey(User, on_delete=models.CASCADE, help_text="review written by users maybe", related_name='customer review')
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, help_text="optional link to booking, do not know what for", related_name='booking review')

    rating = models.PositiveSmallIntegerField(validators=[MaxValueValidator(5), MinValueValidator(0)], null=False, blank=False, default=5)

    title = models.TextField(max_length=255, blank=False, null= False)
    comment = models.TextField(max_length=255, null=True, blank=True)

    # Optional detailed rating 
    cleaning_rating = models.PositiveSmallIntegerField(validators=[MaxValueValidator(5), MinValueValidator(1)], 
                                                       blank=True, null=True, help_text="optional cleaning reating")
    
    location_rating = models.PositiveSmallIntegerField(validators=[MaxValueValidator(5), MinValueValidator(1)], 
                                                       blank=True, null=True, help_text="optional location reating")
    
    service_rating = models.PositiveSmallIntegerField(validators=[MaxValueValidator(5), MinValueValidator(1)], 
                                                       blank=True, null=True, help_text="optional service reating")
    
    value_rating = models.PositiveSmallIntegerField(validators=[MaxValueValidator(5), MinValueValidator(1)], 
                                                       blank=True, null=True, help_text="optional value reating")
    
    
    is_stayed = models.BooleanField(null=False, blank=False, default=True, help_text="Verification flag (true if user actually stayed)")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField (auto_add=True)

    class Meta:
        unique_together = [['user', 'booking']]
