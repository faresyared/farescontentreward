// frontend/src/pages/Dashboard.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BookmarkIcon, SignalIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black font-sans text-gray-300">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Layout Container */}
      <div className="relative z-10 flex flex-col h-screen">
        <Navbar />
        
        <div className="flex flex-grow overflow-hidden">
          {/* Left Sidebar: Saved Campaigns */}
          <aside className="hidden lg:block w-64 flex-shrink-0 bg-gray-900/30 border-r border-gray-800/50 p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-4">
                <BookmarkIcon className="h-6 w-6 text-red-500" />
                <h2 className="text-lg font-bold">Saved Campaigns</h2>
            </div>
            <div className="text-center text-gray-500 mt-10">
                <p>Your saved campaigns will appear here.</p>
                <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 py-1 px-2 rounded-full mt-2 inline-block">
                    Coming Soon
                </span>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Corner Buttons */}
      {/* Top Right: Livestreams */}
      <div className="fixed top-20 right-5 z-50 group">
         <button className="h-12 w-12 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/20 transition-all">
            <SignalIcon className="h-6 w-6" />
         </button>
         <span className="absolute top-1/2 -right-2 -translate-y-1/2 w-max px-2 py-1 bg-gray-900 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:-right-4 transition-all pointer-events-none">
            Livestreams (Coming Soon)
         </span>
      </div>

      {/* Bottom Right: Chats */}
       <div className="fixed bottom-5 right-5 z-50 group">
         <button className="h-16 w-16 bg-red-600 shadow-lg shadow-red-500/30 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-transform hover:scale-110">
            <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
         </button>
         <span className="absolute top-1/2 -right-4 -translate-y-1/2 w-max px-2 py-1 bg-gray-900 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:-right-6 transition-all pointer-events-none">
            Chats (Coming Soon)
         </span>
      </div>
    </div>
  );
};

export default Dashboard;