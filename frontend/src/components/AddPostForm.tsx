// src/components/AddPostForm.tsx

import React, { useState } from 'react';
import axios from 'axios';

const cloudinaryAxios = axios.create();

interface AddPostFormProps {
  onSuccess: (newPost: any) => void;
  onClose: () => void;
}

const AddPostForm: React.FC<AddPostFormProps> = ({ onSuccess, onClose }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'reelify_preset'); // Same preset can be used for videos

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const resourceType = fileType === 'image' ? 'image' : 'video';
      const res = await cloudinaryAxios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, uploadData);
      
      if (fileType === 'image') {
        setImageUrl(res.data.secure_url);
        setVideoUrl(''); // Ensure only one media type is set
      } else {
        setVideoUrl(res.data.secure_url);
        setImageUrl('');
      }
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      setError('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content) {
      setError('Post content is required.');
      return;
    }

    try {
      const postData = { content, imageUrl, videoUrl };
      const res = await axios.post('/api/posts', postData);
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-300">Post Content</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={5}
          className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
          placeholder="What's on your mind?"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300">Upload Image</label>
        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30"/>
        {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-32 w-auto rounded-lg"/>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Upload Video</label>
        <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30"/>
        {videoUrl && <video src={videoUrl} controls className="mt-2 h-32 w-auto rounded-lg"/>}
      </div>

      {isUploading && <p className="text-blue-400 text-center">Uploading file...</p>}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Create Post'}
        </button>
      </div>
    </form>
  );
};

export default AddPostForm;