import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './CoachPanel.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function CoachPanel() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('plans');
  const [dietPlans, setDietPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [subscriberMeals, setSubscriberMeals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  // Create Plan Form State
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [foods, setFoods] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const user = JSON.parse(localStorage.getItem('befit_user') || '{}');

  // Check if user is a coach
  useEffect(() => {
    if (user.user_type !== 'coach') {
      setError('هذه الصفحة للكوتشز فقط');
      return;
    }
    fetchDietPlans();
    fetchSubscribers();
  }, []);

  const fetchDietPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ coach_id: user.id });
      const response = await fetch(`${API_BASE_URL}/diet-plans/list/?${params}`);
      const data = await response.json();

      if (data.success) {
        setDietPlans(data.plans);
      } else {
        setError(data.error || t('general.error'));
      }
    } catch (err) {
      setError(t('general.error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams({ coach_id: user.id });
      const response = await fetch(`${API_BASE_URL}/subscriptions/list/?${params}`);
      const data = await response.json();

      if (data.success) {
        setSubscribers(data.subscriptions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubscriberMeals = async (subscriberId, period = 'daily') => {
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE_URL}/subscriptions/${subscriberId}/history/?period=${period}&date=${dateStr}`
      );
      const data = await response.json();

      if (data.success) {
        setSubscriberMeals(data.meals_by_type || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchFoods = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const params = new URLSearchParams({ query: searchQuery });
      const response = await fetch(`${API_BASE_URL}/foods/search/?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.foods);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addFoodToMeal = (food, mealType) => {
    setSelectedFoods((prev) => ({
      ...prev,
      [mealType]: [...prev[mealType], food],
    }));
    setSearchResults([]);
    setSearchQuery('');
  };

  const removeFoodFromMeal = (mealType, index) => {
    setSelectedFoods((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      setError('الرجاء إدخال اسم النظام');
      return;
    }

    // Calculate daily targets
    let totalCalories = 0,
      totalProtein = 0,
      totalCarbs = 0,
      totalFat = 0;

    const meals = {
      breakfast: selectedFoods.breakfast.map((f) => ({
        food_id: f._id,
        quantity: 1,
        serving_unit: f.serving_unit,
        calories: f.calories,
        protein: f.protein || 0,
        carbs: f.carbs || 0,
        fat: f.fat || 0,
      })),
      lunch: selectedFoods.lunch.map((f) => ({
        food_id: f._id,
        quantity: 1,
        serving_unit: f.serving_unit,
        calories: f.calories,
        protein: f.protein || 0,
        carbs: f.carbs || 0,
        fat: f.fat || 0,
      })),
      dinner: selectedFoods.dinner.map((f) => ({
        food_id: f._id,
        quantity: 1,
        serving_unit: f.serving_unit,
        calories: f.calories,
        protein: f.protein || 0,
        carbs: f.carbs || 0,
        fat: f.fat || 0,
      })),
      snacks: selectedFoods.snacks.map((f) => ({
        food_id: f._id,
        quantity: 1,
        serving_unit: f.serving_unit,
        calories: f.calories,
        protein: f.protein || 0,
        carbs: f.carbs || 0,
        fat: f.fat || 0,
      })),
    };

    Object.values(meals).forEach((mealArray) => {
      mealArray.forEach((m) => {
        totalCalories += m.calories;
        totalProtein += m.protein;
        totalCarbs += m.carbs;
        totalFat += m.fat;
      });
    });

    try {
      const response = await fetch(`${API_BASE_URL}/diet-plans/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: user.id,
          name: planName,
          description: planDescription,
          breakfast_meals: meals.breakfast,
          lunch_meals: meals.lunch,
          dinner_meals: meals.dinner,
          snacks: meals.snacks,
          daily_targets: {
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('تم إنشاء النظام بنجاح!');
        setShowCreatePlan(false);
        setPlanName('');
        setPlanDescription('');
        setSelectedFoods({ breakfast: [], lunch: [], dinner: [], snacks: [] });
        fetchDietPlans();
      } else {
        setError(data.error || t('general.error'));
      }
    } catch (err) {
      setError(t('general.error'));
      console.error(err);
    }
  };

  return (
    <div className="coach-panel-container">
      <div className="coach-header">
        <h1>🏋️ لوحة الكوتش</h1>
        <p>أنت الآن مسؤول عن تدريب المشتركين معك</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="coach-tabs">
        <button
          onClick={() => setActiveTab('plans')}
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
        >
          📋 الأنظمة الغذائية
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
        >
          👥 المشتركون ({subscribers.length})
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>أنظمتي الغذائية</h2>
            <button
              onClick={() => setShowCreatePlan(!showCreatePlan)}
              className="btn-primary"
            >
              ➕ نظام جديد
            </button>
          </div>

          {/* Create Plan Form */}
          {showCreatePlan && (
            <div className="create-plan-form">
              <h3>إنشاء نظام غذائي جديد</h3>

              <div className="form-group">
                <label>اسم النظام</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="مثال: خطة كمال الأجسام"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>الوصف</label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="وصف النظام الغذائي..."
                  className="form-input"
                  rows="3"
                ></textarea>
              </div>

              {/* Food Search */}
              <div className="search-section">
                <h4>ابحث عن الأطعمة وأضفها</h4>
                <form onSubmit={handleSearchFoods} className="search-form">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن طعام..."
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    🔍
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((food) => (
                      <div key={food._id} className="food-item">
                        <div>
                          <strong>{food.name_ar}</strong>
                          <small>
                            {food.calories.toFixed(0)} سعرة • {food.serving_unit}
                          </small>
                        </div>
                        <div className="meal-type-buttons">
                          <button
                            onClick={() => addFoodToMeal(food, 'breakfast')}
                            className="add-btn breakfast"
                            title="الفطار"
                          >
                            🌅
                          </button>
                          <button
                            onClick={() => addFoodToMeal(food, 'lunch')}
                            className="add-btn lunch"
                            title="الغداء"
                          >
                            🌞
                          </button>
                          <button
                            onClick={() => addFoodToMeal(food, 'dinner')}
                            className="add-btn dinner"
                            title="العشاء"
                          >
                            🌙
                          </button>
                          <button
                            onClick={() => addFoodToMeal(food, 'snacks')}
                            className="add-btn snack"
                            title="السناك"
                          >
                            🍿
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Meals */}
              <div className="meals-grid">
                {['breakfast', 'lunch', 'dinner', 'snacks'].map((mealType) => (
                  <div key={mealType} className="meal-section">
                    <h4>
                      {mealType === 'breakfast'
                        ? '🌅 فطار'
                        : mealType === 'lunch'
                        ? '🌞 غداء'
                        : mealType === 'dinner'
                        ? '🌙 عشاء'
                        : '🍿 سناك'}
                    </h4>
                    <div className="foods-list">
                      {selectedFoods[mealType].length > 0 ? (
                        selectedFoods[mealType].map((food, idx) => (
                          <div key={idx} className="selected-food">
                            <span>{food.name_ar}</span>
                            <button
                              onClick={() => removeFoodFromMeal(mealType, idx)}
                              className="remove-btn"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="empty">لا توجد أطعمة</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  onClick={() => setShowCreatePlan(false)}
                  className="btn-cancel"
                >
                  إلغاء
                </button>
                <button onClick={handleCreatePlan} className="btn-submit">
                  إنشاء النظام
                </button>
              </div>
            </div>
          )}

          {/* Plans List */}
          <div className="plans-grid">
            {dietPlans.length > 0 ? (
              dietPlans.map((plan) => (
                <div key={plan._id} className="plan-card">
                  <h3>{plan.name}</h3>
                  <p>{plan.description}</p>

                  <div className="plan-targets">
                    <div className="target">
                      <span>السعرات:</span>
                      <strong>{plan.daily_targets?.calories || 0}</strong>
                    </div>
                    <div className="target">
                      <span>بروتين:</span>
                      <strong>{plan.daily_targets?.protein || 0}g</strong>
                    </div>
                    <div className="target">
                      <span>كارب:</span>
                      <strong>{plan.daily_targets?.carbs || 0}g</strong>
                    </div>
                    <div className="target">
                      <span>فات:</span>
                      <strong>{plan.daily_targets?.fat || 0}g</strong>
                    </div>
                  </div>

                  <div className="plan-meals">
                    <small>
                      🌅 {plan.meals?.breakfast?.length || 0} • 🌞{' '}
                      {plan.meals?.lunch?.length || 0} • 🌙{' '}
                      {plan.meals?.dinner?.length || 0} • 🍿{' '}
                      {plan.meals?.snacks?.length || 0}
                    </small>
                  </div>

                  <div className="plan-actions">
                    <button className="btn-edit">تعديل</button>
                    <button className="btn-delete">حذف</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>لم تنشئ أي أنظمة غذائية بعد</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>المشتركون معي</h2>
          </div>

          {subscribers.length > 0 ? (
            <div className="subscribers-grid">
              {subscribers.map((sub) => (
                <div
                  key={sub._id}
                  className={`subscriber-card ${
                    selectedSubscriber?._id === sub._id ? 'active' : ''
                  }`}
                  onClick={() => {
                    setSelectedSubscriber(sub);
                    fetchSubscriberMeals(sub.subscriber_id);
                  }}
                >
                  <h3>👤 مشترك</h3>
                  <p>
                    <strong>الحالة:</strong> {sub.status}
                  </p>
                  {sub.diet_plan_id && <p>✅ له نظام غذائي</p>}
                  <button className="btn-view">عرض</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>لا توجد مشتركين معك حالياً</p>
            </div>
          )}

          {/* Selected Subscriber Details */}
          {selectedSubscriber && (
            <div className="subscriber-details">
              <h3>سجل الأكل</h3>
              <div className="meals-by-type">
                {Object.entries(subscriberMeals).map(([type, data]) => (
                  <div key={type} className="meal-type-group">
                    <h4>
                      {type === 'breakfast'
                        ? '🌅 فطار'
                        : type === 'lunch'
                        ? '🌞 غداء'
                        : type === 'dinner'
                        ? '🌙 عشاء'
                        : '🍿 سناك'}
                    </h4>
                    <div className="meals-list">
                      {data.meals && data.meals.length > 0 ? (
                        data.meals.map((meal) => (
                          <div key={meal._id} className="meal-row">
                            <span>{meal.food_name_ar || meal.food_name}</span>
                            <span>
                              {meal.calories_consumed.toFixed(0)} سعرة
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="no-meals">لا توجد وجبات</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
