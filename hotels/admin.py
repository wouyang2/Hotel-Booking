from django.contrib import admin
from .models import Hotel, Room, Hotel_Image, Room_Image, RoomType


# Register your models here.

class HotelImageInline(admin.TabularInline):
    model = Hotel_Image
    extra = 1

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
        'adress',
        'city',
        'state',
        'country',
        'zip_code',
        'phone', 
        'email',
        'website',
        'rating',
        'is_active',
        'is_feature',
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

    prepopulated_fields = {'slug': ('name',)}
    inlines = [RoomInline, HotelImageInline]

@admin.register(RoomType)
class RoomType(admin.ModelAdmin):
    list_display = ('name')
    
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    list_display = (
        'hotel_belong_to',
        'room_type',
        'room_number',
        'floor_number',
        'max_occupany',
        'number_of_bed',
        'price_per_night',
        'is_availiable',
        'created_at'
    )

    list_filter = (
        'hotel_belong_to',
        'room_type',
        'is_availiable',
        'number_of_bed',
        'price_per_night'
    )

    search_fields = (
        'hotel_belong_to',
        'created_at',
        'is_availiable'
        'room_type',
        'room_number'
    )
    
