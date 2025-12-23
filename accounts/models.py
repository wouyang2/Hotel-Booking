from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.
class User (AbstractUser):
    """
    Email (make it unique)
    Phone number (optional field)
    Date of birth (optional)
    Address (optional text field)
    Two boolean fields: one for customers, one for hotel managers
    Profile picture (image field)
    Email verification status (boolean)
    Timestamps for creation and last update
    """
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$', 
                                 message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.") 

    email = models.EmailField(max_length=50, blank=False, unique= True)
    phone = models.CharField(validators=(phone_regex,), blank=True, null=True, max_length=15)
    date_of_birth = models.DateField(blank = True, null=True)
    address = models.TextField(blank = True, null=True)
    is_customer = models.BooleanField(default=True)
    #is_staff = models.BooleanField(default=False)
    is_hotel_manager = models.BooleanField(default=False)
    profile_pic = models.ImageField(upload_to='user_images/',null= True)
    email_verif = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now = True)

    # Add unique related_names to prevent clashes
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="accounts_users",
        blank=True,
        help_text="The groups this user belongs to.",
        verbose_name="groups",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="accounts_users",
        blank=True,
        help_text="Specific permissions for this user.",
        verbose_name="user permissions",
    )

    USERNAME_FIELD = 'email'

    def __str__(self):
        return self.email
    

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name="profile", on_delete=models.CASCADE)

    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
    