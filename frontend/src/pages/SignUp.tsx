import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    countryCode: '+966',
    phone: '',
  });
  const [error, setError] = useState('');

  const { username, fullName, email, password, countryCode, phone } = formData;

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/auth/signup', formData);
      toast.success(res.data.message);
      
      // --- THIS IS THE CHANGE ---
      // Redirect to the new verification page, passing the email along
      navigate(`/verify-account?email=${email}`);

    } catch (err: any) {
      if (err.response && err.response.data.errors) {
        setError(err.response.data.errors[0].msg);
      } else if (err.response && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900 opacity-70 blur-3xl"></div>
      <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl shadow-red-500/10">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-2">Create Account</h1>
          <p className="text-center text-gray-400 mb-6">Join the Reelify community</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
                <input type="text" id="username" value={username} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-400">Full Name</label>
                <input type="text" id="fullName" value={fullName} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
              <input type="email" id="email" value={email} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-400">Country & Phone</label>
                <div className="flex gap-2 mt-1">
                    <select id="countryCode" value={countryCode} onChange={onChange} className="bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-2 focus:ring-2 focus:ring-red-500 outline-none">
                        {middleEastCountries.map(country => (<option key={country.code} value={country.code} className="bg-gray-900 text-white">{country.emoji} {country.code}</option>))}
                    </select>
                    <input type="tel" id="phone" value={phone} onChange={onChange} required className="block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none" placeholder="5X XXX XXXX" />
                </div>
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-400">Password</label>
              <input type="password" id="password" value={password} onChange={onChange} required minLength={6} className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 text-center">{error}</div>}
            <div className="pt-2">
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg shadow-red-500/20">Sign Up</button>
            </div>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/" className="font-medium text-red-500 hover:text-red-400">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;