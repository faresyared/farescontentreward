import React, { Fragment } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SavedCampaignItem from '../components/SavedCampaignItem';
import { BookmarkIcon, SignalIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { Popover, Transition } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { joinedCampaigns } = useAuth();

  return (
    // --- THIS IS THE NEW LAYOUT STRUCTURE ---
    <div className="h-screen flex flex-col bg-black font-sans text-gray-300">
      {/* Background blobs are now separate and don't affect layout */}
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

      {/* Floating action buttons remain unchanged */}
      <div className="fixed top-24 right-5 z-50">
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
      <div className="fixed top-40 right-5 z-50 block lg:hidden">
        <Popover className="relative">
          <Popover.Button className="h-12 w-12 bg-gray-800/50 backdrop-blur-md border border-gray-700/50 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500/20 transition-all outline-none">
              <BookmarkIcon className="h-6 w-6" />
          </Popover.Button>
          <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute right-0 mt-2 w-72 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                      <BookmarkIcon className="h-6 w-6 text-red-500" />
                      <h2 className="text-lg font-bold">Joined Campaigns</h2>
                  </div>
                  <div className="mt-4 space-y-1">
                    {joinedCampaigns.length > 0 ? (
                        joinedCampaigns.map(campaign => (
                            <SavedCampaignItem key={campaign._id} campaign={campaign} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center mt-4">You haven't joined any campaigns yet.</p>
                    )}
                  </div>
              </Popover.Panel>
          </Transition>
        </Popover>
      </div>
      <div className="fixed bottom-20 left-5 md:left-auto md:right-5 z-50">
        <Popover className="relative">
          <Popover.Button className="h-16 w-16 bg-red-600 shadow-lg shadow-red-500/30 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition-transform hover:scale-110 outline-none">
              <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />
          </Popover.Button>
          <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute bottom-full left-0 md:left-auto md:right-0 mb-2 w-72 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg p-4">
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