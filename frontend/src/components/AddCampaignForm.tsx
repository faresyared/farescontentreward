// src/components/AddCampaignForm.tsx

import React, { useState } from 'react';
import axios from 'axios';

// We define the Campaign type here as well, following our pattern.
// Note the `_id` is optional because a new campaign won't have one yet.
interface Campaign {
    _id?: string;
    name: string;
    photo: string;
    budget: number;
    rules: string;
    platforms: string[];
    status: 'Active' | 'Ended' | 'Soon' | 'Paused';
}

interface AddCampaignFormProps {
  onSuccess: (newCampaign: Campaign) => void;
  onClose: () => void;
}

const AddCampaignForm: React.FC<AddCampaignFormProps> = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    budget: '',
    rules: '',
    platforms: [] as string[],
    status: 'Soon',
  });
  const [error, setError] = useState('');

  const { name, photo, budget, rules, platforms, status } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({ ...formData, platforms: [...platforms, value] });
    } else {
      setFormData({ ...formData, platforms: platforms.filter(p => p !== value) });
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const campaignData = { ...formData, budget: Number(budget) };
      const res = await axios.post('/api/campaigns', campaignData);
      onSuccess(res.data); // Pass the new campaign back to the parent
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create campaign.');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Campaign Name</label>
          <input type="text" name="name" value={name} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Budget ($)</label>
          <input type="number" name="budget" value={budget} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Photo URL</label>
        <input type="text" name="photo" value={photo} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Rules</label>
        <textarea name="rules" value={rules} onChange={onChange} required rows={4} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Platforms</label>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
          {['YouTube', 'X', 'Instagram', 'TikTok'].map(platform => (
            <label key={platform} className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" value={platform} checked={platforms.includes(platform)} onChange={handlePlatformChange} className="bg-gray-800 border-gray-600 text-red-600 rounded focus:ring-red-500"/>
              <span>{platform}</span>
            </label>
          ))}
        </div>
      </div>
       <div>
          <label className="block text-sm font-medium text-gray-300">Status</label>
          <select name="status" value={status} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
            <option value="Soon">Soon</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Ended">Ended</option>
          </select>
       </div>
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Create Campaign</button>
      </div>
    </form>
  );
};

export default AddCampaignForm;