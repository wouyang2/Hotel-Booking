from django.shortcuts import render
from django.http import HttpResponse
from hotels.models import Hotel
from django.db.models import Count, Max, Min

# Create your views here.

def hotels (request):
    return render(request, 'home.html', {})

def hotel_list(request):

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

    hotels = Hotel.objects.all()

    featured_hotels = hotels.filter(is_featured = True)
    recent_hotels = hotels.order_by("created_at")
    popular_cities = Hotel.objects.values('city').annotate(city_count = Count('city')).order_by('city_count')
    high_rating = hotels.order_by('rating')

    context = {
        'feature_hotels': featured_hotels,
        'recent_hotels' : recent_hotels,
        'popular_citiess' : popular_cities,
        'high_rating' : high_rating
    }

    return render(request, "hotels/hotel_list.html", context)