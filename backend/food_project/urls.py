from django.contrib import admin
from django.urls import path, include
from api_app.seed_food import seed_food_database

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api_app.urls')),  # All API routes
    path('api/seed-food/', seed_food_database, name='seed_food'),
]