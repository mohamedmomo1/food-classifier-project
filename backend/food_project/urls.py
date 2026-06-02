from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from api_app.seed_food import seed_food_database

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api_app.urls')),  # All API routes
    path('api/seed-food/', seed_food_database, name='seed_food'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'static')