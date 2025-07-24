import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileNav from '../components/MobileNav'; // Import the MobileNav
import SavedCampaignItem from '../components/SavedCampaignItem';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const CampaignPageLayout = () => {
  const { joinedCampaigns } = useAuth();

  return (
    // --- THIS IS THE NEW LAYOUT STRUCTURE ---
    <div className="h-screen flex flex-col bg-black font-sans text-gray-300">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar is the first item in the flex column. It will not scroll. */}
      <Navbar />
      
      {/* This container takes up the rest of the screen height and handles its own overflow */}
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block w-64 bg-black/10 border-r border-gray-800/50 p-4 overflow-y-auto">
          <div className="flex items-center gap-2 text-gray-400 mb-4">
              <BookmarkIcon className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-bold">Joined Campaigns</h2>
          </div>
          <div className="mt-4 space-y-1">
            {joinedCampaigns.length > 0 ? (
              joinedCampaigns.map(campaign => (
                <SavedCampaignItem key={campaign._id} campaign={campaign} />
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center mt-8">You haven't joined any campaigns yet.</p>
            )}
          </div>
        </aside>
        
        {/* The main content area is now the ONLY part that scrolls vertically */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 pb-20">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Render the mobile nav here, at the top level, so it's not clipped */}
      <MobileNav />
    </div>
  );
};

export default CampaignPageLayout;