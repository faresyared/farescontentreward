import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FullCampaign } from './CampaignDetailsModal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

const cloudinaryAxios = axios.create();

interface AddCampaignFormProps {
  onSuccess: (campaign: FullCampaign) => void;
  onClose: () => void;
  campaignToEdit?: FullCampaign | null;
}

const initialState = {
  name: '', photo: '', budget: 0, rules: '', 
  assets: [{ name: '', url: '' }], // Start with one empty asset
  platforms: [], rewardPer1kViews: 0, type: 'UGC',
  maxPayout: 0, minPayout: 0, category: 'Entertainment', status: 'Soon',
  isPrivate: false,
};

const AddCampaignForm: React.FC<AddCampaignFormProps> = ({ onSuccess, onClose, campaignToEdit }) => {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (campaignToEdit) {
      setFormData({
        ...initialState, // Start with a clean slate to avoid missing fields
        ...campaignToEdit,
        // Ensure assets is an array with at least one item for the form
        assets: campaignToEdit.assets && campaignToEdit.assets.length > 0 ? campaignToEdit.assets : [{ name: '', url: '' }],
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
    const isNumber = type === 'number';
    setFormData(prevData => ({ ...prevData, [name]: isNumber ? Number(value) : value }));
  };
  
  const handleAssetChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedAssets = [...formData.assets];
    updatedAssets[index] = { ...updatedAssets[index], [name]: value };
    setFormData(prevData => ({ ...prevData, assets: updatedAssets }));
  };

  const addAsset = () => {
    setFormData(prevData => ({
      ...prevData,
      assets: [...prevData.assets, { name: '', url: '' }],
    }));
  };

  const removeAsset = (index: number) => {
    const updatedAssets = formData.assets.filter((_, i) => i !== index);
    setFormData(prevData => ({ ...prevData, assets: updatedAssets }));
  };
  
  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let updatedPlatforms = [...formData.platforms];
    if (checked) { updatedPlatforms.push(value as any); } 
    else { updatedPlatforms = updatedPlatforms.filter(p => p !== value); }
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
    } catch (err: any) { setError('Image upload failed.'); } 
    finally { setIsUploading(false); }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!formData.photo) { setError('A campaign photo is required.'); return; }
    
    const finalAssets = formData.assets.filter(asset => asset.name.trim() !== '' && asset.url.trim() !== '');

    try {
      const dataToSubmit = { ...formData, assets: finalAssets };
      let res;
      if (campaignToEdit) {
        res = await axios.put(`/api/campaigns/${campaignToEdit._id}`, dataToSubmit);
      } else {
        res = await axios.post('/api/campaigns', dataToSubmit);
      }
      onSuccess(res.data);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to save campaign.'); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Campaign Name</label>
          <input type="text" name="name" value={formData.name} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Type</label>
          <select name="type" value={formData.type} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
            <option value="UGC">UGC</option>
            <option value="Clipping">Clipping</option>
            <option value="Faceless UGC">Faceless UGC</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select name="category" value={formData.category} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
                <option value="Personal Brand">Personal Brand</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Music">Music</option>
            </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-300">Visibility</label>
            <select name="isPrivate" value={String(formData.isPrivate)} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
                <option value="false">Public - Instant Join</option>
                <option value="true">Private - Join Waitlist</option>
            </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300">Campaign Photo</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30"/>
        {isUploading && <p className="text-blue-400 text-sm mt-1">Uploading...</p>}
        {formData.photo && !isUploading && <img src={formData.photo} alt="Preview" className="mt-2 h-32 w-auto rounded-lg"/>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Status</label>
        <select name="status" value={formData.status} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
          <option value="Soon">Soon</option>
          <option value="Active">Active</option>
          <option value="Paused">Paused</option>
          <option value="Ended">Ended</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Budget ($)</label>
          <input type="number" name="budget" value={formData.budget} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Reward/1k Views ($)</label>
          <input type="number" name="rewardPer1kViews" value={formData.rewardPer1kViews} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <textarea name="rules" value={formData.rules} onChange={onChange} required rows={4} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        <p className="text-xs text-gray-500 mt-1">You can use Markdown for formatting (e.g., **bold**, *italic*, - lists).</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Assets</label>
        <div className="space-y-3">
          {formData.assets.map((asset, index) => (
            <div key={index} className="flex items-center gap-2">
              <input type="text" name="name" placeholder="Link Name (e.g., Logos)" value={asset.name} onChange={(e) => handleAssetChange(index, e)} className="w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500" />
              <input type="url" name="url" placeholder="https://example.com/asset-url" value={asset.url} onChange={(e) => handleAssetChange(index, e)} className="w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500" />
              <button type="button" onClick={() => removeAsset(index)} className="p-2 text-red-500 hover:text-red-400 flex-shrink-0">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addAsset} className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
          <PlusIcon className="h-5 w-5" /> Add Another Asset
        </button>
      </div>

      {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
      <div className="flex justify-end pt-4 gap-3">
        <button type="button" onClick={onClose} className="bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" disabled={isUploading}>
          {isUploading ? 'Uploading...' : (campaignToEdit ? 'Save Changes' : 'Create Campaign')}
        </button>
      </div>
    </form>
  );
};

export default AddCampaignForm;