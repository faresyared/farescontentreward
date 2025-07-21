// frontend/src/components/AddCampaignForm.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FullCampaign } from './CampaignDetailsModal';

const cloudinaryAxios = axios.create();

interface AddCampaignFormProps {
  onSuccess: (campaign: FullCampaign) => void;
  onClose: () => void;
  campaignToEdit?: FullCampaign | null;
}

const initialState = {
  name: '', photo: '', budget: 0, rules: '', 
  assets: { name: '', url: '' },
  platforms: [], rewardPer1kViews: 0, type: 'UGC',
  maxPayout: 0, minPayout: 0, category: 'Entertainment', status: 'Soon',
  isPrivate: false, // Default to Public
};

const AddCampaignForm: React.FC<AddCampaignFormProps> = ({ onSuccess, onClose, campaignToEdit }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (campaignToEdit) {
      setFormData({
        name: campaignToEdit.name, photo: campaignToEdit.photo, budget: campaignToEdit.budget,
        rules: campaignToEdit.rules, assets: campaignToEdit.assets || { name: '', url: '' },
        platforms: campaignToEdit.platforms, rewardPer1kViews: campaignToEdit.rewardPer1kViews || 0,
        type: campaignToEdit.type, maxPayout: campaignToEdit.maxPayout || 0,
        minPayout: campaignToEdit.minPayout || 0, category: campaignToEdit.category,
        status: campaignToEdit.status,
        isPrivate: campaignToEdit.isPrivate || false,
      });
    } else {
      setFormData(initialState);
    }
  }, [campaignToEdit]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'isPrivate') {
        setFormData(prevData => ({ ...prevData, isPrivate: value === 'true' }));
        return;
    }
    // @ts-ignore
    const isNumber = type === 'number';
    setFormData(prevData => ({ ...prevData, [name]: isNumber ? Number(value) : value }));
  };

  const handleAssetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
        ...prevData,
        assets: { ...prevData.assets, [name]: value }
    }));
  };
  
  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let updatedPlatforms = [...formData.platforms];
    if (checked) {
      updatedPlatforms.push(value as any);
    } else {
      updatedPlatforms = updatedPlatforms.filter(p => p !== value);
    }
    setFormData(prevData => ({ ...prevData, platforms: updatedPlatforms }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError('');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'reelify_preset');
    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const res = await cloudinaryAxios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, uploadData);
        setFormData(prevData => ({ ...prevData, photo: res.data.secure_url }));
    } catch (err: any) {
        setError('Image upload failed. Please try again.');
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!formData.photo) {
      setError('A campaign photo is required.');
      return;
    }
    try {
      let res;
      if (campaignToEdit) {
        res = await axios.put(`/api/campaigns/${campaignToEdit._id}`, formData);
      } else {
        res = await axios.post('/api/campaigns', formData);
      }
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save campaign.');
    }
  };
 return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Campaign Name</label>
          <input type="text" name="name" value={formData.name} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 ..."/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Type</label>
          <select name="type" value={formData.type} onChange={onChange} className="mt-1 w-full ...">
            <option>UGC</option><option>Clipping</option><option>Faceless UGC</option>
          </select>
        </div>
      </div>

     <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select name="category" value={formData.category} onChange={onChange} className="mt-1 w-full ...">
                <option>Personal Brand</option><option>Entertainment</option><option>Music</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300">Visibility</label>
            <select name="isPrivate" value={String(formData.isPrivate)} onChange={onChange} className="mt-1 w-full ...">
                <option value="false">Public</option>
                <option value="true">Private</option>
            </select>
        </div>
      </div>

          <label className="block text-sm font-medium text-gray-300">Status</label>
          <select name="status" value={formData.status} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
            <option>Soon</option><option>Active</option><option>Paused</option><option>Ended</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Budget ($)</label>
          <input type="number" name="budget" value={formData.budget} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Reward/1k Views ($)</label>
          <input type="number" name="rewardPer1kViews" value={formData.rewardPer1kViews} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Min Payout ($)</label>
          <input type="number" name="minPayout" value={formData.minPayout} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Max Payout ($)</label>
          <input type="number" name="maxPayout" value={formData.maxPayout} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Platforms</label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          {['YouTube', 'X', 'Instagram', 'TikTok'].map(p => (
            <label key={p} className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" value={p} checked={formData.platforms.includes(p as any)} onChange={handlePlatformChange} className="bg-gray-800 border-gray-600 text-red-600 rounded focus:ring-red-500"/>
              <span>{p}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Rules</label>
        <textarea name="rules" value={formData.rules} onChange={onChange} required rows={3} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Assets</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
            <input type="text" name="name" placeholder="Link Name (e.g., Download Brief)" value={formData.assets.name} onChange={handleAssetChange} className="w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500" />
            <input type="url" name="url" placeholder="https://example.com/asset-url" value={formData.assets.url} onChange={handleAssetChange} className="w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500" />
        </div>
      </div>
      {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
<div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="...">Cancel</button>
        <button type="submit" className="..." disabled={isUploading}>
          {isUploading ? 'Uploading...' : (campaignToEdit ? 'Save Changes' : 'Create Campaign')}
        </button>
      </div>
    </form>
  );
};

export default AddCampaignForm;