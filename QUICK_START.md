# 🚀 دليل البدء السريع - Phase 3

## ⚡ تشغيل الـ Seed Script (2 ثانية)

```bash
# 1. تأكد من تشغيل MongoDB
# 2. شغّل Django server
cd /c/final_gp_pro/backend
python manage.py runserver

# 3. في terminal آخر، قم بـ seed البيانات
curl http://localhost:8000/api/seed-demo-data/
```

---

## 📊 البيانات التي تم إنشاؤها

| العنصر | التفاصيل |
|-------|----------|
| **الكوتش** | كابتن بيج رامي |
| | البريد: `coach_big_ramy@befit.com` |
| | الباسورد: `123` |
| **المشترك** | مصطفى مطر |
| | البريد: `mostafa_meter@befit.com` |
| | الباسورد: `123` |
| **الوجبات** | 240 وجبة (60 يوم × 4 وجبات) |
| **الخطة** | خطة تدريبية مخصصة |

---

## 🧪 اختبار سريع

### 1. تسجيل دخول المشترك
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mostafa_meter@befit.com",
    "password": "123"
  }'
```

**احفظ الـ ID من الـ Response**

### 2. عرض سجل الوجبات
```bash
curl "http://localhost:8000/api/meals/history/?user_id=SUBSCRIBER_ID&start_date=2024-01-01&end_date=2024-03-01"
```

### 3. عرض الماكروز اليومية
```bash
curl "http://localhost:8000/api/meals/summary/?user_id=SUBSCRIBER_ID&period=daily&date=2024-01-25"
```

---

## 🏋️ اختبار الكوتش

### 1. تسجيل دخول الكوتش
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "coach_big_ramy@befit.com",
    "password": "123"
  }'
```

### 2. رؤية سجل المشترك
```bash
curl "http://localhost:8000/api/subscriptions/SUBSCRIBER_ID/history/?period=daily&date=2024-01-25"
```

---

## 📁 الملفات المهمة

| الملف | الوصف |
|------|-------|
| `seed_demo_data.py` | السكريبت الرئيسي |
| `SEED_DEMO_DATA.md` | شرح مفصل |
| `API_TESTING_GUIDE.md` | دليل اختبار شامل |
| `PHASE_3_COMPLETE.md` | ملخص المرحلة |

---

## ✅ ما تم إنجازه

- ✅ حساب الكوتش مع خطة تدريبية
- ✅ حساب المشترك مشترك في الخطة
- ✅ 240 وجبة للـ 60 يوماً
- ✅ ماكروز تُحسب تلقائياً
- ✅ صلاحيات كاملة للكوتش
- ✅ جدول أكلات مقسم
- ✅ جميع الـ APIs تعمل

---

## 🎯 الخطوات التالية

1. تشغيل الـ seed script ✓
2. تسجيل الدخول بحسابات التجربة ✓
3. اختبار الـ APIs ✓
4. تطوير الـ Frontend ✓

---

**✨ Backend جاهز 100%!**
