// frontend/src/components/CampaignDetailsModal.tsx

import React from 'react';
import Modal from './Modal';
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

// The full Campaign type definition
export interface FullCampaign {
  _id: string;
  name: string;
  photo: string;
  budget: number;
  rules: string;
  assets?: string;
  platforms: ('YouTube' | 'X' | 'Instagram' | 'TikTok')[];
  rewardPer1kViews?: number;
  type: 'UGC' | 'Clipping' | 'Faceless UGC';
  maxPayout?: number;
  minPayout?: number;
  category: 'Personal Brand' | 'Entertainment' | 'Music';
  status: 'Active' | 'Ended' | 'Soon' | 'Paused';
}

// Styles for the status badge
const statusStyles = {
  Active: 'bg-green-500/20 text-green-400 border-green-500/30',
  Ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Soon: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const platformIcons = {
  YouTube: <FaYoutube />, X: <FaXTwitter />, Instagram: <FaInstagram />, TikTok: <FaTiktok />,
};

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-white">{value || 'N/A'}</p>
  </div>
);

const CampaignDetailsModal: React.FC<{ campaign: FullCampaign; isOpen: boolean; onClose: () => void; }> = ({ campaign, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={campaign.name}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-gray-300">
        <img src={campaign.photo} alt={campaign.name} className="w-full h-64 object-cover rounded-lg" />
        
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2">Campaign Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
          <DetailItem label="Budget" value={`$${campaign.budget}`} />
          <DetailItem label="Category" value={campaign.category} />
          <DetailItem label="Type" value={campaign.type} />
          {/* --- THIS IS THE NEW STATUS BADGE DETAIL --- */}
          <div>
            <p className="text-sm text-gray-400">Status</p>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusStyles[campaign.status]}`}>
                {campaign.status}
            </span>
          </div>
          <DetailItem label="Reward/1k Views" value={campaign.rewardPer1kViews ? `$${campaign.rewardPer1kViews}` : 'N/A'} />
          <DetailItem label="Min Payout" value={campaign.minPayout ? `$${campaign.minPayout}` : 'N/A'} />
          <DetailItem label="Max Payout" value={campaign.maxPayout ? `$${campaign.maxPayout}` : 'N/A'} />
        </div>
        
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 pt-4">Platforms</h3>
        <div className="flex items-center space-x-4">
            {campaign.platforms.map(p => (
                <div key={p} className="flex items-center space-x-2 text-2xl text-white">
                    {platformIcons[p]} <span className="text-base">{p}</span>
                </div>
            ))}
        </div>

        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 pt-4">Rules</h3>
        <p className="whitespace-pre-wrap">{campaign.rules}</p>
        
        {campaign.assets && (
            <>
                <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 pt-4">Assets</h3>
                <a href={campaign.assets} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Download Assets</a>
            </>
        )}
      </div>
    </Modal>
  );
};

export default CampaignDetailsModal;