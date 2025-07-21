// frontend/src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import setAuthToken from './utils/setAuthToken';

import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Campaigns from './pages/Campaigns';
import Earnings from './pages/Earnings';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import CampaignPageLayout from './pages/CampaignPageLayout'; // Import the new layout
import CampaignPage from './pages/CampaignPage'; // Import the new page

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Main Dashboard Routes */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* --- THIS IS THE NEW ROUTE FOR INDIVIDUAL CAMPAIGN PAGES --- */}
      <Route element={<CampaignPageLayout />}>
        <Route path="/dashboard/campaign/:id" element={<CampaignPage />} />
      </Route>
    </Routes>
  );
}

export default App;