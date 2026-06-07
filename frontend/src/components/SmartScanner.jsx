import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import './SmartScanner.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function SmartScanner() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const toast = useToast();
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [mealItems, setMealItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced live suggestions search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/foods/search/?query=${encodeURIComponent(searchQuery)}&meal_type=all`
        );
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.foods);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedMealType]);

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

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('befit_user') || '{}');

  const formatUnit = (unit) => {
    if (language === 'ar') {
      switch (unit?.toLowerCase()) {
        case 'gram': return 'جرام';
        case 'piece': return 'حبة/قطعة';
        case 'sandwich': return 'ساندوتش';
        case 'slice': return 'شريحة';
        case 'cup': case 'glass': return 'كوب';
        case 'loaf': return 'رغيف';
        case 'tablespoon': return 'ملعقة';
        case 'can': case 'pack': return 'عبوة';
        default: return unit || 'وحدة';
      }
    }
    return unit || 'unit';
  };

  const startCamera = async () => {
    setCameraActive(true);
    setPreviewUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError(language === 'ar' ? 'عذرًا، فشل فتح الكاميرا.' : 'Failed to access camera.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const stream = video.srcObject;
      if (stream) stream.getTracks().forEach(track => track.stop());

      canvas.toBlob((blob) => {
        setPreviewUrl(URL.createObjectURL(blob));
        setCameraActive(false);
      }, 'image/jpeg');
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setCameraActive(false);
    }
  };

  const handleAIScan = async () => {
    if (!previewUrl) return;

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      const responseBlob = await fetch(previewUrl);
      const blob = await responseBlob.blob();
      formData.append('image', blob, 'food_image.jpg');

      const response = await axios.post(`${API_BASE_URL}/foods/predict/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.predictions) {
        const detectedItems = response.data.predictions.map((item, index) => ({
          id: Date.now() + index,
          _id: item.food_id || `temp_${index}`,
          name: language === 'ar' ? item.name_ar : item.name_en,
          serving_unit: item.unit_en || 'gram',
          calories: parseFloat(item.calories || 0),
          protein: parseFloat(item.protein || 0),
          carbs: parseFloat(item.carbs || 0),
          fat: parseFloat(item.fat || 0),
          quantity: 1,
          image_url: item.image_url || '/static/food_images/default.jpg'
        }));
        setMealItems([...mealItems, ...detectedItems]);
        setPreviewUrl(null);
      } else {
        setError(language === 'ar' ? 'لم يتعرف الموديل على أصناف طعام.' : 'No food items detected.');
      }
    } catch (error) {
      console.error("AI Scan Error:", error);
      setError(language === 'ar' ? 'حدث خطأ أثناء الاتصال بسيرفر الـ AI.' : 'Error connecting to AI server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError(language === 'ar' ? 'أدخل اسم الطعام' : 'Enter food name');
      return;
    }

    setSearchLoading(true);
    setError('');
    setShowSuggestions(false);
    try {
      const response = await fetch(
        `${API_BASE_URL}/foods/search/?query=${encodeURIComponent(searchQuery)}&meal_type=all`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.foods);
      } else {
        setError(data.error || (language === 'ar' ? 'حدث خطأ' : 'Error'));
      }
    } catch (err) {
      setError(language === 'ar' ? 'حدث خطأ في البحث' : 'Search error');
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const addFoodItem = (food) => {
    const newItem = {
      id: Date.now(),
      _id: food._id || `temp_${Date.now()}`,
      name: language === 'ar' ? food.name_ar : food.name,
      serving_unit: food.serving_unit || 'gram',
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0,
      quantity: 1,
      image_url: food.image_url || '/static/food_images/default.jpg'
    };
    setMealItems([...mealItems, newItem]);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchResults([]);
  };

  const handleQuantityUpdate = (id, newQty) => {
    const validatedQty = Math.max(0.1, parseFloat(newQty) || 1);
    setMealItems(mealItems.map(item =>
      item.id === id ? { ...item, quantity: validatedQty } : item
    ));
  };

  const deleteItem = (id) => {
    setMealItems(mealItems.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    return mealItems.reduce((totals, item) => ({
      calories: totals.calories + (item.calories * item.quantity),
      protein: totals.protein + (item.protein * item.quantity),
      carbs: totals.carbs + (item.carbs * item.quantity),
      fat: totals.fat + (item.fat * item.quantity),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSubmit = async () => {
    if (mealItems.length === 0) {
      setError(language === 'ar' ? 'أضف على الأقل عنصر واحد' : 'Add at least one item');
      return;
    }

    if (!user.id) {
      setError(language === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mealDate = new Date().toISOString().split('T')[0];
      const mealSessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

      for (const item of mealItems) {
        await fetch(`${API_BASE_URL}/meals/log/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            food_id: item._id,
            quantity: item.quantity,
            meal_type: selectedMealType,
            date: mealDate,
            meal_session_id: mealSessionId,
          }),
        });
      }

      // Dispatch custom event for real-time dashboard update
      window.dispatchEvent(new CustomEvent('meal-logged', {
        detail: { mealType: selectedMealType, count: mealItems.length }
      }));

      const totals = calculateTotals();
      toast.success(
        language === 'ar'
          ? `✓ تم إضافة الوجبات بنجاح! إجمالي السعرات: ${totals.calories.toFixed(0)}`
          : `✓ Meals added! Total: ${totals.calories.toFixed(0)} kcal`
      );
      navigate('/dashboard');
    } catch (err) {
      setError(language === 'ar' ? 'خطأ في إضافة الوجبات' : 'Error adding meals');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="smart-scanner-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="smart-scanner-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← {language === 'ar' ? 'العودة' : 'Back'}
        </button>
        <h1>{language === 'ar' ? 'إضافة وجبة جديدة' : 'Add New Meal'}</h1>
      </div>

      {/* Phase 1: Meal Type Selection */}
      {!selectedMealType ? (
        <div className="meal-type-selector">
          <h2>{language === 'ar' ? 'اختر نوع الوجبة' : 'Select Meal Type'}</h2>
          <p>{language === 'ar' ? 'يجب تحديد نوع الوجبة أولاً' : 'Choose the meal type first'}</p>

          <div className="meal-type-options">
            {MEAL_TYPES.map(type => (
              <label key={type} className="meal-type-radio">
                <input
                  type="radio"
                  value={type}
                  checked={selectedMealType === type}
                  onChange={(e) => {
                    setSelectedMealType(e.target.value);
                    setActiveTab('ai');
                  }}
                />
                <span className="radio-label">
                  {language === 'ar' ? t(`food.${type}`) : type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="scanner-content">
          {/* Tabs */}
          <div className="scanner-tabs">
            <button
              className={`tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
              onClick={() => setActiveTab('ai')}
            >
              📸 {language === 'ar' ? 'الكاميرا والذكاء' : 'AI Camera'}
            </button>
            <button
              className={`tab-btn ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => setActiveTab('search')}
            >
              🔍 {language === 'ar' ? 'بحث يدوي' : 'Manual Search'}
            </button>
          </div>

          {/* Main Content */}
          <div className="scanner-main">
            {/* Left Side: Input */}
            <div className="scanner-left">
              {activeTab === 'ai' && (
                <div className="ai-section">
                  <h3>{language === 'ar' ? 'فحص صورة الطعام' : 'Scan Food Image'}</h3>

                  <div className="camera-buttons">
                    <button
                      className="btn btn-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      💻 {language === 'ar' ? 'رفع صورة' : 'Upload Image'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={startCamera}
                      disabled={cameraActive}
                    >
                      📷 {language === 'ar' ? 'كاميرا مباشرة' : 'Live Camera'}
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  {cameraActive && (
                    <div className="camera-view">
                      <video ref={videoRef} autoPlay playsInline />
                      <button className="capture-btn" onClick={capturePhoto}>
                        {language === 'ar' ? 'التقط الصورة' : 'Capture'}
                      </button>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="preview-section">
                      <img src={previewUrl} alt="Preview" />
                      <button
                        className="btn btn-success"
                        onClick={handleAIScan}
                        disabled={loading}
                      >
                        {loading ? '⏳ ' : '🔬 '}
                        {language === 'ar' ? 'تحليل الصورة' : 'Analyze Image'}
                      </button>
                    </div>
                  )}

                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
              )}

              {activeTab === 'search' && (
                <div className="search-section">
                  <h3>{language === 'ar' ? 'بحث يدوي عن الطعام' : 'Search for Food'}</h3>

                  <div className="search-input-wrapper">
                    <form onSubmit={handleSearch} className="search-form">
                      <input
                        type="text"
                        placeholder={language === 'ar' ? 'ابحث عن طعام...' : 'Search for food...'}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="search-input"
                      />
                      <button type="submit" className="btn btn-primary" disabled={searchLoading}>
                        {searchLoading ? '⏳' : '🔍'}
                      </button>
                    </form>

                    {showSuggestions && suggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                        {suggestions.map((food) => (
                          <div
                            key={food._id}
                            className="suggestion-item"
                            onClick={() => addFoodItem(food)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                          >
                            <img 
                              src={food.image_url || `/static/food_images/${(food.name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`} 
                              alt={food.name_ar || food.name} 
                              style={{ width: '30px', height: '30px', borderRadius: '5px', objectFit: 'cover', flexShrink: 0 }}
                              onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span className="suggestion-name">
                                {food.name_ar} - {food.name}
                              </span>
                              <span className="suggestion-details">
                                {food.calories.toFixed(1)} cal / {food.serving_unit || 'gram'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.map(food => (
                        <div key={food._id} className="search-result-item" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img 
                            src={food.image_url || `/static/food_images/${(food.name || '').toLowerCase().replace(/\s+/g, '_')}.jpg`} 
                            alt={food.name_ar || food.name} 
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                            onError={(e) => { e.target.src = '/static/food_images/default.jpg'; }}
                          />
                          <div className="result-info" style={{ flex: 1 }}>
                            <h4>{language === 'ar' ? food.name_ar : food.name}</h4>
                            <p className="macros-summary">
                              {food.calories.toFixed(0)} cal | {(food.protein || 0).toFixed(1)}g protein
                            </p>
                          </div>
                          <button
                            className="btn btn-small"
                            onClick={() => addFoodItem(food)}
                          >
                            ➕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
            </div>

            {/* Right Side: Meal Items & Summary */}
            <div className="scanner-right">
              <div className="meal-items-section">
                <h3>
                  {language === 'ar' ? 'الوجبة الحالية' : 'Current Meal'}
                  <span className="meal-type-badge">{language === 'ar' ? t(`food.${selectedMealType}`) : selectedMealType}</span>
                </h3>

                {mealItems.length === 0 ? (
                  <div className="no-items">
                    {language === 'ar' ? 'لم تضف أي عناصر بعد' : 'No items added yet'}
                  </div>
                ) : (
                  <div className="meal-items-list">
                    {mealItems.map(item => (
                      <div key={item.id} className="meal-item">
                        <div className="item-name">{item.name}</div>
                        <div className="item-controls">
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          >
                            ➖
                          </button>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityUpdate(item.id, e.target.value)}
                            className="qty-input"
                          />
                          <span className="unit">{formatUnit(item.serving_unit)}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          >
                            ➕
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteItem(item.id)}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="item-calories">
                          {(item.calories * item.quantity).toFixed(0)} cal
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="summary-section">
                <h4>{language === 'ar' ? 'ملخص التغذية' : 'Nutrition Summary'}</h4>
                <div className="summary-row">
                  <span>{language === 'ar' ? 'السعرات' : 'Calories'}:</span>
                  <strong>{totals.calories.toFixed(0)}</strong>
                </div>
                <div className="summary-row">
                  <span>{language === 'ar' ? 'البروتين' : 'Protein'}:</span>
                  <strong>{totals.protein.toFixed(1)}g</strong>
                </div>
                <div className="summary-row">
                  <span>{language === 'ar' ? 'الكربوهيدرات' : 'Carbs'}:</span>
                  <strong>{totals.carbs.toFixed(1)}g</strong>
                </div>
                <div className="summary-row">
                  <span>{language === 'ar' ? 'الدهون' : 'Fat'}:</span>
                  <strong>{totals.fat.toFixed(1)}g</strong>
                </div>

                <button
                  className="btn btn-submit"
                  onClick={handleSubmit}
                  disabled={loading || mealItems.length === 0}
                >
                  {loading ? '⏳ ' : '✓ '}
                  {language === 'ar' ? 'إضافة الوجبة' : 'Add Meal'}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedMealType(null)}
                >
                  {language === 'ar' ? 'اختر نوع آخر' : 'Change Meal Type'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
