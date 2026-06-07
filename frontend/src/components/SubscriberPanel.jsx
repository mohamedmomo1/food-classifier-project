import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import './SubscriberPanel.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function SubscriberPanel() {
  const { t, language } = useLanguage();
  const toast = useToast();
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

  // Search & Subscribe states
  const [searchPlanName, setSearchPlanName] = useState('');
  const [foundPlan, setFoundPlan] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Comprehensive Report Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/diet-plans/list/?plan_id=${planId}`);
      const data = await response.json();
      if (data.success && data.plans.length > 0) {
        setDietPlan(data.plans[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchPlan = async (e) => {
    e.preventDefault();
    if (!searchPlanName.trim()) return;
    setSearchError('');
    setFoundPlan(null);
    try {
      const response = await fetch(`${API_BASE_URL}/diet-plans/list/`);
      const data = await response.json();
      if (data.success && data.plans.length > 0) {
        const searchInput = searchPlanName.trim().toLowerCase();
        const found = data.plans.find(plan => 
          (plan.plan_name || plan.name || '').toLowerCase().includes(searchInput)
        );
        if (found) {
          setFoundPlan(found);
        } else {
          setSearchError(language === 'ar' ? 'لم يتم العثور على خطة بهذا الاسم' : 'No plan found with this name');
        }
      } else {
        setSearchError(language === 'ar' ? 'لم يتم العثور على خطة بهذا الاسم' : 'No plan found with this name');
      }
    } catch (err) {
      console.error(err);
      setSearchError(language === 'ar' ? 'حدث خطأ في البحث' : 'Error searching plan');
    }
  };

  const handleSubscribe = async (plan) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: plan.coach_id,
          subscriber_id: user.id,
          diet_plan_id: plan._id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(language === 'ar' ? 'تم الاشتراك في الخطة بنجاح!' : 'Successfully subscribed to the plan!');
        
        // Update user in localStorage to include coach_id
        const updatedUser = { ...user, coach_id: plan.coach_id };
        localStorage.setItem('befit_user', JSON.stringify(updatedUser));
        
        // Re-fetch to render active subscription dashboard
        await fetchCoachAndPlan();
        await fetchTodayMeals();
      } else {
        toast.error(data.error || 'Error subscribing');
      }
    } catch (err) {
      console.error(err);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الاشتراك' : 'Error subscribing');
    } finally {
      setSubmitting(false);
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

          mealsData.meals.forEach((session) => {
            const mealType = session.meal_type || 'snack';
            if (grouped[mealType]) {
              if (session.items && Array.isArray(session.items)) {
                session.items.forEach((item) => {
                  grouped[mealType].meals.push(item);
                });
              }
              grouped[mealType].total_calories += session.total_calories || 0;
            }
          });

          setTodayMeals(grouped);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelSubscription = () => {
    toast.confirm(
      language === 'ar' ? 'هل أنت متأكد من إلغاء اشتراكك؟' : 'Are you sure you want to cancel your subscription?',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/subscriptions/${user.id}/cancel/`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (data.success) {
            toast.success(language === 'ar' ? 'تم إلغاء الاشتراك بنجاح' : 'Subscription canceled successfully');
            
            // Update user in localStorage
            const updatedUser = { ...user };
            delete updatedUser.coach_id;
            localStorage.setItem('befit_user', JSON.stringify(updatedUser));
            
            setCoach(null);
            setDietPlan(null);
          } else {
            toast.error(data.error || 'Error canceling subscription');
          }
        } catch (err) {
          console.error(err);
          toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
        }
      }
    );
  };


  const fetchReportData = async () => {
    setReportLoading(true);
    try {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = today.toISOString().split('T')[0];
      
      const params = new URLSearchParams({
        user_id: user.id,
        start_date: startDateStr,
        end_date: endDateStr,
      });

      const response = await fetch(`${API_BASE_URL}/meals/history/?${params}`);
      const data = await response.json();
      
      if (data.success) {
        const meals = data.meals || [];
        
        // Calculate report metrics
        const dailySummaryMap = {};
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;
        
        // Populate days
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          dailySummaryMap[dateStr] = 0;
        }

        meals.forEach((session) => {
          const dStr = session.date.split('T')[0];
          if (dailySummaryMap[dStr] !== undefined) {
            dailySummaryMap[dStr] += session.total_calories || 0;
          }
          totalCalories += session.total_calories || 0;
          totalProtein += session.total_protein || 0;
          totalCarbs += session.total_carbs || 0;
          totalFat += session.total_fat || 0;
        });

        // Calculate compliance rate (days where consumed calories are within 85-115% of target)
        const targetCalories = dietPlan?.daily_targets?.calories || 2500;
        let compliantDaysCount = 0;
        Object.entries(dailySummaryMap).forEach(([date, calories]) => {
          if (calories > 0) {
            const pct = (calories / targetCalories) * 100;
            if (pct >= 85 && pct <= 115) {
              compliantDaysCount++;
            }
          }
        });

        const activeDaysCount = Object.values(dailySummaryMap).filter(val => val > 0).length || 1;
        
        setReportData({
          complianceRate: Math.round((compliantDaysCount / 30) * 100),
          avgCalories: Math.round(totalCalories / 30),
          avgProtein: Math.round(totalProtein / 30),
          avgCarbs: Math.round(totalCarbs / 30),
          avgFat: Math.round(totalFat / 30),
          loggedDays: activeDaysCount,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (showReportModal) {
      fetchReportData();
    }
  }, [showReportModal]);

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
      breakfast: language === 'ar' ? 'فطار' : 'Breakfast',
      lunch: language === 'ar' ? 'غداء' : 'Lunch',
      dinner: language === 'ar' ? 'عشاء' : 'Dinner',
      snack: language === 'ar' ? 'سناك' : 'Snack',
    };
    return labels[type] || type;
  };

  const renderPlanSearch = () => (
    <div className="plan-search-section" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: 'var(--code-bg)', padding: '2rem', borderRadius: '12px', border: '2px solid var(--border)' }}>
      <h2>{language === 'ar' ? '🔍 ابحث عن خطة غذائية' : '🔍 Search Diet Plans'}</h2>
      <p style={{ color: 'var(--text)', marginBottom: '2rem' }}>
        {language === 'ar' ? 'ابحث عن نظام غذائي بالاسم للاشتراك مع الكوتش وبدء برنامجك اللياقي:' : 'Search for a diet plan by name to subscribe and start your fitness program:'}
      </p>

      <form onSubmit={handleSearchPlan} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          value={searchPlanName}
          onChange={(e) => setSearchPlanName(e.target.value)}
          placeholder={language === 'ar' ? 'أدخل اسم الخطة للبحث...' : 'Enter plan name...'}
          style={{
            flex: 1,
            padding: '0.8rem',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--bg)',
            color: 'var(--text-h)',
            fontSize: '1rem'
          }}
        />
        <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {language === 'ar' ? '🔍 بحث' : '🔍 Search'}
        </button>
      </form>

      {searchError && (
        <div style={{ color: '#c33', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          {searchError}
        </div>
      )}

      {foundPlan && (
        <div className="plan-card" style={{ background: 'var(--bg)', border: '2px solid #667eea', borderRadius: '12px', padding: '1.5rem', textAlign: language === 'ar' ? 'right' : 'left', marginTop: '1.5rem', boxShadow: '0 8px 30px rgba(102, 126, 234, 0.15)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-h)', fontSize: '1.4rem' }}>{foundPlan.name}</h3>
          <p style={{ color: 'var(--text)', marginBottom: '1rem' }}>{foundPlan.description}</p>
          
          <div className="plan-targets" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', padding: '1rem', background: 'var(--code-bg)', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div className="target" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{language === 'ar' ? 'السعرات:' : 'Calories:'}</span>
              <strong style={{ fontSize: '1.1rem', color: '#667eea' }}>{foundPlan.daily_targets?.calories || 0} kcal</strong>
            </div>
            <div className="target" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{language === 'ar' ? 'بروتين:' : 'Protein:'}</span>
              <strong style={{ fontSize: '1.1rem', color: '#667eea' }}>{foundPlan.daily_targets?.protein || 0}g</strong>
            </div>
            <div className="target" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{language === 'ar' ? 'كارب:' : 'Carbs:'}</span>
              <strong style={{ fontSize: '1.1rem', color: '#667eea' }}>{foundPlan.daily_targets?.carbs || 0}g</strong>
            </div>
            <div className="target" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{language === 'ar' ? 'فات:' : 'Fat:'}</span>
              <strong style={{ fontSize: '1.1rem', color: '#667eea' }}>{foundPlan.daily_targets?.fat || 0}g</strong>
            </div>
          </div>

          <button 
            onClick={() => handleSubscribe(foundPlan)}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting 
              ? (language === 'ar' ? '⏳ جاري الاشتراك...' : '⏳ Subscribing...')
              : (language === 'ar' ? '🤝 اشترك الآن في هذه الخطة' : '🤝 Subscribe to this Plan')}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="subscriber-panel-container">
      <div className="subscriber-header">
        <h2 className="header-title">{language === 'ar' ? '📊 لوحة المشترك' : '📊 Subscriber Dashboard'}</h2>
        <p className="header-subtitle">{language === 'ar' ? 'متابعة نظامك الغذائي والالتزام بأهدافك' : 'Monitor your diet plan and stay committed to your goals'}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : (coach && dietPlan) ? (
        <>
          {/* Subscription Banner */}
          <div className="subscription-banner" style={{
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {language === 'ar' 
              ? `الخطة الحالية: ${dietPlan.name} | تصميم الكوتش: ${coach.coach_name || 'غير معروف'}`
              : `Current Plan: ${dietPlan.name} | Created by Coach: ${coach.coach_name || 'Unknown'}`
            }
          </div>

          {/* Coach Info */}
          <div className="coach-info-card">
            <h2>{language === 'ar' ? '👨‍🏫 معلومات كوتشك' : '👨‍🏫 Coach Information'}</h2>
            <p>
              <strong>{language === 'ar' ? 'الحالة:' : 'Status:'}</strong> {coach.status === 'active' ? (language === 'ar' ? '✅ نشط' : '✅ Active') : (language === 'ar' ? '⏸️ معلق' : '⏸️ Suspended')}
            </p>
            <p>
              <strong>{language === 'ar' ? 'تاريخ البداية:' : 'Start Date:'}</strong>{' '}
              {new Date(coach.start_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </p>
            {coach.diet_plan_id ? (
              <div className="plan-info">
                <h3>{language === 'ar' ? '📋 نظامك الغذائي معين' : '📋 Assigned Diet Plan'}</h3>
                <p>{language === 'ar' ? '✅ لديك نظام غذائي مخصص من كوتشك' : '✅ You have a customized diet plan assigned by your coach'}</p>
              </div>
            ) : (
              <div className="no-plan">
                <p>{language === 'ar' ? '⏳ لم يتم تعيين نظام غذائي بعد' : '⏳ No diet plan assigned yet'}</p>
              </div>
            )}
          </div>

          {/* Today's Summary */}
          <div className="today-summary">
            <h2>{language === 'ar' ? '📈 ملخص اليوم' : '📈 Today\'s Summary'}</h2>
            <div className="summary-grid">
              <div className="summary-card calories-card">
                <span className="icon">🔥</span>
                <div className="content">
                  <p className="label">{language === 'ar' ? 'السعرات المستهلكة' : 'Calories Consumed'}</p>
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
                  <p className="label">{language === 'ar' ? 'عدد الوجبات' : 'Total Meals'}</p>
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
                  <p className="label">{language === 'ar' ? 'الالتزام' : 'Compliance'}</p>
                  <p className="value">
                    {calculateComplianceScore()
                      ? `${calculateComplianceScore()}%`
                      : (language === 'ar' ? 'غير محدد' : 'Not defined')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meals by Type */}
          <div className="meals-section">
            <div className="section-header">
              <h2>{language === 'ar' ? 'اليوم بالتفصيل' : 'Today\'s Details'}</h2>
            </div>

            <div className="meals-by-type">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <div key={type} className="meal-type-card">
                  <div className="meal-header">
                    <h3>
                      {getMealTypeEmoji(type)} {getMealTypeLabel(type)}
                    </h3>
                    <span className="meal-calories">
                      {todayMeals[type].total_calories.toFixed(0)} {language === 'ar' ? 'سعرة' : 'kcal'}
                    </span>
                  </div>

                  <div className="meal-content">
                    {todayMeals[type].meals.length > 0 ? (
                      <ul className="meals-list">
                        {todayMeals[type].meals.map((meal) => (
                          <li key={meal._id} className="meal-item">
                            <span className="food-name">
                              {language === 'ar' ? (meal.food_name_ar || meal.food_name) : (meal.food_name || meal.food_name_ar)}
                            </span>
                            <span className="meal-macros">
                              {meal.calories_consumed.toFixed(0)}kcal •{' '}
                              {meal.protein_consumed.toFixed(1)}g {language === 'ar' ? 'بروتين' : 'Protein'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-meals">{language === 'ar' ? 'لم تسجل أي وجبات حتى الآن' : 'No meals logged yet'}</p>
                    )}
                  </div>

                  <button className="btn-add-meal">
                    {language === 'ar' ? `➕ أضف وجبة ${getMealTypeLabel(type)}` : `➕ Add ${getMealTypeLabel(type)}`}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Progress */}
          <div className="compliance-section">
            <h2>{language === 'ar' ? '📊 مدى الالتزام' : '📊 Compliance Level'}</h2>
            <div className="compliance-card">
              <div className="progress-info">
                <p>
                  <strong>{language === 'ar' ? 'هدفك اليومي:' : 'Daily Target:'}</strong> {dietPlan ? dietPlan.daily_targets?.calories : 2500} {language === 'ar' ? 'سعرة حرارية' : 'kcal'}{' '}
                  <em>{language === 'ar' ? '(يمكن تخصيصه حسب نظامك)' : '(personalized based on your plan)'}</em>
                </p>
                <p>
                  <strong>{language === 'ar' ? 'المستهلك حتى الآن:' : 'Consumed so far:'}</strong>{' '}
                  {Object.values(todayMeals).reduce(
                    (sum, m) => sum + m.total_calories,
                    0
                  )}{' '}
                  {language === 'ar' ? 'سعرة' : 'kcal'}
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
                        (dietPlan?.daily_targets?.calories || 2500)) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

              <div className="compliance-tips">
                <h3>{language === 'ar' ? '💡 نصائح' : '💡 Tips'}</h3>
                <ul>
                  <li>{language === 'ar' ? 'احرص على تنويع الوجبات' : 'Make sure to diversify your meals'}</li>
                  <li>{language === 'ar' ? 'سجل وجباتك بانتظام' : 'Log your meals consistently'}</li>
                  <li>{language === 'ar' ? 'اتبع النظام الغذائي الموصى به' : 'Follow the recommended diet plan'}</li>
                  <li>{language === 'ar' ? 'اشرب الكثير من الماء' : 'Drink plenty of water'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button className="btn-secondary" onClick={() => setShowReportModal(true)}>
              {language === 'ar' ? '📊 عرض تقرير شامل' : '📊 View Comprehensive Report'}
            </button>
            <button className="btn-secondary btn-cancel" onClick={handleCancelSubscription} style={{ backgroundColor: '#ff6b6b', color: 'white', border: 'none' }}>
              {language === 'ar' ? '🚫 إلغاء الاشتراك' : '🚫 Cancel Subscription'}
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: '2rem 0' }}>
          {renderPlanSearch()}
        </div>
      )}

      {/* Comprehensive Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>{language === 'ar' ? '📊 التقرير الشامل (آخر 30 يوم)' : '📊 Comprehensive Report (Last 30 Days)'}</h2>
              <button className="btn-close-modal" onClick={() => setShowReportModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {reportLoading ? (
                <div className="loading">{language === 'ar' ? 'جاري تحميل التقرير...' : 'Loading report data...'}</div>
              ) : reportData ? (
                <div className="report-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* General Stats cards */}
                  <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', display: 'grid' }}>
                    <div className="summary-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1rem', borderRadius: '8px' }}>
                      <div className="card-label" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{language === 'ar' ? 'معدل الالتزام' : 'Compliance Rate'}</div>
                      <div className="card-value" style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{reportData.complianceRate}%</div>
                    </div>
                    <div className="summary-card" style={{ background: 'linear-gradient(135deg, #10ac84 0%, #086b51 100%)', color: 'white', padding: '1rem', borderRadius: '8px' }}>
                      <div className="card-label" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{language === 'ar' ? 'متوسط السعرات اليومي' : 'Avg Daily Calories'}</div>
                      <div className="card-value" style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{reportData.avgCalories} kcal</div>
                    </div>
                    <div className="summary-card" style={{ background: 'linear-gradient(135deg, #ff9f43 0%, #ee5253 100%)', color: 'white', padding: '1rem', borderRadius: '8px' }}>
                      <div className="card-label" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{language === 'ar' ? 'الأيام النشطة' : 'Logged Days'}</div>
                      <div className="card-value" style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{reportData.loggedDays} / 30</div>
                    </div>
                  </div>

                  {/* Macro Progress Bars */}
                  <div className="macro-progress-section" style={{ background: 'var(--code-bg)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-h)' }}>{language === 'ar' ? 'متوسط توزيع الماكروز اليومي' : 'Average Daily Macro Breakdown'}</h3>
                    
                    <div className="macro-progress-item" style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                        <span>🥚 {language === 'ar' ? 'بروتين' : 'Protein'}</span>
                        <strong>{reportData.avgProtein}g / {dietPlan?.daily_targets?.protein || 150}g</strong>
                      </div>
                      <div style={{ background: 'var(--border)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ background: '#ff6b6b', height: '100%', width: `${Math.min((reportData.avgProtein / (dietPlan?.daily_targets?.protein || 150)) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="macro-progress-item" style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                        <span>🌾 {language === 'ar' ? 'كربوهيدرات' : 'Carbs'}</span>
                        <strong>{reportData.avgCarbs}g / {dietPlan?.daily_targets?.carbs || 300}g</strong>
                      </div>
                      <div style={{ background: 'var(--border)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ background: '#4ecdc4', height: '100%', width: `${Math.min((reportData.avgCarbs / (dietPlan?.daily_targets?.carbs || 300)) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    <div className="macro-progress-item">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                        <span>🧈 {language === 'ar' ? 'دهون' : 'Fat'}</span>
                        <strong>{reportData.avgFat}g / {dietPlan?.daily_targets?.fat || 80}g</strong>
                      </div>
                      <div style={{ background: 'var(--border)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ background: '#ffa500', height: '100%', width: `${Math.min((reportData.avgFat / (dietPlan?.daily_targets?.fat || 80)) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Print and Close buttons */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button className="btn-primary" onClick={() => window.print()} style={{ background: 'linear-gradient(135deg, #10ac84 0%, #086b51 100%)', border: 'none', color: 'white', fontWeight: 'bold', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                      🖨️ {language === 'ar' ? 'طباعة التقرير' : 'Print Report'}
                    </button>
                    <button className="btn-secondary" onClick={() => setShowReportModal(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                      {language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                  </div>

                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#c33' }}>
                  {language === 'ar' ? 'فشل تحميل بيانات التقرير' : 'Failed to load report data.'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
