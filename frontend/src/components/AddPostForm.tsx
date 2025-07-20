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
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = 'reelify_preset';
    
    const uploadPromises = Array.from(files).map(file => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const resourceType = fileType === 'image' ? 'image' : 'video';
      return cloudinaryAxios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, formData);
    });

    try {
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.data.secure_url);
      if (fileType === 'image') {
        setImageUrls(prev => [...prev, ...urls]);
      } else {
        setVideoUrls(prev => [...prev, ...urls]);
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
    if (!content) { setError('Post content is required.'); return; }

    try {
      const postData = { content, imageUrls, videoUrls };
      const res = await axios.post('/api/posts', postData);
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500" placeholder="What's on your mind?" />
      
      <div>
        <label className="block text-sm font-medium text-gray-300">Upload Images</label>
        <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="mt-1 w-full text-sm ..."/>
        <div className="mt-2 flex flex-wrap gap-2">
            {imageUrls.map(url => <img key={url} src={url} className="h-20 w-20 object-cover rounded-md"/>)}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Upload Videos</label>
        <input type="file" multiple accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="mt-1 w-full text-sm ..."/>
         <div className="mt-2 flex flex-wrap gap-2">
            {videoUrls.map(url => <video key={url} src={url} className="h-20 w-20 object-cover rounded-md"/>)}
        </div>
      </div>

      {isUploading && <p className="text-blue-400 text-center">Uploading files...</p>}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="... ">Cancel</button>
        <button type="submit" className="..." disabled={isUploading}>Post</button>
      </div>
    </form>
  );
};

export default AddPostForm;