import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

export default function Navbar() {
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('befit_user') || '{}');
  const userType = user?.user_type || 'subscriber';

  const handleLogout = () => {
    localStorage.removeItem('befit_user');
    localStorage.removeItem('befit_token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const isLoggedIn = !!user?.id;

  const navLinks = [
    { path: '/dashboard', label: t('navbar.home'), show: isLoggedIn },
    { path: '/search', label: t('navbar.search'), show: isLoggedIn },
    { path: '/history', label: t('navbar.history'), show: isLoggedIn },
    { path: '/coach', label: t('navbar.coach'), show: isLoggedIn && userType === 'coach' },
    { path: '/subscriber', label: t('navbar.subscriber'), show: isLoggedIn && userType === 'subscriber' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <img src="/src/assets/logo.svg" alt="BEFIT Logo" className="logo-image" />
          <span className="logo-text">BEFIT</span>
        </Link>

        {/* Hamburger Menu */}
        <button
          className="hamburger"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Nav Links */}
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          {navLinks.map(
            (link) =>
              link.show && (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              )
          )}
        </ul>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Language Toggle */}
          <button className="language-toggle" onClick={toggleLanguage} title="Toggle Language">
            {language === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* User Menu */}
          {user?.name ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={handleLogout}>
                {t('navbar.logout')}
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              {t('auth.login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
