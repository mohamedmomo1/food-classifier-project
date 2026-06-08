import os
import bcrypt
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ultralytics import YOLO
from PIL import Image
from calendar import monthrange

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Check if running in Docker container with mounted volume, otherwise use relative path fallback
if os.path.exists("/ai_model/weights/best_fixed_konafa.pt"):
    MODEL_PATH = "/ai_model/weights/best_fixed_konafa.pt"
else:
    MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "ai_model", "weights", "best_fixed_konafa.pt"))
    if not os.path.exists(MODEL_PATH):
        MODEL_PATH = r"C:\final_gp_pro\ai_model\weights\best_fixed_konafa.pt"

try:
    model = YOLO(MODEL_PATH)
    print(f"=======> YOLO Model Loaded Successfully from: {MODEL_PATH} <=======")
except Exception as e:
    model = None
    print(f"=======> Error Loading Model: {str(e)} <=======")

ARABIC_NAMES_MAPPING = {
    "meat": "لحم",
    "rice": "أرز",
    "salad": "سلطة خضراء",
    "burger": "برجر",
    "pizza": "بيتزا",
    "ketchup": "كاتشب",
    "fries": "بطاطس مقلية",
    "cola": "كولا",
    "banana": "موز",
    "chicken": "دجاج",
    "cucumber": "خيار",
    "falafel": "فلافل",
    "konafa": "كنافة",
    "orange": "برتقال",
    "tomato": "طماطم",
    "mulukhiyah": "ملوخية"
}

ARABIC_UNITS_MAPPING = {
    "gram": "جرام",
    "piece": "قطعة",
    "slice": "شريحة",
    "tablespoon": "ملعقة كبيرة",
    "ml": "مللي",
    "cup": "كوب",
    "loaf": "رغيف",
    "pack": "عبوة",
    "clove": "فص"
}


# ============ Helper Functions ============

def calculate_fitness_targets(weight, height, age, gender, activity_level):
    if gender.lower() == 'male':
        bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161

    activity_multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
    }

    tdee = bmr * activity_multipliers.get(activity_level.lower(), 1.2)
    daily_calories = round(tdee)

    protein_g = round(weight * 2)
    protein_cal = protein_g * 4

    fat_cal = daily_calories * 0.25
    fat_g = round(fat_cal / 9)

    remaining_cal = daily_calories - (protein_cal + fat_cal)
    carbs_g = round(remaining_cal / 4)

    return {
        "daily_calories": daily_calories,
        "protein_g": protein_g,
        "carbs_g": carbs_g,
        "fat_g": fat_g
    }


def parse_date(date_str):
    """تحويل نص التاريخ إلى Date object"""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except:
        return datetime.now().date()


# ============ Food APIs ============

