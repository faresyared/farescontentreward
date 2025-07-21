// frontend/src/pages/CampaignPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FullCampaign } from '../components/CampaignDetailsModal'; // Reuse our detailed type
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";

const platformIcons = { YouTube: <FaYoutube />, X: <FaXTwitter />, Instagram: <FaInstagram />, TikTok: <FaTiktok />, };
const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => ( <div> <p className="text-sm text-gray-400">{label}</p> <p className="text-lg font-semibold text-white">{value || 'N/A'}</p> </div> );

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>(); // Get the campaign ID from the URL
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
        <img src={campaign.photo} alt={campaign.name} className="w-full h-80 object-cover rounded-2xl border border-gray-800/50" />
        <h1 className="text-4xl font-bold text-white">{campaign.name}</h1>
        
        <div className="p-4 bg-gray-900/50 rounded-xl">
            <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 mb-4">Rules</h3>
            <p className="whitespace-pre-wrap text-gray-300">{campaign.rules}</p>
        </div>
      </div>

      {/* Right side: Channels & Admin Controls */}
      <div className="space-y-6">
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