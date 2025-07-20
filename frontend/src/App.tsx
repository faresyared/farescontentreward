// src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import setAuthToken from './utils/setAuthToken';

// Import Pages
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';

// Simple "Coming Soon" component
const ComingSoon = () => (
  <div className="text-center">
    <h1 className="text-5xl font-bold text-white">Coming Soon...</h1>
    <p className="text-gray-400 mt-2">This feature is under construction.</p>
  </div>
);


if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Dashboard Nested Routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="profile" element={<Profile />} />
        {/* --- NEW ROUTES START HERE --- */}
        <Route path="chats" element={<ComingSoon />} />
        <Route path="livestreams" element={<ComingSoon />} />
        <Route path="saved" element={<ComingSoon />} />
        {/* --- NEW ROUTES END HERE --- */}
      </Route>
    </Routes>
  );
}

export default App;