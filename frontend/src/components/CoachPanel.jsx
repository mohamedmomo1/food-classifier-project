import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import './CoachPanel.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function CoachPanel() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('plans');
  const [dietPlans, setDietPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [subscriberMeals, setSubscriberMeals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  // Create/Edit Plan Form State
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [originalPlanName, setOriginalPlanName] = useState('');
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNameUnique, setIsNameUnique] = useState(true);
  const [nameChecking, setNameChecking] = useState(false);

  // Client History Modal State
  const [selectedSubForHistory, setSelectedSubForHistory] = useState(null);
  const [modalPeriod, setModalPeriod] = useState('daily');
  const [modalSelectedDate, setModalSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [modalMealType, setModalMealType] = useState('all');
  const [modalSummary, setModalSummary] = useState(null);
  const [modalMeals, setModalMeals] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('befit_user') || '{}');

  // Debounced live suggestions search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          query: searchQuery,
          meal_type: 'all',
        });
        const response = await fetch(`${API_BASE_URL}/foods/search/?${params}`);
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.foods);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside to close recommendations
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-input-wrapper')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Debounced plan name uniqueness check
  useEffect(() => {
    if (!planName.trim()) {
      setIsNameUnique(true);
      return;
    }

    if (editingPlanId && planName.trim() === originalPlanName.trim()) {
      setIsNameUnique(true);
      return;
    }

    const checkNameUnique = setTimeout(async () => {
      setNameChecking(true);
      try {
        const params = new URLSearchParams({ plan_name: planName.trim() });
        const response = await fetch(`${API_BASE_URL}/diet-plans/list/?${params}`);
        const data = await response.json();
        if (data.success) {
          setIsNameUnique(data.plans.length === 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setNameChecking(false);
      }
    }, 450);

    return () => clearTimeout(checkNameUnique);
  }, [planName, editingPlanId, originalPlanName]);

  // Check if user is a coach
  useEffect(() => {
    if (user.user_type !== 'coach') {
      setError(language === 'ar' ? 'هذه الصفحة للكوتشز فقط' : 'This page is for coaches only');
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

  // Client History Modal Data Fetching
  useEffect(() => {
    if (selectedSubForHistory) {
      fetchModalSummary();
      fetchModalMeals();
    }
  }, [selectedSubForHistory, modalPeriod, modalSelectedDate, modalMealType]);

  const fetchModalSummary = async () => {
    if (!selectedSubForHistory) return;
    setModalLoading(true);
    try {
      const params = new URLSearchParams({
        user_id: selectedSubForHistory.subscriber_id,
        period: modalPeriod,
        date: modalSelectedDate,
        meal_type: modalMealType !== 'all' ? modalMealType : 'all',
      });
      const response = await fetch(`${API_BASE_URL}/meals/summary/?${params}`);
      const data = await response.json();
      if (data.success) {
        setModalSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchModalMeals = async () => {
    if (!selectedSubForHistory) return;
    try {
      let startDate, endDate;
      const date = new Date(modalSelectedDate);

      if (modalPeriod === 'daily') {
        startDate = modalSelectedDate;
        endDate = modalSelectedDate;
      } else if (modalPeriod === 'weekly') {
        const dayOfWeek = date.getDay();
        const diffToMonday = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diffToMonday));
        startDate = monday.toISOString().split('T')[0];
        const sunday = new Date(monday.setDate(monday.getDate() + 6));
        endDate = sunday.toISOString().split('T')[0];
      } else if (modalPeriod === 'monthly') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];
      }

      const params = new URLSearchParams({
        user_id: selectedSubForHistory.subscriber_id,
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(`${API_BASE_URL}/meals/history/?${params}`);
      const data = await response.json();
      if (data.success) {
        setModalMeals(data.meals || []);
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
  const handleSelectSuggestion = (food) => {
    setSearchResults([food]);
    setSearchQuery(language === 'ar' ? food.name_ar : food.name);
    setShowSuggestions(false);
  };

  const addFoodToMeal = (food, mealType) => {
    setSelectedFoods((prev) => ({
      ...prev,
      [mealType]: [...prev[mealType], { ...food, quantity_g: 100 }],
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

  const updateFoodQuantity = (mealType, index, value) => {
    const qty = parseFloat(value) || 0;
    setSelectedFoods((prev) => ({
      ...prev,
      [mealType]: prev[mealType].map((food, i) =>
        i === index ? { ...food, quantity_g: qty } : food
      ),
    }));
  };

  const handleCreatePlan = async () => {
    if (!planName.trim()) {
      setError(language === 'ar' ? 'الرجاء إدخال اسم النظام' : 'Please enter a plan name');
      return;
    }

    if (!isNameUnique) {
      setError(language === 'ar' ? 'اسم النظام مستخدم بالفعل، الرجاء اختيار اسم آخر' : 'Plan name is already in use, please choose another name');
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
        quantity: f.quantity_g || 100.0,
        quantity_g: f.quantity_g || 100.0,
      })),
      lunch: selectedFoods.lunch.map((f) => ({
        food_id: f._id,
        quantity: f.quantity_g || 100.0,
        quantity_g: f.quantity_g || 100.0,
      })),
      dinner: selectedFoods.dinner.map((f) => ({
        food_id: f._id,
        quantity: f.quantity_g || 100.0,
        quantity_g: f.quantity_g || 100.0,
      })),
      snacks: selectedFoods.snacks.map((f) => ({
        food_id: f._id,
        quantity: f.quantity_g || 100.0,
        quantity_g: f.quantity_g || 100.0,
      })),
    };

    // Calculate aggregated macros accurately based on food database serving unit
    Object.keys(selectedFoods).forEach((mealType) => {
      selectedFoods[mealType].forEach((f) => {
        const qty = f.quantity_g || 100.0;
        const factor = f.serving_unit === 'gram' ? qty / 100.0 : qty;
        totalCalories += f.calories * factor;
        totalProtein += (f.protein || 0) * factor;
        totalCarbs += (f.carbs || 0) * factor;
        totalFat += (f.fat || 0) * factor;
      });
    });

    try {
      const url = editingPlanId
        ? `${API_BASE_URL}/diet-plans/${editingPlanId}/`
        : `${API_BASE_URL}/diet-plans/`;
      const method = editingPlanId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coach_id: user.id,
          plan_name: planName.trim(),
          name: planName.trim(),
          description: planDescription,
          breakfast_meals: meals.breakfast,
          lunch_meals: meals.lunch,
          dinner_meals: meals.dinner,
          snacks: meals.snacks,
          daily_targets: {
            calories: Math.round(totalCalories),
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fat: Math.round(totalFat),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingPlanId
            ? language === 'ar'
              ? 'تم تحديث النظام بنجاح!'
              : 'Plan updated successfully!'
            : language === 'ar'
            ? 'تم إنشاء النظام بنجاح!'
            : 'Plan created successfully!'
        );
        setShowCreatePlan(false);
        setPlanName('');
        setPlanDescription('');
        setEditingPlanId(null);
        setOriginalPlanName('');
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

  const handleDeletePlan = (planId) => {
    toast.confirm(
      language === 'ar' ? 'هل أنت متأكد من حذف هذا النظام؟' : 'Are you sure you want to delete this plan?',
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/diet-plans/${planId}/delete/`, {
            method: 'DELETE',
          });
          const data = await response.json();
          if (data.success) {
            toast.success(language === 'ar' ? 'تم حذف النظام بنجاح' : 'Plan deleted successfully');
            fetchDietPlans();
          } else {
            toast.error(data.error || 'Error deleting plan');
          }
        } catch (err) {
          console.error(err);
          toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
        }
      }
    );
  };

  const handleEditPlanClick = (plan) => {
    setEditingPlanId(plan._id);
    setOriginalPlanName(plan.name || '');
    setPlanName(plan.name || '');
    setPlanDescription(plan.description || '');
    setSelectedFoods({
      breakfast: plan.meals?.breakfast || [],
      lunch: plan.meals?.lunch || [],
      dinner: plan.meals?.dinner || [],
      snacks: plan.meals?.snacks || [],
    });
    setShowCreatePlan(true);
  };

  return (
    <div className="coach-panel-container">
      <div className="coach-header">
        <h2 className="header-title">{language === 'ar' ? '🏋️ لوحة الكوتش' : '🏋️ Coach Panel'}</h2>
        <p className="header-subtitle">{language === 'ar' ? 'أنت الآن مسؤول عن تدريب المشتركين معك' : 'You are now responsible for training subscribers'}</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Tabs */}
      <div className="coach-tabs">
        <button
          onClick={() => setActiveTab('plans')}
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
        >
          {language === 'ar' ? '📋 الأنظمة الغذائية' : '📋 Diet Plans'}
        </button>
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`tab-btn ${activeTab === 'subscribers' ? 'active' : ''}`}
        >
          {language === 'ar' ? '👥 المشتركون' : '👥 Subscribers'} ({subscribers.length})
        </button>
      </div>

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div className="tab-content">
          <div className="section-header">
            <h2>{language === 'ar' ? 'أنظمتي الغذائية' : 'My Diet Plans'}</h2>
            <button
              onClick={() => {
                setEditingPlanId(null);
                setOriginalPlanName('');
                setPlanName('');
                setPlanDescription('');
                setSelectedFoods({ breakfast: [], lunch: [], dinner: [], snacks: [] });
                setShowCreatePlan(!showCreatePlan);
              }}
              className="btn-primary"
            >
              {language === 'ar' ? '➕ نظام جديد' : '➕ New Plan'}
            </button>
          </div>

          {/* Create Plan Form */}
          {showCreatePlan && (
            <div className="create-plan-form">
              <h3>إنشاء نظام غذائي جديد</h3>

              <div className="form-group">
                <label>{language === 'ar' ? 'اسم النظام' : 'Plan Name'}</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: خطة كمال الأجسام' : 'e.g. Bulk Plan'}
                  className="form-input"
                />
                {planName.trim() && (
                  <div className={`unique-validation-message ${nameChecking ? 'checking' : !isNameUnique ? 'error' : 'success'}`}>
                    {nameChecking
                      ? (language === 'ar' ? '🔍 جاري التحقق من توفر الاسم...' : 'Checking availability...')
                      : !isNameUnique
                      ? (language === 'ar' ? '❌ اسم الخطة مستخدم بالفعل، يرجى اختيار اسم فريد' : 'Plan name already in use, choose a unique name')
                      : (language === 'ar' ? '✅ اسم الخطة متاح' : 'Plan name is available')}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{language === 'ar' ? 'الوصف' : 'Description'}</label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder={language === 'ar' ? 'وصف النظام الغذائي...' : 'Diet plan description...'}
                  className="form-input"
                  rows="3"
                ></textarea>
              </div>

              {/* Food Search */}
              <div className="search-section">
                <h4>{language === 'ar' ? 'ابحث عن الأطعمة وأضفها' : 'Search & Add Foods'}</h4>
                <form onSubmit={handleSearchFoods} className="search-form">
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder={language === 'ar' ? 'ابحث عن طعام...' : 'Search for food...'}
                      className="search-input"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="suggestions-dropdown">
                        {suggestions.map((food) => (
                          <div
                            key={food._id}
                            className="suggestion-item"
                            onClick={() => handleSelectSuggestion(food)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                          >
                            <img 
                              src={`/static/food_images/${(food.name || '').toLowerCase()}.jpg`} 
                              alt={food.name_ar || food.name} 
                              style={{ width: '32px', height: '32px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }}
                              onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span className="suggestion-name">
                                {food.name_ar} - {food.name}
                              </span>
                              <span className="suggestion-details">
                                {food.calories.toFixed(0)} سعرة • {food.serving_unit}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="search-btn">
                    🔍
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((food) => (
                      <div key={food._id} className="food-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img 
                          src={food.image_url || `/static/food_images/${(food.name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`} 
                          alt={food.name_ar || food.name} 
                          style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                        />
                        <div style={{ flex: 1 }}>
                          <strong>{language === 'ar' ? food.name_ar : food.name}</strong>
                          <small style={{ display: 'block' }}>
                            {food.calories.toFixed(0)} {language === 'ar' ? 'سعرة' : 'kcal'} • {food.serving_unit}
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
                          <div key={idx} className="selected-food" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img 
                              src={food.image_url || `/static/food_images/${(food.name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`} 
                              alt={food.name_ar || food.name} 
                              style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                              onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                            />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {language === 'ar' ? food.name_ar : food.name}
                            </span>
                            <div className="quantity-edit">
                              <input
                                type="number"
                                value={food.quantity_g || 100}
                                onChange={(e) => updateFoodQuantity(mealType, idx, e.target.value)}
                                className="quantity-input"
                                min="1"
                              />
                              <span>{language === 'ar' ? 'جرام' : 'g'}</span>
                            </div>
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
                    <button className="btn-edit" onClick={() => handleEditPlanClick(plan)}>
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                    <button className="btn-delete" onClick={() => handleDeletePlan(plan._id)}>
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
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
            <h2>{language === 'ar' ? 'المشتركون معي' : 'My Subscribers'}</h2>
          </div>

          {subscribers.length > 0 ? (
            <div className="subscribers-grid">
              {subscribers.map((sub) => (
                <div
                  key={sub._id}
                  className="subscriber-card"
                  onClick={() => {
                    setSelectedSubForHistory(sub);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <h3>👤 {sub.subscriber_name || (language === 'ar' ? 'مشترك' : 'Subscriber')}</h3>
                  <p>
                    <strong>{language === 'ar' ? 'العمر:' : 'Age:'}</strong> {sub.subscriber_age || 25} {language === 'ar' ? 'سنة' : 'years'}
                  </p>
                  <p>
                    <strong>{language === 'ar' ? 'الحالة:' : 'Status:'}</strong> {sub.status === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : sub.status}
                  </p>
                  {sub.diet_plan_id ? (
                    <p>{language === 'ar' ? '✅ له نظام غذائي' : '✅ Has diet plan'}</p>
                  ) : (
                    <p>{language === 'ar' ? '❌ ليس له نظام غذائي' : '❌ No diet plan'}</p>
                  )}
                  <button className="btn-view" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubForHistory(sub);
                  }}>
                    {language === 'ar' ? 'عرض السجل' : 'View History'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>{language === 'ar' ? 'لا توجد مشتركين معك حالياً' : 'No subscribers linked to you currently'}</p>
            </div>
          )}
        </div>
      )}

      {/* Client History Modal */}
      {selectedSubForHistory && (
        <div className="modal-overlay" onClick={() => setSelectedSubForHistory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                👤 {selectedSubForHistory.subscriber_name || (language === 'ar' ? 'مشترك' : 'Subscriber')}
                <span style={{ fontSize: '1rem', fontWeight: 'normal', marginInlineStart: '10px' }}>
                  ({selectedSubForHistory.subscriber_age || 25} {language === 'ar' ? 'سنة' : 'years'})
                </span>
              </h2>
              <button className="btn-close-modal" onClick={() => setSelectedSubForHistory(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Modal Filters */}
              <div className="filters-section" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div className="filter-group">
                  <label>{t('history.summary')}:</label>
                  <div className="period-buttons">
                    <button
                      onClick={() => setModalPeriod('daily')}
                      className={`period-btn ${modalPeriod === 'daily' ? 'active' : ''}`}
                    >
                      {t('history.daily')}
                    </button>
                    <button
                      onClick={() => setModalPeriod('weekly')}
                      className={`period-btn ${modalPeriod === 'weekly' ? 'active' : ''}`}
                    >
                      {t('history.weekly')}
                    </button>
                    <button
                      onClick={() => setModalPeriod('monthly')}
                      className={`period-btn ${modalPeriod === 'monthly' ? 'active' : ''}`}
                    >
                      {t('history.monthly')}
                    </button>
                  </div>
                </div>

                <div className="filter-group">
                  <label>{t('meal.date')}:</label>
                  <input
                    type="date"
                    value={modalSelectedDate}
                    onChange={(e) => setModalSelectedDate(e.target.value)}
                    className="date-input"
                  />
                </div>

                <div className="filter-group">
                  <label>{t('history.filterByType')}:</label>
                  <select
                    value={modalMealType}
                    onChange={(e) => setModalMealType(e.target.value)}
                    className="meal-filter"
                  >
                    <option value="all">{t('food.all')}</option>
                    <option value="breakfast">{t('food.breakfast')}</option>
                    <option value="lunch">{t('food.lunch')}</option>
                    <option value="dinner">{t('food.dinner')}</option>
                    <option value="snack">{t('food.snack')}</option>
                  </select>
                </div>
              </div>

              {/* Modal Loading / Error */}
              {modalLoading && <div className="loading">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>}

              {/* Modal Summary Cards */}
              {!modalLoading && modalSummary && (
                <div className="summary-section" style={{ marginBottom: '1.5rem' }}>
                  <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                    <div className="summary-card calories">
                      <div className="card-label">{t('history.totalCalories')}</div>
                      <div className="card-value">{modalSummary.total_calories.toFixed(0)}</div>
                      <div className="card-unit">kcal</div>
                    </div>
                    <div className="summary-card protein">
                      <div className="card-label">{t('history.totalProtein')}</div>
                      <div className="card-value">{modalSummary.total_protein.toFixed(1)}</div>
                      <div className="card-unit">g</div>
                    </div>
                    <div className="summary-card carbs">
                      <div className="card-label">{t('history.totalCarbs')}</div>
                      <div className="card-value">{modalSummary.total_carbs.toFixed(1)}</div>
                      <div className="card-unit">g</div>
                    </div>
                    <div className="summary-card fat">
                      <div className="card-label">{t('history.totalFat')}</div>
                      <div className="card-value">{modalSummary.total_fat.toFixed(1)}</div>
                      <div className="card-unit">g</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Sequential Meals List */}
              {!modalLoading && (
                <div className="meals-section">
                  <h3>{language === 'ar' ? 'سجل الوجبات التفصيلي' : 'Detailed Meals Log'}</h3>
                  {modalMeals.filter(m => modalMealType === 'all' || m.meal_type === modalMealType).length > 0 ? (
                    <div className="meal-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
                      {modalMeals.filter(m => modalMealType === 'all' || m.meal_type === modalMealType).map((session) => {
                        const loggedDate = new Date(session.logged_at);
                        const timeStr = loggedDate.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        });
                        const dateStr = loggedDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        });

                        return (
                          <div key={session.meal_session_id} className="meal-type-section" style={{ marginBottom: 0 }}>
                            <div className="meal-type-header">
                              <h3>
                                <span className={`meal-tag ${session.meal_type}`} style={{
                                  padding: '0.3rem 0.8rem',
                                  borderRadius: '20px',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  color: 'white',
                                  background: session.meal_type === 'breakfast' ? '#ff6b6b' : 
                                              session.meal_type === 'lunch' ? '#4ecdc4' : 
                                              session.meal_type === 'dinner' ? '#ffa500' : '#38ada9',
                                }}>
                                  {session.meal_type === 'breakfast' ? t('food.breakfast') :
                                   session.meal_type === 'lunch' ? t('food.lunch') :
                                   session.meal_type === 'dinner' ? t('food.dinner') : t('food.snack')}
                                </span>
                                <span className="meal-count" style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 'normal', marginInlineStart: '10px' }}>
                                  📅 {dateStr} • ⏰ {timeStr}
                                </span>
                              </h3>
                              <div className="type-calories">
                                {session.total_calories.toFixed(0)} {language === 'ar' ? 'سعرة' : 'kcal'}
                              </div>
                            </div>

                            <div className="meals-list">
                              {session.items.map((item) => (
                                <div key={item._id} className="meal-item" style={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1rem',
                                  borderInlineStartColor: session.meal_type === 'breakfast' ? '#ff6b6b' : 
                                                session.meal_type === 'lunch' ? '#4ecdc4' : 
                                                session.meal_type === 'dinner' ? '#ffa500' : '#38ada9' 
                                }}>
                                  <img 
                                    src={item.food_image_url || `/static/food_images/${(item.food_name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`} 
                                    alt={item.food_name_ar || item.food_name} 
                                    style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                                    onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                                  />
                                  <div className="meal-main" style={{ flex: 1 }}>
                                    <div className="meal-name">
                                      {language === 'ar' ? (item.food_name_ar || item.food_name) : (item.food_name || item.food_name_ar)}
                                    </div>
                                    <div className="meal-quantity">
                                      ⚖️ {item.quantity} {
                                        language === 'ar' ? (
                                          item.serving_unit === 'piece' ? 'حبة' :
                                          item.serving_unit === 'gram' ? 'جرام' :
                                          item.serving_unit === 'slice' ? 'شريحة' :
                                          item.serving_unit === 'cup' ? 'كوب' :
                                          item.serving_unit === 'ml' ? 'مللي' :
                                          item.serving_unit === 'loaf' ? 'رغيف' :
                                          item.serving_unit === 'tablespoon' ? 'ملعقة كبيرة' : item.serving_unit
                                        ) : item.serving_unit
                                      }
                                    </div>
                                  </div>

                                  <div className="meal-macros-compact">
                                    <span className="macro-item">🔥 {item.calories_consumed.toFixed(0)}</span>
                                    <span className="macro-item">🥚 {item.protein_consumed.toFixed(1)}g</span>
                                    <span className="macro-item">🌾 {item.carbs_consumed.toFixed(1)}g</span>
                                    <span className="macro-item">🧈 {item.fat_consumed.toFixed(1)}g</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              background: 'var(--code-bg)',
                              padding: '1rem',
                              borderTop: '2px solid var(--border)',
                              fontSize: '0.9rem',
                              color: 'var(--text)',
                              fontWeight: '600'
                            }}>
                              <span>🥚 {language === 'ar' ? 'بروتين' : 'Protein'}: {session.total_protein.toFixed(1)}g</span>
                              <span>🌾 {language === 'ar' ? 'كربوهيدرات' : 'Carbs'}: {session.total_carbs.toFixed(1)}g</span>
                              <span>🧈 {language === 'ar' ? 'دهون' : 'Fat'}: {session.total_fat.toFixed(1)}g</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
                      <p>{language === 'ar' ? '📭 لا توجد وجبات مسجلة للفترة المحددة' : '📭 No logged meals for this period'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
