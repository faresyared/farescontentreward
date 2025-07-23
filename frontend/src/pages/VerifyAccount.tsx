import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the email from the URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromUrl = params.get('email');
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [location.search]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-email', { email, code });
      toast.success('Account verified successfully!');
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Verify Your Account</h1>
            <p className="text-gray-400 mb-6">Enter the 6-digit code we sent to your email address.</p>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Email</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">6-Digit Code</label>
                    <input 
                      type="text" 
                      value={code} 
                      onChange={(e) => setCode(e.target.value)} 
                      required 
                      maxLength={6} 
                      className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
                <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                      {loading ? 'Verifying...' : 'Verify and Sign In'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default VerifyAccount;