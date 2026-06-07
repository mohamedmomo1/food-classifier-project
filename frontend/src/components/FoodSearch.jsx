import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './FoodSearch.css';

const API_BASE_URL = 'http://localhost:8000/api';

// Curated "trending" seeds — one representative from each category
const TRENDING_SEEDS = [
  'rice', 'chicken', 'burger', 'pizza', 'banana',
  'konafa', 'koshary', 'salad', 'falafel', 'oats',
  'salmon', 'yogurt', 'fries', 'eggs', 'mango',
];

function FoodCard({ food, language }) {
  const mealLabel = food.meal_type
    ? food.meal_type.charAt(0).toUpperCase() + food.meal_type.slice(1)
    : '';

  return (
    <div className="food-card read-only">
      <div className="food-image">
        <img
          src={food.image_url || `/static/food_images/${(food.name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`}
          alt={food.name_ar || food.name}
          onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
        />
      </div>
      <div className="food-info">
        <h3>{language === 'ar' ? food.name_ar : food.name}</h3>
        <p className="meal-type-badge">{mealLabel}</p>
        <div className="macros">
          <div className="macro calories-macro">
            <span className="label">{language === 'ar' ? 'سعرات' : 'Cal'}</span>
            <span className="value">{food.calories.toFixed(1)}</span>
          </div>
          <div className="macro protein-macro">
            <span className="label">{language === 'ar' ? 'بروتين' : 'Protein'}</span>
            <span className="value">{(food.protein || 0).toFixed(1)}g</span>
          </div>
          <div className="macro carbs-macro">
            <span className="label">{language === 'ar' ? 'كربو' : 'Carbs'}</span>
            <span className="value">{(food.carbs || 0).toFixed(1)}g</span>
          </div>
          <div className="macro fat-macro">
            <span className="label">{language === 'ar' ? 'دهون' : 'Fat'}</span>
            <span className="value">{(food.fat || 0).toFixed(1)}g</span>
          </div>
        </div>
        <p className="serving-size">
          {language === 'ar' ? 'الحجم' : 'Size'}: {food.serving_unit || 'gram'}
        </p>
        <p className="info-text catalog-info">
          {language === 'ar'
            ? '📌 معلومات فقط - استخدم SmartScanner للإضافة'
            : '📌 Info only - Use SmartScanner to add meals'}
        </p>
      </div>
    </div>
  );
}

