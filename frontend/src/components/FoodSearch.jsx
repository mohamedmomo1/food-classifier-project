import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './FoodSearch.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function FoodSearch() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState('all');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mealDate, setMealDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('befit_user') || '{}');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError(t('food.searchPlaceholder'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        meal_type: mealType !== 'all' ? mealType : 'all',
      });

      const response = await fetch(`${API_BASE_URL}/foods/search/?${params}`);
      const data = await response.json();

      if (data.success) {
        setFoods(data.foods);
        if (data.foods.length === 0) {
          setError(t('general.error'));
        }
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

  const openMealModal = (food) => {
    setSelectedFood(food);
    setSelectedMealType(food.meal_type || 'breakfast');
    setShowMealModal(true);
  };

  const handleLogMeal = async () => {
    if (!user.id) {
      setError(t('auth.login'));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/meals/log/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          food_id: selectedFood._id,
          quantity: parseFloat(quantity),
          meal_type: selectedMealType,
          date: mealDate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // نجح تسجيل الوجبة
        alert(t('meal.mealLogged'));
        setShowMealModal(false);
        setQuantity(1);
        setSelectedFood(null);
      } else {
        setError(data.error || t('general.error'));
      }
    } catch (err) {
      setError(t('general.error'));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="food-search-container">
      <div className="food-search-header">
        <h1>ابحث عن طعامك</h1>
        <p>ابحث عن أطعمتك المفضلة وسجلها</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-row">
          <div className="search-input-group">
            <input
              type="text"
              placeholder={t('food.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? t('general.loading') : '🔍 ' + t('food.search')}
            </button>
          </div>

          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="meal-type-filter"
          >
            <option value="all">{t('food.all')}</option>
            <option value="breakfast">{t('food.breakfast')}</option>
            <option value="lunch">{t('food.lunch')}</option>
            <option value="dinner">{t('food.dinner')}</option>
            <option value="snack">{t('food.snack')}</option>
          </select>
        </div>
      </form>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Results Grid */}
      <div className="foods-grid">
        {foods.length > 0 ? (
          foods.map((food) => (
            <div key={food._id} className="food-card">
              <div className="food-image">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.name_ar} />
                ) : (
                  <div className="placeholder">🍽️</div>
                )}
              </div>

              <div className="food-info">
                <h3>{food.name_ar || food.name}</h3>
                <p className="meal-type-badge">{t(`food.${food.meal_type}`)}</p>

                <div className="macros">
                  <div className="macro">
                    <span className="label">{t('food.calories')}</span>
                    <span className="value">{food.calories.toFixed(1)}</span>
                  </div>
                  <div className="macro">
                    <span className="label">{t('food.protein')}</span>
                    <span className="value">{(food.protein || 0).toFixed(1)}</span>
                  </div>
                  <div className="macro">
                    <span className="label">{t('food.carbs')}</span>
                    <span className="value">{(food.carbs || 0).toFixed(1)}</span>
                  </div>
                  <div className="macro">
                    <span className="label">{t('food.fat')}</span>
                    <span className="value">{(food.fat || 0).toFixed(1)}</span>
                  </div>
                </div>

                <p className="serving-size">
                  {t('food.servingSize')}: {food.serving_unit || 'gram'}
                </p>

                <button
                  onClick={() => openMealModal(food)}
                  className="add-btn"
                >
                  ➕ {t('food.add')}
                </button>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="no-results">
              <p>🔍 {t('history.noMeals')}</p>
            </div>
          )
        )}
      </div>

      {/* Meal Modal */}
      {showMealModal && selectedFood && (
        <div className="modal-overlay" onClick={() => setShowMealModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('meal.logMeal')}</h2>
              <button
                className="modal-close"
                onClick={() => setShowMealModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-food-info">
                <h3>{selectedFood.name_ar || selectedFood.name}</h3>
                <p>السعرات: {selectedFood.calories.toFixed(1)} كيلوكالوري</p>
              </div>

              <div className="form-group">
                <label>{t('meal.quantity')}</label>
                <div className="quantity-input">
                  <button
                    onClick={() => setQuantity(Math.max(0.1, quantity - 1))}
                    type="button"
                  >
                    ➖
                  </button>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    type="button"
                  >
                    ➕
                  </button>
                </div>
                <small>{selectedFood.serving_unit}</small>
              </div>

              <div className="form-group">
                <label>{t('meal.mealType')}</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                >
                  <option value="breakfast">{t('food.breakfast')}</option>
                  <option value="lunch">{t('food.lunch')}</option>
                  <option value="dinner">{t('food.dinner')}</option>
                  <option value="snack">{t('food.snack')}</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('meal.date')}</label>
                <input
                  type="date"
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="macro-preview">
                <h4>الماكروز المتناول:</h4>
                <div className="preview-grid">
                  <div>
                    <span>السعرات:</span>
                    <strong>
                      {(selectedFood.calories * quantity).toFixed(1)}
                    </strong>
                  </div>
                  <div>
                    <span>البروتين:</span>
                    <strong>
                      {((selectedFood.protein || 0) * quantity).toFixed(1)}g
                    </strong>
                  </div>
                  <div>
                    <span>الكربوهيدرات:</span>
                    <strong>
                      {((selectedFood.carbs || 0) * quantity).toFixed(1)}g
                    </strong>
                  </div>
                  <div>
                    <span>الدهون:</span>
                    <strong>
                      {((selectedFood.fat || 0) * quantity).toFixed(1)}g
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowMealModal(false)}
              >
                {t('general.cancel')}
              </button>
              <button
                className="btn-submit"
                onClick={handleLogMeal}
                disabled={submitting}
              >
                {submitting ? t('general.loading') : t('general.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
