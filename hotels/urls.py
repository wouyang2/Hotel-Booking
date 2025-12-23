"""
`` (empty) - Homepage/hotel list
hotels/ - All hotels page
hotels/<slug:slug>/ - Hotel detail (use slug field)
search/ - Search results (optional for now)
"""
from django.urls import path
from . import views

urlpatterns = [
    path("", views.hotels ,name="home_page"),
    path('hotels/', views.hotel_list ,name = "hotels"),
    path('hotels/<slug:slug>', views.hotels ,name="slug"),
    path('search/', views.hotels ,name="search_results")
]
