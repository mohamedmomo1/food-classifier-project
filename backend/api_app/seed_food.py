from django.http import JsonResponse
from django.conf import settings

def seed_food_database(request):
    db = settings.MONGO_DB
    food_collection = db["food_database"]

    # تصفير الكولكشن القديمة تماماً
    food_collection.delete_many({})

    food_items = [
        # --- أصناف موديل YOLO (حسابات دقيقة للوحدة البدائية الواحدة: إما 1 جرام أو 1 قطعة) ---
        {"food_id": 0, "name": "Meat", "calories": 2.5, "protein": 0.26, "carbs": 0.0, "fat": 0.15, "serving_unit": "gram", "image_url": ""},
        {"food_id": 1, "name": "Rice", "calories": 1.3, "protein": 0.027, "carbs": 0.28, "fat": 0.003, "serving_unit": "gram", "image_url": ""},
        {"food_id": 2, "name": "Salad", "calories": 0.15, "protein": 0.008, "carbs": 0.036, "fat": 0.002, "serving_unit": "gram", "image_url": ""},
        {"food_id": 3, "name": "Burger", "calories": 600.0, "protein": 28.0, "carbs": 40.0, "fat": 24.0, "serving_unit": "sandwich", "image_url": ""},
        {"food_id": 4, "name": "Pizza", "calories": 285.0, "protein": 12.0, "carbs": 36.0, "fat": 10.0, "serving_unit": "slice", "image_url": ""},
        {"food_id": 5, "name": "Ketchup", "calories": 15.0, "protein": 0.1, "carbs": 3.5, "fat": 0.0, "serving_unit": "tablespoon", "image_url": ""},
        {"food_id": 6, "name": "Fries", "calories": 3.12, "protein": 0.034, "carbs": 0.41, "fat": 0.15, "serving_unit": "gram", "image_url": ""},
        {"food_id": 7, "name": "Cola", "calories": 140.0, "protein": 0.0, "carbs": 39.0, "fat": 0.0, "serving_unit": "can", "image_url": ""},
        {"food_id": 8, "name": "Banana", "calories": 105.0, "protein": 1.3, "carbs": 27.0, "fat": 0.4, "serving_unit": "piece", "image_url": ""},
        {"food_id": 9, "name": "Chicken", "calories": 1.65, "protein": 0.31, "carbs": 0.0, "fat": 0.036, "serving_unit": "gram", "image_url": ""},
        {"food_id": 10, "name": "Cucumber", "calories": 0.15, "protein": 0.007, "carbs": 0.036, "fat": 0.001, "serving_unit": "gram", "image_url": ""},
        {"food_id": 11, "name": "Falafel", "calories": 60.0, "protein": 2.5, "carbs": 6.0, "fat": 3.0, "serving_unit": "piece", "image_url": ""},
        {"food_id": 12, "name": "Konafa", "calories": 3.6, "protein": 0.05, "carbs": 0.52, "fat": 0.15, "serving_unit": "gram", "image_url": ""},
        {"food_id": 13, "name": "Orange", "calories": 62.0, "protein": 1.2, "carbs": 15.0, "fat": 0.2, "serving_unit": "piece", "image_url": ""},
        {"food_id": 14, "name": "Tomato", "calories": 0.18, "protein": 0.009, "carbs": 0.039, "fat": 0.002, "serving_unit": "gram", "image_url": ""},
        {"food_id": 15, "name": "Mulukhiyah", "calories": 15.0, "protein": 0.8, "carbs": 1.5, "fat": 0.6, "serving_unit": "tablespoon", "image_url": ""},

        # --- أصناف البحث اليدوي (موزونة بالكامل حسب طريقة القياس الفردية) ---
        {"food_id": 16, "name": "Koshary", "calories": 1.6, "protein": 0.06, "carbs": 0.30, "fat": 0.022, "serving_unit": "gram", "image_url": ""},
        {"food_id": 17, "name": "Ful Mudammas", "calories": 25.0, "protein": 1.8, "carbs": 4.5, "fat": 0.1, "serving_unit": "tablespoon", "image_url": ""},
        {"food_id": 18, "name": "Mahshi", "calories": 55.0, "protein": 1.1, "carbs": 9.0, "fat": 2.0, "serving_unit": "piece", "image_url": ""},
        {"food_id": 19, "name": "Shawarma Meat", "calories": 2.3, "protein": 0.22, "carbs": 0.04, "fat": 0.14, "serving_unit": "gram", "image_url": ""},
        {"food_id": 20, "name": "Shawarma Chicken", "calories": 1.9, "protein": 0.24, "carbs": 0.025, "fat": 0.09, "serving_unit": "gram", "image_url": ""},
        {"food_id": 21, "name": "Hawawshi", "calories": 560.0, "protein": 28.0, "carbs": 50.0, "fat": 28.0, "serving_unit": "loaf", "image_url": ""},
        {"food_id": 22, "name": "Macaroni Bechamel", "calories": 2.1, "protein": 0.10, "carbs": 0.22, "fat": 0.095, "serving_unit": "gram", "image_url": ""},
        {"food_id": 23, "name": "Fatteh", "calories": 1.8, "protein": 0.09, "carbs": 0.20, "fat": 0.07, "serving_unit": "gram", "image_url": ""},
        {"food_id": 24, "name": "Lentil Soup", "calories": 180.0, "protein": 11.0, "carbs": 30.0, "fat": 2.0, "serving_unit": "cup", "image_url": ""},
        {"food_id": 25, "name": "Grilled Fish", "calories": 1.2, "protein": 0.22, "carbs": 0.0, "fat": 0.035, "serving_unit": "gram", "image_url": ""},
        {"food_id": 26, "name": "Fried Fish", "calories": 2.2, "protein": 0.19, "carbs": 0.08, "fat": 0.12, "serving_unit": "gram", "image_url": ""},
        {"food_id": 27, "name": "Tuna Canned", "calories": 1.16, "protein": 0.26, "carbs": 0.0, "fat": 0.01, "serving_unit": "gram", "image_url": ""},
        {"food_id": 28, "name": "Boiled Eggs", "calories": 78.0, "protein": 6.5, "carbs": 0.6, "fat": 5.5, "serving_unit": "piece", "image_url": ""},
        {"food_id": 29, "name": "Fried Eggs", "calories": 98.0, "protein": 6.5, "carbs": 0.5, "fat": 7.5, "serving_unit": "piece", "image_url": ""},
        {"food_id": 30, "name": "Pane Chicken", "calories": 210.0, "protein": 19.0, "carbs": 10.0, "fat": 10.0, "serving_unit": "piece", "image_url": ""},
        {"food_id": 31, "name": "Salmon", "calories": 2.08, "protein": 0.22, "carbs": 0.0, "fat": 0.13, "serving_unit": "gram", "image_url": ""},
        {"food_id": 32, "name": "Cottage Cheese", "calories": 25.0, "protein": 2.8, "carbs": 0.9, "fat": 1.1, "serving_unit": "tablespoon", "image_url": ""},
        {"food_id": 33, "name": "Feta Cheese", "calories": 66.0, "protein": 3.5, "carbs": 1.0, "fat": 5.2, "serving_unit": "tablespoon", "image_url": ""},
        {"food_id": 34, "name": "Yogurt", "calories": 105.0, "protein": 6.0, "carbs": 8.0, "fat": 5.5, "serving_unit": "cup", "image_url": ""},
        {"food_id": 35, "name": "Oats", "calories": 3.89, "protein": 0.169, "carbs": 0.66, "fat": 0.069, "serving_unit": "gram", "image_url": ""},
        {"food_id": 36, "name": "Pasta Boiled", "calories": 1.31, "protein": 0.05, "carbs": 0.25, "fat": 0.011, "serving_unit": "gram", "image_url": ""},
        {"food_id": 37, "name": "White Bread", "calories": 240.0, "protein": 8.0, "carbs": 44.0, "fat": 2.8, "serving_unit": "loaf", "image_url": ""},
        {"food_id": 38, "name": "Baladi Bread", "calories": 252.0, "protein": 8.5, "carbs": 53.0, "fat": 1.2, "serving_unit": "loaf", "image_url": ""},
        {"food_id": 39, "name": "Toast Bread", "calories": 80.0, "protein": 2.5, "carbs": 15.0, "fat": 1.2, "serving_unit": "slice", "image_url": ""},
        {"food_id": 40, "name": "Potato Boiled", "calories": 0.87, "protein": 0.019, "carbs": 0.20, "fat": 0.001, "serving_unit": "gram", "image_url": ""},
        {"food_id": 41, "name": "Sweet Potato", "calories": 0.86, "protein": 0.016, "carbs": 0.20, "fat": 0.001, "serving_unit": "gram", "image_url": ""},
        {"food_id": 42, "name": "Indomie", "calories": 350.0, "protein": 7.0, "carbs": 50.0, "fat": 13.0, "serving_unit": "pack", "image_url": ""},
        {"food_id": 43, "name": "Popcorn", "calories": 31.0, "protein": 1.0, "carbs": 6.2, "fat": 0.4, "serving_unit": "cup", "image_url": ""},
        {"food_id": 44, "name": "Rice Pudding", "calories": 180.0, "protein": 4.5, "carbs": 33.0, "fat": 3.3, "serving_unit": "cup", "image_url": ""},
        {"food_id": 45, "name": "Apple", "calories": 95.0, "protein": 0.5, "carbs": 25.0, "fat": 0.3, "serving_unit": "piece", "image_url": ""},
        {"food_id": 46, "name": "Strawberry", "calories": 0.32, "protein": 0.007, "carbs": 0.077, "fat": 0.003, "serving_unit": "gram", "image_url": ""},
        {"food_id": 47, "name": "Mango", "calories": 150.0, "protein": 2.0, "carbs": 37.5, "fat": 1.0, "serving_unit": "piece", "image_url": ""},
        {"food_id": 48, "name": "Watermelon", "calories": 0.30, "protein": 0.006, "carbs": 0.076, "fat": 0.002, "serving_unit": "gram", "image_url": ""},
        {"food_id": 49, "name": "Dates", "calories": 23.0, "protein": 0.2, "carbs": 6.0, "fat": 0.0, "serving_unit": "piece", "image_url": ""},
        {"food_id": 50, "name": "Grapes", "calories": 0.69, "protein": 0.007, "carbs": 0.18, "fat": 0.002, "serving_unit": "gram", "image_url": ""},
        {"food_id": 51, "name": "Peach", "calories": 59.0, "protein": 1.4, "carbs": 15.0, "fat": 0.4, "serving_unit": "piece", "image_url": ""},
        {"food_id": 52, "name": "Guava", "calories": 38.0, "protein": 1.4, "carbs": 8.0, "fat": 0.5, "serving_unit": "piece", "image_url": ""},
        {"food_id": 53, "name": "Potato Chips", "content": 150.0, "calories": 150.0, "protein": 2.0, "carbs": 15.0, "fat": 10.0, "serving_unit": "pack", "image_url": ""},
        {"food_id": 54, "name": "Onion", "calories": 0.40, "protein": 0.011, "carbs": 0.093, "fat": 0.001, "serving_unit": "gram", "image_url": ""},
        {"food_id": 55, "name": "Garlic", "calories": 4.0, "protein": 0.2, "carbs": 1.0, "fat": 0.0, "serving_unit": "clove", "image_url": ""},
        {"food_id": 56, "name": "Spinach", "calories": 0.23, "protein": 0.029, "carbs": 0.036, "fat": 0.004, "serving_unit": "gram", "image_url": ""},
        {"food_id": 57, "name": "Carrot", "calories": 0.41, "protein": 0.009, "carbs": 0.10, "fat": 0.002, "serving_unit": "gram", "image_url": ""},
        {"food_id": 58, "name": "Broccoli", "calories": 0.34, "protein": 0.028, "carbs": 0.07, "fat": 0.004, "serving_unit": "gram", "image_url": ""},
        {"food_id": 59, "name": "Pea", "calories": 0.81, "protein": 0.054, "carbs": 0.14, "fat": 0.004, "serving_unit": "gram", "image_url": ""},
        {"food_id": 60, "name": "Milk Full Cream", "calories": 150.0, "protein": 8.0, "carbs": 12.0, "fat": 8.0, "serving_unit": "glass", "image_url": ""},
        {"food_id": 61, "name": "Avocado Juice", "calories": 240.0, "protein": 3.0, "carbs": 13.0, "fat": 22.0, "serving_unit": "cup", "image_url": ""},
        {"food_id": 62, "name": "Mango Juice", "calories": 120.0, "protein": 0.8, "carbs": 30.0, "fat": 0.2, "serving_unit": "cup", "image_url": ""},
        {"food_id": 63, "name": "Basbousa", "calories": 3.8, "protein": 0.05, "carbs": 0.55, "fat": 0.16, "serving_unit": "gram", "image_url": ""},
        {"food_id": 64, "name": "Dark Chocolate", "calories": 6.0, "protein": 0.08, "carbs": 0.46, "fat": 0.43, "serving_unit": "gram", "image_url": ""},
        {"food_id": 65, "name": "Omelette", "calories": 140.0, "protein": 10.0, "carbs": 0.6, "fat": 11.0, "serving_unit": "piece", "image_url": ""},
        {"food_id": 66, "name": "Tea with Sugar", "calories": 120.0, "protein": 0.0, "carbs": 30.0, "fat": 0.0, "serving_unit": "cup", "image_url": ""}
    ]

    food_collection.insert_many(food_items)
    return JsonResponse({"success": True, "message": f"Successfully seeded {len(food_items)} absolute unit items!"})