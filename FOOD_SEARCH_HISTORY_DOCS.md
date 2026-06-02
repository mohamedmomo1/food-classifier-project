# 🎯 Food Search & Meal History Pages - Documentation

## 📄 الصفحات الجديدة

### 1️⃣ **Food Search Page** (`/search`)

**الملفات:**
- `src/components/FoodSearch.jsx` (280 lines)
- `src/components/FoodSearch.css` (350 lines)

#### 🎨 المميزات:

1. **واجهة البحث المتقدمة:**
   - حقل بحث نصي (search by name)
   - فلتر حسب نوع الوجبة (breakfast/lunch/dinner/snack)
   - زر بحث مع loading state

2. **عرض النتائج في Grid:**
   - صورة الطعام (placeholder إذا لم توجد)
   - اسم الطعام (العربية)
   - نوع الوجبة (badge ملون)
   - الماكروز الأساسية:
     - 🔥 السعرات الحرارية
     - 🥚 البروتين (جرام)
     - 🌾 الكربوهيدرات (جرام)
     - 🧈 الدهون (جرام)
   - حجم الحصة (serving unit)
   - زر الإضافة

3. **Modal لتسجيل الوجبة:**
   - معاينة الطعام المختار
   - إدخال الكمية (مع أزرار +/-)
   - اختيار نوع الوجبة
   - اختيار التاريخ
   - معاينة الماكروز المتناول
   - زر الإرسال/الإلغاء

#### 📡 الـ API Calls:

```javascript
// البحث عن الأطعمة
GET /api/foods/search/?query=دجاج&meal_type=lunch

// تسجيل الوجبة
POST /api/meals/log/
{
  user_id, food_id, quantity, meal_type, date
}
```

#### 🎯 User Flow:

```
1. المستخدم يدخل الكلمة المفتاحية
2. يختار نوع الوجبة (optional)
3. يضغط البحث
4. تظهر النتائج في grid
5. يختار طعام ويضغط "إضافة"
6. يظهر modal لإدخال التفاصيل
7. يضغط "إرسال"
8. تسجيل الوجبة + رسالة نجاح
```

---

### 2️⃣ **Meal History Page** (`/history`)

**الملفات:**
- `src/components/MealHistory.jsx` (320 lines)
- `src/components/MealHistory.css` (380 lines)

#### 🎨 المميزات:

1. **اختيار الفترة الزمنية:**
   - يومي (Daily) - يوم واحد
   - أسبوعي (Weekly) - أسبوع كامل
   - شهري (Monthly) - شهر كامل

2. **تحديد التاريخ:**
   - date picker لاختيار التاريخ
   - يتغير النطاق حسب الفترة المختارة

3. **تصفية حسب نوع الوجبة:**
   - الكل (All)
   - فطار (Breakfast)
   - غداء (Lunch)
   - عشاء (Dinner)
   - سناك (Snack)

4. **ملخص الماكروز (Summary Cards):**
   - 4 بطاقات ملونة:
     - 🔥 إجمالي السعرات (أحمر)
     - 🥚 إجمالي البروتين (أزرق مخضر)
     - 🌾 إجمالي الكربوهيدرات (برتقالي)
     - 🧈 إجمالي الدهون (بنفسجي)
   - عدد الوجبات الإجمالي

5. **الوجبات مقسمة حسب النوع:**
   - رؤوس أقسام لكل نوع وجبة
   - عدد الوجبات في كل قسم
   - إجمالي السعرات لكل قسم
   - قائمة الوجبات:
     - اسم الطعام
     - الكمية والوحدة
     - الماكروز المستهلك (مختصر)
     - زر حذف الوجبة

6. **حالات خاصة:**
   - رسالة عند عدم وجود وجبات
   - loading state
   - error handling

#### 📡 الـ API Calls:

```javascript
// جلب الملخص
GET /api/meals/summary/?user_id=&period=daily&date=&meal_type=

// جلب سجل الوجبات
GET /api/meals/history/?user_id=&start_date=&end_date=

// حذف وجبة
DELETE /api/meals/{meal_id}/
```

#### 🎯 Data Flow:

