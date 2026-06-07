# 🏋️ BEFIT - تطبيق متكامل للياقة والتغذية

## نظرة عامة

**BEFIT** هو تطبيق ويب متكامل يجمع بين:
- 🔍 **البحث عن الأطعمة** ومعرفة الماكروز
- 📊 **تتبع الوجبات** اليومية والإحصائيات
- 👨‍🏫 **نظام الكوتش** لإنشاء أنظمة غذائية
- 👤 **لوحة المشترك** لمتابعة النظام

مع دعم كامل للعربية والإنجليزية وتصميم احترافي Responsive!

---

## 🚀 البدء السريع

### المتطلبات
```
Node.js 16+
Python 3.9+
MongoDB 4.4+
npm
pip
```

### التثبيت

**1. استنسخ المشروع:**
```bash
git clone <repository-url>
cd final_gp_pro
```

**2. شغّل Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

**3. شغّل Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**4. افتح التطبيق:**
```
Frontend: http://localhost:5173
Backend:  http://localhost:8000
```

---

## 📋 الميزات الرئيسية

### 🔍 البحث والإضافة
- ابحث عن الأطعمة بسهولة
- شوف الماكروز (سعرات، بروتين، كارب، فات)
- أضف الوجبات مع تحديد الكمية والتاريخ

### 📈 التتبع والإحصائيات
- تتبع الوجبات يومي/أسبوعي/شهري
- ملخص الماكروز بشكل مرئي
- تقسيم الوجبات حسب النوع

### 👨‍🏫 لوحة الكوتش
- إنشاء أنظمة غذائية مخصصة
- إضافة مشتركين
- مراقبة سجل أكل المشتركين

### 👤 لوحة المشترك
- عرض النظام الغذائي الخاص بك
- متابعة الالتزام اليومي
- نصائح وتوجيهات

---

## 📱 الصفحات الرئيسية

| الصفحة | الرابط | الوصف |
|-------|--------|-------|
| الدخول | `/login` | تسجيل دخول المستخدمين |
| التسجيل | `/register` | إنشاء حساب جديد |
| الرئيسية | `/dashboard` | الصفحة الرئيسية |
| البحث | `/search` | 🔍 البحث والإضافة |
| السجل | `/history` | 📊 السجل والتحليلات |
| الكوتش | `/coach` | 👨‍🏫 لوحة الكوتش |
| المشترك | `/subscriber` | 👤 لوحة المشترك |

---

## 🎨 التصميم

### الألوان:
```
🟣 Primary: #667eea → #764ba2 (Purple Gradient)
🔴 Calories: #ff6b6b
🟢 Protein: #4ecdc4
🟠 Carbs: #ffa500
```

### الدعم:
- ✅ Responsive Design (Mobile, Tablet, Desktop)
- ✅ Dark Mode Support
- ✅ RTL/LTR (العربية والإنجليزية)
- ✅ Smooth Animations

---

## 🔗 الـ APIs

### المصادقة:
```
POST   /api/auth/register/       - إنشاء حساب
POST   /api/auth/login/          - دخول
PUT    /api/auth/users/{id}/     - تحديث البيانات
```

### الأطعمة:
```
GET    /api/foods/search/        - البحث
POST   /api/foods/predict/       - التعرف من الصورة
```

### الوجبات:
```
POST   /api/meals/log/           - تسجيل وجبة
GET    /api/meals/history/       - السجل
GET    /api/meals/summary/       - الملخص
DELETE /api/meals/{id}/          - حذف
PUT    /api/meals/{id}/update/   - تعديل
```

### النظام الغذائي:
```
POST   /api/diet-plans/          - إنشاء
GET    /api/diet-plans/list/     - العرض
PUT    /api/diet-plans/{id}/     - تعديل
DELETE /api/diet-plans/{id}/     - حذف
```

