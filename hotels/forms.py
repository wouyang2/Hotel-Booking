from django import forms
from .models import Room_Image, Hotel_Image

class HotelImage_Form(forms.ModelForm):
    class Meta:
        model = Hotel_Image
        fields = ['link_to_hotel', 'image']

class RoomImage_Form(forms.ModelForm):
    class Meta:
        model = Room_Image
        fields = ['link_to_room', 'image']