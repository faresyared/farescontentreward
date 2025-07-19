// src/pages/Campaigns.tsx

import React from 'react';
import CampaignCard from '../components/CampaignCard';
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

// تعريف نوع Campaign محلياً هنا
interface Campaign {
  id: number;
  name: string;
  photo: string;
  platform: string;
  budget: number;
  type: string;
  status: string;
}

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'CyberRays Glasses',
    photo: 'https://images.unsplash.com/photo-1574258481421-3a39653c8592?q=80&w=2070&auto=format&fit=crop',
    platform: 'Instagram',
    budget: 1200,
    type: 'UGC',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Quantum Laptops',
    photo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1926&auto=format&fit=crop',
    platform: 'YouTube',
    budget: 5000,
    type: 'Clipping',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Echo Headphones',
    photo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop',
    platform: 'TikTok',
    budget: 800,
    type: 'Faceless UGC',
    status: 'Soon',
  },
  {
    id: 4,
    name: 'Apex Gaming Chair',
    photo: 'https://images.unsplash.com/photo-1586023492125-24b2c0457d70?q=80&w=1887&auto=format&fit=crop',
    platform: 'X',
    budget: 2500,
    type: 'UGC',
    status: 'Paused',
  },
  {
    id: 5,
    name: 'Nova Smartwatch',
    photo: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1964&auto=format&fit=crop',
    platform: 'Instagram',
    budget: 1500,
    type: 'UGC',
    status: 'Ended',
  },
];

// Mock user role
const isAdmin = true;

const Campaigns = () => {
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
            <input
              type="text"
              placeholder="Search by campaign name..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-red-500 outline-none text-white"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <select className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white">
            <option>All Platforms</option>
            <option>YouTube</option>
            <option>Instagram</option>
            <option>TikTok</option>
            <option>X</option>
          </select>
          <select className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 px-3 focus:ring-2 focus:ring-red-500 outline-none text-white">
            <option>All Types</option>
            <option>UGC</option>
            <option>Clipping</option>
            <option>Faceless UGC</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

export default Campaigns;
