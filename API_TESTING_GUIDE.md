# 🧪 ملف اختبار الـ APIs الكاملة

## 🎯 الخطوة 1: تشغيل السكريبت

```bash
# تشغيل الـ seed script لإنشاء البيانات
curl http://localhost:8000/api/seed-demo-data/
```

**الـ Response:**
```json
{
  "success": true,
  "message": "✓ تم إنشاء البيانات التجريبية بنجاح!",
  "data": {
    "coach": {
      "id": "65a123...",
      "name": "كابتن بيج رامي",
      "email": "coach_big_ramy@befit.com"
    },
    "subscriber": {
      "id": "65a456...",
      "name": "مصطفى مطر",
      "email": "mostafa_meter@befit.com"
    }
  }
}
```

---

## 🔑 الخطوة 2: تسجيل الدخول

### تسجيل دخول المشترك (مصطفى مطر)

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mostafa_meter@befit.com",
    "password": "123"
  }'
```

**الـ Response:**
```json
{
  "success": true,
  "message": "تم تسجيل الدخول بنجاح!",
  "user": {
    "id": "65a456...",
    "name": "مصطفى مطر",
    "email": "mostafa_meter@befit.com",
    "user_type": "subscriber",
    "language": "ar",
    "calories_target": 2500
  }
}
```

**احفظ الـ ID:** `SUBSCRIBER_ID = "65a456..."`

---

### تسجيل دخول الكوتش (كابتن بيج رامي)

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach_big_ramy@befit.com",
    "password": "123"
  }'
```

**احفظ الـ ID:** `COACH_ID = "65a123..."`

---

## 📊 الخطوة 3: اختبر APIs المشترك

### 3.1 عرض سجل الوجبات (آخر 7 أيام)

```bash
# احصل على تاريخ قبل 7 أيام
START_DATE="2024-01-25"  # مثال
END_DATE="2024-02-01"

curl "http://localhost:8000/api/meals/history/?user_id=SUBSCRIBER_ID&start_date=$START_DATE&end_date=$END_DATE"
```

**الـ Response:**
```json
{
  "success": true,
  "meals": [
    {
      "_id": "...",
      "food_name_ar": "كشري",
      "food_name": "Koshary",
      "meal_type": "breakfast",
      "quantity": 1.5,
      "calories_consumed": 2.4,
      "protein_consumed": 0.09,
      "date": "2024-01-25T00:00:00",
      "logged_at": "2024-02-01T10:30:00"
    },
    ...
  ],
  "count": 28  // 7 أيام × 4 وجبات
}
```

---

### 3.2 عرض ملخص الماكروز (يوم محدد)

```bash
curl "http://localhost:8000/api/meals/summary/?user_id=SUBSCRIBER_ID&period=daily&date=2024-01-25"
```

**الـ Response:**
```json
{
  "success": true,
  "period": "daily",
  "start_date": "2024-01-25T00:00:00",
  "end_date": "2024-01-26T00:00:00",
  "summary": {
    "total_calories": 7500,    // مجموع من 4 وجبات
    "total_protein": 280,
    "total_carbs": 950,
    "total_fat": 250,
    "meal_count": 4
  }
}
```

---

### 3.3 عرض ملخص أسبوع

```bash
curl "http://localhost:8000/api/meals/summary/?user_id=SUBSCRIBER_ID&period=weekly&date=2024-01-25"
```

**الـ Response:**
```json
{
  "summary": {
    "total_calories": 52500,   // 7 أيام × 7500
    "total_protein": 1960,
    "total_carbs": 6650,
    "total_fat": 1750,
    "meal_count": 28           // 7 أيام × 4 وجبات
  }
}
```

---

### 3.4 عرض ملخص شهري

```bash
curl "http://localhost:8000/api/meals/summary/?user_id=SUBSCRIBER_ID&period=monthly&date=2024-01-15"
```

**الـ Response:**
```json
{
  "summary": {
    "total_calories": 225000,   // 30 يوم × 7500
    "total_protein": 8400,
    "total_carbs": 28500,
    "total_fat": 7500,
    "meal_count": 120
  }
}
```

---

### 3.5 إضافة وجبة جديدة

