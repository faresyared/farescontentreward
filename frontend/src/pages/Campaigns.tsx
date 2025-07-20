// src/pages/Campaigns.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignCard from '../components/CampaignCard';
import Modal from '../components/Modal'; // Import Modal
import AddCampaignForm from '../components/AddCampaignForm'; // Import Form
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

interface Campaign {
  _id: string;
  name: string;
  photo: string;
  platform: any; // Simplified for Card component
  budget: number;
  type: any; // Simplified for Card component
  status: 'Active' | 'Ended' | 'Soon' | 'Paused';
}

const Campaigns = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  useEffect(() => {
    const fetchCampaigns = async () => { /* ... same as before ... */ };
    fetchCampaigns();
  }, []);

  const handleAddCampaignSuccess = (newCampaign: Campaign) => {
    // Add the new campaign to the top of the list and close the modal
    setCampaigns([newCampaign, ...campaigns]);
    setIsModalOpen(false);
  };

  const renderContent = () => { /* ... same as before ... */ };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Campaign">
        <AddCampaignForm 
          onSuccess={handleAddCampaignSuccess} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Campaigns</h1>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)} // Open the modal on click
              className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105"
            >
              <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Campaign
            </button>
          )}
        </div>
        <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
          {/* ... Search and Filter Section ... */}
        </div>
        {renderContent()}
      </div>
    </>
  );
};


// Full component code for easier replacement
// src/pages/Campaigns.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignCard from '../components/CampaignCard';
import Modal from '../components/Modal';
import AddCampaignForm from '../components/AddCampaignForm';
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

interface Campaign {
  _id: string;
  name: string;
  photo: string;
  platform: any;
  budget: number;
  type: any;
  status: 'Active' | 'Ended' | 'Soon' | 'Paused';
}

const Campaigns = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleAddCampaignSuccess = (newCampaign: any) => {
    setCampaigns([newCampaign, ...campaigns]);
    setIsModalOpen(false);
  };

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-400">Loading campaigns...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (campaigns.length === 0) return <p className="text-center text-gray-400">No campaigns found.</p>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign._id} campaign={campaign} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Campaign">
        <AddCampaignForm onSuccess={handleAddCampaignSuccess} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-white">Campaigns</h1>
          {isAdmin && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
              <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Campaign
            </button>
          )}
        </div>
        <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
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