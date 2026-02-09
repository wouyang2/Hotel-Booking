from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from hotels.models import Hotel
from django.db.models import Count, Max, Min, Q
from django.core.paginator import Paginator
from collections import defaultdict
from django.contrib import messages


# Create your views here.

def home(request):

    """
    Featured hotels (filter by featured=True)
    Recent hotels (order by created_at)
    Popular cities (aggregate query)
    High-rated hotels (order by rating)

    Context to pass:

    featured_hotels (limit to 6)
    recent_hotels (limit to 4)
    popular_cities (get count of hotels per city)
    """

    hotels = Hotel.objects.all()[:3]

    # featured_hotels = hotels.filter(is_featured = True)
    # recent_hotels = hotels.order_by("created_at")
    # popular_cities = Hotel.objects.values('city').annotate(city_count = Count('city')).order_by('city_count')
    # high_rating = hotels.order_by('rating')

    context = {
        'hotels': hotels,
        # 'feature_hotels': featured_hotels,
        # 'recent_hotels' : recent_hotels,
        # 'popular_citiess' : popular_cities,
        # 'high_rating' : high_rating
    }

    return render(request, "home.html", context)


def hotel_list(request):

    """
    Try class base view using ViewList

    model = Hotel
    paginated_by = 10
    template_name = 'hotels/hotel_list.html'
    """

    hotels = (
        Hotel.objects
        .prefetch_related("hotel_room")
        .annotate(min_price=Min("hotel_room__price_per_night"))
        .annotate(max_price=Max("hotel_room__price_per_night"))
    )

    # Search
    q = request.GET.get("q")
    if q:
        hotels = hotels.filter(Q(name__icontains=q) | Q(city__icontains = q))

    # location 
    location = request.GET.get('location')
    if location:  
        hotels = hotels.filter(Q(city__icontains = location) | Q(country__icontains = location))

    # Check in/out date
    checkin = request.GET.get('checkin')
    checkout = request.GET.get('checkout')

    if checkin and checkout:
        if checkin > checkout:
            messages.error(request, "Check-out date must be after check-in.")

    # Price filtering 
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')

    if min_price:
        hotels = hotels.filter(hotel_room__price_per_night__gte = min_price)

    if max_price:
        hotels = hotels.filter(hotel_room__price_per_night__lte = max_price)

    # Filter by rating
    rating = request.GET.get('rating')
    if rating:
        hotels = hotels.filter(rating__gte = int(rating))
    
    # Amenities
    amenities = request.GET.getlist("amenities")

    Amenity_Field_Map = {
        'wifi' : 'wifi',
        "parking": "parking",
        "indoor_pool": "indoor_pool",
        "outdoor_pool" : "outdoor_pool",
        "gym": "gym",
        "laundry": "laundry",
        "breakfast": "free_breakfast"
    }

    for amenity in amenities:
        field = Amenity_Field_Map.get(amenity) 
        if field:
            hotels = hotels.filter(**{field: True})


    # Sorting
    sort = request.GET.get('sorting', "")

    if (sort == "price_asc"):
        hotels = hotels.order_by('min_price')
    if (sort == "price_desc"):
        hotels = hotels.order_by('-min_price')
    if sort == 'rating_asc':
        hotels = hotels.order_by('rating')
    if sort == "rating_desc":
        hotels = hotels.order_by('-rating')

    # Pagination
    p = Paginator(hotels, 4)
    page_number = request.GET.get('page')
    page_obj = p.get_page(page_number)

    context = {
        'page_obj' : page_obj,
        'hotel_count' : hotels.count(),
        'location': location,
        'checkin': checkin,
        'checkout': checkout,
        'amenities' : amenities,
    }

    if request.htmx:
        return render(request, "hotels/_hotel_result_block.html", context)
    
    return render (request, "hotels/hotel_list.html", context)


""""Hotel Detail"""
def hotel_details(request, slug):

    hotel = get_object_or_404(Hotel, slug=slug)

    rooms = hotel.hotel_room.prefetch_related('room_image', 'room_type')
    room_type_map = defaultdict(list)

    for room in rooms:
        room_type_map[room.room_type].append(room)

    rating_per = float(hotel.rating) / 5 * 100

    context = {
        'hotel' : hotel,
        'rooms' : rooms,
        'amenities' : hotel.get_amenities(-1),
        'rating_percent' : rating_per,
        'room_type_map' : dict(room_type_map),
    }

    return render(request, 'hotels/hotel_detail.html', context)


    