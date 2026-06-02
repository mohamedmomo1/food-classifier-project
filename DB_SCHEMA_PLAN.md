# BEFIT - Database Schema Design

## تعديلات قاعدة البيانات المقترحة

### 1. **Food Collection** (تعديل الموجود)
إضافة `meal_type` للأطعمة:

```json
{
  "_id": ObjectId,
  "food_id": number,
  "name": string,           // "Pizza"
  "name_ar": string,        // "بيتزا"
  "calories": number,       // 285.0
  "protein": number,        // 12.0 (جرام)
  "carbs": number,          // 36.0 (جرام)
  "fat": number,            // 10.0 (جرام)
  "serving_unit": string,   // "slice", "gram", "piece"
  "meal_type": string,      // "breakfast", "lunch", "dinner", "snack"
  "image_url": string,
  "created_at": Date
}
```

**التغييرات:**
- إضافة `name_ar` و `meal_type` لكل طعام
- تصنيف الأطعمة: فطار (breakfast) / غداء (lunch) / عشاء (dinner) / سناك (snack)

---

### 2. **Users Collection** (تعديل الموجود)
إضافة نوع المستخدم و اللغة المفضلة:

```json
{
  "_id": ObjectId,
  "name": string,
  "email": string (unique),
  "password_hash": string,
  "age": number,
  "gender": string,         // "male" / "female"
  "weight_kg": number,
  "height_cm": number,
  "activity_level": string, // "sedentary", "light", "moderate", "active"
  "user_type": string,      // "subscriber" / "coach"
  "targets": {
    "daily_calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  },
  "language": string,       // "ar" / "en" (localStorage)
  "coach_id": ObjectId,     // null إن كان coach، reference للـ coach إن كان subscriber
  "created_at": Date,
  "updated_at": Date
}
```

**التغييرات:**
- إضافة `user_type` (subscriber vs coach)
- إضافة `language` (للـ localStorage)
- إضافة `coach_id` (الكوتش الخاص بالمشترك)

---

### 3. **MealLog Collection** (جديد)
تتبع الوجبات المستهلكة يومياً:

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,              // reference to Users
  "food_id": ObjectId,              // reference to Food
  "food_name": string,              // "بيتزا" (snapshot)
  "meal_type": string,              // "breakfast", "lunch", "dinner", "snack"
  "quantity": number,               // 2 (الكمية)
  "serving_unit": string,           // "slice"
  "calories_consumed": number,      // 285 * 2 = 570
  "protein_consumed": number,
  "carbs_consumed": number,
  "fat_consumed": number,
  "date": Date,                     // تاريخ الوجبة
  "logged_at": Date,                // وقت التسجيل
  "created_at": Date
}
```

**الغرض:**
- تتبع كل وجبة يأكلها المستخدم
- حساب الإجمالي حسب اليوم/الأسبوع/الشهر
- تصفية حسب `meal_type` (فطار/غداء/عشاء/سناك)

---

### 4. **DietPlan Collection** (جديد)
نظام غذائي يعده الكوتش:

```json
{
  "_id": ObjectId,
  "coach_id": ObjectId,             // reference to Users (coach)
  "name": string,                   // "خطة كمال الأجسام"
  "description": string,
  "meals": {
    "breakfast": [
      {
        "food_id": ObjectId,
        "quantity": number,
        "serving_unit": string,
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      }
    ],
    "lunch": [...],
    "dinner": [...],
    "snacks": [...]
  },
  "daily_targets": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "is_active": boolean,             // هل النظام متاح للاستخدام
  "created_at": Date,
  "updated_at": Date
}
```

**الغرض:**
- الكوتش ينشئ نظام غذائي متكامل
- تقسيم الوجبات حسب الفترة الزمنية
- حساب الإجمالي اليومي

---

### 5. **CoachSubscription Collection** (جديد)
العلاقة بين الكوتش والمشترك:

```json
{
  "_id": ObjectId,
  "coach_id": ObjectId,             // reference to Users (coach)
  "subscriber_id": ObjectId,        // reference to Users (subscriber)
  "diet_plan_id": ObjectId,         // reference to DietPlan (optional)
  "status": string,                 // "active" / "paused" / "ended"
  "start_date": Date,
  "end_date": Date,                 // null إن كانت مستمرة
  "created_at": Date,
  "updated_at": Date
}
```

**الغرض:**
- تتبع علاقة كل مشترك بالكوتش الخاص به
- ربط النظام الغذائي بالمشترك
- تتبع حالة الاشتراك

---

## Indexes (للأداء)

```javascript
// MealLog - للبحث السريع
db.meal_logs.createIndex({ "user_id": 1, "date": -1 })
db.meal_logs.createIndex({ "user_id": 1, "meal_type": 1, "date": -1 })

// Users - للتحقق من البريد
db.users.createIndex({ "email": 1 }, { unique: true })

// Food - للبحث
db.food.createIndex({ "name": 1 })
db.food.createIndex({ "meal_type": 1 })

// CoachSubscription - للعلاقات
db.coach_subscriptions.createIndex({ "coach_id": 1, "status": 1 })
db.coach_subscriptions.createIndex({ "subscriber_id": 1 })
```

---

## الملفات المراد تعديلها

- ✅ `/backend/api_app/models.py` - تعريف كل Collections
- ✅ `/backend/api_app/seed_food.py` - إضافة `meal_type` و `name_ar` للـ Food
- ✅ `/backend/api_app/views.py` - APIs جديد (CRUD للوجبات والنظام الغذائي)
- ✅ `/backend/api_app/urls.py` - تعريف الـ routes
- ✅ Frontend Components - صفحات جديدة

---

## ملخص البنية العلاقية

```
Users (subscriber)
  ├─ has many MealLogs
  ├─ has one Coach (coach_id)
  └─ has one CoachSubscription
  
Users (coach)
  ├─ has many DietPlans
  └─ has many CoachSubscriptions (as coach)

DietPlan
  ├─ created by Coach
  └─ used in CoachSubscription

Food
  ├─ referenced in DietPlan
  └─ logged in MealLog

MealLog
  └─ tracks consumption by subscriber

CoachSubscription
  ├─ links Coach to Subscriber
  └─ assigns DietPlan to Subscriber
```

---

## جدول التنفيذ (11 مرحلة)

1. ✅ **تعديل DB Schema** - إضافة Collections و Fields
2. صفحة البحث عن الأطعمة (Search)
3. تصنيف الوجبات (Meal Type Classification)
4. صفحة تتبع التاريخ (Meal History)
5. إصلاح اللغة (i18n + localStorage)
6. Navbar و Footer
7. صفحة إنشاء النظام الغذائي (Coach Panel)
8. صفحة متابعة النظام (Subscriber Panel)
9. صفحة هستوري الأكل (Coach View History)
10. اسم وشعار الموقع
11. مراجعة نهائية

