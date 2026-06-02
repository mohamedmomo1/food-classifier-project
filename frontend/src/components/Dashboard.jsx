import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Card, CardContent, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LogOutIcon from '@mui/icons-material/ExitToApp';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState({});

  useEffect(() => {
    const loggedInUser = localStorage.getItem('befit_user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('befit_user');
    localStorage.removeItem('befit_token');
    navigate('/login');
  };

  return (
    <Box dir={language === 'ar' ? 'rtl' : 'ltr'} sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #162447 0%, #1b1b2f 100%)',
      color: '#fff',
      paddingBottom: 5
    }}>
      <Paper elevation={4} sx={{ background: '#1f4068', borderRadius: 0, padding: 2, mb: 4 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>لوحة التحكم</Typography>
          <Button onClick={handleLogout} variant="contained" color="error" startIcon={<LogOutIcon />}>
            {t('navbar.logout')}
          </Button>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          {t('auth.login') === 'Login' ? `Welcome, ${user.name}` : `أهلاً بك يا ${user.name}`} 👋
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: 4 }}>
                <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                  <Typography variant="h5" gutterBottom>{t('food.calories')}</Typography>
                  <Typography variant="h2" sx={{ color: '#e43f5a', fontWeight: 'bold', my: 2 }}>
                    {user.calories_target || 2000}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>{t('history.totalCalories')}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{t('food.protein')}</Typography>
                      <Typography variant="body2">0g / 150g</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#e43f5a' } }} />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{t('food.carbs')}</Typography>
                      <Typography variant="body2">0g / 200g</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#00b4d8' } }} />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{t('food.fat')}</Typography>
                      <Typography variant="body2">0g / 70g</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#ffb703' } }} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/classifier')}
                startIcon={<CameraAltIcon />}
                sx={{
                  backgroundColor: '#e43f5a',
                  '&:hover': { backgroundColor: '#c0354e' },
                  padding: 2,
                  borderRadius: 4,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 20px rgba(228, 63, 90, 0.4)'
                }}
              >
                {t('food.search')} 📸
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
