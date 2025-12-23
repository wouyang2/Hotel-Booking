"""
register/ - Registration view
login/ - Login view
logout/ - Logout view
profile/ - User profile/dashboard
profile/edit/ - Edit profile (optional)
"""

from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.custom_register, name='register'),
    path('login/', views.custom_login, name='login'),
    path('logout/', views.custom_logout, name='logout'),
    path('profile/', views.custom_profile, name='profile'),
    path('profile/edit', views.accounts, name='profile_edit'),
]