```
1. عند فتح الصفحة:
   - جلب الملخص (summary) مع التاريخ الحالي
   - جلب قائمة الوجبات الكاملة
   - تقسيم الوجبات حسب النوع

2. عند تغيير الفترة الزمنية:
   - تحديث الملخص تلقائياً
   - تحديث قوائم الوجبات

3. عند تغيير التاريخ:
   - إعادة حساب الفترة (إذا كانت أسبوعي أو شهري)
   - تحديث جميع البيانات

4. عند حذف وجبة:
   - تأكيد من المستخدم
   - حذف من الـ Backend
   - تحديث الملخص والقوائم
```

---

## 🎨 التصميم والألوان

### Summary Cards Gradient:
```css
.calories   → #ff6b6b to #ee5a6f (red)
.protein    → #4ecdc4 to #44a08d (teal)
.carbs      → #ffa500 to #ff8c00 (orange)
.fat        → #667eea to #764ba2 (purple)
```

### Responsive Design:
- **Desktop:** Grid متعدد الأعمدة
- **Tablet:** 2-3 أعمدة
- **Mobile:** عمود واحد
- **Small Mobile:** optimized layout

---

## 📱 Mobile Optimization

1. **Food Search:**
   - Search input على سطر واحد
   - Grid يتحول إلى عمود واحد
   - Modal يأخذ 95% من الشاشة

2. **Meal History:**
   - Filters تتكدس عمودياً
   - Summary cards 2x2 بدل 1x4
   - Meals list سهلة التمرير

---

## ⚙️ التعديلات على الملفات الموجودة

### `App.jsx`:
```jsx
// أضفنا routes جديد
<Route path="/search" element={<FoodSearch />} />
<Route path="/history" element={<MealHistory />} />
```

### `Navbar.jsx`:
```jsx
// أضفنا شرط isLoggedIn للروابط
const navLinks = [
  { path: '/search', label: t('navbar.search'), show: isLoggedIn },
  { path: '/history', label: t('navbar.history'), show: isLoggedIn },
  ...
];
```

---

## 🔐 Security & Validation

✅ **Authentication Check:**
- التحقق من وجود `user.id` قبل أي عملية
- إعادة توجيه إلى تسجيل الدخول إذا لزم الأمر

✅ **Input Validation:**
- التحقق من الكمية (> 0)
- التحقق من التاريخ (تنسيق صحيح)
- تنظيف البيانات قبل الإرسال

✅ **Error Handling:**
- رسائل خطأ واضحة
- Try-catch على جميع API calls
- Loading states للتجربة الجيدة

---

## 📊 مثال على البيانات المتوقعة

### Response من `/api/foods/search/`:
```json
{
  "success": true,
  "foods": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Pizza",
      "name_ar": "بيتزا",
      "calories": 285,
      "protein": 12,
      "carbs": 36,
      "fat": 10,
      "serving_unit": "slice",
      "meal_type": "dinner",
      "image_url": ""
    }
  ]
}
```

### Response من `/api/meals/summary/`:
```json
{
  "success": true,
  "summary": {
    "total_calories": 2150.5,
    "total_protein": 145.3,
    "total_carbs": 280.7,
    "total_fat": 65.2,
    "meal_count": 4
  }
}
```

---

## 🎯 الخطوات التالية

1. **صفحات الكوتش والمشترك** (Coach & Subscriber Panels)
   - لوحة الكوتش لإنشاء الأنظمة الغذائية
   - لوحة المشترك لمتابعة النظام

2. **تحسينات إضافية:**
   - إضافة الرسوم البيانية (charts)
   - نظام التنبيهات
   - حفظ المفضلة

---

## 📋 Checklist

- ✅ واجهة البحث
- ✅ عرض النتائج
- ✅ Modal لتسجيل الوجبة
- ✅ API integration
- ✅ صفحة السجل والتجميعات
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ i18n support

---

**إجمالي الأسطر:** ~950 سطر
**الملفات الجديدة:** 4 ملفات
**التحديثات:** 2 ملفات

🎉 **النتيجة: تطبيق متكامل لتتبع الوجبات بواجهة سهلة الاستخدام!**
