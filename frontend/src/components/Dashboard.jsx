import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Card, CardContent, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LogOutIcon from '@mui/icons-material/ExitToApp';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isArabic, setIsArabic] = useState(true);
  const [user, setUser] = useState({ name: 'المستخدم', calories_target: 2000 });

  // جلب بيانات المستخدم المسجل من الـ LocalStorage
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const text = {
    welcome: isArabic ? `أهلاً بك يا ${user.name}` : `Welcome, ${user.name}`,
    title: isArabic ? 'لوحة التحكم والمتابعة اليومية' : 'Daily Tracking Dashboard',
    logout: isArabic ? 'خروج' : 'Logout',
    calCard: isArabic ? 'السعرات الحرارية' : 'Calories',
    calSub: isArabic ? 'المتبقي اليوم' : 'Remaining Today',
    target: isArabic ? 'المستهدف:' : 'Target:',
    eaten: isArabic ? 'المأكول: 0' : 'Eaten: 0',
    protein: isArabic ? 'البروتين' : 'Protein',
    carbs: isArabic ? 'الكربوهيدرات' : 'Carbohydrates',
    fats: isArabic ? 'الدهون' : 'Fats',
    scanBtn: isArabic ? 'فتح مصنف الأطعمة الذكي (الكاميرا) 📸' : 'Open Smart Food Classifier (Camera) 📸',
    langBtn: isArabic ? 'English' : 'عربي'
  };

  return (
    <Box dir={isArabic ? 'rtl' : 'ltr'} sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #162447 0%, #1b1b2f 100%)',
      color: '#fff',
      paddingBottom: 5
    }}>
      {/* البار العلوي (Header) */}
      <Paper elevation={4} sx={{ background: '#1f4068', borderRadius: 0, padding: 2, mb: 4 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{text.title}</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={() => setIsArabic(!isArabic)} variant="outlined" sx={{ color: '#fff', borderColor: '#fff' }}>
              {text.langBtn}
            </Button>
            <Button onClick={handleLogout} variant="contained" color="error" startIcon={<LogOutIcon />}>
              {text.logout}
            </Button>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* رسالة الترحيب */}
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          {text.welcome} 👋
        </Typography>

        <Grid container spacing={4}>
          {/* كارت السعرات الكبيرة */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: 4 }}>
                <CardContent sx={{ textAlign: 'center', padding: 4 }}>
                  <Typography variant="h5" gutterBottom>{text.calCard}</Typography>
                  <Typography variant="h2" sx={{ color: '#e43f5a', fontWeight: 'bold', my: 2 }}>
                    {user.calories_target || 2000}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>{text.calSub}</Typography>
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
                    <Typography variant="body2">{text.target} {user.calories_target || 2000}</Typography>
                    <Typography variant="body2">{text.eaten}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* كروت الماكروس الثلاثة (بروتين، كارب، دهون) */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card sx={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', color: '#fff', borderRadius: 4, height: '100%' }}>
                <CardContent sx={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  
                  {/* بروتين */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{text.protein}</Typography>
                      <Typography variant="body2">0g / 150g</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#e43f5a' } }} />
                  </Box>

                  {/* كارب */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{text.carbs}</Typography>
                      <Typography variant="body2">0g / 200g</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#00b4d8' } }} />
                  </Box>

                  {/* دهون */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{text.fats}</Typography>
                      <Typography variant="body2">0g / 70g</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={0} sx={{ height: 10, borderRadius: 5, backgroundColor: '#162447', '& .MuiLinearProgress-bar': { backgroundColor: '#ffb703' } }} />
                  </Box>

                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* زرار الكاميرا الكبير للذهاب للمصنف الذكي */}
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
                {text.scanBtn}
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}