from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from hotels.models import Hotel
from django.db.models import Count, Max, Min
from django.core.paginator import Paginator
from collections import defaultdict

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

    hotels = Hotel.objects.prefetch_related('hotel_room').all()

    # Filtering
    city = request.GET.get('city')
    rating = request.GET.get('rating')

    if city:
        hotels = hotels.filter(city_icontain=city)
    if rating:
        hotels = hotels.filter(rating_icontain = rating)

    # Pagination
    p = Paginator(hotels, 10)
    page_number = request.GET.get('page')
    page_obj = p.get_page(page_number)

    context = {
        'page_obj' : page_obj,
    }
    return render (request, "hotels/hotel_list.html", context)

def hotel_details(request, slug):

    hotel = get_object_or_404(Hotel, slug=slug)

    # have the rooms group by the type
    # hotel = get_object_or_404(
    #     Hotel.objects.prefetch_related(Prefetch('rooms', queryset=rooms_ordered)),
    #     slug=slug
    # )
    rooms = hotel.hotel_room.prefetch_related('room_image', 'room_type')
    room_type_map = defaultdict(list)

    for room in rooms:
        room_type_map[room.room_type].append(room)

    rating_per = float(hotel.rating) / 5 * 100

    context = {
        'hotel' : hotel,
        'rooms' : rooms,
        'amenities' : hotel.get_amenities(),
        'rating_percent' : rating_per,
        'room_type_map' : dict(room_type_map),
    }

    return render(request, 'hotels/hotel_detail.html', context)


    