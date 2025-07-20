// frontend/src/pages/Campaigns.tsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CampaignCard from '../components/CampaignCard';
import Modal from '../components/Modal';
import AddCampaignForm from '../components/AddCampaignForm';
import CampaignDetailsModal, { FullCampaign } from '../components/CampaignDetailsModal';
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const Campaigns = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [campaigns, setCampaigns] = useState<FullCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW STATE FOR FILTERS ---
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [typeFilter, setTypeFilter] = useState('All Types');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<FullCampaign | null>(null);
  const [campaignToEdit, setCampaignToEdit] = useState<FullCampaign | null>(null);

  // --- UPDATED FETCH FUNCTION ---
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      // Build the query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (platformFilter !== 'All Platforms') params.append('platform', platformFilter);
      if (typeFilter !== 'All Types') params.append('type', typeFilter);
      
      const res = await axios.get('/api/campaigns', { params });
      setCampaigns(res.data);
    } catch (err) {
      setError('Failed to load campaigns. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, platformFilter, typeFilter]); // Re-run when filters change

  // --- USEEFFECT TO TRIGGER FETCH ---
  useEffect(() => {
    // We use a debounce to prevent API calls on every keystroke
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer); // Cleanup the timer
  }, [fetchCampaigns]);

  const handleFormSuccess = (updatedCampaign: FullCampaign) => {
    if (campaignToEdit) {
      setCampaigns(campaigns.map(c => c._id === updatedCampaign._id ? updatedCampaign : c));
    } else {
      setCampaigns([updatedCampaign, ...campaigns]);
    }
    setIsFormModalOpen(false);
    setCampaignToEdit(null);
  };

  const openAddModal = () => { setCampaignToEdit(null); setIsFormModalOpen(true); };
  const openEditModal = (campaign: FullCampaign) => { setCampaignToEdit(campaign); setIsFormModalOpen(true); };
  const openDetailsModal = (campaign: FullCampaign) => { setSelectedCampaign(campaign); setIsDetailsModalOpen(true); };

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-400">Loading campaigns...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (campaigns.length === 0) return <p className="text-center text-gray-400">No campaigns match your filters.</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard 
            key={campaign._id} campaign={campaign}
            onCardClick={() => openDetailsModal(campaign)} onEditClick={() => openEditModal(campaign)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={campaignToEdit ? "Edit Campaign" : "Add New Campaign"}>
        <AddCampaignForm onSuccess={handleFormSuccess} onClose={() => setIsFormModalOpen(false)} campaignToEdit={campaignToEdit} />
      </Modal>
      {selectedCampaign && (
        <CampaignDetailsModal campaign={selectedCampaign} isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} />
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Campaigns</h1>
          {isAdmin && (
            <button onClick={openAddModal} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
              <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Campaign
            </button>
          )}
        </div>
        
        {/* --- FUNCTIONAL FILTER CONTROLS --- */}
        <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <input 
                type="text" 
                placeholder="Search by campaign name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-red-500 outline-none text-white"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            </div>
            <select 
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white"
            >
              <option>All Platforms</option><option>YouTube</option><option>X</option><option>Instagram</option><option>TikTok</option>
            </select>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white"
            >
              <option>All Types</option><option>UGC</option><option>Clipping</option><option>Faceless UGC</option>
            </select>
          </div>
        </div>
        
        {renderContent()}
      </div>
    </>
  );
};

export default Campaigns;