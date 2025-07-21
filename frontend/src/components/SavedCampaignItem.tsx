// frontend/src/components/SavedCampaignItem.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { FullCampaign } from './CampaignDetailsModal';

const statusStyles = {
  Active: 'bg-green-500',
  Ended: 'bg-gray-500',
  Soon: 'bg-blue-500',
  Paused: 'bg-yellow-500',
};

const SavedCampaignItem: React.FC<{ campaign: FullCampaign }> = ({ campaign }) => {
  return (
    // --- THIS IS THE KEY CHANGE ---
    // The link now goes directly to the unique campaign page.
    <NavLink
      to={`/dashboard/campaign/${campaign._id}`}
      className="flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-colors duration-200"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusStyles[campaign.status]}`} />
      <span className="flex-grow text-sm truncate">{campaign.name}</span>
      <img src={campaign.photo} alt={campaign.name} className="h-8 w-8 rounded-md object-cover flex-shrink-0" />
    </NavLink>
  );
};

export default SavedCampaignItem;