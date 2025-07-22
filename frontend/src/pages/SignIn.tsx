// frontend/src/pages/SignIn.tsx

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
      const res = await axios.post('/api/users/signin', { login: loginField, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred.');
    }
  };

  const handleGoogleSuccess = () => {
    // Redirect to the backend Google auth route
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-red-900 opacity-70 blur-3xl"></div>
      <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 shadow-2xl shadow-red-500/10">
        <div className="p-8">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 mb-2">Reelify</h1>
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
              <input type="text" name="login" value={loginField} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 ..."/>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
              <input type="password" name="password" value={password} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 ..."/>
            </div>
            {error && <div className="bg-red-500/20 ...">{error}</div>}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 ..."/>
                <label htmlFor="remember-me" className="ml-2 block text-gray-400">Keep me signed in</label>
              </div>
              <Link to="/forgot-password" className="font-medium text-red-500 hover:text-red-400">Forgot password?</Link>
            </div>
            <div>
              <button type="button" onClick={handleSignInClick} className="w-full bg-red-600 ...">Sign In</button>
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