@api_view(['POST'])
def predict_food(request):
    """تحديد نوع الطعام من الصورة مع إرجاع تفاصيل الأطعمة المكتشفة"""
    if 'image' not in request.FILES:
        return Response({'error': 'Please upload an image under the key "image"'}, status=status.HTTP_400_BAD_REQUEST)

    if model is None:
        return Response({'error': 'YOLO model is not initialized on the server'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        db = settings.MONGO_DB
        food_collection = db["food_database"]

        uploaded_image = request.FILES['image']
        image = Image.open(uploaded_image)
        results = model(image)

        detected_classes = []
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    class_id = int(box.cls[0].item())
                    class_name = model.names[class_id]
                    detected_classes.append(class_name)

        unique_food_detected = list(set(detected_classes))

        predictions_response = []
        for food_key in unique_food_detected:
            search_name = food_key.strip().capitalize()

            food_data = food_collection.find_one({"name": search_name})

            if food_data:
                raw_unit = food_data.get('serving_unit', 'gram')
                raw_name = food_data.get('name', food_key)
                name_ar = food_data.get('name_ar', raw_name)
                image_url = food_data.get('image_url', '/static/food_images/default.jpg')

                unit_ar = ARABIC_UNITS_MAPPING.get(raw_unit.lower(), raw_unit)

                predictions_response.append({
                    'food_id': str(food_data.get('_id', '')),
                    'name_ar': name_ar,
                    'name_en': raw_name,
                    'unit_ar': unit_ar,
                    'unit_en': raw_unit,
                    'calories': food_data.get('calories', 150),
                    'meal_type': food_data.get('meal_type', 'snack'),
                    'image_url': image_url
                })
            else:
                fallback_key = food_key.lower().strip()
                predictions_response.append({
                    'name_ar': ARABIC_NAMES_MAPPING.get(fallback_key, food_key),
                    'name_en': food_key.capitalize(),
                    'unit_ar': 'جرام',
                    'unit_en': 'gram',
                    'calories': 100,
                    'meal_type': 'snack',
                    'image_url': '/static/food_images/default.jpg'
                })

        return Response({
            'success': True,
            'predictions': predictions_response,
            'count': len(predictions_response)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def search_foods(request):
    """البحث عن الأطعمة بـ auto-complete (عربي وإنجليزي)"""
    try:
        db = settings.MONGO_DB
        food_collection = db["food_database"]

        query = request.GET.get('query', '').strip()
        meal_type = request.GET.get('meal_type', None)

        if not query:
            return Response({
                'success': True,
                'foods': [],
                'count': 0
            }, status=status.HTTP_200_OK)

        # 1. Build initial DB query filter
        db_filter = {}
        if meal_type and meal_type != "all":
            db_filter["meal_type"] = meal_type

        # Fetch candidate foods from database to do fuzzy/regex matching
        all_candidates = list(food_collection.find(db_filter))

        import difflib
        scored_foods = []
        query_lower = query.lower()

        for food in all_candidates:
            name_en = food.get("name", "").lower()
            name_ar = food.get("name_ar", "").lower()

            score = 0.0

            # Direct/Regex matches
            # 1. Exact match
            if query_lower == name_en or query_lower == name_ar:
                score = 1.0
            # 2. Starts with (Prefix)
            elif name_en.startswith(query_lower) or name_ar.startswith(query_lower):
                score = 0.9
            # 3. Substring match
            elif query_lower in name_en or query_lower in name_ar:
                score = 0.8
            # 4. Fuzzy match using difflib SequenceMatcher (case-insensitive)
            else:
                en_ratio = difflib.SequenceMatcher(None, query_lower, name_en).ratio()
                ar_ratio = difflib.SequenceMatcher(None, query_lower, name_ar).ratio()
                max_ratio = max(en_ratio, ar_ratio)
                if max_ratio >= 0.40:  # similarity threshold
                    score = max_ratio * 0.7  # scale down fuzzy match score so exact/prefix matches rank higher

            if score > 0:
                food['_id'] = str(food['_id'])
                scored_foods.append((score, food))

        # Sort foods by score descending
        scored_foods.sort(key=lambda x: x[0], reverse=True)

        # Extract food dicts, limit to 20
        matched_foods = [item[1] for item in scored_foods[:20]]

        return Response({
            'success': True,
            'foods': matched_foods,
            'count': len(matched_foods)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============ Auth APIs ============

@api_view(['POST'])
def register_user(request):
    """تسجيل مستخدم جديد"""
    db = settings.MONGO_DB
    users_collection = db["users"]

    data = request.data
    email = data.get('email')

    if users_collection.find_one({"email": email}):
        return Response({"error": "هذا البريد الإلكتروني مسجل بالفعل!"}, status=status.HTTP_400_BAD_REQUEST)

    password = data.get('password')
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    weight = float(data.get('weight'))
    height = float(data.get('height'))
    age = int(data.get('age'))
    gender = data.get('gender')
    activity_level = data.get('activity_level')
    user_type = data.get('user_type', 'subscriber')  # subscriber or coach

    targets = calculate_fitness_targets(weight, height, age, gender, activity_level)

    user_document = {
        "name": data.get('name'),
        "email": email,
        "password_hash": hashed_password,
        "age": age,
        "gender": gender,
        "weight_kg": weight,
        "height_cm": height,
        "activity_level": activity_level,
        "user_type": user_type,
        "targets": targets,
        "language": "ar",
        "coach_id": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = users_collection.insert_one(user_document)

    return Response({
        "success": True,
        "message": "تم إنشاء الحساب وحساب السعرات بنجاح!",
        "user_id": str(result.inserted_id),
        "user_type": user_type,
        "targets": targets
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def login_user(request):
    """تسجيل الدخول"""
    db = settings.MONGO_DB
    users_collection = db["users"]

    data = request.data
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({"email": email})

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return Response({
            "success": True,
            "message": "تم تسجيل الدخول بنجاح!",
            "user": {
                "id": str(user['_id']),
                "name": user['name'],
                "email": user['email'],
                "user_type": user.get('user_type', 'subscriber'),
                "language": user.get('language', 'ar'),
                "calories_target": user['targets']['daily_calories']
            }
        }, status=status.HTTP_200_OK)

    return Response({"error": "البريد الإلكتروني أو كلمة المرور غير صحيحة!"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PUT'])
def update_user(request, user_id):
    """تحديث بيانات المستخدم"""
    try:
        db = settings.MONGO_DB
        users_collection = db["users"]

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return Response({"error": "المستخدم غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        update_data = {
            "updated_at": datetime.utcnow()
        }

        if 'language' in data:
            update_data['language'] = data.get('language')
        if 'user_type' in data:
            update_data['user_type'] = data.get('user_type')
        if 'coach_id' in data:
            update_data['coach_id'] = ObjectId(data.get('coach_id')) if data.get('coach_id') else None

        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        return Response({
            "success": True,
            "message": "تم تحديث البيانات بنجاح"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============ Meal Log APIs ============

@api_view(['POST'])
def log_meal(request):
    """تسجيل وجبة جديدة"""
    try:
        db = settings.MONGO_DB
        meal_logs = db["meal_logs"]
        food_collection = db["food_database"]

        data = request.data
        user_id = ObjectId(data.get('user_id'))
        food_id = ObjectId(data.get('food_id'))
        quantity = float(data.get('quantity', 1))
        meal_type = data.get('meal_type')
        meal_date = data.get('date', datetime.now().strftime("%Y-%m-%d"))
        
        # Get or generate meal_session_id
        meal_session_id = data.get('meal_session_id')
        if not meal_session_id:
            import uuid
            meal_session_id = f"session_{uuid.uuid4().hex}"

        # جلب بيانات الطعام
        food = food_collection.find_one({"_id": food_id})
        if not food:
            return Response({"error": "الطعام غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        # حساب الماكروز المستهلكة
        meal_log = {
            "user_id": user_id,
            "food_id": food_id,
            "meal_session_id": meal_session_id,
            "food_name": food.get('name', ''),
            "food_name_ar": food.get('name_ar', ''),
            "food_image_url": food.get('image_url', '/static/food_images/default.jpg'),
            "meal_type": meal_type or food.get('meal_type', 'snack'),
            "quantity": quantity,
            "serving_unit": food.get('serving_unit', 'gram'),
            "calories_consumed": round(food.get('calories', 0) * quantity, 2),
            "protein_consumed": round(food.get('protein', 0) * quantity, 2),
            "carbs_consumed": round(food.get('carbs', 0) * quantity, 2),
            "fat_consumed": round(food.get('fat', 0) * quantity, 2),
            "date": datetime.strptime(meal_date, "%Y-%m-%d"),
            "logged_at": datetime.utcnow(),
            "created_at": datetime.utcnow()
        }

        result = meal_logs.insert_one(meal_log)

        return Response({
            "success": True,
            "message": "تم تسجيل الوجبة بنجاح",
            "meal_id": str(result.inserted_id),
            "meal": meal_log
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_meal_history(request):
    """جلب سجل الوجبات"""
    try:
        db = settings.MONGO_DB
        meal_logs = db["meal_logs"]

        user_id = ObjectId(request.GET.get('user_id'))
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        filter_query = {"user_id": user_id}

        if start_date and end_date:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            filter_query["date"] = {"$gte": start, "$lt": end}

        # Sort by logged_at descending so newest eating sessions are first
        raw_meals = list(meal_logs.find(filter_query).sort("logged_at", -1))

        # Grouping by meal_session_id or fallback
        grouped_meals = []
        grouped_map = {}

        for meal in raw_meals:
            session_id = meal.get('meal_session_id')
            if not session_id:
                # Proximity/fallback key: group by date, meal_type, and rounded logged_at to nearest 2 minutes
                logged_at = meal.get('created_at') or meal.get('logged_at') or datetime.utcnow()
                rounded_minute = (logged_at.minute // 2) * 2
                time_key = logged_at.replace(minute=rounded_minute, second=0, microsecond=0).strftime("%Y-%m-%d %H:%M")
                session_id = f"fallback_{meal.get('meal_type', 'snack')}_{time_key}"

            if session_id not in grouped_map:
                logged_at_val = meal.get('created_at') or meal.get('logged_at') or datetime.utcnow()
                date_val = meal.get('date') or datetime.utcnow()

                # ISO formats
                logged_at_iso = logged_at_val.isoformat() if hasattr(logged_at_val, 'isoformat') else str(logged_at_val)
                date_iso = date_val.isoformat() if hasattr(date_val, 'isoformat') else str(date_val)

                grouped_map[session_id] = {
                    "_id": session_id,
                    "meal_session_id": session_id,
                    "meal_type": meal.get('meal_type', 'snack'),
                    "date": date_iso,
                    "logged_at": logged_at_iso,
                    "total_calories": 0.0,
                    "total_protein": 0.0,
                    "total_carbs": 0.0,
                    "total_fat": 0.0,
                    "items": []
                }
                grouped_meals.append(grouped_map[session_id])

            g = grouped_map[session_id]
            g['total_calories'] = round(g['total_calories'] + meal.get('calories_consumed', 0.0), 2)
            g['total_protein'] = round(g['total_protein'] + meal.get('protein_consumed', 0.0), 2)
            g['total_carbs'] = round(g['total_carbs'] + meal.get('carbs_consumed', 0.0), 2)
            g['total_fat'] = round(g['total_fat'] + meal.get('fat_consumed', 0.0), 2)

            item = {
                "_id": str(meal['_id']),
                "user_id": str(meal.get('user_id')),
                "food_id": str(meal.get('food_id')),
                "food_name": meal.get('food_name', ''),
                "food_name_ar": meal.get('food_name_ar', ''),
                "food_image_url": meal.get('food_image_url', '/static/food_images/default.jpg'),
                "quantity": meal.get('quantity', 1.0),
                "serving_unit": meal.get('serving_unit', 'gram'),
                "calories_consumed": meal.get('calories_consumed', 0.0),
                "protein_consumed": meal.get('protein_consumed', 0.0),
                "carbs_consumed": meal.get('carbs_consumed', 0.0),
                "fat_consumed": meal.get('fat_consumed', 0.0),
            }
            g['items'].append(item)

        total_meals = len(grouped_meals)
        total_items = sum(len(g['items']) for g in grouped_meals)

        return Response({
            "success": True,
            "meals": grouped_meals,
            "total_meals": total_meals,
            "total_items": total_items,
            "count": len(grouped_meals)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_meal_summary(request):
    """جلب ملخص الماكروز حسب الفترة الزمنية"""
    try:
        db = settings.MONGO_DB
        meal_logs = db["meal_logs"]

        user_id = ObjectId(request.GET.get('user_id'))
        period = request.GET.get('period', 'daily')  # daily, weekly, monthly
        date_str = request.GET.get('date', datetime.now().strftime("%Y-%m-%d"))
        meal_type = request.GET.get('meal_type', None)  # breakfast, lunch, dinner, snack

        target_date = datetime.strptime(date_str, "%Y-%m-%d")

        # تحديد نطاق التاريخ حسب الفترة
        if period == 'daily':
            start_date = target_date
            end_date = target_date + timedelta(days=1)
        elif period == 'weekly':
            start_date = target_date - timedelta(days=target_date.weekday())
            end_date = start_date + timedelta(days=7)
        elif period == 'monthly':
            start_date = target_date.replace(day=1)
            last_day = monthrange(target_date.year, target_date.month)[1]
            end_date = target_date.replace(day=last_day) + timedelta(days=1)
        else:
            return Response({"error": "فترة غير صحيحة"}, status=status.HTTP_400_BAD_REQUEST)

        # بناء الفلتر
        filter_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lt": end_date}
        }

        if meal_type and meal_type != "all":
            filter_query["meal_type"] = meal_type

        meals = list(meal_logs.find(filter_query))

        # تجميع الماكروز
        total_calories = sum([m['calories_consumed'] for m in meals])
        total_protein = sum([m['protein_consumed'] for m in meals])
        total_carbs = sum([m['carbs_consumed'] for m in meals])
        total_fat = sum([m['fat_consumed'] for m in meals])

        return Response({
            "success": True,
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "meal_type_filter": meal_type,
            "summary": {
                "total_calories": round(total_calories, 2),
                "total_protein": round(total_protein, 2),
                "total_carbs": round(total_carbs, 2),
                "total_fat": round(total_fat, 2),
                "meal_count": len(meals)
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_meal(request, meal_id):
    """حذف وجبة"""
    try:
        db = settings.MONGO_DB
        meal_logs = db["meal_logs"]

        result = meal_logs.delete_one({"_id": ObjectId(meal_id)})

        if result.deleted_count == 0:
            return Response({"error": "الوجبة غير موجودة"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "success": True,
            "message": "تم حذف الوجبة بنجاح"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_meal(request, meal_id):
    """تعديل وجبة"""
    try:
        db = settings.MONGO_DB
        meal_logs = db["meal_logs"]
        food_collection = db["food_database"]

        meal = meal_logs.find_one({"_id": ObjectId(meal_id)})
        if not meal:
            return Response({"error": "الوجبة غير موجودة"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        update_data = {}

        if 'quantity' in data:
            quantity = float(data.get('quantity'))
            food = food_collection.find_one({"_id": meal['food_id']})

            update_data['quantity'] = quantity
            update_data['calories_consumed'] = round(food.get('calories', 0) * quantity, 2)
            update_data['protein_consumed'] = round(food.get('protein', 0) * quantity, 2)
            update_data['carbs_consumed'] = round(food.get('carbs', 0) * quantity, 2)
            update_data['fat_consumed'] = round(food.get('fat', 0) * quantity, 2)

        if 'meal_type' in data:
            update_data['meal_type'] = data.get('meal_type')

        if 'date' in data:
            update_data['date'] = datetime.strptime(data.get('date'), "%Y-%m-%d")

        meal_logs.update_one(
            {"_id": ObjectId(meal_id)},
            {"$set": update_data}
        )

        return Response({
            "success": True,
            "message": "تم تحديث الوجبة بنجاح"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============ Diet Plan APIs ============

@api_view(['POST'])
def create_diet_plan(request):
    """إنشاء نظام غذائي (للكوتش فقط)"""
    try:
        db = settings.MONGO_DB
        diet_plans = db["diet_plans"]
        diet_plan_items = db["diet_plan_items"]

        coach_id = ObjectId(request.data.get('coach_id'))
        plan_name = request.data.get('plan_name') or request.data.get('name', '')
        description = request.data.get('description', '')

        # Enforce uniqueness on plan_name
        if diet_plans.find_one({"plan_name": plan_name}):
            return Response({
                "success": False,
                "error": "اسم الخطة مستخدم بالفعل، يرجى اختيار اسم فريد"
            }, status=status.HTTP_400_BAD_REQUEST)

        # 1. Insert into diet_plans
        diet_plan = {
            "coach_id": coach_id,
            "plan_name": plan_name,
            "description": description,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = diet_plans.insert_one(diet_plan)
        plan_id = result.inserted_id

        # 2. Insert items into diet_plan_items
        meals_map = {
            "breakfast": request.data.get('breakfast_meals', []),
            "lunch": request.data.get('lunch_meals', []),
            "dinner": request.data.get('dinner_meals', []),
            "snack": request.data.get('snacks', [])
        }

        # Handle snacks/snack naming variations
        if not meals_map["snack"] and request.data.get('snack_meals'):
            meals_map["snack"] = request.data.get('snack_meals')

        for meal_type, items_list in meals_map.items():
            for item in items_list:
                food_id_str = item.get('food_id') or item.get('_id')
                if not food_id_str:
                    continue
                qty = float(item.get('quantity') or item.get('quantity_g') or 100.0)
                diet_plan_items.insert_one({
                    "diet_plan_id": plan_id,
                    "food_id": ObjectId(food_id_str),
                    "meal_type": meal_type,
                    "quantity_g": qty,
                    "created_at": datetime.utcnow()
                })

        return Response({
            "success": True,
            "message": "تم إنشاء النظام الغذائي بنجاح",
            "plan_id": str(plan_id)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_diet_plans(request):
    """جلب الأنظمة الغذائية"""
    try:
        db = settings.MONGO_DB
        diet_plans = db["diet_plans"]
        diet_plan_items = db["diet_plan_items"]
        food_collection = db["food_database"]

        coach_id_str = request.GET.get('coach_id')
        plan_name = request.GET.get('plan_name')
        plan_id_str = request.GET.get('plan_id')

        filter_query = {}
        if coach_id_str:
            filter_query["coach_id"] = ObjectId(coach_id_str)
        if plan_name:
            filter_query["plan_name"] = plan_name
        if plan_id_str:
            filter_query["_id"] = ObjectId(plan_id_str)

        plans = list(diet_plans.find(filter_query))

        for plan in plans:
            plan['_id'] = str(plan['_id'])
            plan['coach_id'] = str(plan['coach_id'])
            plan['name'] = plan.get('plan_name')

            # Fetch items
            items = list(diet_plan_items.find({"diet_plan_id": ObjectId(plan['_id'])}))

            breakfast_meals = []
            lunch_meals = []
            dinner_meals = []
            snacks = []

            for item in items:
                food_id = item.get('food_id')
                food = food_collection.find_one({"_id": food_id})

                food_data = {
                    "_id": str(food_id),
                    "food_id": str(food_id),
                    "quantity": item.get('quantity_g', 100.0),
                    "quantity_g": item.get('quantity_g', 100.0),
                    "meal_type": item.get('meal_type')
                }
                if food:
                    food_data.update({
                        "name": food.get('name', ''),
                        "name_ar": food.get('name_ar', ''),
                        "calories": food.get('calories', 0.0),
                        "protein": food.get('protein', 0.0),
                        "carbs": food.get('carbs', 0.0),
                        "fat": food.get('fat', 0.0),
                        "serving_unit": food.get('serving_unit', 'gram'),
                        "image_url": food.get('image_url', '')
                    })

                m_type = item.get('meal_type')
                if m_type == 'breakfast':
                    breakfast_meals.append(food_data)
                elif m_type == 'lunch':
                    lunch_meals.append(food_data)
                elif m_type == 'dinner':
                    dinner_meals.append(food_data)
                else:
                    snacks.append(food_data)

            plan['meals'] = {
                "breakfast": breakfast_meals,
                "lunch": lunch_meals,
                "dinner": dinner_meals,
                "snacks": snacks
            }

            # Calculate daily targets dynamically
            total_cals = sum(float(f.get('calories', 0)) * (float(f.get('quantity', 100)) / 100.0 if f.get('serving_unit') == 'gram' else float(f.get('quantity', 1))) for f in (breakfast_meals + lunch_meals + dinner_meals + snacks))
            total_prot = sum(float(f.get('protein', 0)) * (float(f.get('quantity', 100)) / 100.0 if f.get('serving_unit') == 'gram' else float(f.get('quantity', 1))) for f in (breakfast_meals + lunch_meals + dinner_meals + snacks))
            total_carb = sum(float(f.get('carbs', 0)) * (float(f.get('quantity', 100)) / 100.0 if f.get('serving_unit') == 'gram' else float(f.get('quantity', 1))) for f in (breakfast_meals + lunch_meals + dinner_meals + snacks))
            total_fats = sum(float(f.get('fat', 0)) * (float(f.get('quantity', 100)) / 100.0 if f.get('serving_unit') == 'gram' else float(f.get('quantity', 1))) for f in (breakfast_meals + lunch_meals + dinner_meals + snacks))

            plan['daily_targets'] = {
                "calories": round(total_cals, 1),
                "protein": round(total_prot, 1),
                "carbs": round(total_carb, 1),
                "fat": round(total_fats, 1)
            }

        return Response({
            "success": True,
            "plans": plans,
            "count": len(plans)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_diet_plan(request, plan_id):
    """تعديل نظام غذائي"""
    try:
        db = settings.MONGO_DB
        diet_plans = db["diet_plans"]
        diet_plan_items = db["diet_plan_items"]

        pid = ObjectId(plan_id)
        plan = diet_plans.find_one({"_id": pid})
        if not plan:
            return Response({"error": "النظام الغذائي غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        plan_name = request.data.get('plan_name') or request.data.get('name')

        # Check uniqueness of plan_name if changed
        if plan_name and plan_name != plan.get('plan_name'):
            if diet_plans.find_one({"plan_name": plan_name}):
                return Response({
                    "success": False,
                    "error": "اسم الخطة مستخدم بالفعل، يرجى اختيار اسم فريد"
                }, status=status.HTTP_400_BAD_REQUEST)

        update_data = {
            "updated_at": datetime.utcnow()
        }
        if plan_name:
            update_data['plan_name'] = plan_name
        if 'description' in request.data:
            update_data['description'] = request.data.get('description')

        diet_plans.update_one({"_id": pid}, {"$set": update_data})

        # Update items: delete and rebuild
        has_items_update = any(k in request.data for k in ['breakfast_meals', 'lunch_meals', 'dinner_meals', 'snacks'])
        if has_items_update:
            diet_plan_items.delete_many({"diet_plan_id": pid})

            meals_map = {
                "breakfast": request.data.get('breakfast_meals', []),
                "lunch": request.data.get('lunch_meals', []),
                "dinner": request.data.get('dinner_meals', []),
                "snack": request.data.get('snacks', [])
            }

            for meal_type, items_list in meals_map.items():
                for item in items_list:
                    food_id_str = item.get('food_id') or item.get('_id')
                    if not food_id_str:
                        continue
                    qty = float(item.get('quantity') or item.get('quantity_g') or 100.0)
                    diet_plan_items.insert_one({
                        "diet_plan_id": pid,
                        "food_id": ObjectId(food_id_str),
                        "meal_type": meal_type,
                        "quantity_g": qty,
                        "created_at": datetime.utcnow()
                    })

        return Response({
            "success": True,
            "message": "تم تحديث النظام الغذائي بنجاح"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_diet_plan(request, plan_id):
    """حذف نظام غذائي"""
    try:
        db = settings.MONGO_DB
        diet_plans = db["diet_plans"]

        result = diet_plans.delete_one({"_id": ObjectId(plan_id)})

        if result.deleted_count == 0:
            return Response({"error": "النظام الغذائي غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            "success": True,
            "message": "تم حذف النظام الغذائي بنجاح"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============ Coach Subscription APIs ============

@api_view(['POST'])
def create_subscription(request):
    """إضافة مشترك للكوتش"""
    try:
        db = settings.MONGO_DB
        subscriptions = db["coach_subscriptions"]

        coach_id = ObjectId(request.data.get('coach_id'))
        subscriber_id = ObjectId(request.data.get('subscriber_id'))
        diet_plan_id = request.data.get('diet_plan_id')
        diet_plan_id = ObjectId(diet_plan_id) if diet_plan_id else None

        subscription = {
            "coach_id": coach_id,
            "subscriber_id": subscriber_id,
            "diet_plan_id": diet_plan_id,
            "status": "active",
            "start_date": datetime.utcnow(),
            "end_date": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        result = subscriptions.insert_one(subscription)

        # تحديث coach_id للمشترك
        users = db["users"]
        users.update_one(
            {"_id": subscriber_id},
            {"$set": {"coach_id": coach_id}}
        )

        return Response({
            "success": True,
            "message": "تم إضافة المشترك بنجاح",
            "subscription_id": str(result.inserted_id)
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_subscriptions(request):
    """جلب الاشتراكات"""
    try:
        db = settings.MONGO_DB
        subscriptions = db["coach_subscriptions"]

        coach_id = request.GET.get('coach_id')
        subscriber_id = request.GET.get('subscriber_id')

        filter_query = {}
        if coach_id:
            filter_query['coach_id'] = ObjectId(coach_id)
        if subscriber_id:
            filter_query['subscriber_id'] = ObjectId(subscriber_id)

        subs = list(subscriptions.find(filter_query))

        for sub in subs:
            sub['_id'] = str(sub['_id'])
            sub['coach_id'] = str(sub['coach_id'])
            sub['subscriber_id'] = str(sub['subscriber_id'])
            if sub['diet_plan_id']:
                sub['diet_plan_id'] = str(sub['diet_plan_id'])
            
            # Fetch subscriber user details
            users_col = db["users"]
            subscriber = users_col.find_one({"_id": ObjectId(sub["subscriber_id"])})
            if subscriber:
                sub['subscriber_name'] = subscriber.get('name', 'Unknown')
                sub['subscriber_age'] = subscriber.get('age', 25)
            else:
                sub['subscriber_name'] = 'Unknown'
                sub['subscriber_age'] = 25

            # Fetch coach user details
            coach_user = users_col.find_one({"_id": ObjectId(sub["coach_id"])})
            if coach_user:
                sub['coach_name'] = coach_user.get('name', 'Unknown')
            else:
                sub['coach_name'] = 'Unknown'

        return Response({
            "success": True,
            "subscriptions": subs,
            "count": len(subs)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_subscription(request, subscription_id):
    """تحديث الاشتراك"""
    try:
        db = settings.MONGO_DB
        subscriptions = db["coach_subscriptions"]

        subscription = subscriptions.find_one({"_id": ObjectId(subscription_id)})
        if not subscription:
            return Response({"error": "الاشتراك غير موجود"}, status=status.HTTP_404_NOT_FOUND)

        update_data = {
            "updated_at": datetime.utcnow()
        }

        if 'diet_plan_id' in request.data:
            diet_plan_id = request.data.get('diet_plan_id')
            update_data['diet_plan_id'] = ObjectId(diet_plan_id) if diet_plan_id else None

        if 'status' in request.data:
            update_data['status'] = request.data.get('status')

        subscriptions.update_one(
            {"_id": ObjectId(subscription_id)},
            {"$set": update_data}
        )

        return Response({
            "success": True,
            "message": "تم تحديث الاشتراك بنجاح"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_subscriber_meal_history(request, subscriber_id):
    """جلب هستوري الأكل للمشترك (للكوتش)"""
    try:
        db = settings.MONGO_DB
        meal_logs = db["meal_logs"]

        sub_id = ObjectId(subscriber_id)
        period = request.GET.get('period', 'daily')
        date_str = request.GET.get('date', datetime.now().strftime("%Y-%m-%d"))

        target_date = datetime.strptime(date_str, "%Y-%m-%d")

        # تحديد نطاق التاريخ
        if period == 'daily':
            start_date = target_date
            end_date = target_date + timedelta(days=1)
        elif period == 'weekly':
            start_date = target_date - timedelta(days=target_date.weekday())
            end_date = start_date + timedelta(days=7)
        elif period == 'monthly':
            start_date = target_date.replace(day=1)
            last_day = monthrange(target_date.year, target_date.month)[1]
            end_date = target_date.replace(day=last_day) + timedelta(days=1)
        else:
            return Response({"error": "فترة غير صحيحة"}, status=status.HTTP_400_BAD_REQUEST)

        meals = list(meal_logs.find({
            "user_id": sub_id,
            "date": {"$gte": start_date, "$lt": end_date}
        }).sort("date", -1))

        # تجميع حسب نوع الوجبة
        by_meal_type = {
            "breakfast": {"meals": [], "total_calories": 0},
            "lunch": {"meals": [], "total_calories": 0},
            "dinner": {"meals": [], "total_calories": 0},
            "snack": {"meals": [], "total_calories": 0}
        }

        for meal in meals:
            meal_data = {
                "_id": str(meal['_id']),
                "user_id": str(meal.get('user_id', '')),
                "food_id": str(meal.get('food_id', '')),
                "food_name": meal.get('food_name', ''),
                "food_name_ar": meal.get('food_name_ar', ''),
                "food_image_url": meal.get('food_image_url', '/static/food_images/default.jpg'),
                "meal_type": meal.get('meal_type', ''),
                "quantity": meal.get('quantity', 1.0),
                "serving_unit": meal.get('serving_unit', 'gram'),
                "calories_consumed": meal.get('calories_consumed', 0.0),
                "protein_consumed": meal.get('protein_consumed', 0.0),
                "carbs_consumed": meal.get('carbs_consumed', 0.0),
                "fat_consumed": meal.get('fat_consumed', 0.0),
                "date": meal.get('date').isoformat() if hasattr(meal.get('date'), 'isoformat') else str(meal.get('date')),
                "logged_at": meal.get('logged_at').isoformat() if hasattr(meal.get('logged_at'), 'isoformat') else str(meal.get('logged_at')),
                "created_at": meal.get('created_at').isoformat() if hasattr(meal.get('created_at'), 'isoformat') else str(meal.get('created_at')),
            }
            meal_type = meal_data['meal_type']
            if meal_type in by_meal_type:
                by_meal_type[meal_type]['meals'].append(meal_data)
                by_meal_type[meal_type]['total_calories'] += meal_data['calories_consumed']

        return Response({
            "success": True,
            "period": period,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "meals_by_type": by_meal_type,
            "total_meals": len(meals)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def delete_subscription(request, subscriber_id):
    """إلغاء الاشتراك للكوتش"""
    try:
        db = settings.MONGO_DB
        subscriptions = db["coach_subscriptions"]
        users = db["users"]

        sub_id = ObjectId(subscriber_id)

        # Delete from coach_subscriptions
        subscriptions.delete_many({"subscriber_id": sub_id})

        # Unset coach_id in users collection
        users.update_one(
            {"_id": sub_id},
            {"$unset": {"coach_id": ""}}
        )

        return Response({
            "success": True,
            "message": "تم إلغاء الاشتراك بنجاح"
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

