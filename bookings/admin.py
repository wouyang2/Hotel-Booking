from django.contrib import admin
from models import Booking, Payment, Review
# Register your models here.


@admin.register(Booking)

class BookingAdmin(admin.ModelAdmin):

    list_display = ('booking_id', 'to_user', 'check_in_date', 'check_out_date','bookingstatus')
    readonly_fields = ('booking_id')
    list_filter = ('check_in_date', 'check_out_date')
    search_fields = ('booking_id', )