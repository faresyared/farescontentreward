import React from 'react';
import { FullCampaign } from '../CampaignDetailsModal'; // We'll pass the full campaign object as a prop

interface DetailsChannelProps {
  campaign: FullCampaign;
}

const DetailsChannel: React.FC<DetailsChannelProps> = ({ campaign }) => {
  return (
    <div className="space-y-6">
      <div className="w-full h-80 bg-black rounded-2xl flex items-center justify-center border border-gray-800/50">
        <img src={campaign.photo} alt={campaign.name} className="max-w-full max-h-full object-contain" />
      </div>
      <div className="p-4 bg-gray-900/50 rounded-xl">
        <h1 className="text-4xl font-bold text-white">{campaign.name}</h1>
        <p className="mt-2 text-gray-400">{campaign.type} • {campaign.category}</p>
      </div>
      <div className="p-4 bg-gray-900/50 rounded-xl">
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 mb-4">Rules & Guidelines</h3>
        <p className="whitespace-pre-wrap text-gray-300">{campaign.rules}</p>
      </div>
    </div>
  );
};

export default DetailsChannel;