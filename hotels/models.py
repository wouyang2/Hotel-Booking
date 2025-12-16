from django.db import models
from django.core.validators import RegexValidator, MaxValueValidator, MinValueValidator
from accounts.models import User
# Create your models here.
class Hotel (models.Model):

    """
    Basic info: name, slug (for URLs), description
    Location fields: address, city, state, country, zip code
    Optional: latitude/longitude for maps
    Contact: phone, email, website
    Link to the manager (User model)
    Rating field (0-5 stars)
    Amenity boolean fields (parking, wifi, pool, gym, etc.)
    Status fields (is it active? is it featured?)
    Timestamps
    """
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', 
                                 message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    
    #Location
    address = models.CharField(max_length=255)
    city = models.CharField(max_length = 255)
    state = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    zip_code = models.IntegerField(blank=False)

    # Contact
    phone = models.CharField(validators=(phone_regex,), max_length=15)
    email = models.EmailField(max_length=100)
    website = models.URLField()

    # Link to the manager    ?? how to know if the user a manager ??
    link_to_manager = models.ManyToManyField(User, related_name="manager_of_the_hotel")

    # Rating
    rating = models.DecimalField(validators=[MinValueValidator(0), MaxValueValidator(5)], decimal_places=1,max_digits=3)

    # Amnity
    parking = models.BooleanField(default=False)
    wifi = models.BooleanField(default = True)
    pool = models.BooleanField(default = False)
    gym = models.BooleanField(default = True)
    laundry = models.BooleanField(default=True)

    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default= False)

    # TimeStamp
    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateField(auto_now=True)

    def __str__ (self):
        return self.name
    
class RoomType(models.Model):
    """Define types of rooms like Single, Double, Suite, etc."""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Room (models.Model):
    """
    Foreign key to Hotel
    Room type (create a separate RoomType model)
    Room number (like "101", "202")
    Floor number
    Capacity information (max occupancy, number of beds)
    Price per night
    Room amenities (AC, TV, minibar, etc.)
    Availability status
    Timestamps
    """

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="hotel_room")
    room_type = models.ForeignKey(RoomType, on_delete=models.CASCADE, related_name="room_type")
    room_number = models.CharField(max_length=10)  # how to ensure they are like 101, 201,... 
    floor_number = models.IntegerField(validators=[MaxValueValidator(10), MinValueValidator(1)])

    # Capacity info
    max_occupancy = models.PositiveIntegerField(validators=[MaxValueValidator(4)], null=True)
    number_of_bed = models.PositiveSmallIntegerField(validators=[MinValueValidator(1),MaxValueValidator(2)])

    price_per_night = models.DecimalField(validators=[MaxValueValidator(500), MinValueValidator(50)], decimal_places=2, max_digits=5)

    # Room amenities 
    ac = models.BooleanField(default=True)
    tv = models.BooleanField(default=True)
    minibar = models.BooleanField(default=False)
    cloth_iron = models.BooleanField(default=False)
    bathtub = models.BooleanField(default=False)
    bacolny = models.BooleanField(default=False)

    is_available = models.BooleanField(default=True)

    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['hotel', 'room_number']

    def __str__ (self):
        return f"Room {self.room_number} - {self.room_type.name}"

    
class Hotel_Image(models.Model):

    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name="hotel_image")

    image = models.ImageField(upload_to='hotel_images/')

    caption = models.TextField(blank=True)

    primary_flag = models.BooleanField(default=False)

class Room_Image(models.Model):

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="room_image")

    image = models.ImageField(upload_to='room_images/')

    caption = models.TextField(blank=True)