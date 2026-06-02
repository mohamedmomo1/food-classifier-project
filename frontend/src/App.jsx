import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import FoodClassifier from './components/FoodClassifier.jsx';
import FoodSearch from './components/FoodSearch.jsx';
import MealHistory from './components/MealHistory.jsx';
import CoachPanel from './components/CoachPanel.jsx';
import SubscriberPanel from './components/SubscriberPanel.jsx';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/classifier" element={<FoodClassifier />} />
          <Route path="/search" element={<FoodSearch />} />
          <Route path="/history" element={<MealHistory />} />
          <Route path="/coach" element={<CoachPanel />} />
          <Route path="/subscriber" element={<SubscriberPanel />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}