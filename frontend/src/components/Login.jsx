import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', formData);
      if (response.data.success) {
        localStorage.setItem('befit_user', JSON.stringify(response.data.user));
        localStorage.setItem('befit_token', response.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || t('auth.loginError'));
    }
  };

  return (
    <Box dir={language === 'ar' ? 'rtl' : 'ltr'} sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1b1b2f 0%, #162447 100%)',
      padding: 3,
      position: 'relative'
    }}>

      <Container maxWidth="xs">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 4, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(10px)' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#162447' }}>
              {t('auth.login')}
            </Typography>

            {error && (
              <Typography variant="body2" align="center" sx={{ color: 'red', mb: 2, fontWeight: 'bold' }}>
                {error}
              </Typography>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#1f4068', '&:hover': { backgroundColor: '#162447' }, padding: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                    {t('auth.login')}
                  </Button>
                </motion.div>

                <Button onClick={() => navigate('/register')} sx={{ color: '#e43f5a', mt: 1, fontWeight: 'bold' }}>
                  {t('auth.register')}
                </Button>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
}