import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  ar: {
    // Navbar
    navbar: {
      home: 'الرئيسية',
      search: 'البحث',
      history: 'السجل',
      coach: 'الخطط',
      subscriber: 'لوحة المشترك',
      account: 'حسابي',
      logout: 'تسجيل الخروج',
    },
    // Auth
    auth: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      name: 'الاسم',
      age: 'العمر',
      gender: 'الجنس',
      weight: 'الوزن (كجم)',
      height: 'الطول (سم)',
      activityLevel: 'مستوى النشاط',
      userType: 'نوع الحساب',
      subscriber: 'مشترك',
      coach: 'كوتش',
      male: 'ذكر',
      female: 'أنثى',
      sedentary: 'قليل جداً',
      light: 'قليل',
      moderate: 'متوسط',
      active: 'نشيط جداً',
      loginSuccess: 'تم تسجيل الدخول بنجاح',
      registerSuccess: 'تم إنشاء الحساب بنجاح',
      loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      registerError: 'البريد الإلكتروني مسجل بالفعل',
    },
    // Food Search
    food: {
      search: 'ابحث عن الطعام',
      searchPlaceholder: 'ابحث عن الطعام...',
      mealType: 'نوع الوجبة',
      all: 'الكل',
      breakfast: 'فطار',
      lunch: 'غداء',
      dinner: 'عشاء',
      snack: 'سناك',
      calories: 'السعرات الحرارية',
      protein: 'البروتين (جرام)',
      carbs: 'الكربوهيدرات (جرام)',
      fat: 'الدهون (جرام)',
      servingSize: 'حجم الحصة',
      add: 'إضافة',
    },
    // Meal Logging
    meal: {
      logMeal: 'تسجيل وجبة',
      mealLogged: 'تم تسجيل الوجبة بنجاح',
      quantity: 'الكمية',
      date: 'التاريخ',
      time: 'الوقت',
      delete: 'حذف',
      edit: 'تعديل',
      deleteConfirm: 'هل أنت متأكد من حذف هذه الوجبة؟',
      deletedSuccessfully: 'تم حذف الوجبة بنجاح',
      updatedSuccessfully: 'تم تحديث الوجبة بنجاح',
    },
    // History/Summary
    history: {
      title: 'سجل الوجبات',
      summary: 'ملخص الماكروز',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      totalCalories: 'إجمالي السعرات',
      totalProtein: 'إجمالي البروتين',
      totalCarbs: 'إجمالي الكربوهيدرات',
      totalFat: 'إجمالي الدهون',
      mealCount: 'عدد الوجبات',
      noMeals: 'لا توجد وجبات في هذه الفترة',
      filterByType: 'تصفية حسب النوع',
    },
    // Coach
    coach: {
      title: 'الخطط',
      myPlans: 'أنظمتي الغذائية',
      mySubscribers: 'مشتركوي',
      createPlan: 'إنشاء نظام جديد',
      planName: 'اسم النظام',
      description: 'الوصف',
      breakfastMeals: 'وجبات الفطار',
      lunchMeals: 'وجبات الغداء',
      dinnerMeals: 'وجبات العشاء',
      snackMeals: 'السناكات',
      dailyTargets: 'الأهداف اليومية',
      viewMeals: 'عرض الوجبات',
      assignPlan: 'تعيين النظام',
      editPlan: 'تعديل النظام',
      deletePlan: 'حذف النظام',
      createdSuccessfully: 'تم إنشاء النظام بنجاح',
      updatedSuccessfully: 'تم تحديث النظام بنجاح',
      deletedSuccessfully: 'تم حذف النظام بنجاح',
    },
    // Subscriber
    subscriber: {
      title: 'لوحة المشترك',
      myCoach: 'كوتشي',
      myPlan: 'نظامي الغذائي',
      noPlan: 'لا يوجد نظام غذائي معين',
      addMeal: 'إضافة وجبة',
      viewHistory: 'عرض السجل',
      mealsByType: 'الوجبات حسب النوع',
    },
    // General
    general: {
      cancel: 'إلغاء',
      save: 'حفظ',
      submit: 'إرسال',
      loading: 'جاري التحميل...',
      error: 'حدث خطأ',
      success: 'نجح',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
    },
    // Footer
    footer: {
      contactUs: 'اتصل بنا',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      followUs: 'تابعنا',
      allRights: 'جميع الحقوق محفوظة',
      about: 'عن التطبيق',
      aboutText: 'BEFIT تطبيق متكامل لتتبع التغذية واللياقة البدنية',
    },
  },
  en: {
    // Navbar
    navbar: {
      home: 'Home',
      search: 'Search',
      history: 'History',
      coach: 'Plans',
      subscriber: 'Subscriber Panel',
      account: 'Account',
      logout: 'Logout',
    },
    // Auth
    auth: {
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      age: 'Age',
      gender: 'Gender',
      weight: 'Weight (kg)',
      height: 'Height (cm)',
      activityLevel: 'Activity Level',
      userType: 'Account Type',
      subscriber: 'Subscriber',
      coach: 'Coach',
      male: 'Male',
      female: 'Female',
      sedentary: 'Sedentary',
      light: 'Light',
      moderate: 'Moderate',
      active: 'Very Active',
      loginSuccess: 'Logged in successfully',
      registerSuccess: 'Account created successfully',
      loginError: 'Invalid email or password',
      registerError: 'Email already registered',
    },
    // Food Search
    food: {
      search: 'Search Food',
      searchPlaceholder: 'Search for food...',
      mealType: 'Meal Type',
      all: 'All',
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      snack: 'Snack',
      calories: 'Calories',
      protein: 'Protein (g)',
      carbs: 'Carbs (g)',
      fat: 'Fat (g)',
      servingSize: 'Serving Size',
      add: 'Add',
    },
    // Meal Logging
    meal: {
      logMeal: 'Log Meal',
      mealLogged: 'Meal logged successfully',
      quantity: 'Quantity',
      date: 'Date',
      time: 'Time',
      delete: 'Delete',
      edit: 'Edit',
      deleteConfirm: 'Are you sure you want to delete this meal?',
      deletedSuccessfully: 'Meal deleted successfully',
      updatedSuccessfully: 'Meal updated successfully',
    },
    // History/Summary
    history: {
      title: 'Meal History',
      summary: 'Macro Summary',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      totalCalories: 'Total Calories',
      totalProtein: 'Total Protein',
      totalCarbs: 'Total Carbs',
      totalFat: 'Total Fat',
      mealCount: 'Meal Count',
      noMeals: 'No meals in this period',
      filterByType: 'Filter by Type',
    },
    // Coach
    coach: {
      title: 'Plans',
      myPlans: 'My Diet Plans',
      mySubscribers: 'My Subscribers',
      createPlan: 'Create New Plan',
      planName: 'Plan Name',
      description: 'Description',
      breakfastMeals: 'Breakfast Meals',
      lunchMeals: 'Lunch Meals',
      dinnerMeals: 'Dinner Meals',
      snackMeals: 'Snacks',
      dailyTargets: 'Daily Targets',
      viewMeals: 'View Meals',
      assignPlan: 'Assign Plan',
      editPlan: 'Edit Plan',
      deletePlan: 'Delete Plan',
      createdSuccessfully: 'Plan created successfully',
      updatedSuccessfully: 'Plan updated successfully',
      deletedSuccessfully: 'Plan deleted successfully',
    },
    // Subscriber
    subscriber: {
      title: 'Subscriber Panel',
      myCoach: 'My Coach',
      myPlan: 'My Diet Plan',
      noPlan: 'No diet plan assigned',
      addMeal: 'Add Meal',
      viewHistory: 'View History',
      mealsByType: 'Meals by Type',
    },
    // General
    general: {
      cancel: 'Cancel',
      save: 'Save',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
    },
    // Footer
    footer: {
      contactUs: 'Contact Us',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      followUs: 'Follow Us',
      allRights: 'All rights reserved',
      about: 'About',
      aboutText: 'BEFIT is a comprehensive app for nutrition and fitness tracking',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // جلب اللغة من localStorage
    const saved = localStorage.getItem('befit_language');
    return saved || 'ar';
  });

  useEffect(() => {
    // حفظ اللغة في localStorage و تطبيقها على الـ DOM
    localStorage.setItem('befit_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[language];
    for (const key of keys) {
      value = value[key];
      if (!value) return path;
    }
    return value;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
