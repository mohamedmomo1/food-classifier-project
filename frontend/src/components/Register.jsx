import React, { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Paper, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [isArabic, setIsArabic] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', gender: 'male', weight: '', height: '', activity_level: 'moderate'
  });
  const [error, setError] = useState('');

  const text = {
    title: isArabic ? 'إنشاء حساب جديد' : 'Create New Account',
    subtitle: isArabic ? 'أدخل بياناتك الشخصية لإتمام التسجيل' : 'Enter your personal details to register',
    name: isArabic ? 'الاسم الكامل' : 'Full Name',
    email: isArabic ? 'البريد الإلكتروني' : 'Email Address',
    password: isArabic ? 'كلمة المرور' : 'Password',
    age: isArabic ? 'العمر' : 'Age',
    gender: isArabic ? 'الجنس' : 'Gender',
    male: isArabic ? 'ذكر' : 'Male',
    female: isArabic ? 'أنثى' : 'Female',
    weight: isArabic ? 'الوزن (كجم)' : 'Weight (kg)',
    height: isArabic ? 'الطول (سم)' : 'Height (cm)',
    activity: isArabic ? 'مستوى النشاط اليومي' : 'Activity Level',
    act1: isArabic ? 'خامل (بدون تمرين)' : 'Sedentary (No exercise)',
    act2: isArabic ? 'نشاط خفيف (تمرين 1-3 أيام)' : 'Lightly Active (1-3 days)',
    act3: isArabic ? 'نشاط متوسط (تمرين 3-5 أيام)' : 'Moderately Active (3-5 days)',
    act4: isArabic ? 'نشاط عالي (تمرين شاق يومياً)' : 'Very Active (Daily heavy exercise)',
    submit: isArabic ? 'تسجيل الحساب' : 'Register Account',
    hasAccount: isArabic ? 'لديك حساب بالفعل؟ سجل دخولك من هنا' : 'Already have an account? Sign In',
    langBtn: isArabic ? 'English' : 'عربي'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', formData);
      if (response.data.success) {
        alert(isArabic ? 'تم إنشاء الحساب بنجاح!' : 'Account created successfully!');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || (isArabic ? 'حدث خطأ ما' : 'An error occurred'));
    }
  };

  return (
    <Box dir={isArabic ? 'rtl' : 'ltr'} sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1f4068 0%, #162447 100%)',
      padding: 3,
      position: 'relative'
    }}>
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

      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1f4068' }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label={text.name} name="name" fullWidth required onChange={handleChange} />
                <TextField label={text.email} name="email" type="email" fullWidth required onChange={handleChange} />
                <TextField label={text.password} name="password" type="password" fullWidth required onChange={handleChange} />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label={text.age} name="age" type="number" fullWidth required onChange={handleChange} />
                  <TextField label={text.gender} name="gender" select fullWidth value={formData.gender} onChange={handleChange}>
                    <MenuItem value="male">{text.male}</MenuItem>
                    <MenuItem value="female">{text.female}</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField label={text.weight} name="weight" type="number" fullWidth required onChange={handleChange} />
                  <TextField label={text.height} name="height" type="number" fullWidth required onChange={handleChange} />
                </Box>

                <TextField label={text.activity} name="activity_level" select fullWidth value={formData.activity_level} onChange={handleChange}>
                  <MenuItem value="sedentary">{text.act1}</MenuItem>
                  <MenuItem value="light">{text.act2}</MenuItem>
                  <MenuItem value="moderate">{text.act3}</MenuItem>
                  <MenuItem value="active">{text.act4}</MenuItem>
                </TextField>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#e43f5a', '&:hover': { backgroundColor: '#c0354e' }, padding: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                    {text.submit}
                  </Button>
                </motion.div>

                <Button onClick={() => navigate('/login')} sx={{ color: '#1f4068', mt: 1, fontWeight: 'bold' }}>
                  {text.hasAccount}
                </Button>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}