// frontend/src/components/AddCampaignForm.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { FullCampaign } from './CampaignDetailsModal';

interface AddCampaignFormProps {
  onSuccess: (campaign: FullCampaign) => void;
  onClose: () => void;
  campaignToEdit?: FullCampaign | null;
}

const AddCampaignForm: React.FC<AddCampaignFormProps> = ({ onSuccess, onClose, campaignToEdit }) => {
  const [formData, setFormData] = useState({
    name: campaignToEdit?.name || '',
    photo: campaignToEdit?.photo || '',
    budget: campaignToEdit?.budget || 0,
    rules: campaignToEdit?.rules || '',
    assets: campaignToEdit?.assets || '',
    platforms: campaignToEdit?.platforms || [],
    rewardPer1kViews: campaignToEdit?.rewardPer1kViews || 0,
    type: campaignToEdit?.type || 'UGC',
    maxPayout: campaignToEdit?.maxPayout || 0,
    minPayout: campaignToEdit?.minPayout || 0,
    category: campaignToEdit?.category || 'Entertainment',
    status: campaignToEdit?.status || 'Soon',
  });
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const isNumber = type === 'number';
    setFormData({ ...formData, [name]: isNumber ? Number(value) : value });
  };
  
  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let updatedPlatforms = [...formData.platforms];
    if (checked) { updatedPlatforms.push(value as any); } 
    else { updatedPlatforms = updatedPlatforms.filter(p => p !== value); }
    setFormData({ ...formData, platforms: updatedPlatforms });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'reelify_preset'); // This name MUST match your Cloudinary setting
    
    try {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        if (!cloudName) {
            setError("Cloudinary configuration is missing. Please contact support.");
            setIsUploading(false);
            return;
        }
        const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, uploadData);
        setFormData(prevData => ({ ...prevData, photo: res.data.secure_url }));
    } catch (err: any) {
        console.error("Cloudinary Upload Error:", err.response?.data); // Add detailed logging
        setError('Image upload failed. Check the console for details.');
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.photo) {
      setError('A campaign photo is required. Please upload an image.');
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
      {/* Name and Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Campaign Name</label>
          <input type="text" name="name" value={formData.name} onChange={onChange} required className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Type</label>
          <select name="type" value={formData.type} onChange={onChange} className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500">
            <option>UGC</option><option>Clipping</option><option>Faceless UGC</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Campaign Photo</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30"/>
        {isUploading && <p className="text-blue-400 text-sm mt-1">Uploading image...</p>}
        {formData.photo && !isUploading && <img src={formData.photo} alt="Preview" className="mt-2 h-32 w-auto rounded-lg"/>}
      </div>
      {/* ... rest of the form is the same ... */}
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