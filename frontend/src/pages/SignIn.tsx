import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ login: '', password: '' });
  const [error, setError] = useState('');

  const { login: loginField, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignInClick = async () => {
    setError('');
    if (!loginField || !password) { setError('Please fill in all fields.'); return; }
    try {
      const res = await axios.post('/api/auth/signin', { login: loginField, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    }
  };

  const handleGoogleSuccess = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900 opacity-70 blur-3xl"></div>
      <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl shadow-red-500/10">
        <div className="p-8">
          {/* --- THIS IS THE CHANGE --- */}
          <div className="flex justify-center items-center mb-2">
            <img src="/logo.png" alt="Reelify Logo" className="h-10 w-auto" />
            <span className="ml-3 text-4xl font-bold text-red-500">Reelify</span>
          </div>
          <p className="text-center text-gray-400 mb-8">Welcome back</p>
          
          <div className="space-y-4">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed.')} theme="filled_black" text="signin_with" shape="pill" />

            <div className="flex items-center text-xs text-gray-500">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4">OR</span>
              <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-400">Username or Email</label>
              <input type="text" name="login" value={loginField} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
              <input type="password" name="password" value={password} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 text-center">{error}</div>}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"/>
                <label htmlFor="remember-me" className="ml-2 block text-gray-400">Keep me signed in</label>
              </div>
              <Link to="/forgot-password" className="font-medium text-red-500 hover:text-red-400">Forgot password?</Link>
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