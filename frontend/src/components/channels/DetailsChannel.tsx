import React from 'react';
import { FullCampaign } from '../CampaignDetailsModal'; // We get the campaign object as a prop
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

// A small, reusable component to display each detail item neatly.
const DetailItem: React.FC<{ label: string; value?: string | number | React.ReactNode }> = ({ label, value }) => (
  <div className="bg-gray-800/40 p-3 rounded-lg">
    <p className="text-sm text-gray-400">{label}</p>
    <div className="text-lg font-semibold text-white">{value || 'N/A'}</div>
  </div>
);

// A map for our platform icons.
const platformIcons = {
  YouTube: <FaYoutube className="text-red-600" />,
  X: <FaXTwitter className="text-white" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  TikTok: <FaTiktok className="text-white" />,
};

const DetailsChannel: React.FC<{ campaign: FullCampaign }> = ({ campaign }) => {
  return (
    <div className="space-y-6">
      <div className="w-full h-80 bg-black rounded-2xl flex items-center justify-center border border-gray-800/50">
        <img src={campaign.photo} alt={campaign.name} className="max-w-full max-h-full object-contain" />
      </div>

      <div className="p-4 bg-gray-900/50 rounded-xl">
        <h1 className="text-4xl font-bold text-white">{campaign.name}</h1>
        <p className="mt-2 text-gray-400">{campaign.type} • {campaign.category}</p>
      </div>
      
      {/* --- THIS IS THE NEW, DETAILED SECTION --- */}
      <div className="p-4 bg-gray-900/50 rounded-xl">
        <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-3 mb-4">Campaign Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailItem label="Budget" value={`$${campaign.budget.toLocaleString()}`} />
          <DetailItem label="Reward/1k Views" value={campaign.rewardPer1kViews ? `$${campaign.rewardPer1kViews}` : undefined} />
          <DetailItem label="Min Payout" value={campaign.minPayout ? `$${campaign.minPayout}` : undefined} />
          <DetailItem label="Max Payout" value={campaign.maxPayout ? `$${campaign.maxPayout}` : undefined} />
          <DetailItem 
            label="Platforms" 
            value={
              <div className="flex items-center space-x-3 text-2xl pt-1">
                {campaign.platforms.map(p => <span key={p}>{platformIcons[p]}</span>)}
              </div>
            } 
          />
          <DetailItem 
            label="Assets"
            value={
              campaign.assets && campaign.assets.url ? (
                <a href={campaign.assets.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold text-lg">
                  {campaign.assets.name || 'Download'}
                </a>
              ) : (
                'N/A'
              )
            }
          />
        </div>
      </div>

      <div className="p-4 bg-gray-900/50 rounded-xl">
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-3 mb-4">Rules & Guidelines</h3>
        <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">{campaign.rules}</p>
      </div>
    </div>
  );
};

export default DetailsChannel;