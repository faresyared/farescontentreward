// frontend/src/components/AddPostForm.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Post } from './PostCard';
import { XCircleIcon } from '@heroicons/react/24/solid';

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
      const resourceType = fileType;
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
    } catch (err) { setError('File upload failed.'); } finally { setIsUploading(false); }
  };

  const removeMedia = (urlToRemove: string, mediaType: 'image' | 'video') => {
    if (mediaType === 'image') {
      setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter(url => url !== urlToRemove) }));
    } else {
      setFormData(prev => ({ ...prev, videoUrls: prev.videoUrls.filter(url => url !== urlToRemove) }));
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
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save post.'); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required rows={5} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500" placeholder="What's on your mind?" />
      
      <div>
        <label className="block text-sm font-medium text-gray-300">Images</label>
        <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="mt-1 w-full text-sm ..."/>
        <div className="mt-2 flex flex-wrap gap-2">
            {formData.imageUrls.map(url => (
                <div key={url} className="relative group">
                    <img src={url} className="h-20 w-20 object-cover rounded-md"/>
                    <button type="button" onClick={() => removeMedia(url, 'image')} className="absolute top-0 right-0 p-0.5 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <XCircleIcon className="h-5 w-5"/>
                    </button>
                </div>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Videos</label>
        <input type="file" multiple accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} className="mt-1 w-full text-sm ..."/>
         <div className="mt-2 flex flex-wrap gap-2">
            {formData.videoUrls.map(url => (
                <div key={url} className="relative group">
                    <video src={url} className="h-20 w-20 object-cover rounded-md"/>
                    <button type="button" onClick={() => removeMedia(url, 'video')} className="absolute top-0 right-0 p-0.5 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <XCircleIcon className="h-5 w-5"/>
                    </button>
                </div>
            ))}
        </div>
      </div>

      {isUploading && <p className="text-blue-400 text-center">Uploading files...</p>}
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="...">Cancel</button>
        <button type="submit" className="..." disabled={isUploading}>{postToEdit ? 'Save Changes' : 'Create Post'}</button>
      </div>
    </form>
  );
};

export default AddPostForm;