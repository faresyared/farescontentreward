import React, { useEffect } from 'react';
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

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token); // تعيين التوكن في axios headers
    }
  }, []);

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
      </Route>
    </Routes>
  );
}

export default App;
