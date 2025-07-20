// frontend/src/components/AddPostForm.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Post } from './PostCard';

const cloudinaryAxios = axios.create();
const initialState = { content: '', imageUrls: [], videoUrls: [] };

interface AddPostFormProps {
  onSuccess: (post: Post) => void;
  onClose: () => void;
  postToEdit?: Post | null;
}

const AddPostForm: React.FC<AddPostFormProps> = ({ onSuccess, onClose, postToEdit }) => {
  const [formData, setFormData] = useState(initialState);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (postToEdit) {
      setFormData({
        content: postToEdit.content,
        imageUrls: postToEdit.imageUrls || [],
        videoUrls: postToEdit.videoUrls || [],
      });
    } else {
      setFormData(initialState);
    }
  }, [postToEdit]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = 'reelify_preset';
    
    const uploadPromises = Array.from(files).map(file => {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', uploadPreset);
      const resourceType = fileType === 'image' ? 'image' : 'video';
      return cloudinaryAxios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, uploadData);
    });

    try {
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.data.secure_url);
      if (fileType === 'image') {
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...urls] }));
      } else {
        setFormData(prev => ({ ...prev, videoUrls: [...prev.videoUrls, ...urls] }));
      }
    } catch (err) {
      setError('File upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.content) { setError('Post content is required.'); return; }

    try {
      let res;
      if (postToEdit) {
        res = await axios.put(`/api/posts/${postToEdit._id}`, formData);
      } else {
        res = await axios.post('/api/posts', formData);
      }
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save post.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required rows={5} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500" placeholder="What's on your mind?" />
      <div>
        <label className="block text-sm font-medium text-gray-300">Upload Images</label>
        <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30"/>
        <div className="mt-2 flex flex-wrap gap-2">{formData.imageUrls.map(url => <img key={url} src={url} className="h-20 w-20 object-cover rounded-md"/>)}</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Upload Videos</label>
        <input type="file" multiple accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30"/>
        <div className="mt-2 flex flex-wrap gap-2">{formData.videoUrls.map(url => <video key={url} src={url} className="h-20 w-20 object-cover rounded-md"/>)}</div>
      </div>
      {isUploading && <p className="text-blue-400 text-center">Uploading files...</p>}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" disabled={isUploading}>{postToEdit ? 'Save Changes' : 'Create Post'}</button>
      </div>
    </form>
  );
};

export default AddPostForm;