```bash
# أولاً، ابحث عن أطعمة
curl "http://localhost:8000/api/foods/search/?query=ك"

# حصلت على food_id من النتائج: "65b789..."

# أضف الوجبة
curl -X POST http://localhost:8000/api/meals/log/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "SUBSCRIBER_ID",
    "food_id": "65b789...",
    "quantity": 1.5,
    "meal_type": "breakfast",
    "date": "2024-02-01"
  }'
```

---

### 3.6 حذف وجبة

```bash
curl -X DELETE http://localhost:8000/api/meals/MEAL_ID/
```

---

### 3.7 تعديل وجبة

```bash
curl -X PUT http://localhost:8000/api/meals/MEAL_ID/update/ \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 2.0,
    "meal_type": "lunch"
  }'
```

---

## 🏋️ الخطوة 4: اختبر APIs الكوتش

### 4.1 عرض سجل وجبات المشترك (صلاحيات الكوتش)

```bash
curl "http://localhost:8000/api/subscriptions/SUBSCRIBER_ID/history/?period=daily&date=2024-01-25"
```

**الـ Response:**
```json
{
  "success": true,
  "period": "daily",
  "date_range": {
    "start": "2024-01-25T00:00:00",
    "end": "2024-01-26T00:00:00"
  },
  "meals_by_type": {
    "breakfast": {
      "meals": [...],
      "total_calories": 2400
    },
    "lunch": {
      "meals": [...],
      "total_calories": 1800
    },
    "dinner": {
      "meals": [...],
      "total_calories": 1900
    },
    "snack": {
      "meals": [...],
      "total_calories": 1400
    }
  },
  "total_meals": 4
}
```

---

### 4.2 إنشاء خطة تدريبية

```bash
# أولاً ابحث عن أطعمة جيدة
curl "http://localhost:8000/api/foods/search/?query=chicken&meal_type=lunch"

# احصل على IDs الأطعمة المناسبة

curl -X POST http://localhost:8000/api/diet-plans/ \
  -H "Content-Type: application/json" \
  -d '{
    "coach_id": "COACH_ID",
    "name": "خطة تنشيف",
    "description": "خطة لتنشيف الدهون والحفاظ على العضلات",
    "breakfast_meals": [
      {
        "food_id": "65b111...",
        "quantity": 2.0,
        "serving_unit": "piece",
        "calories": 156.0,
        "protein": 13.0,
        "carbs": 1.2,
        "fat": 11.0
      }
    ],
    "lunch_meals": [
      {
        "food_id": "65b222...",
        "quantity": 200,
        "serving_unit": "gram",
        "calories": 330.0,
        "protein": 62.0,
        "carbs": 0.0,
        "fat": 7.2
      }
    ],
    "dinner_meals": [
      {
        "food_id": "65b333...",
        "quantity": 1.0,
        "serving_unit": "plate",
        "calories": 450.0,
        "protein": 30.0,
        "carbs": 40.0,
        "fat": 15.0
      }
    ],
    "snacks": [
      {
        "food_id": "65b444...",
        "quantity": 1.0,
        "serving_unit": "piece",
        "calories": 105.0,
        "protein": 1.3,
        "carbs": 27.0,
        "fat": 0.4
      }
    ],
    "daily_targets": {
      "calories": 2700,
      "protein": 180,
      "carbs": 200,
      "fat": 80
    }
  }'
```

---

### 4.3 عرض الخطط

```bash
curl "http://localhost:8000/api/diet-plans/list/?coach_id=COACH_ID"
```

**الـ Response:**
```json
{
  "success": true,
  "plans": [
    {
      "_id": "65c999...",
      "name": "خطة تنشيف",
      "description": "...",
      "meals": {
        "breakfast": [...],
        "lunch": [...],
        "dinner": [...],
        "snacks": [...]
      },
      "daily_targets": {...},
      "is_active": true
    }
  ],
  "count": 1
}
```

---

### 4.4 تعديل خطة

```bash
curl -X PUT http://localhost:8000/api/diet-plans/PLAN_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "خطة بناء عضلات محسنة",
    "breakfast_meals": [...],
    "lunch_meals": [...],
    "dinner_meals": [...],
    "snacks": [...],
    "daily_targets": {
      "calories": 3500,
      "protein": 250,
      "carbs": 400,
      "fat": 110
    }
  }'
```

