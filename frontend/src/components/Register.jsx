import React, { useState } from 'react';
import { Box, TextField, Button, Typography, MenuItem, Paper, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activity_level: 'moderate',
    user_type: 'subscriber'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register/', formData);
      if (response.data.success) {
        alert(t('auth.registerSuccess'));
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.error || t('auth.registerError'));
    }
  };

  return (
    <Box dir={language === 'ar' ? 'rtl' : 'ltr'} sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1f4068 0%, #162447 100%)',
      padding: 3,
      position: 'relative'
    }}>

      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#1f4068' }}>
              {t('auth.register')}
            </Typography>

            {error && (
              <Typography variant="body2" align="center" sx={{ color: 'red', mb: 2, fontWeight: 'bold' }}>
                {error}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={t('auth.name')}
                  name="name"
                  fullWidth
                  required
                  onChange={handleChange}
                  value={formData.name}
                />
                <TextField
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  fullWidth
                  required
                  onChange={handleChange}
                  value={formData.email}
                />
                <TextField
                  label={t('auth.password')}
                  name="password"
                  type="password"
                  fullWidth
                  required
                  onChange={handleChange}
                  value={formData.password}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={t('auth.age')}
                    name="age"
                    type="number"
                    fullWidth
                    required
                    onChange={handleChange}
                    value={formData.age}
                  />
                  <TextField
                    label={t('auth.gender')}
                    name="gender"
                    select
                    fullWidth
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <MenuItem value="male">{t('auth.male')}</MenuItem>
                    <MenuItem value="female">{t('auth.female')}</MenuItem>
                  </TextField>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={t('auth.weight')}
                    name="weight"
                    type="number"
                    fullWidth
                    required
                    onChange={handleChange}
                    value={formData.weight}
                  />
                  <TextField
                    label={t('auth.height')}
                    name="height"
                    type="number"
                    fullWidth
                    required
                    onChange={handleChange}
                    value={formData.height}
                  />
                </Box>

                <TextField
                  label={t('auth.activityLevel')}
                  name="activity_level"
                  select
                  fullWidth
                  value={formData.activity_level}
                  onChange={handleChange}
                >
                  <MenuItem value="sedentary">{t('auth.sedentary')}</MenuItem>
                  <MenuItem value="light">{t('auth.light')}</MenuItem>
                  <MenuItem value="moderate">{t('auth.moderate')}</MenuItem>
                  <MenuItem value="active">{t('auth.active')}</MenuItem>
                </TextField>

                <TextField
                  label={t('auth.userType')}
                  name="user_type"
                  select
                  fullWidth
                  value={formData.user_type}
                  onChange={handleChange}
                >
                  <MenuItem value="subscriber">{t('auth.subscriber')}</MenuItem>
                  <MenuItem value="coach">{t('auth.coach')}</MenuItem>
                </TextField>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#e43f5a', '&:hover': { backgroundColor: '#c0354e' }, padding: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                    {t('auth.register')}
                  </Button>
                </motion.div>

                <Button onClick={() => navigate('/login')} sx={{ color: '#1f4068', mt: 1, fontWeight: 'bold' }}>
                  {t('auth.login')}
                </Button>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}