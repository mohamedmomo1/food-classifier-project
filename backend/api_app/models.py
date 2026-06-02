from django.db import models
from pymongo import MongoClient
from django.conf import settings
from datetime import datetime

# MongoDB Collections (شرح نماذج البيانات - ليست Django Models حقيقية)
# استخدام PyMongo مباشرة بدل Django ORM

"""
BEFIT Database Schema
=====================

1. Food Collection - قائمة الأطعمة مع المعلومات الغذائية
2. Users Collection - المستخدمين (مشترك / كوتش)
3. MealLog Collection - تسجيل الوجبات اليومية
4. DietPlan Collection - الأنظمة الغذائية للكوتش
5. CoachSubscription Collection - العلاقة بين الكوتش والمشترك
"""

class DatabaseManager:
    """مدير اتصال MongoDB"""

    @staticmethod
    def get_db():
        return settings.MONGO_DB

    @staticmethod
    def get_collection(collection_name):
        db = settings.MONGO_DB
        return db[collection_name]


# ============ Schema Definitions (للتوثيق فقط) ============

FOOD_SCHEMA = {
    "_id": "ObjectId",
    "food_id": "number",
    "name": "string (english name)",
    "name_ar": "string (arabic name)",
    "calories": "number",
    "protein": "number (grams)",
    "carbs": "number (grams)",
    "fat": "number (grams)",
    "serving_unit": "string (gram, piece, slice, cup, etc.)",
    "meal_type": "string (breakfast, lunch, dinner, snack)",
    "image_url": "string",
    "created_at": "Date"
}

USERS_SCHEMA = {
    "_id": "ObjectId",
    "name": "string",
    "email": "string (unique)",
    "password_hash": "string",
    "age": "number",
    "gender": "string (male/female)",
    "weight_kg": "number",
    "height_cm": "number",
    "activity_level": "string (sedentary, light, moderate, active)",
    "user_type": "string (subscriber, coach)",
    "targets": {
        "daily_calories": "number",
        "protein_g": "number",
        "carbs_g": "number",
        "fat_g": "number"
    },
    "language": "string (ar/en) - from localStorage",
    "coach_id": "ObjectId or null - reference to coach",
    "created_at": "Date",
    "updated_at": "Date"
}

MEAL_LOG_SCHEMA = {
    "_id": "ObjectId",
    "user_id": "ObjectId - reference to Users",
    "food_id": "ObjectId - reference to Food",
    "food_name": "string (snapshot)",
    "food_name_ar": "string (snapshot)",
    "meal_type": "string (breakfast, lunch, dinner, snack)",
    "quantity": "number",
    "serving_unit": "string",
    "calories_consumed": "number",
    "protein_consumed": "number",
    "carbs_consumed": "number",
    "fat_consumed": "number",
    "date": "Date (the meal date)",
    "logged_at": "Date (when logged)",
    "created_at": "Date"
}

DIET_PLAN_SCHEMA = {
    "_id": "ObjectId",
    "coach_id": "ObjectId - reference to Users (coach)",
    "name": "string",
    "description": "string",
    "meals": {
        "breakfast": [
            {
                "food_id": "ObjectId",
                "quantity": "number",
                "serving_unit": "string",
                "calories": "number",
                "protein": "number",
                "carbs": "number",
                "fat": "number"
            }
        ],
        "lunch": "array of meal items",
        "dinner": "array of meal items",
        "snacks": "array of meal items"
    },
    "daily_targets": {
        "calories": "number",
        "protein": "number",
        "carbs": "number",
        "fat": "number"
    },
    "is_active": "boolean",
    "created_at": "Date",
    "updated_at": "Date"
}

COACH_SUBSCRIPTION_SCHEMA = {
    "_id": "ObjectId",
    "coach_id": "ObjectId - reference to Users (coach)",
    "subscriber_id": "ObjectId - reference to Users (subscriber)",
    "diet_plan_id": "ObjectId or null - reference to DietPlan",
    "status": "string (active, paused, ended)",
    "start_date": "Date",
    "end_date": "Date or null",
    "created_at": "Date",
    "updated_at": "Date"
}


# ============ Helper Functions ============

def init_mongo_indexes():
    """إنشء Indexes للأداء الأفضل"""
    db = DatabaseManager.get_db()

    # MealLog indexes
    db.meal_logs.create_index([("user_id", 1), ("date", -1)])
    db.meal_logs.create_index([("user_id", 1), ("meal_type", 1), ("date", -1)])

    # Users indexes
    db.users.create_index([("email", 1)], unique=True)

    # Food indexes
    db.food.create_index([("name", 1)])
    db.food.create_index([("meal_type", 1)])

    # CoachSubscription indexes
    db.coach_subscriptions.create_index([("coach_id", 1), ("status", 1)])
    db.coach_subscriptions.create_index([("subscriber_id", 1)])

    print("✓ MongoDB Indexes Created Successfully")
