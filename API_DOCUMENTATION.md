# BEFIT Backend APIs Documentation

## Base URL
```
http://localhost:8000/api/
```

---

## 🔐 Authentication APIs

### 1. Register User
**POST** `/auth/register/`

```json
{
  "name": "أحمد علي",
  "email": "ahmed@example.com",
  "password": "password123",
  "age": 25,
  "gender": "male",
  "weight": 80,
  "height": 180,
  "activity_level": "moderate",
  "user_type": "subscriber"  // or "coach"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "507f1f77bcf86cd799439011",
  "user_type": "subscriber",
  "targets": {
    "daily_calories": 2500,
    "protein_g": 160,
    "carbs_g": 312,
    "fat_g": 69
  }
}
```

---

### 2. Login User
**POST** `/auth/login/`

```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "أحمد علي",
    "email": "ahmed@example.com",
    "user_type": "subscriber",
    "language": "ar",
    "calories_target": 2500
  }
}
```

---

### 3. Update User
**PUT** `/auth/users/{user_id}/`

```json
{
  "language": "en",
  "user_type": "coach",
  "coach_id": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث البيانات بنجاح"
}
```

---

## 🥘 Food APIs

### 1. Search Foods
**GET** `/foods/search/?query=دجاج&meal_type=lunch`

**Query Parameters:**
- `query` (string) - اسم الطعام
- `meal_type` (optional) - breakfast, lunch, dinner, snack, all

**Response:**
```json
{
  "success": true,
  "foods": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Chicken",
      "name_ar": "دجاج",
      "calories": 1.65,
      "protein": 0.31,
      "carbs": 0.0,
      "fat": 0.036,
      "serving_unit": "gram",
      "meal_type": "lunch"
    }
  ],
  "count": 1
}
```

---

### 2. Predict Food from Image
**POST** `/foods/predict/`

**Request:** multipart/form-data
- `image` (file) - صورة الطعام

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "food_id": "507f1f77bcf86cd799439011",
      "name_ar": "بيتزا",
      "name_en": "Pizza",
      "unit_ar": "شريحة",
      "unit_en": "slice",
      "calories": 285,
      "meal_type": "dinner"
    }
  ]
}
```

---

## 📊 Meal Log APIs

### 1. Log Meal
**POST** `/meals/log/`

```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "food_id": "507f1f77bcf86cd799439012",
  "quantity": 2,
  "meal_type": "lunch",
  "date": "2026-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "meal_id": "507f1f77bcf86cd799439013",
  "message": "تم تسجيل الوجبة بنجاح",
  "meal": {
    "user_id": "507f1f77bcf86cd799439011",
    "food_id": "507f1f77bcf86cd799439012",
    "food_name": "Pizza",
    "food_name_ar": "بيتزا",
    "quantity": 2,
    "serving_unit": "slice",
    "meal_type": "lunch",
    "calories_consumed": 570,
    "protein_consumed": 24,
    "carbs_consumed": 72,
    "fat_consumed": 20
  }
}
```

---

### 2. Get Meal History
**GET** `/meals/history/?user_id=507f1f77bcf86cd799439011&start_date=2026-01-10&end_date=2026-01-20`

**Query Parameters:**
- `user_id` (required) - معرف المستخدم
- `start_date` (optional) - YYYY-MM-DD
- `end_date` (optional) - YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "meals": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "user_id": "507f1f77bcf86cd799439011",
      "food_name": "Pizza",
      "quantity": 2,
      "meal_type": "lunch",
      "calories_consumed": 570,
      "date": "2026-01-15T00:00:00"
    }
  ],
  "count": 1
}
```

---

### 3. Get Meal Summary (Daily/Weekly/Monthly)
**GET** `/meals/summary/?user_id=507f1f77bcf86cd799439011&period=daily&date=2026-01-15&meal_type=lunch`

**Query Parameters:**
- `user_id` (required) - معرف المستخدم
- `period` (required) - "daily", "weekly", "monthly"
- `date` (required) - YYYY-MM-DD
- `meal_type` (optional) - breakfast, lunch, dinner, snack, all

**Response:**
```json
{
  "success": true,
  "period": "daily",
  "start_date": "2026-01-15T00:00:00",
  "end_date": "2026-01-16T00:00:00",
  "meal_type_filter": "lunch",
  "summary": {
    "total_calories": 570,
    "total_protein": 24,
    "total_carbs": 72,
    "total_fat": 20,
    "meal_count": 1
  }
}
```

---

### 4. Update Meal
**PUT** `/meals/{meal_id}/update/`

```json
{
  "quantity": 3,
  "meal_type": "dinner",
  "date": "2026-01-16"
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تحديث الوجبة بنجاح"
}
```

