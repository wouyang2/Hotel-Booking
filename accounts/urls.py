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
    path('register/', views.registers, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('profile/edit', views.profile_edit, name='profile_edit'),
]