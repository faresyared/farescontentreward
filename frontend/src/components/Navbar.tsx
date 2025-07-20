// frontend/src/components/Navbar.tsx

import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, MegaphoneIcon, CurrencyDollarIcon, UserCircleIcon, BookmarkIcon, SignalIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Popover, Transition } from '@headlessui/react';

const Navbar = () => {
  const { user } = useAuth();

  const placeholderUser = {
    name: user?.username || 'User',
    avatar: 'https://i.pravatar.cc/150?u=' + user?.id,
  };

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
      isActive ? 'bg-red-500/10 text-red-400' : 'text-gray-400'
    }`;
    
  const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
      isActive ? 'bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">Reelify</h1>
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/dashboard/home" className={desktopNavLinkClass}><HomeIcon className="h-5 w-5 mr-2" /> Home</NavLink>
              <NavLink to="/dashboard/campaigns" className={desktopNavLinkClass}><MegaphoneIcon className="h-5 w-5 mr-2" /> Campaigns</NavLink>
              <NavLink to="/dashboard/earnings" className={desktopNavLinkClass}><CurrencyDollarIcon className="h-5 w-5 mr-2" /> Earnings</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* --- NEW LIVESTREAMS POPOVER FOR DESKTOP --- */}
            <div className="hidden md:block">
                <Popover className="relative">
                    <Popover.Button className="h-10 w-10 bg-gray-800/50 border border-gray-700/50 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all outline-none">
                        <SignalIcon className="h-5 w-5" />
                    </Popover.Button>
                    <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                        <Popover.Panel className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg p-2">
                            <div className="text-center text-gray-400">
                                <p className="font-bold">Livestreams</p>
                                <p className="text-sm">This feature is coming soon.</p>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </Popover>
            </div>

            <NavLink to="/dashboard/profile" className="flex items-center space-x-3 hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-300">
              <span className="text-white font-medium hidden sm:block">{placeholderUser.name}</span>
              <img className="h-10 w-10 rounded-full border-2 border-red-500/50" src={placeholderUser.avatar} alt="User avatar" />
            </NavLink>
          </div>
        </div>
      </div>
      
      {/* --- NEW MOBILE BOTTOM BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-gray-800/50 p-1">
        <div className="flex justify-around items-center">
          <NavLink to="/dashboard/home" className={mobileNavLinkClass}> <HomeIcon className="h-6 w-6" /> <span className="text-xs mt-1">Home</span> </NavLink>
          <NavLink to="/dashboard/campaigns" className={mobileNavLinkClass}> <MegaphoneIcon className="h-6 w-6" /> <span className="text-xs mt-1">Campaigns</span> </NavLink>
          <NavLink to="/dashboard/earnings" className={mobileNavLinkClass}> <CurrencyDollarIcon className="h-6 w-6" /> <span className="text-xs mt-1">Earnings</span> </NavLink>
          
          {/* --- NEW SAVED CAMPAIGNS POPOVER FOR MOBILE --- */}
          <Popover className="relative w-full flex justify-center">
            <Popover.Button className={mobileNavLinkClass({ isActive: false })}>
              <BookmarkIcon className="h-6 w-6" /> <span className="text-xs mt-1">Saved</span>
            </Popover.Button>
            <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute bottom-full mb-2 w-72 bg-gray-900 border border-gray-700/50 rounded-xl shadow-lg p-4">
                  <div className="text-center text-gray-400">
                      <p className="font-bold">Saved Campaigns</p>
                      <p className="text-sm">This feature is coming soon.</p>
                  </div>
              </Popover.Panel>
            </Transition>
          </Popover>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;