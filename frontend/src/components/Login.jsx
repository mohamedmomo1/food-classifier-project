import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [isArabic, setIsArabic] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const text = {
    title: isArabic ? 'تسجيل الدخول' : 'Sign In',
    subtitle: isArabic ? 'مرحباً بك مجدداً في نظام التتبع الذكي' : 'Welcome back to the Smart Tracking System',
    email: isArabic ? 'البريد الإلكتروني' : 'Email Address',
    password: isArabic ? 'كلمة المرور' : 'Password',
    submit: isArabic ? 'دخول' : 'Login',
    noAccount: isArabic ? 'ليس لديك حساب؟ سجل حساباً جديداً من هنا' : "Don't have an account? Register here",
    langBtn: isArabic ? 'English' : 'عربي',
    loginSuccess: isArabic ? 'مرحباً بك! تم تسجيل الدخول بنجاح' : 'Welcome! Logged in successfully',
    loginError: isArabic ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', formData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        alert(text.loginSuccess);
         navigate('/dashboard'); // هنفعلها لما نعمل الصفحة الرئيسية
      }
    } catch (err) {
      setError(err.response?.data?.error || text.loginError);
    }
  };

  return (
    <Box dir={isArabic ? 'rtl' : 'ltr'} sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1b1b2f 0%, #162447 100%)',
      padding: 3,
      position: 'relative'
    }}>
      {/* زرار تغيير اللغة الشاقي */}
      <Button 
        onClick={() => setIsArabic(!isArabic)}
        variant="outlined"
        sx={{
          position: 'absolute',
          top: 20,
          right: isArabic ? 20 : 'auto',
          left: isArabic ? 'auto' : 20,
          color: '#fff',
          borderColor: '#fff',
          fontWeight: 'bold',
          '&:hover': { borderColor: '#e43f5a', color: '#e43f5a' }
        }}
      >
        {text.langBtn}
      </Button>

      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#162447' }}>
              {text.title}
            </Typography>
            <Typography variant="body2" align="center" gutterBottom sx={{ mb: 3, color: '#555' }}>
              {text.subtitle}
            </Typography>

            {error && (
              <Typography variant="body2" align="center" sx={{ color: 'red', mb: 2, fontWeight: 'bold' }}>
                {error}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField label={text.email} name="email" type="email" fullWidth required onChange={handleChange} />
                <TextField label={text.password} name="password" type="password" fullWidth required onChange={handleChange} />
                
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#1f4068', '&:hover': { backgroundColor: '#162447' }, padding: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                    {text.submit}
                  </Button>
                </motion.div>

                <Button onClick={() => navigate('/register')} sx={{ color: '#e43f5a', mt: 1, fontWeight: 'bold' }}>
                  {text.noAccount}
                </Button>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}