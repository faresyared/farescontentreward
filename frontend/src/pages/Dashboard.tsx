// src/pages/Dashboard.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black font-sans">
      {/* Floating 3D shapes for visual depth */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <Navbar />
      <main className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* The Outlet is where nested routes like Home, Campaigns, etc., will be rendered */}
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;