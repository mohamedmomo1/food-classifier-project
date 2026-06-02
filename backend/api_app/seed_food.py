from django.http import JsonResponse
from django.conf import settings

def seed_food_database(request):
    db = settings.MONGO_DB
    food_collection = db["food_database"]

    # تصفير الكولكشن القديمة تماماً
    food_collection.delete_many({})

    food_items = [
        # --- Breakfast items (فطار) ---
        {"food_id": 0, "name": "Meat", "name_ar": "لحم", "calories": 2.5, "protein": 0.26, "carbs": 0.0, "fat": 0.15, "serving_unit": "gram", "meal_type": "breakfast", "image_url": "/static/food_images/meat.jpg"},
        {"food_id": 1, "name": "Rice", "name_ar": "أرز", "calories": 1.3, "protein": 0.027, "carbs": 0.28, "fat": 0.003, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/rice.jpg"},
        {"food_id": 28, "name": "Boiled Eggs", "name_ar": "بيض مسلوق", "calories": 78.0, "protein": 6.5, "carbs": 0.6, "fat": 5.5, "serving_unit": "piece", "meal_type": "breakfast", "image_url": "/static/food_images/boiled_eggs.jpg"},
        {"food_id": 29, "name": "Fried Eggs", "name_ar": "بيض مقلي", "calories": 98.0, "protein": 6.5, "carbs": 0.5, "fat": 7.5, "serving_unit": "piece", "meal_type": "breakfast", "image_url": "/static/food_images/fried_eggs.jpg"},
        {"food_id": 65, "name": "Omelette", "name_ar": "عجة", "calories": 140.0, "protein": 10.0, "carbs": 0.6, "fat": 11.0, "serving_unit": "piece", "meal_type": "breakfast", "image_url": "/static/food_images/omelette.jpg"},
        {"food_id": 37, "name": "White Bread", "name_ar": "خبز أبيض", "calories": 240.0, "protein": 8.0, "carbs": 44.0, "fat": 2.8, "serving_unit": "loaf", "meal_type": "breakfast", "image_url": "/static/food_images/white_bread.jpg"},
        {"food_id": 38, "name": "Baladi Bread", "name_ar": "خبز بلدي", "calories": 252.0, "protein": 8.5, "carbs": 53.0, "fat": 1.2, "serving_unit": "loaf", "meal_type": "breakfast", "image_url": "/static/food_images/baladi_bread.jpg"},
        {"food_id": 39, "name": "Toast Bread", "name_ar": "خبز التوست", "calories": 80.0, "protein": 2.5, "carbs": 15.0, "fat": 1.2, "serving_unit": "slice", "meal_type": "breakfast", "image_url": "/static/food_images/toast_bread.jpg"},
        {"food_id": 35, "name": "Oats", "name_ar": "الشوفان", "calories": 3.89, "protein": 0.169, "carbs": 0.66, "fat": 0.069, "serving_unit": "gram", "meal_type": "breakfast", "image_url": "/static/food_images/oats.jpg"},
        {"food_id": 60, "name": "Milk Full Cream", "name_ar": "حليب كامل الدسم", "calories": 150.0, "protein": 8.0, "carbs": 12.0, "fat": 8.0, "serving_unit": "glass", "meal_type": "breakfast", "image_url": "/static/food_images/milk_full_cream.jpg"},
        {"food_id": 66, "name": "Tea with Sugar", "name_ar": "شاي بالسكر", "calories": 120.0, "protein": 0.0, "carbs": 30.0, "fat": 0.0, "serving_unit": "cup", "meal_type": "breakfast", "image_url": "/static/food_images/tea_with_sugar.jpg"},
        {"food_id": 32, "name": "Cottage Cheese", "name_ar": "جبنة", "calories": 25.0, "protein": 2.8, "carbs": 0.9, "fat": 1.1, "serving_unit": "tablespoon", "meal_type": "breakfast", "image_url": "/static/food_images/cottage_cheese.jpg"},

        # --- Lunch items (غداء) ---
        {"food_id": 3, "name": "Burger", "name_ar": "برجر", "calories": 600.0, "protein": 28.0, "carbs": 40.0, "fat": 24.0, "serving_unit": "sandwich", "meal_type": "lunch", "image_url": "/static/food_images/burger.jpg"},
        {"food_id": 2, "name": "Salad", "name_ar": "سلطة خضراء", "calories": 0.15, "protein": 0.008, "carbs": 0.036, "fat": 0.002, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/salad.jpg"},
        {"food_id": 9, "name": "Chicken", "name_ar": "دجاج", "calories": 1.65, "protein": 0.31, "carbs": 0.0, "fat": 0.036, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/chicken.jpg"},
        {"food_id": 30, "name": "Pane Chicken", "name_ar": "دجاج بانيه", "calories": 210.0, "protein": 19.0, "carbs": 10.0, "fat": 10.0, "serving_unit": "piece", "meal_type": "lunch", "image_url": "/static/food_images/pane_chicken.jpg"},
        {"food_id": 24, "name": "Lentil Soup", "name_ar": "حساء العدس", "calories": 180.0, "protein": 11.0, "carbs": 30.0, "fat": 2.0, "serving_unit": "cup", "meal_type": "lunch", "image_url": "/static/food_images/lentil_soup.jpg"},
        {"food_id": 25, "name": "Grilled Fish", "name_ar": "سمك مشوي", "calories": 1.2, "protein": 0.22, "carbs": 0.0, "fat": 0.035, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/grilled_fish.jpg"},
        {"food_id": 26, "name": "Fried Fish", "name_ar": "سمك مقلي", "calories": 2.2, "protein": 0.19, "carbs": 0.08, "fat": 0.12, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/fried_fish.jpg"},
        {"food_id": 31, "name": "Salmon", "name_ar": "سلمون", "calories": 2.08, "protein": 0.22, "carbs": 0.0, "fat": 0.13, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/salmon.jpg"},
        {"food_id": 16, "name": "Koshary", "name_ar": "كشري", "calories": 1.6, "protein": 0.06, "carbs": 0.30, "fat": 0.022, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/koshary.jpg"},
        {"food_id": 17, "name": "Ful Mudammas", "name_ar": "فول مدمس", "calories": 25.0, "protein": 1.8, "carbs": 4.5, "fat": 0.1, "serving_unit": "tablespoon", "meal_type": "lunch", "image_url": "/static/food_images/ful_mudammas.jpg"},
        {"food_id": 18, "name": "Mahshi", "name_ar": "محشي", "calories": 55.0, "protein": 1.1, "carbs": 9.0, "fat": 2.0, "serving_unit": "piece", "meal_type": "lunch", "image_url": "/static/food_images/mahshi.jpg"},
        {"food_id": 19, "name": "Shawarma Meat", "name_ar": "شاورما لحم", "calories": 2.3, "protein": 0.22, "carbs": 0.04, "fat": 0.14, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/shawarma_meat.jpg"},
        {"food_id": 20, "name": "Shawarma Chicken", "name_ar": "شاورما دجاج", "calories": 1.9, "protein": 0.24, "carbs": 0.025, "fat": 0.09, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/shawarma_chicken.jpg"},
        {"food_id": 22, "name": "Macaroni Bechamel", "name_ar": "مكرونة بشاميل", "calories": 2.1, "protein": 0.10, "carbs": 0.22, "fat": 0.095, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/macaroni_bechamel.jpg"},
        {"food_id": 23, "name": "Fatteh", "name_ar": "فتة", "calories": 1.8, "protein": 0.09, "carbs": 0.20, "fat": 0.07, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/fatteh.jpg"},

        # --- Dinner items (عشاء) ---
        {"food_id": 4, "name": "Pizza", "name_ar": "بيتزا", "calories": 285.0, "protein": 12.0, "carbs": 36.0, "fat": 10.0, "serving_unit": "slice", "meal_type": "dinner", "image_url": "/static/food_images/pizza.jpg"},
        {"food_id": 21, "name": "Hawawshi", "name_ar": "حاووشي", "calories": 560.0, "protein": 28.0, "carbs": 50.0, "fat": 28.0, "serving_unit": "loaf", "meal_type": "dinner", "image_url": "/static/food_images/hawawshi.jpg"},
        {"food_id": 27, "name": "Tuna Canned", "name_ar": "تونة معلبة", "calories": 1.16, "protein": 0.26, "carbs": 0.0, "fat": 0.01, "serving_unit": "gram", "meal_type": "dinner", "image_url": "/static/food_images/tuna_canned.jpg"},
        {"food_id": 36, "name": "Pasta Boiled", "name_ar": "معكرونة مسلوقة", "calories": 1.31, "protein": 0.05, "carbs": 0.25, "fat": 0.011, "serving_unit": "gram", "meal_type": "dinner", "image_url": "/static/food_images/pasta_boiled.jpg"},
        {"food_id": 34, "name": "Yogurt", "name_ar": "زبادي", "calories": 105.0, "protein": 6.0, "carbs": 8.0, "fat": 5.5, "serving_unit": "cup", "meal_type": "dinner", "image_url": "/static/food_images/yogurt.jpg"},

        # --- Snacks (سناك) ---
        {"food_id": 6, "name": "Fries", "name_ar": "بطاطس مقلية", "calories": 3.12, "protein": 0.034, "carbs": 0.41, "fat": 0.15, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/fries.jpg"},
        {"food_id": 7, "name": "Cola", "name_ar": "كولا", "calories": 140.0, "protein": 0.0, "carbs": 39.0, "fat": 0.0, "serving_unit": "can", "meal_type": "snack", "image_url": "/static/food_images/cola.jpg"},
        {"food_id": 8, "name": "Banana", "name_ar": "موز", "calories": 105.0, "protein": 1.3, "carbs": 27.0, "fat": 0.4, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/banana.jpg"},
        {"food_id": 11, "name": "Falafel", "name_ar": "فلافل", "calories": 60.0, "protein": 2.5, "carbs": 6.0, "fat": 3.0, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/falafel.jpg"},
        {"food_id": 12, "name": "Konafa", "name_ar": "كنافة", "calories": 3.6, "protein": 0.05, "carbs": 0.52, "fat": 0.15, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/konafa.jpg"},
        {"food_id": 13, "name": "Orange", "name_ar": "برتقال", "calories": 62.0, "protein": 1.2, "carbs": 15.0, "fat": 0.2, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/orange.jpg"},
        {"food_id": 45, "name": "Apple", "name_ar": "تفاح", "calories": 95.0, "protein": 0.5, "carbs": 25.0, "fat": 0.3, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/apple.jpg"},
        {"food_id": 46, "name": "Strawberry", "name_ar": "فراولة", "calories": 0.32, "protein": 0.007, "carbs": 0.077, "fat": 0.003, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/strawberry.jpg"},
        {"food_id": 47, "name": "Mango", "name_ar": "مانجو", "calories": 150.0, "protein": 2.0, "carbs": 37.5, "fat": 1.0, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/mango.jpg"},
        {"food_id": 49, "name": "Dates", "name_ar": "تمر", "calories": 23.0, "protein": 0.2, "carbs": 6.0, "fat": 0.0, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/dates.jpg"},
        {"food_id": 51, "name": "Peach", "name_ar": "دراق", "calories": 59.0, "protein": 1.4, "carbs": 15.0, "fat": 0.4, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/peach.jpg"},
        {"food_id": 52, "name": "Guava", "name_ar": "جوافة", "calories": 38.0, "protein": 1.4, "carbs": 8.0, "fat": 0.5, "serving_unit": "piece", "meal_type": "snack", "image_url": "/static/food_images/guava.jpg"},
        {"food_id": 53, "name": "Potato Chips", "name_ar": "شيبس", "calories": 150.0, "protein": 2.0, "carbs": 15.0, "fat": 10.0, "serving_unit": "pack", "meal_type": "snack", "image_url": "/static/food_images/potato_chips.jpg"},
        {"food_id": 5, "name": "Ketchup", "name_ar": "كاتشب", "calories": 15.0, "protein": 0.1, "carbs": 3.5, "fat": 0.0, "serving_unit": "tablespoon", "meal_type": "snack", "image_url": "/static/food_images/ketchup.jpg"},
        {"food_id": 63, "name": "Basbousa", "name_ar": "بسبوسة", "calories": 3.8, "protein": 0.05, "carbs": 0.55, "fat": 0.16, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/basbousa.jpg"},
        {"food_id": 64, "name": "Dark Chocolate", "name_ar": "شوكولاتة سوداء", "calories": 6.0, "protein": 0.08, "carbs": 0.46, "fat": 0.43, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/dark_chocolate.jpg"},
        {"food_id": 61, "name": "Avocado Juice", "name_ar": "عصير أفوكادو", "calories": 240.0, "protein": 3.0, "carbs": 13.0, "fat": 22.0, "serving_unit": "cup", "meal_type": "snack", "image_url": "/static/food_images/avocado_juice.jpg"},
        {"food_id": 62, "name": "Mango Juice", "name_ar": "عصير مانجو", "calories": 120.0, "protein": 0.8, "carbs": 30.0, "fat": 0.2, "serving_unit": "cup", "meal_type": "snack", "image_url": "/static/food_images/mango_juice.jpg"},

        # --- Others (للبحث) ---
        {"food_id": 10, "name": "Cucumber", "name_ar": "خيار", "calories": 0.15, "protein": 0.007, "carbs": 0.036, "fat": 0.001, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/cucumber.jpg"},
        {"food_id": 14, "name": "Tomato", "name_ar": "طماطم", "calories": 0.18, "protein": 0.009, "carbs": 0.039, "fat": 0.002, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/tomato.jpg"},
        {"food_id": 15, "name": "Mulukhiyah", "name_ar": "ملوخية", "calories": 15.0, "protein": 0.8, "carbs": 1.5, "fat": 0.6, "serving_unit": "tablespoon", "meal_type": "lunch", "image_url": "/static/food_images/mulukhiyah.jpg"},
        {"food_id": 40, "name": "Potato Boiled", "name_ar": "بطاطس مسلوقة", "calories": 0.87, "protein": 0.019, "carbs": 0.20, "fat": 0.001, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/potato_boiled.jpg"},
        {"food_id": 41, "name": "Sweet Potato", "name_ar": "بطاطا حلوة", "calories": 0.86, "protein": 0.016, "carbs": 0.20, "fat": 0.001, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/sweet_potato.jpg"},
        {"food_id": 42, "name": "Indomie", "name_ar": "إندومي", "calories": 350.0, "protein": 7.0, "carbs": 50.0, "fat": 13.0, "serving_unit": "pack", "meal_type": "lunch", "image_url": "/static/food_images/indomie.jpg"},
        {"food_id": 43, "name": "Popcorn", "name_ar": "فشار", "calories": 31.0, "protein": 1.0, "carbs": 6.2, "fat": 0.4, "serving_unit": "cup", "meal_type": "snack", "image_url": "/static/food_images/popcorn.jpg"},
        {"food_id": 44, "name": "Rice Pudding", "name_ar": "أرز باللبن", "calories": 180.0, "protein": 4.5, "carbs": 33.0, "fat": 3.3, "serving_unit": "cup", "meal_type": "snack", "image_url": "/static/food_images/rice_pudding.jpg"},
        {"food_id": 33, "name": "Feta Cheese", "name_ar": "جبن فيتا", "calories": 66.0, "protein": 3.5, "carbs": 1.0, "fat": 5.2, "serving_unit": "tablespoon", "meal_type": "breakfast", "image_url": "/static/food_images/feta_cheese.jpg"},
        {"food_id": 48, "name": "Watermelon", "name_ar": "بطيخ", "calories": 0.30, "protein": 0.006, "carbs": 0.076, "fat": 0.002, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/watermelon.jpg"},
        {"food_id": 50, "name": "Grapes", "name_ar": "عنب", "calories": 0.69, "protein": 0.007, "carbs": 0.18, "fat": 0.002, "serving_unit": "gram", "meal_type": "snack", "image_url": "/static/food_images/grapes.jpg"},
        {"food_id": 54, "name": "Onion", "name_ar": "بصل", "calories": 0.40, "protein": 0.011, "carbs": 0.093, "fat": 0.001, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/onion.jpg"},
        {"food_id": 55, "name": "Garlic", "name_ar": "ثوم", "calories": 4.0, "protein": 0.2, "carbs": 1.0, "fat": 0.0, "serving_unit": "clove", "meal_type": "lunch", "image_url": "/static/food_images/garlic.jpg"},
        {"food_id": 56, "name": "Spinach", "name_ar": "سبانخ", "calories": 0.23, "protein": 0.029, "carbs": 0.036, "fat": 0.004, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/spinach.jpg"},
        {"food_id": 57, "name": "Carrot", "name_ar": "جزر", "calories": 0.41, "protein": 0.009, "carbs": 0.10, "fat": 0.002, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/carrot.jpg"},
        {"food_id": 58, "name": "Broccoli", "name_ar": "برقيق", "calories": 0.34, "protein": 0.028, "carbs": 0.07, "fat": 0.004, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/broccoli.jpg"},
        {"food_id": 59, "name": "Pea", "name_ar": "بازلاء", "calories": 0.81, "protein": 0.054, "carbs": 0.14, "fat": 0.004, "serving_unit": "gram", "meal_type": "lunch", "image_url": "/static/food_images/pea.jpg"},
    ]

    food_collection.insert_many(food_items)
    return JsonResponse({"success": True, "message": f"Successfully seeded {len(food_items)} food items with meal_type and name_ar!"})
