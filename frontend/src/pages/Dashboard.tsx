// frontend/src/pages/Dashboard.tsx

import React, { Fragment } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BookmarkIcon, SignalIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { Popover, Transition } from '@headlessui/react';

const Dashboard = () => {
  return (
    // --- THIS IS THE KEY CHANGE ---
    // We add `overflow-hidden` to the main container to "clip" the animated blobs
    // and prevent them from affecting the page's scroll. This makes the page stable.
    <div className="min-h-screen bg-black font-sans text-gray-300 overflow-hidden">
      
      {/* Animated Background Blobs will now be contained */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main Layout Container */}
      <div className="relative z-20 flex flex-col h-screen">
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
          <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Corner Buttons */}
      <div className="fixed top-20 right-5 z-50">
        <Popover className="relative">
          <Popover.Button className="h-12 w-12 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all outline-none">
              <SignalIcon className="h-6 w-6" />
          </Popover.Button>
          <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg p-4">
                  <div className="text-center text-gray-400">
                      <p className="font-bold">Livestreams</p>
                      <p className="text-sm">This feature is coming soon.</p>
                  </div>
              </Popover.Panel>
          </Transition>
        </Popover>
      </div>

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