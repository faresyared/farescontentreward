// src/pages/Profile.tsx

import React from 'react';
import { UserCircleIcon, AtSymbolIcon, LockClosedIcon, MapPinIcon, ArrowRightOnRectangleIcon, CameraIcon } from '@heroicons/react/24/outline';

// Define the Middle East countries array locally
const middleEastCountries = [
    { code: '+966', name: 'Saudi Arabia' },
    { code: '+971', name: 'UAE' },
    { code: '+974', name: 'Qatar' },
    { code: '+965', name: 'Kuwait' },
    { code: '+973', name: 'Bahrain' },
    { code: '+968', name: 'Oman' },
    { code: '+962', name: 'Jordan' },
    { code: '+20', name: 'Egypt' },
    { code: '+961', name: 'Lebanon' },
];

// Mock user data - updated with avatar and phone
const currentUser = {
    fullName: 'Al-Anoud',
    email: 'alanoud@example.com',
    countryCode: '+966',
    phone: '551234567',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
};

const Profile = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-white">Profile Settings</h1>

            {/* Profile Update Form */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50">
                <form className="p-8 space-y-6">

                    {/* Profile Photo Upload */}
                    <div className="flex justify-center">
                        <div className="relative group">
                            <img className="h-28 w-28 rounded-full object-cover border-4 border-gray-700/50 group-hover:border-red-500/50 transition-all duration-300" src={currentUser.avatar} alt="Profile" />
                            <label htmlFor="profile-photo-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <CameraIcon className="h-8 w-8" />
                            </label>
                            <input type="file" id="profile-photo-upload" className="hidden" accept="image/*" />
                        </div>
                    </div>

                    {/* Full Name */}
                    <div className="flex items-center space-x-4">
                        <UserCircleIcon className="h-7 w-7 text-gray-400" />
                        <div className="flex-grow">
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-400">Full Name</label>
                            <input type="text" id="fullName" defaultValue={currentUser.fullName} className="mt-1 block w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center space-x-4">
                        <AtSymbolIcon className="h-7 w-7 text-gray-400" />
                        <div className="flex-grow">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
                            <input type="email" id="email" defaultValue={currentUser.email} className="mt-1 block w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                        </div>
                    </div>
                    
                    {/* Country & Phone Number */}
                     <div className="flex items-center space-x-4">
                        <MapPinIcon className="h-7 w-7 text-gray-400" />
                        <div className="flex-grow">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-400">Phone Number</label>
                            <div className="flex gap-2 mt-1">
                                <select id="countryCode" defaultValue={currentUser.countryCode} className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none">
                                    {middleEastCountries.map(country => (
                                        <option key={country.code} value={country.code} className="bg-gray-900 text-white">
                                            {country.code}
                                        </option>
                                    ))}
                                </select>
                                <input type="tel" id="phone" defaultValue={currentUser.phone} placeholder="5X XXX XXXX" className="block w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex items-center space-x-4">
                        <LockClosedIcon className="h-7 w-7 text-gray-400" />
                        <div className="flex-grow">
                            <label htmlFor="password"className="block text-sm font-medium text-gray-400">New Password</label>
                            <input type="password" id="password" placeholder="Leave blank to keep current password" className="mt-1 block w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                        </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="pt-4 flex justify-end">
                         <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Contact and Logout Section */}
            <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50 p-8 text-center">
                 <h2 className="text-xl font-bold text-white mb-2">Need Help?</h2>
                 <p className="text-gray-400 mb-4">Our support team is here to assist you.</p>
                 <a href="mailto:support@reelify.com" className="font-medium text-red-500 hover:text-red-400">Contact Support</a>
                 <div className="border-t border-gray-700/50 my-6"></div>
                 <button className="flex items-center justify-center w-full max-w-xs mx-auto bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 font-bold py-2 px-4 rounded-lg transition duration-300">
                    <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" /> Logout
                 </button>
            </div>
        </div>
    );
};

export default Profile;