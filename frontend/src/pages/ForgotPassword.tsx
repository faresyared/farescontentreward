// frontend/src/pages/ForgotPassword.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/api/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Reset Password</h1>
            <p className="text-gray-400 mb-6">Enter your email address and we will send you a link to reset your password.</p>
            <form onSubmit={onSubmit}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-gray-900/50 ..."/>
                {message && <p className="text-green-400 mt-4">{message}</p>}
                {error && <p className="text-red-400 mt-4">{error}</p>}
                <div className="mt-6">
                    <button type="submit" className="w-full bg-red-600 ...">Send Reset Link</button>
                </div>
            </form>
             <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{' '}
                <Link to="/" className="font-medium text-red-500 hover:text-red-400">Sign In</Link>
            </p>
        </div>
    </div>
  );
};

export default ForgotPassword;