### الاشتراكات:
```
POST   /api/subscriptions/       - إضافة مشترك
GET    /api/subscriptions/list/  - العرض
PUT    /api/subscriptions/{id}/  - تحديث
GET    /api/subscriptions/{id}/history/ - الهستوري
```

---

## 📊 قاعدة البيانات

### Collections:
```
users              - المستخدمين
food_database      - الأطعمة
meal_logs          - الوجبات المسجلة
diet_plans         - الأنظمة الغذائية
coach_subscriptions - العلاقات الكوتش-مشترك
```

### مثال على بيانات:

**User:**
```json
{
  "_id": "...",
  "name": "أحمد",
  "email": "ahmed@example.com",
  "user_type": "subscriber",
  "language": "ar",
  "targets": {
    "daily_calories": 2500,
    "protein_g": 150,
    "carbs_g": 300,
    "fat_g": 70
  }
}
```

**Meal Log:**
```json
{
  "_id": "...",
  "user_id": "...",
  "food_name_ar": "دجاج مشوي",
  "meal_type": "lunch",
  "quantity": 150,
  "serving_unit": "gram",
  "calories_consumed": 247.5,
  "protein_consumed": 46.5,
  "date": "2026-06-01"
}
```

---

## 💻 التكنولوجيا المستخدمة

### Frontend:
- React 18
- Vite
- React Router
- Material-UI Icons
- CSS Grid & Flexbox

### Backend:
- Django
- Django REST Framework
- MongoDB
- PyMongo
- YOLO (التعرف على الطعام)

### Database:
- MongoDB

---

## 📖 التوثيق الإضافية

- 📄 [DIAGRAMS.md](./DIAGRAMS.md) - الرسوم التخطيطية وهيكل النظام (Architecture, ERD, User Flows)
- 📄 [DB_SCHEMA_PLAN.md](./DB_SCHEMA_PLAN.md) - خطة قاعدة البيانات
- 📄 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - توثيق الـ APIs
- 📄 [FRONTEND_DOCUMENTATION.md](./FRONTEND_DOCUMENTATION.md) - توثيق Frontend
- 📄 [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md) - ملخص شامل

---

## 🧪 الاختبار

### اختبار الميزات:

**1. إنشاء حساب:**
```
1. اذهب إلى /register
2. اختر "كوتش" أو "مشترك"
3. أدخل البيانات
4. انقر إنشاء حساب
```

**2. البحث والإضافة:**
```
1. اذهب إلى /search
2. ابحث عن "دجاج"
3. اختر طعام
4. أدخل الكمية والتاريخ
5. انقر إضافة
```

**3. عرض السجل:**
```
1. اذهب إلى /history
2. اختر الفترة الزمنية
3. شوف الملخص والتفاصيل
```

---

## 🔐 الأمان

- ✅ تشفير كلمات المرور (bcrypt)
- ✅ Validation على جميع المدخلات
- ✅ CORS محدود
- ✅ محمي من XSS و SQL Injection
- ✅ Authentication عبر localStorage

---

## 📱 التوافقية

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Windows, Mac, Linux
- ✅ Mobile (iOS, Android)
- ✅ Tablet

---

## 🤝 المساهمة

نرحب بالمساهمات! يمكنك:
1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الـ branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

---


## 🎯 خارطة الطريق

- [x] Phase 1: i18n + Navbar + Footer
- [x] Phase 2: البحث والسجل
- [x] Phase 3: الكوتش والمشترك
- [ ] الرسوم البيانية والتحليلات المتقدمة
- [ ] تطبيق Mobile
- [ ] نظام التنبيهات
- [ ] برنامج التمارين

---


## 📈 الإحصائيات

- ✅ 12 صفحة React
- ✅ 23 API Endpoint
- ✅ 5 Database Collections
- ✅ دعم عربي كامل
- ✅ Responsive Design
- ✅ +4,800 سطر كود Frontend
- ✅ +865 سطر كود Backend

---

**آخر تحديث: 2026/06/01**
**الإصدار: v1.0.0**


