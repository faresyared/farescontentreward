import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import setAuthToken from './utils/setAuthToken';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyAccount from './pages/VerifyAccount'; // Import the new page
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CampaignPageLayout from './pages/CampaignPageLayout';
import CampaignPage from './pages/CampaignPage';
import UserManagement from './pages/UserManagement';
import AdminAnalytics from './pages/AdminAnalytics';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

if (localStorage.token) { setAuthToken(localStorage.token); }

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* --- NEW ROUTE FOR CODE VERIFICATION --- */}
      <Route path="/verify-account" element={<VerifyAccount />} />
      
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* The old /verify-email/:token route is no longer needed */}

      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      <Route element={<CampaignPageLayout />}>
        <Route path="/dashboard/campaign/:id" element={<CampaignPage />} />
      </Route>
    </Routes>
  );
}

export default App;