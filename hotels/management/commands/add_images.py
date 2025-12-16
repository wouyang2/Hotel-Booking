from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from hotels.models import Hotel, Room, Hotel_Image, Room_Image
from PIL import Image, ImageDraw, ImageFont
import io
import random

class Command (BaseCommand):

    help = 'Adding placeholder image to room and hotel.'

    def add_arguments(self, parser):
        parser.add_argument(
            'hotels',
            type = int,
            default = 5,
            help = 'number of hotels that images added to'
        )

        parser.add_argument(
            'methods',
            type = str,
            default = 'placeholder',
            choices=['placeholder', 'download'],
            help = 'method to use for adding image'
        )
    
    def handle(self, *arg, **options):
        
        number_of_hotels = options['hotels']
        method = options['methods']

        if method == 'placeholder':
            self.add_placeholder_images(number_of_hotels)
        else:
            self.stdout.write ("Not yet implement")

    def add_placeholder_images(self, num: int):
        
        hotels = Hotel.objects.all()
        colors = [
            (64, 134, 170),   # Blue
            (170, 64, 134),   # Purple
            (134, 170, 64),   # Green
            (170, 134, 64),   # Orange
            (64, 170, 134),   # Teal
        ]

        for hotel in hotels:
            # Create 2-3 images per hotel
            for i in range(random.randint(2, 3)):
                # Create image
                color = random.choice(colors)
                img = Image.new('RGB', (800, 600), color=color)
                draw = ImageDraw.Draw(img)
                
                # Add text
                text = f"{hotel.name}\n{hotel.city}, {hotel.state}"
                font = ImageFont.load_default()
                
                # Center text
                draw.text((400, 300), text, fill=(255, 255, 255), 
                         anchor="mm", font=font, align="center")
                
                # Convert to file
                img_io = io.BytesIO()
                img.save(img_io, format='JPEG', quality=85)
                img_io.seek(0)

                # Save to model
                hotel_image = Hotel_Image()
                hotel_image.hotel = hotel
                hotel_image.caption = f"View {i+1}"
                hotel_image.primary_flag = (i == 0)
                hotel_image.image.save(
                    f"hotel_{hotel.id}_{i}.jpg",
                    ContentFile(img_io.read())
                )
                
            self.stdout.write(
                self.style.SUCCESS(f'Added images for {hotel.name}')
            )

        # Add room images similarly
        rooms = Room.objects.filter(hotel__in=hotels)
        
        for room in rooms:
            # One image per room
            color = random.choice(colors)
            img = Image.new('RGB', (800, 600), color=color)
            draw = ImageDraw.Draw(img)
            
            text = f"Room {room.room_number}\n{room.room_type}"
            font = ImageFont.load_default()
            draw.text((400, 300), text, fill=(255, 255, 255), 
                     anchor="mm", font=font, align="center")
            
            img_io = io.BytesIO()
            img.save(img_io, format='JPEG', quality=85)
            img_io.seek(0)

            room_image = Room_Image()
            room_image.room = room
            room_image.caption = f"Room {room.room_number} interior"
            room_image.image.save(
                f"room_{room.id}.jpg",
                ContentFile(img_io.read())
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully added images!')
        )
