import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Paper, Button, Grid, Card, CardMedia, CircularProgress, TextField, Autocomplete, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const localFoodDatabase = [
  { id: 1, name_ar: 'كشري', name_en: 'Koshary', serving_unit: 'gram', calories: 1.6 },
  { id: 3, name_ar: 'برجر لحم', name_en: 'Beef Burger', serving_unit: 'sandwich', calories: 600.0 },
  { id: 4, name_ar: 'بطاطس مقلية', name_en: 'French Fries', serving_unit: 'gram', calories: 3.12 },
  { id: 5, name_ar: 'شاي بالسكر', name_en: 'Tea with Sugar', serving_unit: 'cup', calories: 120.0 },
  { id: 6, name_ar: 'بيتزا', name_en: 'Pizza Slice', serving_unit: 'slice', calories: 285.0 },
  { id: 8, name_ar: 'موز', name_en: 'Banana', serving_unit: 'piece', calories: 105.0 },
  { id: 9, name_ar: 'فراخ', name_en: 'Chicken', serving_unit: 'gram', calories: 1.65 },
  { id: 14, name_ar: 'طماطم', name_en: 'Tomato', serving_unit: 'gram', calories: 0.18 },
];

export default function FoodClassifier() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [mealItems, setMealItems] = useState([]);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const formatUnit = (unit, qty) => {
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
    } else {
      return qty > 1 ? `${unit}s` : unit;
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    setPreviewUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert(language === 'ar' ? 'عذرًا، فشل فتح الكاميرا.' : 'Failed to access camera.');
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
    try {
      const formData = new FormData();
      const responseBlob = await fetch(previewUrl);
      const blob = await responseBlob.blob();
      formData.append('image', blob, 'food_image.jpg');

      const response = await axios.post('http://127.0.0.1:8000/api/predict-food/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.predictions) {
        const detectedItems = response.data.predictions.map((item, index) => ({
          id: Date.now() + index,
          name: language === 'ar' ? item.name_ar : item.name_en,
          serving_unit: item.serving_unit || 'gram',
          calories: parseFloat(item.calories),
          quantity: 1
        }));
        setMealItems([...mealItems, ...detectedItems]);
      } else {
        alert(language === 'ar' ? 'لم يتعرف الموديل على أصناف طعام.' : 'No food items detected.');
      }
    } catch (error) {
      console.error("AI Scan Error:", error);
      alert(language === 'ar' ? 'حدث خطأ أثناء الاتصال بسيرفر الـ AI. تم تشغيل الوضع الاحتياطي!' : 'Error connecting to AI server.');

      const fallbackItems = [
        { id: Date.now(), name: language === 'ar' ? 'فراخ مشوية' : 'Grilled Chicken', serving_unit: 'gram', calories: 1.65, quantity: 100 }
      ];
      setMealItems([...mealItems, ...fallbackItems]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualFood = (event, newValue) => {
    if (newValue) {
      const newItem = {
        id: Date.now(),
        name: language === 'ar' ? newValue.name_ar : newValue.name_en,
        serving_unit: newValue.serving_unit,
        calories: newValue.calories,
        quantity: newValue.serving_unit === 'gram' ? 100 : 1
      };
      setMealItems([...mealItems, newItem]);
    }
  };

  const handleQuantityUpdate = (id, newQty) => {
    setMealItems(mealItems.map(item => {
      if (item.id === id) {
        const validatedQty = isNaN(newQty) ? 0 : newQty;
        return { ...item, quantity: validatedQty >= 0 ? validatedQty : 0 };
      }
      return item;
    }));
  };

  const deleteItem = (id) => {
    setMealItems(mealItems.filter(item => item.id !== id));
  };

  const calculateTotalCalories = () => {
    const total = mealItems.reduce((sum, item) => sum + (item.calories * item.quantity), 0);
    return total.toFixed(1);
  };

  const handleFinalSubmit = () => {
    alert(language === 'ar' ? `تم بنجاح إضافة الوجبة بإجمالي سعرات: ${calculateTotalCalories()} Cal` : `Meal added with total: ${calculateTotalCalories()} Cal`);
    navigate('/dashboard');
  };

  return (
    <Box dir={language === 'ar' ? 'rtl' : 'ltr'} sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1b1b2f 0%, #162447 100%)', color: '#fff', paddingY: 4 }}>
      <Container maxWidth="lg">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')} sx={{ color: '#fff', fontWeight: 'bold', mb: 4 }}>
          {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
        </Button>

        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold', color: '#e43f5a' }}>
          {language === 'ar' ? 'مصنف الأطعمة الذكي ونظام بناء الوجبات' : 'AI Food Classifier & Meal Builder'}
        </Typography>

        <Paper elevation={3} sx={{ p: 2, mb: 4, background: 'rgba(255, 255, 255, 0.9)', borderRadius: 3 }}>
          <Autocomplete
            options={localFoodDatabase}
            getOptionLabel={(option) => language === 'ar' ? `${option.name_ar}` : `${option.name_en}`}
            onChange={handleAddManualFood}
            renderInput={(params) => <TextField {...params} label={language === 'ar' ? 'ابحث عن أكلة يدويًا...' : 'Search food manually...'} variant="outlined" fullWidth />}
          />
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={4} sx={{ padding: 3, background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff', textAlign: 'center', borderRadius: 4 }}>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
              <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
                <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => fileInputRef.current.click()} sx={{ backgroundColor: '#1f4068' }}>
                  {language === 'ar' ? 'صورة من الجهاز 💻' : 'Upload from PC 💻'}
                </Button>
                <Button variant="contained" startIcon={<PhotoCamera />} onClick={startCamera} sx={{ backgroundColor: '#00b4d8' }}>
                  {language === 'ar' ? 'تشغيل الكاميرا 📸' : 'Live Camera 📸'}
                </Button>
              </Box>

              {cameraActive && (
                <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                  <Button variant="contained" color="secondary" onClick={capturePhoto} sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}>
                    {language === 'ar' ? 'التقاط الصورة 🎯' : 'Capture Photo 🎯'}
                  </Button>
                </Box>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {previewUrl && (
                <Card sx={{ borderRadius: 3, overflow: 'hidden', mt: 2 }}>
                  <CardMedia component="img" height="250" image={previewUrl} alt="Preview" />
                </Card>
              )}

              {previewUrl && !loading && (
                <Button variant="contained" fullWidth onClick={handleAIScan} sx={{ backgroundColor: '#e43f5a', mt: 3, fontWeight: 'bold', py: 1.5 }}>
                  {language === 'ar' ? 'بدء الفحص 🔬' : 'Start AI Analysis 🔬'}
                </Button>
              )}

              {loading && (
                <Box sx={{ mt: 3 }}>
                  <CircularProgress color="secondary" />
                  <Typography variant="body1" sx={{ mt: 1 }}>{language === 'ar' ? 'جاري تحليل الصورة...' : 'Analyzing image...'}</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={4} sx={{ padding: 3, background: 'rgba(255, 255, 255, 0.9)', color: '#162447', borderRadius: 4, minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#e43f5a' }}>
                  {language === 'ar' ? 'مكونات الوجبة الحالية:' : 'Current Meal Components:'}
                </Typography>

                {mealItems.length === 0 ? (
                  <Typography variant="body1" align="center" sx={{ color: '#777', mt: 4 }}>{language === 'ar' ? 'لم يتم إضافة أي عناصر بعد' : 'No items added yet'}</Typography>
                ) : (
                  mealItems.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 1.5, background: '#f0f2f5', borderRadius: 2, justifyContent: 'space-between' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: '600' }}>
                          {(item.calories * item.quantity).toFixed(1)} Cal
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => handleQuantityUpdate(item.id, Math.max(0, item.quantity - (item.serving_unit === 'gram' ? 10 : 1)))}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mx: 0.5 }}>
                          <TextField
                            value={item.quantity === 0 ? '' : item.quantity}
                            type="number"
                            size="small"
                            onChange={(e) => handleQuantityUpdate(item.id, parseInt(e.target.value))}
                            onBlur={() => { if (item.quantity <= 0) handleQuantityUpdate(item.id, 1); }}
                            inputProps={{ min: "1", style: { textAlign: 'center', padding: '4px 0px', width: '55px', fontWeight: 'bold' } }}
                            variant="outlined"
                          />
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#555', minWidth: '40px' }}>
                            {formatUnit(item.serving_unit, item.quantity)}
                          </Typography>
                        </Box>

                        <IconButton size="small" onClick={() => handleQuantityUpdate(item.id, item.quantity + (item.serving_unit === 'gram' ? 10 : 1))}>
                          <AddIcon fontSize="small" />
                        </IconButton>

                        <IconButton color="error" size="small" onClick={() => deleteItem(item.id)} sx={{ ml: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>

              {mealItems.length > 0 && (
                <motion.div whileHover={{ scale: 1.02 }} style={{ marginTop: '20px' }}>
                  <Button variant="contained" fullWidth onClick={handleFinalSubmit} sx={{ backgroundColor: '#162447', color: '#fff', py: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                    {language === 'ar' ? 'إرسال الوجبة' : 'Submit Meal'} (Total: {calculateTotalCalories()} Cal)
                  </Button>
                </motion.div>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}