---

### 4.5 إنشاء اشتراك (ربط مشترك بخطة)

```bash
curl -X POST http://localhost:8000/api/subscriptions/ \
  -H "Content-Type: application/json" \
  -d '{
    "coach_id": "COACH_ID",
    "subscriber_id": "SUBSCRIBER_ID",
    "diet_plan_id": "PLAN_ID"
  }'
```

---

### 4.6 عرض الاشتراكات

```bash
curl "http://localhost:8000/api/subscriptions/list/?coach_id=COACH_ID"
```

---

### 4.7 تعديل الاشتراك

```bash
curl -X PUT http://localhost:8000/api/subscriptions/SUBSCRIPTION_ID/ \
  -H "Content-Type: application/json" \
  -d '{
    "diet_plan_id": "NEW_PLAN_ID",
    "status": "active"
  }'
```

---

## 🔍 الخطوة 5: اختبارات شاملة

### 5.1 التحقق من الـ 60 يوم

```bash
# عد الوجبات المسجلة
curl "http://localhost:8000/api/meals/history/?user_id=SUBSCRIBER_ID" | jq '.count'

# يجب أن تكون النتيجة: ≥ 240
```

---

### 5.2 التحقق من الماكروز التلقائية

```bash
# اختبر أيام مختلفة
for day in 1 15 30 45 60; do
  DATE=$(date -d "$day days ago" +%Y-%m-%d)
  echo "اليوم $day قبل ($DATE):"
  curl -s "http://localhost:8000/api/meals/summary/?user_id=SUBSCRIBER_ID&period=daily&date=$DATE" | jq '.summary'
done
```

---

### 5.3 التحقق من صلاحيات الكوتش

```bash
# الكوتش يجب أن يرى وجبات المشترك
curl "http://localhost:8000/api/subscriptions/SUBSCRIBER_ID/history/?period=daily&date=2024-01-25" | jq '.meals_by_type'
```

---

## 📱 اختبارات الـ Frontend

### من الفرونتنيد، يجب أن تختبر:

1. **صفحة الهوم:**
   - عرض الماكروز اليومية ✓
   - عرض الـ 60 يوم في الرسم البياني ✓

2. **صفحة السجل:**
   - عرض جميع الوجبات المسجلة ✓
   - إمكانية البحث والفلترة ✓

3. **صفحة الكوتش:**
   - رؤية خطط المشتركين ✓
   - عرض سجل الوجبات ✓
   - تصميم جداول أكلات ✓

4. **تحديث الماكروز:**
   - عند إضافة وجبة جديدة، الماكروز تُحدّث تلقائياً ✓
   - الرسم البياني يُحدّث بدون refresh ✓

---

## 📊 قائمة المتغيرات المهمة

احفظ هذه المتغيرات لاستخدامها في الاختبارات:

```bash
COACH_ID="65a123..."              # من seed_demo_data response
SUBSCRIBER_ID="65a456..."          # من seed_demo_data response
PLAN_ID="65c789..."                # من seed_demo_data response
SUBSCRIPTION_ID="65d012..."        # من seed_demo_data response
MEAL_ID="65e345..."                # من meals history
FOOD_ID="65f678..."                # من search results
```

---

## ✅ Checklist الاختبار

- [ ] تشغيل seed script بنجاح
- [ ] تسجيل دخول المشترك بنجاح
- [ ] تسجيل دخول الكوتش بنجاح
- [ ] عرض 240 وجبة للمشترك
- [ ] حساب الماكروز اليومية بشكل صحيح
- [ ] حساب الماكروز الأسبوعية بشكل صحيح
- [ ] حساب الماكروز الشهرية بشكل صحيح
- [ ] إضافة وجبة جديدة تُحدّث الماكروز
- [ ] الكوتش يرى سجل المشترك
- [ ] إنشاء خطة تدريبية بنجاح
- [ ] ربط المشترك بالخطة بنجاح
- [ ] تعديل الخطة بنجاح

**✨ كل هذا يجب أن يعمل بدون أخطاء!**
