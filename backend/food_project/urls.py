from django.contrib import admin
from django.urls import path
from api_app.views import predict_food, register_user, login_user
from api_app.seed_food import seed_food_database

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/predict-food/', predict_food, name='predict_food'),
    path('api/seed-food/', seed_food_database, name='seed_food'),
    path('api/register/', register_user, name='register_user'),  
    path('api/login/', login_user, name='login_user'),          
]