// frontend/src/pages/CampaignPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import { FullCampaign } from '../components/CampaignDetailsModal'; // Reuse our detailed type
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

// --- THIS IS THE FIX ---
// These helpers were missing from the file, causing the crash.
const platformIcons = {
  YouTube: <FaYoutube className="text-red-600" />,
  X: <FaXTwitter className="text-white" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  TikTok: <FaTiktok className="text-white" />,
};

const statusStyles = {
  Active: 'bg-green-500/20 text-green-400 border-green-500/30',
  Ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Soon: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-lg font-semibold text-white">{value || 'N/A'}</p>
  </div>
);
// --- END OF THE FIX ---

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<FullCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`/api/campaigns/${id}`);
        setCampaign(res.data);
      } catch (err) {
        console.error("Failed to fetch campaign details", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  if (loading) return <p className="text-center text-gray-400">Loading Campaign...</p>;
  if (!campaign) return <p className="text-center text-red-500">Campaign not found.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side: Campaign Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="w-full h-80 bg-black rounded-2xl flex items-center justify-center border border-gray-800/50">
          <img src={campaign.photo} alt={campaign.name} className="max-w-full max-h-full object-contain" />
        </div>
        
        <div className="p-4 bg-gray-900/50 rounded-xl">
            <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 mb-4">Rules & Guidelines</h3>
            <p className="whitespace-pre-wrap text-gray-300">{campaign.rules}</p>
        </div>
      </div>

      {/* Right side: Info & Channels */}
      <div className="space-y-6">
        <div className="p-4 bg-gray-900/50 rounded-xl">
          <h1 className="text-3xl font-bold text-white mb-2">{campaign.name}</h1>
          <div className="flex justify-between items-center mb-4">
            <div className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusStyles[campaign.status]}`}>
                {campaign.status}
            </div>
            <div className="text-lg font-bold text-red-500">${campaign.budget}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-gray-700/50 pt-4">
            <DetailItem label="Category" value={campaign.category} />
            <DetailItem label="Type" value={campaign.type} />
            <DetailItem label="Reward/1k Views" value={campaign.rewardPer1kViews ? `$${campaign.rewardPer1kViews}` : 'N/A'} />
            <DetailItem label="Max Payout" value={campaign.maxPayout ? `$${campaign.maxPayout}` : 'N/A'} />
          </div>
          {campaign.assets && campaign.assets.url && (
            <div className="border-t border-gray-700/50 pt-4 mt-4">
                <a href={campaign.assets.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold">
                    {campaign.assets.name || 'Download Assets'}
                </a>
            </div>
           )}
        </div>

        <div className="p-4 bg-gray-900/50 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-4">Channels</h3>
          <div className="text-center text-gray-500 py-8">
            <p>Admin-configurable channels will appear here.</p>
            <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 py-1 px-2 rounded-full mt-2 inline-block">
                Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPage;