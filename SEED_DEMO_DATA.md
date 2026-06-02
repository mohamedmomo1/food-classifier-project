# 🚀 ملف Seed البيانات التجريبية - Phase 3

## 📋 المتطلبات المُنجزة

### 1️⃣ حساب الكوتش (مشاكل 8 و 13)
- ✅ **الاسم:** كابتن بيج رامي
- ✅ **الإيميل:** coach_big_ramy@befit.com
- ✅ **الباسورد:** 123 (مشفر بـ bcrypt)
- ✅ **Unique:** اسم الحساب فريد (unique email)
- ✅ **الخطة:** "خطة تدريبية وتغذية" من كابتن بيج رامي

### 2️⃣ حساب المشترك (مشاكل 9 و 12)
- ✅ **الاسم:** مصطفى مطر
- ✅ **الإيميل:** mostafa_meter@befit.com
- ✅ **الباسورد:** 123 (مشفر)
- ✅ **مشترك في خطة:** كابتن بيج رامي

### 3️⃣ حشو الـ History (مشاكل 9 و 10)
- ✅ **المدة:** 60 يوماً ماضية
- ✅ **الوجبات:** فطار، غداء، عشاء، سناك (4 وجبات يومياً)
- ✅ **الإجمالي:** 240 وجبة (60 × 4)
- ✅ **التحديث التلقائي:** الماكروز تُحسب تلقائياً

### 4️⃣ صلاحيات الكوتش (مشكلة 13)
- ✅ **الرؤية:** الكوتش يرى history المشتركين عنده
- ✅ **العلاقات:** coach_subscriptions تربط الكوتش بالمشترك

### 5️⃣ جدول أكلات الكوتش (مشكلة 7)
- ✅ **التصميم:** جدول مقسم إلى (breakfast, lunch, dinner, snack)
- ✅ **المرونة:** يمكن تعديل الجدول من قبل الكوتش

---

## 🔧 كيفية الاستخدام

### 1️⃣ تشغيل السكريبت
```bash
# عبر HTTP request
curl http://localhost:8000/api/seed-demo-data/

# أو من Django shell
python manage.py shell
from api_app.seed_demo_data import seed_demo_data
seed_demo_data(None)
```

### 2️⃣ تسجيل الدخول

**الكوتش:**
```json
{
  "email": "coach_big_ramy@befit.com",
  "password": "123"
}
```

**المشترك:**
```json
{
  "email": "mostafa_meter@befit.com",
  "password": "123"
}
```

---

## 📊 Response من السكريبت

```json
{
  "success": true,
  "message": "✓ تم إنشاء البيانات التجريبية بنجاح!",
  "data": {
    "coach": {
      "id": "ObjectId",
      "name": "كابتن بيج رامي",
      "email": "coach_big_ramy@befit.com",
      "password": "123",
      "user_type": "coach"
    },
    "subscriber": {
      "id": "ObjectId",
      "name": "مصطفى مطر",
      "email": "mostafa_meter@befit.com",
      "password": "123",
      "user_type": "subscriber",
      "coach_id": "ObjectId"
    },
    "diet_plan": {
      "id": "ObjectId",
      "name": "كابتن بيج رامي",
      "coach_id": "ObjectId"
    },
    "subscription": {
      "id": "ObjectId",
      "status": "active",
      "coach_id": "ObjectId",
      "subscriber_id": "ObjectId",
      "diet_plan_id": "ObjectId"
    },
    "meals": {
      "total": 240,
      "days": 60,
      "meals_per_day": 4
    }
  }
}
```

---

## 🔗 الـ APIs المتاحة الآن

### للمشترك (مصطفى مطر)

**1. الحصول على سجل الوجبات:**
```
GET /api/meals/history/?user_id={subscriber_id}&start_date=2024-01-01&end_date=2024-03-01
```

**2. الحصول على ملخص الماكروز:**
```
GET /api/meals/summary/?user_id={subscriber_id}&period=daily&date=2024-02-15
```

**3. تسجيل وجبة جديدة:**
```
POST /api/meals/log/
{
  "user_id": "{subscriber_id}",
  "food_id": "{food_id}",
  "quantity": 1.5,
  "meal_type": "breakfast",
  "date": "2024-03-01"
}
```

---

### للكوتش (كابتن بيج رامي)

**1. رؤية سجل وجبات المشتركين:**
```
GET /api/subscriptions/{subscriber_id}/history/?period=daily&date=2024-02-15
```

**2. إنشاء خطة تدريبية:**
```
POST /api/diet-plans/
{
  "coach_id": "{coach_id}",
  "name": "خطة مخصصة",
  "description": "...",
  "breakfast_meals": [...],
  "lunch_meals": [...],
  "dinner_meals": [...],
  "snacks": [...]
}
```

**3. عرض الخطط:**
```
GET /api/diet-plans/list/?coach_id={coach_id}
```

---

## 📊 بنية البيانات

### Users Collection
```javascript
{
  "_id": ObjectId,
  "name": "مصطفى مطر / كابتن بيج رامي",
  "email": "unique@email.com",
  "password_hash": "bcrypt hashed password",
  "user_type": "subscriber / coach",
  "coach_id": ObjectId (null for coach, ObjectId for subscriber),
  "targets": {
    "daily_calories": 2500,
    "protein_g": 125,
    "carbs_g": 300,
    "fat_g": 80
  },
  "created_at": DateTime,
  "updated_at": DateTime
}
```

### Meal Logs (240 وجبة)
```javascript
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "food_id": ObjectId,
  "food_name": "Koshary",
  "food_name_ar": "كشري",
  "meal_type": "breakfast / lunch / dinner / snack",
  "quantity": 1.5,
  "calories_consumed": 2.4,
  "protein_consumed": 0.09,
  "carbs_consumed": 0.45,
  "fat_consumed": 0.033,
  "date": DateTime (من 60 يوماً ماضية),
  "logged_at": DateTime
}
```

### Diet Plans
```javascript
{
  "_id": ObjectId,
  "coach_id": ObjectId,
  "name": "كابتن بيج رامي",
  "description": "خطة تدريبية وتغذية...",
  "meals": {
    "breakfast": [{ food_id, quantity, ... }],
    "lunch": [...],
    "dinner": [...],
    "snacks": [...]
  },
  "daily_targets": {
    "calories": 3000,
    "protein": 170,
    "carbs": 300,
    "fat": 100
  }
}
```

### Coach Subscriptions
```javascript
{
  "_id": ObjectId,
  "coach_id": ObjectId,
  "subscriber_id": ObjectId,
  "diet_plan_id": ObjectId,
  "status": "active",
  "start_date": DateTime,
  "end_date": null
}
```

---

## 🎯 الحسابات التلقائية

### الماكروز اليومية
عند جلب `GET /api/meals/summary/`، النظام يحسب تلقائياً:
```json
{
  "total_calories": 7500,    // مجموع السعرات من 4 وجبات
  "total_protein": 280,
  "total_carbs": 950,
  "total_fat": 250,
  "meal_count": 4
}
```

### التاريخ والفترات
- **daily:** يوم واحد
- **weekly:** 7 أيام
- **monthly:** شهر كامل

---

## 🔐 الأمان والتحقق

- ✅ **Unique Email:** لا يمكن إنشاء حسابين بنفس الإيميل
- ✅ **Password Hashing:** جميع كلمات المرور مشفرة بـ bcrypt
- ✅ **Authorization:** الكوتش يرى فقط وجبات المشتركين عنده
- ✅ **Coach ID:** كل مشترك له coach_id لربطه بالكوتش

---

## ⚙️ ملفات السكريبت

### `/backend/api_app/seed_demo_data.py`
- إنشاء الكوتش والمشترك
- إنشاء الخطة والاشتراك
- حشو 240 وجبة (60 يوم × 4 وجبات)

### `/backend/food_project/urls.py`
```python
path('api/seed-demo-data/', seed_demo_data, name='seed_demo_data')
```

---

## 📝 ملاحظات مهمة

### إذا أردت تشغيل السكريبت مرة أخرى:
- السكريبت يتحقق من وجود البيانات
- لن يُنشئ duplicates (حسابات مكررة)
- لن يُضيف وجبات مكررة إذا كانت موجودة

### حذف البيانات (للاختبار):
```javascript
// في MongoDB
db.users.deleteMany({email: /coach_big_ramy|mostafa_meter/})
db.meal_logs.deleteMany({food_name_ar: "..."})
db.diet_plans.deleteMany({coach_id: ObjectId("...")})
db.coach_subscriptions.deleteMany({})
```

---

## 🚀 الخطوات التالية

1. ✅ تشغيل السكريبت: `curl http://localhost:8000/api/seed-demo-data/`
2. ✅ تسجيل الدخول برجل الدين (مشترك)
3. ✅ التحقق من عرض الـ 60 يوم في الهوم
4. ✅ تسجيل الدخول بالكوتش
5. ✅ عرض سجل المشتركين

---

## 📊 ملخص الإحصائيات

| البيان | العدد |
|------|-------|
| عدد الحسابات | 2 (1 coach + 1 subscriber) |
| الوجبات المسجلة | 240 (60 يوم × 4 وجبات) |
| الأيام | 60 يوماً |
| الخطط التدريبية | 1 |
| الاشتراكات | 1 |

**✨ البيانات التجريبية جاهزة للاختبار الشامل!**
