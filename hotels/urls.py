"""
`` (empty) - Homepage/hotel list
hotels/ - All hotels page
hotels/<slug:slug>/ - Hotel detail (use slug field)
search/ - Search results (optional for now)
"""
from django.urls import path
from . import views

urlpatterns = [
    path("", name="home_page"),
    path('hotels/', name = "hotels"),
    path('hotels/<slug:slug>', name="slug"),
    path('search/', name="search_results")
]
