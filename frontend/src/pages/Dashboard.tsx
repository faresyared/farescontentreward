// frontend/src/pages/Dashboard.tsx

import React, { Fragment, useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { BookmarkIcon, SignalIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import { Popover, Transition } from '@headlessui/react';
import { FullCampaign } from '../components/CampaignDetailsModal';

const Dashboard = () => {
  const [savedCampaigns, setSavedCampaigns] = useState<FullCampaign[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    const fetchSavedCampaigns = async () => {
      try {
        setLoadingSaved(true);
        const res = await axios.get('/api/users/me/saved');
        setSavedCampaigns(res.data);
      } catch (err) {
        console.error("Failed to load saved campaigns", err);
      } finally {
        setLoadingSaved(false);
      }
    };
    fetchSavedCampaigns();
  }, []);

  return (
    <div className="min-h-screen bg-black font-sans text-gray-300 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      
      <div className="flex">
        <aside className="hidden lg:block fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-black/10 border-r border-gray-800/50 p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-4">
              <BookmarkIcon className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-bold">Saved Campaigns</h2>
          </div>
          <div className="mt-4 space-y-2">
            {loadingSaved ? (
              <p className="text-gray-500 text-sm">Loading...</p>
            ) : savedCampaigns.length > 0 ? (
              savedCampaigns.map(campaign => (
                <NavLink 
                  key={campaign._id}
                  to={`/dashboard/campaigns`} // This just navigates to the main page for now
                  className="block p-2 rounded-lg text-gray-300 hover:bg-gray-800/50 truncate"
                >
                  {campaign.name}
                </NavLink>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center mt-8">You have no saved campaigns.</p>
            )}
          </div>
        </aside>
        
        <main className="flex-grow lg:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

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
              <Popover.Panel className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg p-4">
                  <div className="text-center text-gray-400">
                      <p className="font-bold">Saved Campaigns</p>
                      <p className="text-sm">This feature is coming soon.</p>
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