export default function FoodSearch() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState('all');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingFoods, setTrendingFoods] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  /* ── Fetch 6 random trending foods on mount ──────────────────────── */
  useEffect(() => {
    const fetchTrending = async () => {
      setTrendingLoading(true);
      try {
        // Pick 6 random seeds
        const shuffled = [...TRENDING_SEEDS].sort(() => Math.random() - 0.5).slice(0, 6);
        const results = await Promise.all(
          shuffled.map(seed =>
            fetch(`${API_BASE_URL}/foods/search/?query=${seed}`)
              .then(r => r.json())
              .then(d => (d.success && d.foods.length > 0 ? d.foods[0] : null))
              .catch(() => null)
          )
        );
        const unique = [];
        const seen = new Set();
        for (const food of results) {
          if (food && !seen.has(food._id)) {
            seen.add(food._id);
            unique.push(food);
          }
        }
        setTrendingFoods(unique.slice(0, 6));
      } catch (err) {
        console.error('Trending fetch error:', err);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  /* ── Debounced live suggestions ──────────────────────────────────── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ query: searchQuery, meal_type: mealType });
        const res = await fetch(`${API_BASE_URL}/foods/search/?${params}`);
        const data = await res.json();
        if (data.success) setSuggestions(data.foods);
      } catch (_) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, mealType]);

  /* ── Click-outside to close dropdown ───────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.search-input-wrapper')) setShowSuggestions(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  /* ── Handlers ───────────────────────────────────────────────────── */
  const searchByName = useCallback(async (name) => {
    setSearchQuery(name);
    setLoading(true);
    setError('');
    setShowSuggestions(false);
    try {
      const params = new URLSearchParams({ query: name, meal_type: mealType });
      const res = await fetch(`${API_BASE_URL}/foods/search/?${params}`);
      const data = await res.json();
      if (data.success) setFoods(data.foods);
      else setError(data.error || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    } catch (_) {
      setError(language === 'ar' ? 'حدث خطأ في البحث' : 'Search error');
    } finally {
      setLoading(false);
    }
  }, [mealType, language]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setError(language === 'ar' ? 'أدخل اسم الطعام' : 'Enter food name');
      return;
    }
    setLoading(true);
    setError('');
    setShowSuggestions(false);
    try {
      const params = new URLSearchParams({ query: searchQuery, meal_type: mealType });
      const res = await fetch(`${API_BASE_URL}/foods/search/?${params}`);
      const data = await res.json();
      if (data.success) setFoods(data.foods);
      else setError(data.error || (language === 'ar' ? 'حدث خطأ' : 'Error'));
    } catch (_) {
      setError(language === 'ar' ? 'حدث خطأ في البحث' : 'Search error');
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = async (food) => {
    const name = language === 'ar' ? food.name_ar : food.name;
    setSearchQuery(name);
    setShowSuggestions(false);
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ query: name, meal_type: mealType });
      const res = await fetch(`${API_BASE_URL}/foods/search/?${params}`);
      const data = await res.json();
      if (data.success) setFoods(data.foods);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const hasSearchResults = foods.length > 0;

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="food-search-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="food-search-header">
        <h1>{language === 'ar' ? 'فهرس الأطعمة' : 'Food Catalog'}</h1>
        <p>{language === 'ar' ? 'استكشف مجموعتنا الشاملة من الأطعمة الصحية' : 'Explore our comprehensive food database'}</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-row">
          <div className="search-input-group">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث عن طعام...' : 'Search for food...'}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="search-input"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((food) => (
                    <div
                      key={food._id}
                      className="suggestion-item"
                      onClick={() => selectSuggestion(food)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                    >
                      <img
                        src={food.image_url || `/static/food_images/${(food.name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`}
                        alt={food.name_ar || food.name}
                        style={{ width: '30px', height: '30px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }}
                        onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="suggestion-name">{food.name_ar} - {food.name}</span>
                        <span className="suggestion-details">{food.calories.toFixed(1)} cal / {food.serving_unit || 'gram'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? (language === 'ar' ? '⏳ جاري' : '⏳ Loading') : '🔍 ' + (language === 'ar' ? 'بحث' : 'Search')}
            </button>
          </div>

          <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="meal-type-filter">
            <option value="all">{language === 'ar' ? 'جميع الأنواع' : 'All Types'}</option>
            <option value="breakfast">{language === 'ar' ? 'فطار' : 'Breakfast'}</option>
            <option value="lunch">{language === 'ar' ? 'غداء' : 'Lunch'}</option>
            <option value="dinner">{language === 'ar' ? 'عشاء' : 'Dinner'}</option>
            <option value="snack">{language === 'ar' ? 'سناك' : 'Snack'}</option>
          </select>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* ── Search Results ───────────────────────────────────────── */}
      {hasSearchResults ? (
        <div className="foods-grid">
          {foods.map((food) => (
            <FoodCard key={food._id} food={food} language={language} />
          ))}
        </div>
      ) : !loading && !searchQuery.trim() ? (
        /* ── Trending / Suggested section (shown only before any search) ── */
        <section className="trending-section">
          {/* Suggestions Grid */}

          {trendingLoading ? (
            <div className="trending-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line medium" />
                </div>
              ))}
            </div>
          ) : (
            <div className="trending-grid">
              {trendingFoods.map((food) => (
                <div
                  key={food._id}
                  className="trending-card"
                  onClick={() => searchByName(language === 'ar' ? food.name_ar : food.name)}
                  title={language === 'ar' ? 'انقر للبحث' : 'Click to search'}
                >
                  <div className="trending-card-img-wrap">
                    <img
                      src={food.image_url || `/static/food_images/${(food.name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`}
                      alt={food.name_ar || food.name}
                      className="trending-card-img"
                      onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                    />
                    <span className="trending-meal-badge">{food.meal_type}</span>
                  </div>
                  <div className="trending-card-body">
                    <h3 className="trending-card-name">
                      {language === 'ar' ? food.name_ar : food.name}
                    </h3>
                    <p className="trending-card-sub">
                      {language === 'ar' ? food.name : food.name_ar}
                    </p>
                    <div className="trending-macros">
                      <span className="t-cal">🔥 {food.calories.toFixed(0)}</span>
                      <span className="t-protein">🥚 {(food.protein || 0).toFixed(1)}g</span>
                      <span className="t-carbs">🌾 {(food.carbs || 0).toFixed(1)}g</span>
                    </div>
                    <p className="trending-card-unit">{food.serving_unit}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        !loading && searchQuery.trim() && (
          <div className="no-results">
            <p>{language === 'ar' ? '🔍 لا توجد نتائج' : '🔍 No results found'}</p>
          </div>
        )
      )}
    </div>
  );
}
