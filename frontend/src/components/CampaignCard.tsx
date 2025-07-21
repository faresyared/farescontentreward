// frontend/src/components/CampaignCard.tsx

import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { BookmarkIcon as BookmarkIconOutline } from '@heroicons/react/24/outline';
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from '../context/AuthContext';

export interface Campaign {
  _id: string;
  name: string;
  photo: string;
  platforms: ('YouTube' | 'X' | 'Instagram' | 'TikTok')[];
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

const platformIcons = {
  YouTube: <FaYoutube className="text-red-600" />,
  X: <FaXTwitter className="text-white" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  TikTok: <FaTiktok className="text-white" />,
};

const CampaignCard: React.FC<{
  campaign: Campaign;
  isSaved: boolean;
  onCardClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onSaveClick: () => void;
}> = ({ campaign, isSaved, onCardClick, onEditClick, onDeleteClick, onSaveClick }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isDimmed = campaign.status === 'Ended' || campaign.status === 'Paused';

  const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); onEditClick(); };
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); onDeleteClick(); };
  const handleSave = (e: React.MouseEvent) => { e.stopPropagation(); onSaveClick(); };

  return (
    <div onClick={onCardClick} className={`bg-gray-900/50 rounded-2xl border border-gray-800/50 overflow-hidden group transition-all duration-300 relative ${isDimmed ? 'opacity-60' : 'cursor-pointer hover:shadow-red-500/20 hover:border-red-500/30 transform hover:-translate-y-1'}`}>
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {isAdmin && !isDimmed && (
          <>
            <button onClick={handleDelete} className="p-2 bg-black/50 rounded-full text-gray-300 hover:bg-red-800 hover:text-white transition-colors">
              <TrashIcon className="h-5 w-5" />
            </button>
            <button onClick={handleEdit} className="p-2 bg-black/50 rounded-full text-gray-300 hover:bg-blue-600 hover:text-white transition-colors">
              <PencilIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <img className="h-48 w-full object-cover" src={campaign.photo} alt={campaign.name} />
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-xl font-bold text-white truncate pr-2">{campaign.name}</h3>
          <div className={`px-2 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${statusStyles[campaign.status]}`}>
            {campaign.status}
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-3">{campaign.type}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {campaign.platforms.map(p => <span key={p} className="text-2xl">{platformIcons[p]}</span>)}
          </div>
          <button onClick={handleSave} className="p-2 rounded-full hover:bg-red-500/20 transition-colors">
            {isSaved ? (
              <BookmarkIconSolid className="h-6 w-6 text-red-500" />
            ) : (
              <BookmarkIconOutline className="h-6 w-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;