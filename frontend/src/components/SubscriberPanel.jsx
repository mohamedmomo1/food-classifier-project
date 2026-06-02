import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './SubscriberPanel.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function SubscriberPanel() {
  const { t } = useLanguage();
  const [coach, setCoach] = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [todayMeals, setTodayMeals] = useState({
    breakfast: { meals: [], total_calories: 0 },
    lunch: { meals: [], total_calories: 0 },
    dinner: { meals: [], total_calories: 0 },
    snack: { meals: [], total_calories: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('all');

  const user = JSON.parse(localStorage.getItem('befit_user') || '{}');

  useEffect(() => {
    if (user.user_type !== 'subscriber') {
      setError('هذه الصفحة للمشتركين فقط');
      return;
    }
    fetchCoachAndPlan();
    fetchTodayMeals();
  }, []);

  const fetchCoachAndPlan = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ subscriber_id: user.id });
      const response = await fetch(`${API_BASE_URL}/subscriptions/list/?${params}`);
      const data = await response.json();

      if (data.success && data.subscriptions.length > 0) {
        const subscription = data.subscriptions[0];
        setCoach(subscription);

        // جلب النظام الغذائي إذا وجد
        if (subscription.diet_plan_id) {
          fetchDietPlan(subscription.diet_plan_id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDietPlan = async (planId) => {
    try {
      // نحتاج لـ API جديد لجلب خطة محددة - للآن نستخدم البيانات من subscription
      // يمكن تحديثها لاحقاً
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTodayMeals = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params = new URLSearchParams({
        user_id: user.id,
        period: 'daily',
        date: today,
      });

      const response = await fetch(`${API_BASE_URL}/meals/summary/?${params}`);
      const data = await response.json();

      if (data.success) {
        // جلب الوجبات الكاملة
        const mealParams = new URLSearchParams({
          user_id: user.id,
          start_date: today,
          end_date: today,
        });

        const mealsResponse = await fetch(
          `${API_BASE_URL}/meals/history/?${mealParams}`
        );
        const mealsData = await mealsResponse.json();

        if (mealsData.success) {
          const grouped = {
            breakfast: { meals: [], total_calories: 0 },
            lunch: { meals: [], total_calories: 0 },
            dinner: { meals: [], total_calories: 0 },
            snack: { meals: [], total_calories: 0 },
          };

          mealsData.meals.forEach((meal) => {
            const mealType = meal.meal_type || 'snack';
            if (grouped[mealType]) {
              grouped[mealType].meals.push(meal);
              grouped[mealType].total_calories += meal.calories_consumed;
            }
          });

          setTodayMeals(grouped);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateComplianceScore = () => {
    if (!coach || !dietPlan) return null;

    const totalTarget = dietPlan.daily_targets?.calories || 0;
    const totalConsumed = Object.values(todayMeals).reduce(
      (sum, m) => sum + m.total_calories,
      0
    );

    if (totalTarget === 0) return null;

    const percentage = (totalConsumed / totalTarget) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  const getMealTypeEmoji = (type) => {
    const emojis = {
      breakfast: '🌅',
      lunch: '🌞',
      dinner: '🌙',
      snack: '🍿',
    };
    return emojis[type] || '🍽️';
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: 'فطار',
      lunch: 'غداء',
      dinner: 'عشاء',
      snack: 'سناك',
    };
    return labels[type] || type;
  };

  return (
    <div className="subscriber-panel-container">
      <div className="subscriber-header">
        <h1>📊 لوحة المشترك</h1>
        <p>متابعة نظامك الغذائي والالتزام بأهدافك</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">جاري التحميل...</div>
      ) : coach ? (
        <>
          {/* Coach Info */}
          <div className="coach-info-card">
            <h2>👨‍🏫 معلومات كوتشك</h2>
            <p>
              <strong>الحالة:</strong> {coach.status === 'active' ? '✅ نشط' : '⏸️ معلق'}
            </p>
            <p>
              <strong>تاريخ البداية:</strong>{' '}
              {new Date(coach.start_date).toLocaleDateString('ar-EG')}
            </p>
            {coach.diet_plan_id ? (
              <div className="plan-info">
                <h3>📋 نظامك الغذائي معين</h3>
                <p>✅ لديك نظام غذائي مخصص من كوتشك</p>
              </div>
            ) : (
              <div className="no-plan">
                <p>⏳ لم يتم تعيين نظام غذائي بعد</p>
              </div>
            )}
          </div>

          {/* Today's Summary */}
          <div className="today-summary">
            <h2>📈 ملخص اليوم</h2>
            <div className="summary-grid">
              <div className="summary-card calories-card">
                <span className="icon">🔥</span>
                <div className="content">
                  <p className="label">السعرات المستهلكة</p>
                  <p className="value">
                    {Object.values(todayMeals).reduce(
                      (sum, m) => sum + m.total_calories,
                      0
                    )}{' '}
                    kcal
                  </p>
                </div>
              </div>

              <div className="summary-card meals-card">
                <span className="icon">🍽️</span>
                <div className="content">
                  <p className="label">عدد الوجبات</p>
                  <p className="value">
                    {Object.values(todayMeals).reduce(
                      (sum, m) => sum + m.meals.length,
                      0
                    )}
                  </p>
                </div>
              </div>

              <div className="summary-card compliance-card">
                <span className="icon">✅</span>
                <div className="content">
                  <p className="label">الالتزام</p>
                  <p className="value">
                    {calculateComplianceScore()
                      ? `${calculateComplianceScore()}%`
                      : 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meals by Type */}
          <div className="meals-section">
            <div className="section-header">
              <h2>اليوم بالتفصيل</h2>
            </div>

            <div className="meals-by-type">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <div key={type} className="meal-type-card">
                  <div className="meal-header">
                    <h3>
                      {getMealTypeEmoji(type)} {getMealTypeLabel(type)}
                    </h3>
                    <span className="meal-calories">
                      {todayMeals[type].total_calories.toFixed(0)} سعرة
                    </span>
                  </div>

                  <div className="meal-content">
                    {todayMeals[type].meals.length > 0 ? (
                      <ul className="meals-list">
                        {todayMeals[type].meals.map((meal) => (
                          <li key={meal._id} className="meal-item">
                            <span className="food-name">
                              {meal.food_name_ar || meal.food_name}
                            </span>
                            <span className="meal-macros">
                              {meal.calories_consumed.toFixed(0)}kcal •{' '}
                              {meal.protein_consumed.toFixed(1)}g بروتين
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-meals">لم تسجل أي وجبات حتى الآن</p>
                    )}
                  </div>

                  <button className="btn-add-meal">
                    ➕ أضف وجبة {getMealTypeLabel(type)}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Progress */}
          <div className="compliance-section">
            <h2>📊 مدى الالتزام</h2>
            <div className="compliance-card">
              <div className="progress-info">
                <p>
                  <strong>هدفك اليومي:</strong> 2500 سعرة حرارية{' '}
                  <em>(يمكن تخصيصه حسب نظامك)</em>
                </p>
                <p>
                  <strong>المستهلك حتى الآن:</strong>
                  {Object.values(todayMeals).reduce(
                    (sum, m) => sum + m.total_calories,
                    0
                  )}{' '}
                  سعرة
                </p>
              </div>

              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min(
                      (Object.values(todayMeals).reduce(
                        (sum, m) => sum + m.total_calories,
                        0
                      ) /
                        2500) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="compliance-tips">
                <h3>💡 نصائح</h3>
                <ul>
                  <li>احرص على تنويع الوجبات</li>
                  <li>سجل وجباتك بانتظام</li>
                  <li>اتبع النظام الغذائي الموصى به</li>
                  <li>اشرب الكثير من الماء</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-secondary">
              📊 عرض تقرير شامل
            </button>
            <button className="btn-secondary">
              📞 تواصل مع كوتشك
            </button>
          </div>
        </>
      ) : (
        <div className="no-coach-state">
          <h2>⏳ لا توجد اشتراك نشط</h2>
          <p>يرجى التواصل مع كوتش لبدء برنامج اللياقة البدنية</p>
        </div>
      )}
    </div>
  );
}
