// src/components/CampaignCard.tsx

import React from 'react';
import { BookmarkIcon } from '@heroicons/react/24/outline';

export interface Campaign {
  id: number;
  name: string;
  photo: string;
  platform: 'YouTube' | 'X' | 'Instagram' | 'TikTok';
  budget: number;
  type: 'UGC' | 'Clipping' | 'Faceless UGC';
  status: 'Active' | 'Ended' | 'Soon' | 'Paused';
}

const statusStyles = {
  Active: 'bg-green-500/20 text-green-400 border-green-500/30',
  Ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Soon: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const isDimmed = campaign.status === 'Ended' || campaign.status === 'Paused';

  return (
    <div className={`bg-gray-900/50 rounded-2xl border border-gray-800/50 overflow-hidden group transition-all duration-300 ${isDimmed ? 'opacity-60' : 'hover:shadow-red-500/20 hover:border-red-500/30 transform hover:-translate-y-1'}`}>
      <img className="h-48 w-full object-cover" src={campaign.photo} alt={campaign.name} />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-white mb-2">{campaign.name}</h3>
          <div className={`px-2 py-1 text-xs font-semibold rounded-full border ${statusStyles[campaign.status]}`}>
            {campaign.status}
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-4">Platform: {campaign.platform}</p>
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-red-500">${campaign.budget}</div>
          <button className="flex items-center space-x-2 text-gray-400 hover:text-white bg-gray-800/50 px-3 py-1 rounded-lg transition-colors">
            <BookmarkIcon className="h-5 w-5" />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;