---

### 5. Delete Meal
**DELETE** `/meals/{meal_id}/`

**Response:**
```json
{
  "success": true,
  "message": "تم حذف الوجبة بنجاح"
}
```

---

## 🏋️ Diet Plan APIs (للكوتش)

### 1. Create Diet Plan
**POST** `/diet-plans/`

```json
{
  "coach_id": "507f1f77bcf86cd799439011",
  "name": "خطة كمال الأجسام",
  "description": "نظام غذائي كامل لبناء العضلات",
  "breakfast_meals": [
    {
      "food_id": "507f1f77bcf86cd799439012",
      "quantity": 2,
      "serving_unit": "piece",
      "calories": 156,
      "protein": 13,
      "carbs": 1.2,
      "fat": 11
    }
  ],
  "lunch_meals": [...],
  "dinner_meals": [...],
  "snacks": [...],
  "daily_targets": {
    "calories": 2500,
    "protein": 160,
    "carbs": 312,
    "fat": 69
  }
}
```

**Response:**
```json
{
  "success": true,
  "plan_id": "507f1f77bcf86cd799439014",
  "message": "تم إنشاء النظام الغذائي بنجاح"
}
```

---

### 2. Get Diet Plans
**GET** `/diet-plans/list/?coach_id=507f1f77bcf86cd799439011`

**Response:**
```json
{
  "success": true,
  "plans": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "coach_id": "507f1f77bcf86cd799439011",
      "name": "خطة كمال الأجسام",
      "description": "...",
      "meals": {...},
      "daily_targets": {...},
      "is_active": true
    }
  ],
  "count": 1
}
```

---

### 3. Update Diet Plan
**PUT** `/diet-plans/{plan_id}/`

```json
{
  "name": "خطة جديدة",
  "description": "وصف جديد",
  "breakfast_meals": [...],
  "daily_targets": {...}
}
```

---

### 4. Delete Diet Plan
**DELETE** `/diet-plans/{plan_id}/delete/`

---

## 👥 Coach Subscription APIs

### 1. Create Subscription (إضافة مشترك للكوتش)
**POST** `/subscriptions/`

```json
{
  "coach_id": "507f1f77bcf86cd799439011",
  "subscriber_id": "507f1f77bcf86cd799439015",
  "diet_plan_id": "507f1f77bcf86cd799439014"
}
```

**Response:**
```json
{
  "success": true,
  "subscription_id": "507f1f77bcf86cd799439016",
  "message": "تم إضافة المشترك بنجاح"
}
```

---

### 2. Get Subscriptions
**GET** `/subscriptions/list/?coach_id=507f1f77bcf86cd799439011`

Or للمشترك:
**GET** `/subscriptions/list/?subscriber_id=507f1f77bcf86cd799439015`

**Response:**
```json
{
  "success": true,
  "subscriptions": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "coach_id": "507f1f77bcf86cd799439011",
      "subscriber_id": "507f1f77bcf86cd799439015",
      "diet_plan_id": "507f1f77bcf86cd799439014",
      "status": "active",
      "start_date": "2026-01-15T10:30:00"
    }
  ],
  "count": 1
}
```

---

### 3. Update Subscription
**PUT** `/subscriptions/{subscription_id}/`

```json
{
  "diet_plan_id": "507f1f77bcf86cd799439017",
  "status": "paused"
}
```

---

### 4. Get Subscriber Meal History (للكوتش لرؤية أكل المشترك)
**GET** `/subscriptions/{subscriber_id}/history/?period=daily&date=2026-01-15`

**Query Parameters:**
- `period` - "daily", "weekly", "monthly"
- `date` - YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "period": "daily",
  "date_range": {
    "start": "2026-01-15T00:00:00",
    "end": "2026-01-16T00:00:00"
  },
  "meals_by_type": {
    "breakfast": {
      "meals": [...],
      "total_calories": 450
    },
    "lunch": {
      "meals": [...],
      "total_calories": 800
    },
    "dinner": {
      "meals": [...],
      "total_calories": 700
    },
    "snack": {
      "meals": [...],
      "total_calories": 200
    }
  },
  "total_meals": 10
}
```

---

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": "وصف الخطأ"
}
```

**Status Codes:**
- 200 - OK
- 201 - Created
- 400 - Bad Request
- 404 - Not Found
- 500 - Server Error

---

## ملاحظات مهمة

1. جميع التواريخ بصيغة ISO 8601: `YYYY-MM-DD`
2. معرفات MongoDB (IDs) تكون string في الـ Response
3. جميع الـ endpoints تدعم i18n (عربي/إنجليزي)
4. الكالوريز والـ macros يتم تقريبها لـ 2 مراتب عشرية
