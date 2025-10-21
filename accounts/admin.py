from django.contrib import admin
from models import User
from django.contrib.auth.admin import UserAdmin
# Register your models here.

@admin.register(User)
class UserAdmin(UserAdmin):

    list_display = (
        'id',
        'email',
        'phone',
        'date_of_birth',
        'address',
        'is_customer',
        'is_staff',
        'is_hotel_manager',
        'emial_verif',
        'created_at'
    )

     # Enable filtering in the right sidebar
    list_filter = ('date_of_birth', 'is_customer', 'is_hotel_manager', 'email_verif', 'created_at')

    # Enable search functionality
    search_fields = ('is_customer', 'is_hotel_manager') 

    # Fields to make read-only after creation (important for transaction integrity)
    readonly_fields = ('created_at', 'updated_at')

    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone_number', 'date_of_birth', 'address', 
                                       'is_customer', 'is_hotel_manager', 
                                       'profile_picture', 'email_verified')}),
    )
