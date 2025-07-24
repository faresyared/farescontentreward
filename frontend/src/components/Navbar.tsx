import React, { Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HomeIcon, MegaphoneIcon, CurrencyDollarIcon, Cog6ToothIcon, UserIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };
    
  const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) => `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${ isActive ? 'bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white' }`;

  return (
    // --- THIS IS THE FIX ---
    // The 'sticky' and 'top-0' classes have been removed. The new flexbox layout handles the positioning.
    <nav className="z-40 bg-black/70 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <NavLink to="/dashboard/home" className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">Reelify</h1>
            </NavLink>
            <div className="hidden md:flex items-center space-x-4">
              <NavLink to="/dashboard/home" className={desktopNavLinkClass}><HomeIcon className="h-5 w-5 mr-2" /> Home</NavLink>
              <NavLink to="/dashboard/campaigns" className={desktopNavLinkClass}><MegaphoneIcon className="h-5 w-5 mr-2" /> Campaigns</NavLink>
              <NavLink to="/dashboard/earnings" className={desktopNavLinkClass}><CurrencyDollarIcon className="h-5 w-5 mr-2" /> Earnings</NavLink>
            </div>
          </div>

          <div className="flex items-center">
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-3 hover:bg-gray-800/50 p-2 rounded-lg transition-colors duration-300 outline-none">
                <span className="text-white font-medium hidden sm:block">{user?.username}</span>
                <img className="h-10 w-10 rounded-full border-2 border-red-500/50" src={user?.avatar} alt="User avatar" />
              </Menu.Button>
              <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-900 border border-gray-700/50 rounded-md shadow-lg focus:outline-none">
                  <div className="p-1">
                    {isAdmin && (
                      <React.Fragment>
                        <Menu.Item>
                          {({ active }) => ( <NavLink to="/dashboard/analytics" className={`${active ? 'bg-red-500/20 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}> <ChartBarIcon className="mr-2 h-5 w-5" /> Analytics </NavLink> )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => ( <NavLink to="/dashboard/users" className={`${active ? 'bg-red-500/20 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}> <ShieldCheckIcon className="mr-2 h-5 w-5" /> User Management </NavLink> )}
                        </Menu.Item>
                        <div className="my-1 h-px bg-gray-700/50" />
                      </React.Fragment>
                    )}
                    <Menu.Item>
                      {({ active }) => ( <NavLink to="/dashboard/profile" className={`${active ? 'bg-red-500/20 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}> <UserIcon className="h-5 w-5" /> Edit Profile </NavLink> )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => ( <NavLink to="/dashboard/settings" className={`${active ? 'bg-red-500/20 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}> <Cog6ToothIcon className="mr-2 h-5 w-5" /> Settings </NavLink> )}
                    </Menu.Item>
                    <div className="my-1 h-px bg-gray-700/50" />
                    <Menu.Item>
                      {({ active }) => ( <button onClick={handleLogout} className={`${active ? 'bg-red-500/20 text-white' : 'text-gray-300'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}> <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5" /> Logout </button> )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;