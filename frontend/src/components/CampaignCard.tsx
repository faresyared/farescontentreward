// src/components/CampaignCard.tsx

import React from 'react';
import { BookmarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { FaYoutube, FaTwitter, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Define the Campaign type locally
export interface Campaign {
  _id: string;
  name: string;
  photo: string;
  platforms: ('YouTube' | 'X' | 'Instagram' | 'TikTok')[];
  budget: number;
  type: 'UGC' | 'Clipping' | 'Faceless UGC';
  status: 'Active' | 'Ended' | 'Soon' | 'Paused';
}

const platformIcons = {
  YouTube: <FaYoutube className="text-red-600" />,
  X: <FaTwitter className="text-blue-400" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  TikTok: <FaTiktok className="text-white" />,
};

const CampaignCard: React.FC<{ campaign: Campaign; onCardClick: () => void; onEditClick: () => void; }> = ({ campaign, onCardClick, onEditClick }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDimmed = campaign.status === 'Ended' || campaign.status === 'Paused';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the card click from firing
    onEditClick();
  };

  return (
    <div
      onClick={onCardClick}
      className={`bg-gray-900/50 rounded-2xl border border-gray-800/50 overflow-hidden group transition-all duration-300 relative ${isDimmed ? 'opacity-60' : 'cursor-pointer hover:shadow-red-500/20 hover:border-red-500/30 transform hover:-translate-y-1'}`}
    >
      {isAdmin && !isDimmed && (
        <button onClick={handleEdit} className="absolute top-2 right-2 z-10 p-2 bg-black/50 rounded-full text-gray-300 hover:bg-red-600 hover:text-white transition-colors">
          <PencilIcon className="h-5 w-5" />
        </button>
      )}
      <img className="h-48 w-full object-cover" src={campaign.photo} alt={campaign.name} />
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-1 truncate">{campaign.name}</h3>
        <p className="text-sm text-gray-400 mb-3">{campaign.type}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {campaign.platforms.map(p => <span key={p} className="text-2xl">{platformIcons[p]}</span>)}
          </div>
          <div className="text-lg font-bold text-red-500">${campaign.budget}</div>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;