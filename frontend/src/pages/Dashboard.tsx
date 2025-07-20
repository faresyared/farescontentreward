// frontend/src/pages/Dashboard.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
        
        {/* Main Content Area */}
        {/* We add padding to the bottom to prevent the mobile nav from covering content */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* --- NEW CHAT POPOVER BUTTON (Visible on all screen sizes) --- */}
      <div className="fixed bottom-5 right-5 z-50">
        <Popover className="relative">
          <Popover.Button className="h-16 w-16 bg-red-600 shadow-lg shadow-red-500/30 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-transform hover:scale-110 outline-none">
              <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
          </Popover.Button>
          <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute bottom-full right-0 mb-2 w-72 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg p-4">
                  <div className="text-center text-gray-400">
                      <p className="font-bold">Live Chat</p>
                      <p className="text-sm">This feature is coming soon.</p>
                  </div>
              </Popover.Panel>
          </Transition>
        </Popover>
      </div>
    </div>
  );
};

export default Dashboard;