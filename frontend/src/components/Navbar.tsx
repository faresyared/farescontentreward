// frontend/src/components/Navbar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, MegaphoneIcon, CurrencyDollarIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth(); // We'll use this to get the real user later

  // This is a placeholder. We will connect this to the actual user state.
  const placeholderUser = {
    name: user?.username || 'User',
    avatar: 'https://i.pravatar.cc/150?u=' + user?.id,
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
      isActive
        ? 'bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-black/70 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
              Reelify
            </h1>
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/dashboard/home" className={navLinkClass}>
                <HomeIcon className="h-5 w-5 mr-2" /> Home
              </NavLink>
              <NavLink to="/dashboard/campaigns" className={navLinkClass}>
                 <MegaphoneIcon className="h-5 w-5 mr-2" /> Campaigns
              </NavLink>
              <NavLink to="/dashboard/earnings" className={navLinkClass}>
                <CurrencyDollarIcon className="h-5 w-5 mr-2" /> Earnings
              </NavLink>
            </div>
          </div>

          <div className="flex items-center">
             <NavLink to="/dashboard/profile" className="flex items-center space-x-3 hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-300">
              <span className="text-white font-medium hidden sm:block">{placeholderUser.name}</span>
              <img className="h-10 w-10 rounded-full border-2 border-red-500/50" src={placeholderUser.avatar} alt="User avatar" />
            </NavLink>
          </div>
        </div>
      </div>
       <div className="md:hidden p-2">
            <div className="flex justify-around bg-gray-900/50 rounded-lg p-1">
                 <NavLink to="/dashboard/home" className={navLinkClass}><HomeIcon className="h-6 w-6" /></NavLink>
                 <NavLink to="/dashboard/campaigns" className={navLinkClass}><MegaphoneIcon className="h-6 w-6" /></NavLink>
                 <NavLink to="/dashboard/earnings" className={navLinkClass}><CurrencyDollarIcon className="h-6 w-6" /></NavLink>
                 <NavLink to="/dashboard/profile" className={navLinkClass}><UserCircleIcon className="h-6 w-6" /></NavLink>
            </div>
       </div>
    </nav>
  );
};

export default Navbar;