import os
import sys
import bcrypt
from datetime import datetime, timedelta, time
from bson.objectid import ObjectId

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "food_project.settings")

import django
django.setup()

from django.conf import settings
from api_app.seed_food import seed_food_database

def run_seeding():
    print("=======> Starting Presentation Database Reset & Seeding <=======")
    db = settings.MONGO_DB

    # 1. Wipe collections
    print("Wiping existing collections...")
    db["users"].delete_many({})
    db["diet_plans"].delete_many({})
    db["diet_plan_items"].delete_many({})
    db["coach_subscriptions"].delete_many({})
    db["meal_logs"].delete_many({})

    # 2. Seed food database
    print("Seeding food database...")
    seed_food_database(None)
    
    # Fetch all seeded foods
    food_collection = db["food_database"]
    foods = list(food_collection.find({}))
    print(f"Loaded {len(foods)} food items from food catalog.")
    
    # Map food name to its object for easy lookup
    food_map = {f['name'].lower(): f for f in foods}

    # Helper function to find food or fallback
    def find_food(name_key):
        return food_map.get(name_key.lower()) or foods[0]

    # 3. Create Coach Account
    print("Creating Coach Account...")
    raw_password = "123"
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    coach_id = ObjectId()
    coach_email = "coach.ramy@befit.com"
    coach = {
        "_id": coach_id,
        "name": "Big Ramy",
        "email": coach_email,
        "password_hash": hashed_password,
        "age": 41,
        "gender": "male",
        "weight_kg": 130.0,
        "height_cm": 180.0,
        "activity_level": "active",
        "user_type": "coach",
        "targets": {
            "daily_calories": 4000,
            "protein_g": 300,
            "carbs_g": 400,
            "fat_g": 100
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    db["users"].insert_one(coach)
    print(f"Coach Created. Email: '{coach_email}', Password: '{raw_password}'")

    # 4. Create Diet Plan for Coach
    print("Creating Diet Plan...")
    plan_id = ObjectId()
    plan_name = "خطة التضخيم للأبطال"
    plan = {
        "_id": plan_id,
        "coach_id": coach_id,
        "plan_name": plan_name,
        "description": "نظام غذائي متكامل عالي البروتين لتضخيم العضلات وزيادة القوة البدنية مصمم بواسطة الكوتش بيج رامي.",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    db["diet_plans"].insert_one(plan)

    # 5. Add Diet Plan Items
    print("Adding Diet Plan Items...")
    # Breakfast
    egg = find_food("Boiled Eggs")
    bread_white = find_food("White Bread")
    milk = find_food("Milk Full Cream")
    # Lunch
    chicken = find_food("Chicken")
    rice = find_food("Rice")
    salad = find_food("Salad")
    # Dinner
    tuna = find_food("Tuna Canned")
    bread_baladi = find_food("Baladi Bread")
    yogurt = find_food("Yogurt")
    # Snack
    banana = find_food("Banana")
    orange = find_food("Orange")

    plan_items = [
        # Breakfast
        {"diet_plan_id": plan_id, "food_id": egg["_id"], "meal_type": "breakfast", "quantity_g": 3.0}, # 3 pieces
        {"diet_plan_id": plan_id, "food_id": bread_white["_id"], "meal_type": "breakfast", "quantity_g": 1.5}, # 1.5 loaf
        {"diet_plan_id": plan_id, "food_id": milk["_id"], "meal_type": "breakfast", "quantity_g": 1.0}, # 1 cup
        # Lunch
        {"diet_plan_id": plan_id, "food_id": chicken["_id"], "meal_type": "lunch", "quantity_g": 250.0}, # 250g
        {"diet_plan_id": plan_id, "food_id": rice["_id"], "meal_type": "lunch", "quantity_g": 350.0}, # 350g
        {"diet_plan_id": plan_id, "food_id": salad["_id"], "meal_type": "lunch", "quantity_g": 200.0}, # 200g
        # Dinner
        {"diet_plan_id": plan_id, "food_id": tuna["_id"], "meal_type": "dinner", "quantity_g": 180.0}, # 180g
        {"diet_plan_id": plan_id, "food_id": bread_baladi["_id"], "meal_type": "dinner", "quantity_g": 1.0}, # 1 loaf
        {"diet_plan_id": plan_id, "food_id": yogurt["_id"], "meal_type": "dinner", "quantity_g": 1.0}, # 1 cup
        # Snacks
        {"diet_plan_id": plan_id, "food_id": banana["_id"], "meal_type": "snack", "quantity_g": 2.0}, # 2 pieces
        {"diet_plan_id": plan_id, "food_id": orange["_id"], "meal_type": "snack", "quantity_g": 1.0}, # 1 piece
    ]

    for item in plan_items:
        item["created_at"] = datetime.utcnow()
        db["diet_plan_items"].insert_one(item)
    print("Diet Plan Items successfully linked.")

    # 6. Create User Account
    print("Creating User Account...")
    user_id = ObjectId()
    user_email = "user.mostafa@befit.com"
    user = {
        "_id": user_id,
        "name": "Mostafa Karam",
        "email": user_email,
        "password_hash": hashed_password,
        "age": 25,
        "gender": "male",
        "weight_kg": 80.0,
        "height_cm": 178.0,
        "activity_level": "moderate",
        "user_type": "subscriber",
        "coach_id": coach_id,
        "targets": {
            "daily_calories": 2800,
            "protein_g": 160,
            "carbs_g": 320,
            "fat_g": 80
        },
        "created_at": datetime.utcnow() - timedelta(days=60),
        "updated_at": datetime.utcnow() - timedelta(days=60)
    }
    db["users"].insert_one(user)
    print(f"User Created. Email: '{user_email}', Password: '{raw_password}'")

    # 7. Automatically subscribe Mostafa to Big Ramy's plan
    print("Subscribing User to Coach's Diet Plan...")
    subscription = {
        "coach_id": coach_id,
        "subscriber_id": user_id,
        "diet_plan_id": plan_id,
        "status": "active",
        "start_date": datetime.utcnow() - timedelta(days=60),
        "end_date": None,
        "created_at": datetime.utcnow() - timedelta(days=60),
        "updated_at": datetime.utcnow() - timedelta(days=60)
    }
    db["coach_subscriptions"].insert_one(subscription)
    print("User successfully subscribed.")

    # 8. History Seeding (Last 60 Days: Exactly 240 logs)
    print("Seeding 240 sequential meal logs spanning the last 60 days...")
    
    # Food options for cycling logs to give natural variations
    breakfast_options = [
        {"food": find_food("Boiled Eggs"), "qty": 2.0},
        {"food": find_food("Oats"), "qty": 80.0},
        {"food": find_food("White Bread"), "qty": 1.0},
        {"food": find_food("Cottage Cheese"), "qty": 2.0}
    ]
    lunch_options = [
        {"food": find_food("Chicken"), "qty": 200.0},
        {"food": find_food("Rice"), "qty": 250.0},
        {"food": find_food("Salad"), "qty": 150.0},
        {"food": find_food("Grilled Fish"), "qty": 180.0}
    ]
    dinner_options = [
        {"food": find_food("Yogurt"), "qty": 1.0},
        {"food": find_food("Tuna Canned"), "qty": 150.0},
        {"food": find_food("Pizza"), "qty": 1.0},
        {"food": find_food("Pasta Boiled"), "qty": 200.0}
    ]
    snack_options = [
        {"food": find_food("Banana"), "qty": 1.0},
        {"food": find_food("Orange"), "qty": 1.0},
        {"food": find_food("Apple"), "qty": 1.0},
        {"food": find_food("Strawberry"), "qty": 100.0}
    ]

    meal_types = [
        ("breakfast", breakfast_options, time(8, 30)),
        ("lunch", lunch_options, time(13, 30)),
        ("snack", snack_options, time(17, 0)),
        ("dinner", dinner_options, time(20, 30))
    ]

    logs_inserted = 0
    today = datetime.now().date()
    
    for day_offset in range(60):
        log_date = today - timedelta(days=59 - day_offset)
        # Ensure exact datetime date component (midnight)
        midnight_date = datetime.combine(log_date, time.min)
        
        # 4 distinct meal types per day
        for meal_idx, (meal_type, food_options, time_offset) in enumerate(meal_types):
            session_id = f"session_{day_offset}_{meal_type}"
            
            # Select 3 distinct food options for this meal session
            for item_idx in range(3):
                option_idx = (day_offset + meal_idx + item_idx) % len(food_options)
                option = food_options[option_idx]
                food_item = option["food"]
                qty = option["qty"]

                # Calculate macros consumed
                calories_consumed = round(food_item.get('calories', 0) * qty, 2)
                protein_consumed = round(food_item.get('protein', 0) * qty, 2)
                carbs_consumed = round(food_item.get('carbs', 0) * qty, 2)
                fat_consumed = round(food_item.get('fat', 0) * qty, 2)

                logged_at = datetime.combine(log_date, time_offset)

                meal_log = {
                    "user_id": user_id,
                    "food_id": food_item["_id"],
                    "meal_session_id": session_id,
                    "food_name": food_item.get("name", ""),
                    "food_name_ar": food_item.get("name_ar", ""),
                    "meal_type": meal_type,
                    "quantity": qty,
                    "serving_unit": food_item.get("serving_unit", "gram"),
                    "calories_consumed": calories_consumed,
                    "protein_consumed": protein_consumed,
                    "carbs_consumed": carbs_consumed,
                    "fat_consumed": fat_consumed,
                    "date": midnight_date,
                    "logged_at": logged_at,
                    "created_at": logged_at
                }
                db["meal_logs"].insert_one(meal_log)
                logs_inserted += 1

    print(f"Generated and inserted exactly {logs_inserted} sequential historical meal logs.")
    print("=======> Seeding Successfully Completed! <=======")

if __name__ == "__main__":
    run_seeding()
