from django.urls import path
from . import views

urlpatterns = [
    # ============ Auth APIs ============
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('users/<str:user_id>/', views.update_user, name='update_user'),

    # ============ Food APIs ============
    path('foods/predict/', views.predict_food, name='predict_food'),
    path('foods/search/', views.search_foods, name='search_foods'),

    # ============ Meal Log APIs ============
    path('meals/log/', views.log_meal, name='log_meal'),
    path('meals/history/', views.get_meal_history, name='meal_history'),
    path('meals/summary/', views.get_meal_summary, name='meal_summary'),
    path('meals/<str:meal_id>/', views.delete_meal, name='delete_meal'),
    path('meals/<str:meal_id>/update/', views.update_meal, name='update_meal'),

    # ============ Diet Plan APIs ============
    path('diet-plans/', views.create_diet_plan, name='create_diet_plan'),
    path('diet-plans/list/', views.get_diet_plans, name='get_diet_plans'),
    path('diet-plans/<str:plan_id>/', views.update_diet_plan, name='update_diet_plan'),
    path('diet-plans/<str:plan_id>/delete/', views.delete_diet_plan, name='delete_diet_plan'),

    # ============ Coach Subscription APIs ============
    path('subscriptions/', views.create_subscription, name='create_subscription'),
    path('subscriptions/list/', views.get_subscriptions, name='get_subscriptions'),
    path('subscriptions/<str:subscription_id>/', views.update_subscription, name='update_subscription'),
    path('subscriptions/<str:subscriber_id>/history/', views.get_subscriber_meal_history, name='subscriber_history'),
]
