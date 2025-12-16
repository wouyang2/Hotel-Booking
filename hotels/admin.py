from django.contrib import admin
from .models import Hotel, Room, Hotel_Image, Room_Image, RoomType


# Register your models here.

class HotelImageInline(admin.TabularInline):
    model = Hotel_Image
    extra = 1
    show_change_link = True

class RoomInline(admin.TabularInline):
    model = Room
    extra = 0
    show_change_link = True

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
        'slug',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'phone', 
        'email',
        'website',
        'rating',
        'is_active',
        'is_featured',
        'created_at'
    )

    list_filter = (
        'city',
        'state',
        'is_active'
    )

    search_fields = (
        'name',
        'address',
        'city',
        'state',
        'country',
        'zip_code'
    )
    list_display_links = ('id', 'name')

    prepopulated_fields = {'slug': ('name',)}
    inlines = [RoomInline, HotelImageInline]

@admin.register(RoomType)
class RoomType(admin.ModelAdmin):
    list_display = ('name',)

class RoomImageInline(admin.TabularInline):
    model = Room_Image
    extra = 1
    
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    list_display = (
        'hotel',
        'room_type',
        'room_number',
        'floor_number',
        'max_occupancy',
        'number_of_bed',
        'price_per_night',
        'is_available',
        'created_at'
    )

    list_filter = (
        'hotel',
        'room_type',
        'is_available',
        'number_of_bed',
        'price_per_night'
    )

    search_fields = (
        'hotel',
        'created_at',
        'is_availiable'
        'room_type',
        'room_number'
    )
    inlines = [RoomImageInline]
    
