// frontend/src/pages/ResetPassword.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setMessage('');
    setError('');
    try {
      const res = await axios.post(`/api/reset-password/${token}`, { password });
      setMessage(res.data.message + " Redirecting to sign in...");
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Enter New Password</h1>
            <form onSubmit={onSubmit}>
                <label>New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1 block w-full bg-gray-900/50 ..."/>
                <label className="mt-4 block">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full bg-gray-900/50 ..."/>
                
                {message && <p className="text-green-400 mt-4">{message}</p>}
                {error && <p className="text-red-400 mt-4">{error}</p>}
                <div className="mt-6">
                    <button type="submit" className="w-full bg-red-600 ...">Update Password</button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ResetPassword;