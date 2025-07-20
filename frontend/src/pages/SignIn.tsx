// src/pages/SignIn.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const { username, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignInClick = async () => {
    setError('');

    if (!username || !password) {
        setError('Please enter both username and password.');
        return;
    }

    try {
      const res = await axios.post('/api/users/signin', formData);
         localStorage.setItem('token', res.data.token);
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data.message) {
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
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-2">Reelify</h1>
          <p className="text-center text-gray-400 mb-8">Welcome back</p>
          <div className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-400">Username</label>
              <input type="text" id="username" value={username} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition duration-300" placeholder="your_username" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
              <input type="password" id="password" value={password} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition duration-300" placeholder="••••••••" />
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 text-center">{error}</div>}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 bg-gray-800 border-gray-600 text-red-600 rounded focus:ring-red-500"/>
                <label htmlFor="remember-me" className="ml-2 block text-gray-400">Keep me signed in</label>
              </div>
              <a href="#" className="font-medium text-red-500 hover:text-red-400">Forgot password?</a>
            </div>
            <div>
              <button type="button" onClick={handleSignInClick} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg shadow-red-500/20">Sign In</button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-red-500 hover:text-red-400">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;