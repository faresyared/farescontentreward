// frontend/src/pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CameraIcon } from '@heroicons/react/24/outline';

const cloudinaryAxios = axios.create();

const Profile = () => {
  const { user, login } = useAuth(); // We need `login` to update the token
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    avatar: '',
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get('/api/users/me');
        setFormData({
          fullName: res.data.fullName,
          email: res.data.email,
          avatar: res.data.avatar,
        });
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };

    fetchUserData();
  }, []);

  const { fullName, email, avatar } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus({ message: '', type: '' });
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'reelify_preset');
    
    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const res = await cloudinaryAxios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, uploadData);
        setFormData(prevData => ({ ...prevData, avatar: res.data.secure_url }));
    } catch (err) {
        setStatus({ message: 'Image upload failed. Please try again.', type: 'error' });
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ message: 'Saving...', type: 'loading' });
    try {
      const res = await axios.put('/api/users/me', formData);
      // The backend sends back a new token with the updated avatar/name.
      // We use our login function to update the global state.
      login(res.data.token);
      setStatus({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setStatus({ message: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-white">Edit Profile</h1>

      <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50">
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="relative group">
              <img className="h-32 w-32 rounded-full object-cover border-4 border-gray-700/50 group-hover:border-red-500/50 transition-all duration-300" src={avatar} alt="Profile" />
              <label htmlFor="profile-photo-upload" className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <CameraIcon className="h-8 w-8" />
              </label>
              <input type="file" id="profile-photo-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
          
          {isUploading && <p className="text-center text-blue-400">Uploading new photo...</p>}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-400">Full Name</label>
            <input type="text" name="fullName" value={fullName} onChange={onChange} required className="mt-1 block w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
            <input type="email" name="email" value={email} onChange={onChange} required className="mt-1 block w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none"/>
          </div>
          
          <div className="pt-4 flex items-center justify-end gap-4">
            {status.message && (
              <p className={`text-sm ${
                status.type === 'success' ? 'text-green-400' : 
                status.type === 'error' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {status.message}
              </p>
            )}
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50" disabled={isUploading}>
              {isUploading ? 'Waiting for upload...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;