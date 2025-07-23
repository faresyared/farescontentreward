import React, { useState } from 'react';
import axios from 'axios';
// --- CHANGE 1: Import useNavigate ---
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  // --- CHANGE 2: Get the navigate function ---
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email });
      setMessage(res.data.message);

      // --- CHANGE 3: Navigate to the next page after a short delay ---
      // We wait 2 seconds so the user has time to read the success message.
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      // We keep the loading state true after success so the button stays disabled
      // until the page navigates away.
      if (error) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Reset Password</h1>
            <p className="text-gray-400 mb-6">Enter your email address and we will send you a 6-digit code to reset your password.</p>
            
            {/* We only show the form if the message hasn't been sent yet */}
            {!message && (
              <form onSubmit={onSubmit}>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
                  
                  {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
                  
                  <div className="mt-6">
                      <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50">
                        {loading ? 'Sending...' : 'Send Reset Code'}
                      </button>
                  </div>
              </form>
            )}
            
            {/* We show the success message here */}
            {message && <p className="text-green-400 mt-4 text-center font-bold">{message}<br/>Redirecting...</p>}

             <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{' '}
                <Link to="/" className="font-medium text-red-500 hover:text-red-400">Sign In</Link>
            </p>
        </div>
    </div>
  );
};

export default ForgotPassword;