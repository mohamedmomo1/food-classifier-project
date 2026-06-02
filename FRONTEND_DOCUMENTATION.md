# BEFIT Frontend Structure & i18n Documentation

## 🌐 Language System (i18n)

### ملفات الترجمة

**المسار:** `src/context/LanguageContext.jsx`

### المميزات:
✅ **localStorage Integration** - حفظ اللغة المفضلة تلقائياً
✅ **RTL Support** - دعم العربية من اليمين لليسار
✅ **Context API** - توفير اللغات لجميع Components
✅ **Dynamic Language Toggle** - التبديل بين العربية والإنجليزية فوراً

### الاستخدام:

```jsx
import { useLanguage } from '../context/LanguageContext';

function MyComponent() {
  const { t, language, toggleLanguage } = useLanguage();
  
  return (
    <div>
      <p>{t('navbar.home')}</p> {/* سيعرض "الرئيسية" أو "Home" */}
      <button onClick={toggleLanguage}>
        {language === 'ar' ? 'EN' : 'عربي'}
      </button>
    </div>
  );
}
```

### كيفية إضافة ترجمات جديدة:

في `LanguageContext.jsx`، اضف في `translations` object:

```javascript
export const translations = {
  ar: {
    mySection: {
      myKey: 'النص العربي'
    }
  },
  en: {
    mySection: {
      myKey: 'English Text'
    }
  }
};
```

ثم استخدمها:
```jsx
const { t } = useLanguage();
<p>{t('mySection.myKey')}</p>
```

---

## 🎨 Frontend Components

### 1. **Navbar** (`components/Navbar.jsx`)

**المسؤوليات:**
- عرض اسم وشعار BEFIT
- روابط التنقل الرئيسية
- زر تبديل اللغة
- عرض بيانات المستخدم
- زر تسجيل الخروج

**Props:** None (يقرأ من localStorage و useLocation)

**مثال:**
```jsx
<Navbar />
```

### 2. **Footer** (`components/Footer.jsx`)

**المسؤوليات:**
- معلومات التواصل (بريد، هاتف، عنوان)
- روابط التواصل الاجتماعي
- روابط سريعة (Privacy, Terms, FAQ)
- حقوق النشر

**Props:** None

### 3. **App Layout** (`App.jsx`)

البنية الأساسية:
```
<LanguageProvider>
  <BrowserRouter>
    <App>
      <Navbar />
      <main className="app-main">
        <Routes>...</Routes>
      </main>
      <Footer />
    </App>
  </BrowserRouter>
</LanguageProvider>
```

---

## 📁 مسارات الملفات (Frontend)

```
src/
├── context/
│   └── LanguageContext.jsx          # نظام الترجمة والتبديل
├── components/
│   ├── Navbar.jsx                   # الشريط العلوي
│   ├── Navbar.css
│   ├── Footer.jsx                   # الفوتر السفلي
│   ├── Footer.css
│   ├── Register.jsx                 # صفحة التسجيل
│   ├── Login.jsx                    # صفحة الدخول
│   ├── Dashboard.jsx                # الصفحة الرئيسية
│   ├── FoodClassifier.jsx           # تحديد الطعام من الصورة
│   ├── FoodSearch.jsx               # البحث عن الطعام (جديد)
│   ├── MealHistory.jsx              # سجل الوجبات (جديد)
│   ├── CoachPanel.jsx               # لوحة الكوتش (جديد)
│   └── SubscriberPanel.jsx          # لوحة المشترك (جديد)
├── App.jsx                          # التطبيق الرئيسي
├── App.css
├── main.jsx                         # نقطة الدخول
└── index.css                        # الأنماط العامة
```

---

## 🗂️ البيانات المخزنة محلياً (localStorage)

```javascript
// بيانات المستخدم
localStorage.getItem('befit_user')
// { id, name, email, user_type, language, calories_target }

// معرف الجلسة
localStorage.getItem('befit_token')
// JWT أو session ID

// اللغة المفضلة
localStorage.getItem('befit_language')
// 'ar' أو 'en'
```

---

## 🔄 تدفق اللغة (Language Flow)

```
1. المستخدم يفتح التطبيق
   ↓
2. LanguageContext يقرأ من localStorage
   ↓
3. إذا لم توجد لغة محفوظة → استخدم 'ar' (العربية افتراضياً)
   ↓
4. تطبيق اللغة على document.documentElement
   ↓
5. جميع Components تحصل على اللغة عبر useLanguage()
   ↓
6. عند تبديل اللغة:
   - حفظ في localStorage
   - تحديث document.lang و dir
   - إعادة عرض جميع النصوص
```

---

## 🎯 CSS Responsive Design

### Breakpoints:
- **Desktop:** > 1024px
- **Tablet:** 768px - 1024px
- **Mobile:** 480px - 768px
- **Small Mobile:** < 480px

### مثال في CSS:
```css
@media (max-width: 768px) {
  /* Tablet styles */
}

@media (max-width: 480px) {
  /* Mobile styles */
}
```

---

## 🚀 الصفحات المتبقية (للمرحلة القادمة)

1. **FoodSearch** - صفحة البحث عن الطعام
   - واجهة بحث مع فلاتر (حسب نوع الوجبة)
   - عرض النتائج مع الماكروز
   - زر إضافة الوجبة

2. **MealHistory** - صفحة السجل والتجميعات
   - مختار الفترة الزمنية (يومي/أسبوعي/شهري)
   - عرض الوجبات المسجلة
   - ملخص الماكروز (كالوريز، بروتين، كارب، فات)
   - تصفية حسب نوع الوجبة

3. **CoachPanel** - لوحة الكوتش
   - عرض الأنظمة الغذائية
   - إنشاء نظام جديد
   - عرض المشتركين
   - مراقبة أكل المشتركين

4. **SubscriberPanel** - لوحة المشترك
   - عرض النظام الغذائي الحالي
   - تسجيل الوجبات اليومية
   - عرض السجل والإحصائيات

---

## 🔐 ملاحظات أمان مهمة

- ✅ حفظ الـ token في localStorage (مؤقتاً - يمكن تحسينه لاحقاً)
- ✅ التحقق من وجود المستخدم قبل عرض بيانات حساسة
- ✅ تنظيف localStorage عند تسجيل الخروج
- ⚠️ يجب إضافة middleware للتحقق من الـ token من الـ Backend

---

## 📱 Mobile First Approach

جميع الـ Components مصممة بـ Mobile First:
1. CSS يبدأ بتصميم الموبايل
2. Media queries للأحجام الأكبر
3. Hamburger menu للموبايل
4. Flexible layouts

---

## 🌙 Dark Mode Support

الموقع يدعم الـ Dark Mode تلقائياً عبر:
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

يمكن للمستخدم تغيير الثيم من إعدادات النظام.

---

## 📊 الروابط الرئيسية

- `/` → تحويل إلى `/login`
- `/login` → صفحة الدخول
- `/register` → صفحة التسجيل
- `/dashboard` → الصفحة الرئيسية
- `/classifier` → تحديد الطعام من الصورة
- `/search` → البحث عن الطعام (جديد)
- `/history` → سجل الوجبات (جديد)
- `/coach` → لوحة الكوتش (جديد)
- `/subscriber` → لوحة المشترك (جديد)
