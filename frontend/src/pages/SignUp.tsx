// src/pages/SignUp.tsx

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const SignUp = () => {
  const middleEastCountries = [
    { code: '+966', name: 'Saudi Arabia', emoji: '🇸🇦' },
    { code: '+971', name: 'UAE', emoji: '🇦🇪' },
    { code: '+974', name: 'Qatar', emoji: '🇶🇦' },
    { code: '+965', name: 'Kuwait', emoji: '🇰🇼' },
    { code: '+973', name: 'Bahrain', emoji: '🇧🇭' },
    { code: '+968', name: 'Oman', emoji: '🇴🇲' },
    { code: '+962', name: 'Jordan', emoji: '🇯🇴' },
    { code: '+20', name: 'Egypt', emoji: '🇪🇬' },
    { code: '+961', name: 'Lebanon', emoji: '🇱🇧' },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900 opacity-70 blur-3xl"></div>
      <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl shadow-red-500/10">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-400 mb-8">Join the Reelify community</p>

          <form className="space-y-4">
            {/* Form fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
                <input type="text" id="username" className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-400">Full Name</label>
                <input type="text" id="fullName" className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
              <input type="email" id="email" className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            
            <div>
                <label htmlFor="countryCode" className="block text-sm font-medium text-gray-400">Country & Phone</label>
                <div className="flex gap-2 mt-1">
                    <select id="countryCode" className="bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-2 focus:ring-2 focus:ring-red-500 outline-none">
                        {middleEastCountries.map(country => (
                            <option key={country.code} value={country.code} className="bg-gray-900 text-white">
                                {country.emoji} {country.code}
                            </option>
                        ))}
                    </select>
                    <input type="tel" id="phone" className="block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" placeholder="5X XXX XXXX" />
                </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-400">Password</label>
              <input type="password" id="password" className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg shadow-red-500/20">
                Sign Up
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-red-500 hover:text-red-400">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;