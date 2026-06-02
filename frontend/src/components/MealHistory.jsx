import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './MealHistory.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function MealHistory() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [mealType, setMealType] = useState('all');
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mealsByType, setMealsByType] = useState({
    breakfast: { meals: [], total_calories: 0 },
    lunch: { meals: [], total_calories: 0 },
    dinner: { meals: [], total_calories: 0 },
    snack: { meals: [], total_calories: 0 },
  });

  const user = JSON.parse(localStorage.getItem('befit_user') || '{}');

  useEffect(() => {
    if (user.id) {
      fetchSummary();
      fetchMealsByType();
    }
  }, [period, selectedDate, mealType]);

  const fetchSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        user_id: user.id,
        period: period,
        date: selectedDate,
        meal_type: mealType !== 'all' ? mealType : 'all',
      });

      const response = await fetch(`${API_BASE_URL}/meals/summary/?${params}`);
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
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

  const fetchMealsByType = async () => {
    try {
      const params = new URLSearchParams({
        user_id: user.id,
        period: period,
        date: selectedDate,
      });

      const response = await fetch(`${API_BASE_URL}/meals/summary/?${params}`);
      const data = await response.json();

      if (data.success) {
        // جلب الوجبات بكاملها لكل نوع
        fetchMealsHistory();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMealsHistory = async () => {
    try {
      // حساب نطاق التاريخ
      let startDate, endDate;
      const date = new Date(selectedDate);

      if (period === 'daily') {
        startDate = selectedDate;
        endDate = selectedDate;
      } else if (period === 'weekly') {
        const dayOfWeek = date.getDay();
        const diffToMonday = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(date.setDate(diffToMonday));
        startDate = monday.toISOString().split('T')[0];
        const sunday = new Date(monday.setDate(monday.getDate() + 6));
        endDate = sunday.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
          .toISOString()
          .split('T')[0];
      }

      const params = new URLSearchParams({
        user_id: user.id,
        start_date: startDate,
        end_date: endDate,
      });

      const response = await fetch(`${API_BASE_URL}/meals/history/?${params}`);
      const data = await response.json();

      if (data.success) {
        // تنظيم الوجبات حسب النوع
        const grouped = {
          breakfast: { meals: [], total_calories: 0 },
          lunch: { meals: [], total_calories: 0 },
          dinner: { meals: [], total_calories: 0 },
          snack: { meals: [], total_calories: 0 },
        };

        data.meals.forEach((meal) => {
          const mealTypeKey = meal.meal_type || 'snack';
          if (grouped[mealTypeKey]) {
            grouped[mealTypeKey].meals.push(meal);
            grouped[mealTypeKey].total_calories += meal.calories_consumed;
          }
        });

        setMealsByType(grouped);
        setMeals(data.meals);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm(t('meal.deleteConfirm'))) return;

    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}/`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert(t('meal.deletedSuccessfully'));
        fetchSummary();
        fetchMealsByType();
      } else {
        setError(data.error || t('general.error'));
      }
    } catch (err) {
      setError(t('general.error'));
      console.error(err);
    }
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: t('food.breakfast'),
      lunch: t('food.lunch'),
      dinner: t('food.dinner'),
      snack: t('food.snack'),
    };
    return labels[type] || type;
  };

  return (
    <div className="meal-history-container">
      <div className="history-header">
        <h1>سجل الوجبات</h1>
        <p>تابع وجباتك اليومية وتحكم في ماكروز التغذية</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>{t('history.summary')}:</label>
          <div className="period-buttons">
            <button
              onClick={() => setPeriod('daily')}
              className={`period-btn ${period === 'daily' ? 'active' : ''}`}
            >
              {t('history.daily')}
            </button>
            <button
              onClick={() => setPeriod('weekly')}
              className={`period-btn ${period === 'weekly' ? 'active' : ''}`}
            >
              {t('history.weekly')}
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`period-btn ${period === 'monthly' ? 'active' : ''}`}
            >
              {t('history.monthly')}
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>{t('meal.date')}:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="filter-group">
          <label>{t('history.filterByType')}:</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
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

      {error && <div className="error-message">{error}</div>}

      {/* Summary Cards */}
      {summary && (
        <div className="summary-section">
          <h2>{t('history.summary')}</h2>
          <div className="summary-grid">
            <div className="summary-card calories">
              <div className="card-label">{t('history.totalCalories')}</div>
              <div className="card-value">{summary.total_calories.toFixed(0)}</div>
              <div className="card-unit">kcal</div>
            </div>
            <div className="summary-card protein">
              <div className="card-label">{t('history.totalProtein')}</div>
              <div className="card-value">{summary.total_protein.toFixed(1)}</div>
              <div className="card-unit">g</div>
            </div>
            <div className="summary-card carbs">
              <div className="card-label">{t('history.totalCarbs')}</div>
              <div className="card-value">{summary.total_carbs.toFixed(1)}</div>
              <div className="card-unit">g</div>
            </div>
            <div className="summary-card fat">
              <div className="card-label">{t('history.totalFat')}</div>
              <div className="card-value">{summary.total_fat.toFixed(1)}</div>
              <div className="card-unit">g</div>
            </div>
          </div>

          <div className="meals-count">
            📊 {t('history.mealCount')}: <strong>{summary.meal_count}</strong>
          </div>
        </div>
      )}

      {/* Meals by Type */}
      <div className="meals-section">
        <h2>الوجبات حسب النوع</h2>

        {Object.entries(mealsByType).map(([type, data]) => (
          <div key={type} className="meal-type-group">
            <div className="meal-type-header">
              <h3>
                {getMealTypeLabel(type)}
                <span className="meal-count">({data.meals.length})</span>
              </h3>
              <div className="type-calories">
                {data.total_calories.toFixed(0)} كيلوكالوري
              </div>
            </div>

            {data.meals.length > 0 ? (
              <div className="meals-list">
                {data.meals.map((meal) => (
                  <div key={meal._id} className="meal-item">
                    <div className="meal-main">
                      <div className="meal-name">{meal.food_name_ar || meal.food_name}</div>
                      <div className="meal-quantity">
                        {meal.quantity} {meal.serving_unit}
                      </div>
                    </div>

                    <div className="meal-macros-compact">
                      <span className="macro-item">
                        🔥 {meal.calories_consumed.toFixed(0)}
                      </span>
                      <span className="macro-item">
                        🥚 {meal.protein_consumed.toFixed(1)}g
                      </span>
                      <span className="macro-item">
                        🌾 {meal.carbs_consumed.toFixed(1)}g
                      </span>
                      <span className="macro-item">
                        🧈 {meal.fat_consumed.toFixed(1)}g
                      </span>
                    </div>

                    <button
                      className="delete-meal-btn"
                      onClick={() => handleDeleteMeal(meal._id)}
                      title={t('meal.delete')}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-meals">لا توجد وجبات {getMealTypeLabel(type)}</div>
            )}
          </div>
        ))}

        {Object.values(mealsByType).every((m) => m.meals.length === 0) && (
          <div className="empty-state">
            <p>📭 {t('history.noMeals')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
