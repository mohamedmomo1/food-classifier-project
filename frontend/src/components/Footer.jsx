import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Section */}
        <div className="footer-section">
          <h3 className="footer-title">BEFIT</h3>
          <p className="footer-about">{t('footer.aboutText')}</p>
        </div>

        {/* Contact Section */}
        <div className="footer-section">
          <h3 className="footer-title">{t('footer.contactUs')}</h3>
          <ul className="footer-list">
            <li>
              <span className="footer-label">{t('footer.email')}:</span>
              <a href="mailto:support@befit.com">support@befit.com</a>
            </li>
            <li>
              <span className="footer-label">{t('footer.phone')}:</span>
              <a href="tel:+201221248911">+20 12 21248911</a>
            </li>
            <li>
              <span className="footer-label">{t('footer.address')}:</span>
              <span>Cairo, Egypt</span>
            </li>
          </ul>
        </div>

        {/* Social Section */}
        <div className="footer-section">
          <h3 className="footer-title">{t('footer.followUs')}</h3>
          <div className="social-links">
            <a href="#" className="social-icon" title="Facebook" aria-label="Facebook">
              f
            </a>
            <a href="#" className="social-icon" title="Twitter" aria-label="Twitter">
              𝕏
            </a>
            <a href="#" className="social-icon" title="Instagram" aria-label="Instagram">
              📷
            </a>
            <a href="#" className="social-icon" title="LinkedIn" aria-label="LinkedIn">
              in
            </a>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section">
          <h3 className="footer-title">{t('footer.about')}</h3>
          <ul className="footer-list">
            <li>
              <a href="#privacy">Privacy Policy</a>
            </li>
            <li>
              <a href="#terms">Terms of Service</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a href="#support">Support</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>
          &copy; {currentYear} BEFIT. {t('footer.allRights')}
        </p>
      </div>
    </footer>
  );
}
