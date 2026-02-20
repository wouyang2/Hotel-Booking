## 🏨 Hotel Booking Platform

A full-stack hotel booking web application built with Django, featuring dynamic filtering, interactive maps, amenity-based search, and a drawer-based booking flow powered by modern frontend patterns.

This project focuses on building a responsive, scalable, and user-friendly booking experience similar to Airbnb or Booking.com.

The primary goal of this project is to learn and reinforce knowledge of frontend & backend development. 

This app is incomplete, there are a lot of space to imporve and refine. It is one of the product from the process of learning.

--- 
## 📄 Visit the actual webapp
* [Hotel Booking Webapp](linam2734.pythonanywhere.com)

--- 

## 📸 Overview

The application allows users to:

* Search hotels by destination

* Select check-in and check-out dates

* Filter by amenities

* View dynamic hotel counts

* Interact with map markers

* Open a booking drawer to select stay dates

The UI emphasizes smooth transitions, real-time updates, and consistent component design.

---

## Features

### 🔎 Smart Search & Filtering
* Location-based search (city/state/country)

* Date selection with linked check-in/check-out logic

* Boolean-based amenity filtering

* Dynamic amenity counts

* Removable selected-filter chips

* URL state preservation via query parameters

### ⚡ Dynamic Updates (No Full Page Reloads)

* Powered by HTMX

* Partial template rendering

* Query parameter synchronization

* State-aware filtering system

### 📅 Date Handling

* Flatpickr integration

* Linked date validation

* Range selection for booking drawer

* Min-date enforcement (no past bookings)

# 🗺 Map Integration

* Dynamic hotel markers

* Marker clustering

* Hover synchronization between map and list

* Popup information rendering

### 🛒 Booking Drawer

* Slide-up drawer UI

* Date range selection

* Consistent styling with filter drawer

* Pre-fills previously selected dates (if available)

### 🏗 Tech Stack

* Backend

* Django

* Django ORM

* SQLite (development)

* Frontend

* HTML5

* CSS3

* Vanilla JavaScript

* HTMX

* Flatpickr

* FontAwesome

* Architecture Concepts

* Server-side filtering

* Query parameter management

* Boolean-based filtering logic

* Event delegation

* Drawer UI pattern

* Component reinitialization after HTMX swaps

---

## ⚙️ Installation
1️⃣ Clone Repository
```
git clone https://github.com/wouyang2/Hotel-Booking.git
cd HOTEL-BOOKING
```

2️⃣ Create Virtual Environment
```
python -m venv venv
source venv/bin/activate  # macOS / Linux
# venv\Scripts\activate  # Windows
```

3️⃣ Install Dependencies
```
pip install -r requirements.txt
```

4️⃣ Apply Migrations
```
python manage.py migrate
```

5️⃣ Run Development Server
```
python manage.py runserver
```
--- 

## 🚀 Future Improvements

* Date availability validation per hotel

* Dynamic pricing calculation in booking drawer

* User authentication & reservation history

* Payment integration

* Autocomplete destination suggestions

* Review & rating system

* Production-ready deployment configuration
* ...

## 🧪 Development Notes

* HTMX swaps require reinitialization of JS components.

* Static files may need cache busting during development.

* Drawer components must remain outside HTMX swap targets.

## 📈 Learning Objectives

This project demonstrates:

* Full-stack Django development

* Modern server-driven UI patterns

* Interactive frontend without heavy frameworks

* Clean state management via query parameters

* Scalable filtering architecture
