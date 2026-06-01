import os
import bcrypt
from datetime import datetime
from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ultralytics import YOLO
from PIL import Image

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = r"C:\final_gp_pro\ai_model\weights\best_fixed_konafa.pt"

try:
    model = YOLO(MODEL_PATH)
    print("=======> YOLO Model Loaded Successfully! <=======")
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

@api_view(['POST'])
def predict_food(request):
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
                
                name_ar = ARABIC_NAMES_MAPPING.get(raw_name.lower(), raw_name)
                unit_ar = ARABIC_UNITS_MAPPING.get(raw_unit.lower(), raw_unit)
                
                predictions_response.append({
                    'name_ar': name_ar,
                    'name_en': raw_name,
                    'unit_ar': unit_ar,
                    'unit_en': raw_unit,
                    'calories': food_data.get('calories', 150)
                })
            else:
                fallback_key = food_key.lower().strip()
                predictions_response.append({
                    'name_ar': ARABIC_NAMES_MAPPING.get(fallback_key, food_key),
                    'name_en': food_key.capitalize(),
                    'unit_ar': 'جرام',
                    'unit_en': 'gram',
                    'calories': 100
                })
        
        return Response({
            'success': True,
            'predictions': predictions_response
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def register_user(request):
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
        "targets": targets,
        "created_at": datetime.utcnow()
    }

    result = users_collection.insert_one(user_document)
    
    return Response({
        "success": True,
        "message": "تم إنشاء الحساب وحساب السعرات بنجاح!",
        "user_id": str(result.inserted_id),
        "targets": targets
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login_user(request):
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
                "calories_target": user['targets']['daily_calories']
            }
        }, status=status.HTTP_200_OK)
    
    return Response({"error": "البريد الإلكتروني أو كلمة المرور غير صحيحة!"}, status=status.HTTP_401_UNAUTHORIZED)