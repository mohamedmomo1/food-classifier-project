import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import './MealHistory.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function MealHistory() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [period, setPeriod] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [mealType, setMealType] = useState('all');
  const [summary, setSummary] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setMeals(data.meals || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeal = (mealId) => {
    toast.confirm(
      t('meal.deleteConfirm'),
      async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/meals/${mealId}/`, {
            method: 'DELETE',
          });

          const data = await response.json();

          if (data.success) {
            toast.success(t('meal.deletedSuccessfully'));
            fetchSummary();
            fetchMealsByType();
          } else {
            toast.error(data.error || t('general.error'));
          }
        } catch (err) {
          toast.error(t('general.error'));
          console.error(err);
        }
      }
    );
  };

  const translateServingUnit = (unit) => {
    if (language === 'ar') {
      const mapping = {
        'piece': 'حبة',
        'gram': 'جرام',
        'slice': 'شريحة',
        'cup': 'كوب',
        'ml': 'مللي',
        'loaf': 'رغيف',
        'tablespoon': 'ملعقة كبيرة'
      };
      return mapping[unit?.toLowerCase()] || unit;
    }
    return unit;
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
        <h1>{language === 'ar' ? 'سجل الوجبات' : 'Meal History'}</h1>
        <p>{language === 'ar' ? 'تابع وجباتك اليومية وتحكم في ماكروز التغذية' : 'Track your daily meals and manage your nutrition macros'}</p>
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

          <div className="stats-subgrid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}>
            <div className="summary-card" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
              <div className="label">{language === 'ar' ? 'عدد الوجبات' : 'Total Meals'}</div>
              <div className="value">{meals.length}</div>
            </div>
            <div className="summary-card" style={{
              background: 'linear-gradient(135deg, #10ac84 0%, #086b51 100%)',
            }}>
              <div className="label">{language === 'ar' ? 'عدد الأصناف' : 'Total Items'}</div>
              <div className="value">{meals.reduce((sum, m) => sum + (m.items?.length || 0), 0)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Grouped Eating Sessions List */}
      <div className="meals-section">
        <h2>{language === 'ar' ? 'تفاصيل الوجبات المستقلة' : 'Independent Meal Details'}</h2>

        {meals.filter(m => mealType === 'all' || m.meal_type === mealType).length > 0 ? (
          <div className="meal-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {meals.filter(m => mealType === 'all' || m.meal_type === mealType).map((session) => {
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
                  {/* Card Header */}
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
                        {getMealTypeLabel(session.meal_type)}
                      </span>
                      <span className="meal-count" style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 'normal' }}>
                        📅 {dateStr} • ⏰ {timeStr}
                      </span>
                    </h3>
                    <div className="type-calories">
                      {session.total_calories.toFixed(0)} {language === 'ar' ? 'سعرة' : 'kcal'}
                    </div>
                  </div>

                  {/* Food Items list in this meal */}
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
                            ⚖️ {item.quantity} {translateServingUnit(item.serving_unit)}
                          </div>
                        </div>

                        <div className="meal-macros-compact">
                          <span className="macro-item calories-macro">🔥 {item.calories_consumed.toFixed(0)}</span>
                          <span className="macro-item protein-macro">🥚 {item.protein_consumed.toFixed(1)}g</span>
                          <span className="macro-item carbs-macro">🌾 {item.carbs_consumed.toFixed(1)}g</span>
                          <span className="macro-item fat-macro">🧈 {item.fat_consumed.toFixed(1)}g</span>
                        </div>

                        <button
                          className="delete-meal-btn"
                          onClick={() => handleDeleteMeal(item._id)}
                          title={t('meal.delete')}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Macros totals for this specific card */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    background: 'var(--code-bg)',
                    padding: '1rem',
                    borderTop: '2px solid var(--border)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    <span style={{ color: '#4ecdc4' }}>🥚 {language === 'ar' ? 'بروتين' : 'Protein'}: {session.total_protein.toFixed(1)}g</span>
                    <span style={{ color: '#ffa500' }}>🌾 {language === 'ar' ? 'كربوهيدرات' : 'Carbs'}: {session.total_carbs.toFixed(1)}g</span>
                    <span style={{ color: '#38ada9' }}>🧈 {language === 'ar' ? 'دهون' : 'Fat'}: {session.total_fat.toFixed(1)}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{
            background: 'var(--code-bg)',
            borderRadius: '12px',
            border: '2px solid var(--border)',
            padding: '40px',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text)' }}>
              📭 {t('history.noMeals')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
