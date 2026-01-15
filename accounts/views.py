from django.shortcuts import render,redirect
from django.http import HttpResponse
from .forms import CustomerUserCreationForm
from django.contrib.auth import login, logout, authenticate
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from bookings.models import Booking
from .forms import CustomLoginForm
from django.http import JsonResponse
from hotel_booking import settings

# Create your views here.
def accounts (request):
    return HttpResponse("<h1> account <h1>")

def custom_register(request):

    if request.method == 'GET':
        form = CustomerUserCreationForm()

    elif request.method == "POST":

        print(request.POST)

        form = CustomerUserCreationForm(request.POST)

        if not form.is_valid():
            print(form.errors)

        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success (request,"Registeration successful, now redirecting...")
            return redirect('home_page')

    return render(request, 'accounts/register.html', {'form': form})


def custom_login(request):
    """
    If GET: Show login form
    If POST:

    Get username/password from POST data
    Use authenticate() to verify credentials
    If valid: login() and redirect
    If invalid: Show error message
    """
    if request.method == "POST":
        print(request.POST)
        form = CustomLoginForm(data = request.POST)

        if form.is_valid():
            "login here"
            user = form.get_user()
            login(request, user)
            # return redirect('home_page')
            return JsonResponse({
                'success' : True,
                'redirect_url': '/'
            })
        
        else:
            return JsonResponse({
                'success': False,
                'message': "Invalid email or password"
            })
            # return redirect('login')
        
    else:
        form = CustomLoginForm()

    return render(request, 'accounts/login.html', {'form': form})

def custom_logout(request):

    logout(request)
    messages.success(request, "Log out successfully.")
    
    return redirect('home_page')

@login_required
def custom_profile(request):

    """
    Block anonymous users

    Fetch user-related data

    Send it to a template
    """

    user = request.user
    bookings = Booking.objects.filter(user = request.user).order_by("created_at")
    stats = {
        "total_bookings": bookings.count(),
        "recent_bookings": bookings.order_by("-created_at")[:5],
    }
    # Get user's booking
    context = {
        'user':user,
        'bookings': bookings,
        'stats':stats
    }


    return render(request, 'accounts/profile.html', context)
        