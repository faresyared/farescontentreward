// src/pages/Campaigns.tsx

import React, { useState, useEffect } from 'react';
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

  // State for modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<FullCampaign | null>(null);
  const [campaignToEdit, setCampaignToEdit] = useState<FullCampaign | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get('/api/campaigns');
        setCampaigns(res.data);
      } catch (err) {
        setError('Failed to load campaigns. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // This is the corrected function
  const handleFormSuccess = (updatedCampaign: FullCampaign) => {
    if (campaignToEdit) {
      // If we were editing, find and replace the campaign in the list
      setCampaigns(campaigns.map(c => c._id === updatedCampaign._id ? updatedCampaign : c));
    } else {
      // If we were adding, add the new campaign to the start of the list
      setCampaigns([updatedCampaign, ...campaigns]);
    }
    // Close the form modal and clear the edit state
    setIsFormModalOpen(false);
    setCampaignToEdit(null);
  };

  const openAddModal = () => {
    setCampaignToEdit(null); // Make sure we're not editing
    setIsFormModalOpen(true);
  };

  const openEditModal = (campaign: FullCampaign) => {
    setCampaignToEdit(campaign); // Set the campaign to edit
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (campaign: FullCampaign) => {
    setSelectedCampaign(campaign);
    setIsDetailsModalOpen(true);
  };

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-400">Loading campaigns...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (campaigns.length === 0) return <p className="text-center text-gray-400">No campaigns found.</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign._id}
            campaign={campaign}
            onCardClick={() => openDetailsModal(campaign)}
            onEditClick={() => openEditModal(campaign)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Add/Edit Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setCampaignToEdit(null); }} title={campaignToEdit ? "Edit Campaign" : "Add New Campaign"}>
        <AddCampaignForm
          onSuccess={handleFormSuccess}
          onClose={() => { setIsFormModalOpen(false); setCampaignToEdit(null); }}
          campaignToEdit={campaignToEdit}
        />
      </Modal>

      {/* Details Modal */}
      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={selectedCampaign}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />
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
        <div className="mb-8 p-4 bg-gray-900/ ৫০ rounded-xl border border-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <input type="text" placeholder="Search by campaign name..." className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-red-500 outline-none text-white"/>
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            </div>
            <select className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white">
              <option>All Platforms</option><option>YouTube</option><option>Instagram</option><option>TikTok</option><option>X</option>
            </select>
            <select className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white">
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