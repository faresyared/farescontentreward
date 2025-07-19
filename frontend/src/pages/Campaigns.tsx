// src/pages/Campaigns.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CampaignCard from '../components/CampaignCard';
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

// We need the Campaign type for our state.
// Following our successful pattern, we define it locally.
interface Campaign {
  _id: string; // MongoDB uses _id
  name: string;
  photo: string;
  platform: 'YouTube' | 'X' | 'Instagram' | 'TikTok';
  budget: number;
  type: 'UGC' | 'Clipping' | 'Faceless UGC';
  status: 'Active' | 'Ended' | 'Soon' | 'Paused';
}

// Mock user role
const isAdmin = true;

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // This request will be sent with the x-auth-token header
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
  }, []); // The empty array ensures this effect runs only once on page load

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-400">Loading campaigns...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500">{error}</p>;
    }
    
    if (campaigns.length === 0) {
        return <p className="text-center text-gray-400">No campaigns found.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          // Note: MongoDB uses _id, so we use that for the key
          <CampaignCard key={campaign._id} campaign={campaign} />
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Header: Title and Admin Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-white">Campaigns</h1>
        {isAdmin && (
           <button className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
             <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Campaign
           </button>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-8 p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <input type="text" placeholder="Search by campaign name..." className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-red-500 outline-none text-white"/>
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
          </div>
          <select className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white">
            <option>All Platforms</option>
            <option>YouTube</option><option>Instagram</option><option>TikTok</option><option>X</option>
          </select>
          <select className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white">
            <option>All Types</option><option>UGC</option><option>Clipping</option><option>Faceless UGC</option>
          </select>
        </div>
      </div>

      {/* Render the content based on the loading/error state */}
      {renderContent()}
    </div>
  );
};

export default Campaigns;