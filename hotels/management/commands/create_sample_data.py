from django.core.management.base import BaseCommand, CommandError
from hotels.models import Hotel, Room, RoomType
from accounts.models import User
from faker import Faker
from django.db import transaction
import random
import re
from decimal import Decimal

# List of room types 
ROOM_TYPES = [
    "Standard Room",
    "Deluxe Room",
    "Suite",
    "Executive Suite",
    "Penthouse Suite",
]

is_ = [True, False]

def create_slug(name):
    # Convert to lowercase
    slug = name.lower()
    # Replace spaces and special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug

class Command(BaseCommand):
    help = "generate some sample date include hotels, managers, room types"

    def add_arguments(self, parser):
        parser.add_argument(
            'hotels',
            type=int,
            default=5,
            help = " Number of hotel to create"
        )
        parser.add_argument(
            'rooms_per_hotel',
            type=int,
            default=20,
            help="number of room per hotel"
        )
        parser.add_argument(
            'managers_per_hotel',
            type=int,
            default = 3,
            help = 'Number of managers per hotel'
        )
        return super().add_arguments(parser)
    
    @transaction.atomic
    def handle(self, *args, **options):

        self.stdout.write("Deleting old data....")
        Hotel.objects.all().delete()

        number_of_hotels = options['hotels']
        number_of_room = options['rooms_per_hotel']
        number_of_manager = options['managers_per_hotel']

        fake = Faker()

        # create sample room types
        self.stdout.write("Creating room types...")

        for rt in ROOM_TYPES:
            RoomType.objects.get_or_create(name = rt, description = f"Comfortable {rt} room")

        self.stdout.write("Creating hotel managers...")
            
        # Create sample hotel manager
        managers = []
        for i in range(number_of_manager):
            email = 'manager' + str(i)
            manager, created = User.objects.get_or_create(
                username = 'hotel_manager' + str(i),
                defaults={
                    'email' : email + '@hotel.com',
                    'is_hotel_manager': True,
                    'is_customer': False
                }
            )
            if created:
                manager.set_password("12345")
                manager.save()
            
            managers.append(manager)

        self.stdout.write("Creating sample hotel and rooms...")
        # Create Hotel and room
        hotels = []
        for i in range(number_of_hotels):
            name = fake.company() + ' Hotel'
            slug = create_slug(name)
            phone = fake.phone_number()
            address = fake.address()
            city = fake.city()
            states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]
            state = random.choice(states)
            zip_code = fake.zipcode()

            hotel, created = Hotel.objects.get_or_create(
                id = i,
                defaults={
                    'name' : name,
                    'slug' : slug,
                    'phone' : phone,
                    'address' : address,
                    'city' : city,
                    'zip_code': zip_code,
                    'state' : state,
                    'country' : 'USA',
                    'description': f"welcome to {name} Hotel",
                    'email': f"info@{slug}.com",
                    'rating': round(random.uniform(2,5),2),
                    'parking': random.choice(is_),
                    'pool': random.choice(is_),
                    'wifi':random.choice(is_),
                    'gym': random.choice(is_),
                }
            )
            hotel.link_to_manager.set(managers)

            # Creating room 
            if created:
                room_type_objs = RoomType.objects.all()
                for floor in range(1,3):
                    for room_num in range(1, number_of_room):
                        Room.objects.create(
                            hotel = hotel,
                            room_type=room_type_objs[room_num % len(room_type_objs)],
                            room_number = f"{floor}0{room_num}",
                            floor_number = floor,
                            price_per_night=Decimal('100.00') + (floor * 20),
                            number_of_bed = 2,
                            is_available = True,
                            ac = True,
                            tv = True,
                            minibar = random.choice(is_),
                            bathtub = random.choice(is_),
                            bacolny = random.choice(is_)
                        )

            hotels.append(hotel)


        self.stdout.write("Successfully created smaple data!!")