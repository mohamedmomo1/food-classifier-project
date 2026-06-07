from django.http import JsonResponse
from django.conf import settings
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import bcrypt
import random


def delete_old_demo_data(db):
    """Delete old demo accounts and all related data"""
    try:
        users_collection = db["users"]
        meal_logs_collection = db["meal_logs"]
        diet_plans_collection = db["diet_plans"]
        subscriptions_collection = db["coach_subscriptions"]

        # Find old coach (coach_big_ramy@befit.com)
        old_coach = users_collection.find_one({"email": "coach_big_ramy@befit.com"})
        if old_coach:
            coach_id = old_coach["_id"]
            # Delete coach's diet plans
            diet_plans_collection.delete_many({"coach_id": coach_id})
            # Delete coach subscriptions
            subscriptions_collection.delete_many({"coach_id": coach_id})
            # Delete coach
            users_collection.delete_one({"_id": coach_id})
            print(f"✓ تم حذف حساب الكوتش القديم: {coach_id}")

        # Find old subscriber (mostafa_meter@befit.com)
        old_subscriber = users_collection.find_one({"email": "mostafa_meter@befit.com"})
        if old_subscriber:
            subscriber_id = old_subscriber["_id"]
            # Delete subscriber's meal logs
            meal_logs_collection.delete_many({"user_id": subscriber_id})
            # Delete subscriber subscriptions
            subscriptions_collection.delete_many({"subscriber_id": subscriber_id})
            # Delete subscriber
            users_collection.delete_one({"_id": subscriber_id})
            print(f"✓ تم حذف حساب المشترك القديم: {subscriber_id}")

        return True
    except Exception as e:
        print(f"✗ خطأ أثناء حذف البيانات القديمة: {str(e)}")
        return False


