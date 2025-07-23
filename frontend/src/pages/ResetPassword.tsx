import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, code, password, confirmPassword } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setMessage('');
    setError('');
    setLoading(true);
    try {
      // --- THIS IS THE FIX ---
      // We now send email, code, and password to the new backend route.
      const res = await axios.post('/api/auth/reset-password', { email, code, password });
      setMessage(res.data.message + " Redirecting to sign in...");
      setTimeout(() => navigate('/'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Enter New Password</h1>
            <p className="text-gray-400 mb-6">Enter your email, the 6-digit code you received, and your new password.</p>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <input type="email" name="email" value={email} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">6-Digit Code</label>
                    <input type="text" name="code" value={code} onChange={onChange} required maxLength={6} className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">New Password</label>
                    <input type="password" name="password" value={password} onChange={onChange} required minLength={6} className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={confirmPassword} onChange={onChange} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                </div>
                
                {message && <p className="text-green-400 mt-2 text-center">{message}</p>}
                {error && <p className="text-red-400 mt-2 text-center">{error}</p>}

                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default ResetPassword;