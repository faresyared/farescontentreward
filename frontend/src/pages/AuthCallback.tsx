// frontend/src/pages/AuthCallback.tsx

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This page is a "middle man". Google redirects here, and this page grabs
// the token from the URL, saves it, and sends the user to the dashboard.
const AuthCallback = () => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      login(token);
      navigate('/dashboard/home');
    } else {
      // Handle error case
      navigate('/');
    }
  }, [location, login, navigate]);

  return <div className="text-center text-white p-10">Loading...</div>;
};

export default AuthCallback;