def seed_demo_data(request):
    """
    إنشاء بيانات تجريبية شاملة (الإصدار الجديد):
    1. حذف الحسابات القديمة
    2. حساب الكوتش: كابتن بيج رامي (coach_big_ramy@befit.com)
    3. حساب المشترك: Mustafa Karam (mustafa_karam@befit.com)
    4. خطة تدريبية للكوتش
    5. 60 يوماً من الوجبات للمشترك
    6. صلاحيات وعلاقات صحيحة
    """
    try:
        db = settings.MONGO_DB
        users_collection = db["users"]
        diet_plans_collection = db["diet_plans"]
        subscriptions_collection = db["coach_subscriptions"]
        meal_logs_collection = db["meal_logs"]
        food_collection = db["food_database"]

        # ============ 0. حذف البيانات القديمة ============
        delete_old_demo_data(db)

        # ============ 1. إنشاء حساب الكوتش ============
        coach_email = "coach_big_ramy@befit.com"
        coach_name = "كابتن بيج رامي"

        hashed_password = bcrypt.hashpw("123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        coach_document = {
            "name": coach_name,
            "email": coach_email,
            "password_hash": hashed_password,
            "age": 35,
            "gender": "male",
            "weight_kg": 85.0,
            "height_cm": 180,
            "activity_level": "active",
            "user_type": "coach",
            "targets": {
                "daily_calories": 3000,
                "protein_g": 170,
                "carbs_g": 300,
                "fat_g": 100
            },
            "language": "ar",
            "coach_id": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        coach_result = users_collection.insert_one(coach_document)
        coach_id = coach_result.inserted_id
        print(f"✓ تم إنشاء حساب الكوتش الجديد: {coach_id}")

        # ============ 2. إنشاء خطة تدريبية للكوتش ============
        diet_plan_document = {
            "coach_id": coach_id,
            "name": coach_name,
            "description": f"خطة تدريبية وتغذية مخصصة من {coach_name}",
            "meals": {
                "breakfast": [],
                "lunch": [],
                "dinner": [],
                "snacks": []
            },
            "daily_targets": {
                "calories": 3000,
                "protein": 170,
                "carbs": 300,
                "fat": 100
            },
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        plan_result = diet_plans_collection.insert_one(diet_plan_document)
        diet_plan_id = plan_result.inserted_id
        print(f"✓ تم إنشاء الخطة التدريبية الجديدة: {diet_plan_id}")

        # ============ 3. إنشاء حساب المشترك (الجديد) ============
        subscriber_email = "mustafa_karam@befit.com"
        subscriber_name = "Mustafa Karam"
        subscriber_name_ar = "مصطفى كرم"

        hashed_password = bcrypt.hashpw("123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        subscriber_targets = {
            "daily_calories": 2500,
            "protein_g": 125,
            "carbs_g": 300,
            "fat_g": 80
        }

        subscriber_document = {
            "name": subscriber_name,
            "email": subscriber_email,
            "password_hash": hashed_password,
            "age": 28,
            "gender": "male",
            "weight_kg": 90.0,
            "height_cm": 175,
            "activity_level": "moderate",
            "user_type": "subscriber",
            "targets": subscriber_targets,
            "language": "ar",
            "coach_id": coach_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        subscriber_result = users_collection.insert_one(subscriber_document)
        subscriber_id = subscriber_result.inserted_id
        print(f"✓ تم إنشاء حساب المشترك الجديد: {subscriber_id}")

        # ============ 4. ربط المشترك بخطة الكوتش ============
        subscription_document = {
            "coach_id": coach_id,
            "subscriber_id": subscriber_id,
            "diet_plan_id": diet_plan_id,
            "status": "active",
            "start_date": datetime.utcnow(),
            "end_date": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        subscription_result = subscriptions_collection.insert_one(subscription_document)
        subscription_id = subscription_result.inserted_id
        print(f"✓ تم ربط المشترك بالخطة: {subscription_id}")

        # ============ 5. حشو 60 يوماً من الوجبات ============
        all_foods = list(food_collection.find({}))

        if not all_foods:
            print("✗ لا توجد أطعمة في قاعدة البيانات!")
            return JsonResponse({"error": "No foods found in database"}, status=400)

        # تجميع الأطعمة حسب نوع الوجبة
        foods_by_type = {
            "breakfast": [f for f in all_foods if f.get("meal_type") == "breakfast"],
            "lunch": [f for f in all_foods if f.get("meal_type") == "lunch"],
            "dinner": [f for f in all_foods if f.get("meal_type") == "dinner"],
            "snack": [f for f in all_foods if f.get("meal_type") == "snack"]
        }

        # التأكد من وجود أطعمة لكل نوع وجبة
        for meal_type, foods in foods_by_type.items():
            if not foods:
                print(f"⚠️ تحذير: لا توجد أطعمة من نوع {meal_type}")

        # حشو 60 يوماً
        today = datetime.now()
        meal_logs_to_insert = []

        for days_ago in range(60, 0, -1):  # من اليوم 60 إلى اليوم 1
            meal_date = today - timedelta(days=days_ago)
            meal_date = meal_date.replace(hour=0, minute=0, second=0, microsecond=0)

            # إضافة وجبة واحدة من كل نوع لكل يوم
            for meal_type in ["breakfast", "lunch", "dinner", "snack"]:
                foods_available = foods_by_type.get(meal_type, [])

                if not foods_available:
                    continue

                # اختيار طعام عشوائي من النوع
                food = random.choice(foods_available)
                quantity = random.uniform(1.0, 2.0)  # كمية عشوائية من 1 إلى 2

                meal_log = {
                    "user_id": subscriber_id,
                    "food_id": food["_id"],
                    "food_name": food.get("name", "Unknown"),
                    "food_name_ar": food.get("name_ar", "مجهول"),
                    "meal_type": meal_type,
                    "quantity": round(quantity, 2),
                    "serving_unit": food.get("serving_unit", "gram"),
                    "calories_consumed": round(food.get("calories", 0) * quantity, 2),
                    "protein_consumed": round(food.get("protein", 0) * quantity, 2),
                    "carbs_consumed": round(food.get("carbs", 0) * quantity, 2),
                    "fat_consumed": round(food.get("fat", 0) * quantity, 2),
                    "date": meal_date,
                    "logged_at": datetime.utcnow(),
                    "created_at": datetime.utcnow()
                }

                meal_logs_to_insert.append(meal_log)

        # إدراج جميع الوجبات دفعة واحدة
        if meal_logs_to_insert:
            meal_logs_collection.insert_many(meal_logs_to_insert)
            print(f"✓ تم إنشاء {len(meal_logs_to_insert)} وجبة (60 يوم × 4 وجبات)")

        # ============ الملخص النهائي ============
        summary = {
            "coach": {
                "id": str(coach_id),
                "name": coach_name,
                "email": coach_email,
                "password": "123",
                "user_type": "coach"
            },
            "subscriber": {
                "id": str(subscriber_id),
                "name": subscriber_name,
                "email": subscriber_email,
                "password": "123",
                "user_type": "subscriber",
                "coach_id": str(coach_id)
            },
            "diet_plan": {
                "id": str(diet_plan_id),
                "name": coach_name,
                "coach_id": str(coach_id)
            },
            "subscription": {
                "id": str(subscription_id),
                "status": "active",
                "coach_id": str(coach_id),
                "subscriber_id": str(subscriber_id),
                "diet_plan_id": str(diet_plan_id)
            },
            "meals": {
                "total": len(meal_logs_to_insert) if meal_logs_to_insert else 0,
                "days": 60,
                "meals_per_day": 4
            }
        }

        return JsonResponse({
            "success": True,
            "message": "✓ تم إنشاء البيانات التجريبية الجديدة بنجاح!",
            "data": summary
        }, status=201)

    except Exception as e:
        return JsonResponse({
            "error": str(e)
        }, status=500)
