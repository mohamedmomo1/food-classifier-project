import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Card, CardContent, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LogOutIcon from '@mui/icons-material/ExitToApp';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:8000/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState({});
  const [macros, setMacros] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchMacros = async (userId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE_URL}/meals/summary/?user_id=${userId}&period=daily&date=${today}`
      );
      const data = await response.json();

      if (data.success && data.summary) {
        setMacros({
          calories: data.summary.total_calories || 0,
          protein: data.summary.total_protein || 0,
          carbs: data.summary.total_carbs || 0,
          fat: data.summary.total_fat || 0
        });
      }
    } catch (err) {
      console.error('Error fetching macros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loggedInUser = localStorage.getItem('befit_user');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      fetchMacros(userData.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const handleMealLogged = () => {
      if (user.id) {
        fetchMacros(user.id);
      }
    };

    window.addEventListener('meal-logged', handleMealLogged);
    return () => window.removeEventListener('meal-logged', handleMealLogged);
  }, [user.id]);

  const handleLogout = () => {
    localStorage.removeItem('befit_user');
    localStorage.removeItem('befit_token');
    navigate('/login');
  };

  const targetCalories = user.targets?.daily_calories || 2000;
  const targetProtein = user.targets?.protein_g || 150;
  const targetCarbs = user.targets?.carbs_g || 200;
  const targetFat = user.targets?.fat_g || 70;

  const proteinPercent = (macros.protein / targetProtein) * 100;
  const carbsPercent = (macros.carbs / targetCarbs) * 100;
  const fatPercent = (macros.fat / targetFat) * 100;

  return (
    <Box className="dashboard-wrapper" dir={language === 'ar' ? 'rtl' : 'ltr'} sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #162447 0%, #1b1b2f 100%)',
      color: '#fff',
      paddingBottom: 5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100% !important'
    }}>
      <Paper className="dashboard-header-bar" elevation={4} sx={{ background: '#1f4068', borderRadius: 0, width: '100%' }}>
        <Box className="dashboard-header-content" sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100% !important',
          maxWidth: '1200px !important',
          margin: '0 auto !important',
          paddingX: '20px !important'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
          </Typography>
          <Button onClick={handleLogout} variant="contained" color="error" startIcon={<LogOutIcon />} size="small">
            {t('navbar.logout')}
          </Button>
        </Box>
      </Paper>

      <Box className="dashboard-main-content" sx={{
        width: '100% !important',
        maxWidth: '1200px !important',
        margin: '0 auto !important',
        paddingX: '20px !important'
      }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center', fontSize: '2rem' }}>
          {language === 'ar' ? `أهلاً بك يا ${user.name}` : `Welcome, ${user.name}`} 👋
        </Typography>

        {/* Cards & Button Wrapper - Constrained width */}
        <Box className="dashboard-cards-wrapper" sx={{
          maxWidth: '950px',
          margin: '0 auto',
          width: '100%'
        }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card className="dashboard-card" sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: 3 }}>
                  <CardContent sx={{ textAlign: 'center', padding: 2 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontSize: '1rem' }}>
                      {language === 'ar' ? 'السعرات اليومية' : 'Daily Calories'}
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#e43f5a', fontWeight: 'bold', my: 1.5, fontSize: '2.2rem' }}>
                      {macros.calories.toFixed(0)}/{targetCalories}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((macros.calories / targetCalories) * 100, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 5,
                        backgroundColor: '#162447',
                        '& .MuiLinearProgress-bar': { backgroundColor: '#e43f5a' }
                      }}
                    />
                    <Typography variant="body2" sx={{ opacity: 0.8, mt: 1, fontSize: '0.85rem' }}>
                      {language === 'ar' ? 'متبقي' : 'Remaining'}: {Math.max(0, targetCalories - macros.calories).toFixed(0)} Cal
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <Card className="dashboard-card" sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {language === 'ar' ? 'البروتين' : 'Protein'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          {macros.protein.toFixed(1)}g / {targetProtein}g
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(proteinPercent, 100)}
                        sx={{ height: 6, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#e43f5a' } }}
                      />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {language === 'ar' ? 'الكربوهيدرات' : 'Carbs'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          {macros.carbs.toFixed(1)}g / {targetCarbs}g
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(carbsPercent, 100)}
                        sx={{ height: 6, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#00b4d8' } }}
                      />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {language === 'ar' ? 'الدهون' : 'Fat'}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          {macros.fat.toFixed(1)}g / {targetFat}g
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(fatPercent, 100)}
                        sx={{ height: 6, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#ffb703' } }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  className="dashboard-search-btn"
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/smart-scanner')}
                  startIcon={<CameraAltIcon />}
                  sx={{
                    backgroundColor: '#e43f5a',
                    '&:hover': { backgroundColor: '#c0354e' },
                    padding: '0.8rem 2rem',
                    borderRadius: 2,
                    fontSize: '0.95rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 20px rgba(228, 63, 90, 0.4)'
                  }}
                >
                  {language === 'ar' ? 'ابحث عن الطعام' : 'Search Food'} 📸
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
