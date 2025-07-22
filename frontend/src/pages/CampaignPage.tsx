// frontend/src/pages/CampaignPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import axios from 'axios';
import { FullCampaign, Channel } from '../components/CampaignDetailsModal';
import ChannelManager from '../components/ChannelManager';
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const platformIcons = { YouTube: <FaYoutube />, X: <FaXTwitter />, Instagram: <FaInstagram />, TikTok: <FaTiktok />, };
const statusStyles = { Active: 'bg-green-500/20 text-green-400 border-green-500/30', Ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30', Soon: 'bg-blue-500/20 text-blue-400 border-blue-500/30', Paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', };
const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => ( <div> <p className="text-sm text-gray-400">{label}</p> <p className="text-lg font-semibold text-white">{value || 'N/A'}</p> </div> );

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [campaign, setCampaign] = useState<FullCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChannelManagerOpen, setIsChannelManagerOpen] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`/api/campaigns/${id}`);
        setCampaign(res.data);
      } catch (err) { console.error("Failed to fetch campaign details", err); } 
      finally { setLoading(false); }
    };
    if (id) { fetchCampaign(); }
  }, [id]);

  if (loading) return <p className="text-center text-gray-400">Loading Campaign...</p>;
  if (!campaign) return <p className="text-center text-red-500">Campaign not found.</p>;

  return (
    <>
      {isAdmin && (
        <ChannelManager 
          campaign={campaign}
          isOpen={isChannelManagerOpen}
          onClose={() => setIsChannelManagerOpen(false)}
          onUpdate={(updatedCampaign) => setCampaign(updatedCampaign)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: Channels */}
        <div className="lg:col-span-1 space-y-6">
            <div className="p-4 bg-gray-900/50 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Channels</h3>
                    {isAdmin && (
                        <button onClick={() => setIsChannelManagerOpen(true)} className="p-2 rounded-full hover:bg-gray-700/50">
                            <Cog6ToothIcon className="h-5 w-5 text-gray-400"/>
                        </button>
                    )}
                </div>
                {campaign.channels && campaign.channels.length > 0 ? (
                    <div className="space-y-2">
                        {campaign.channels.map(channel => (
                            <div key={channel._id} className="p-2 text-gray-300 rounded-lg hover:bg-gray-800/50">
                                # {channel.name}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        <p>No channels yet.</p>
                        {isAdmin && <p className="text-xs">Click the gear to add one.</p>}
                    </div>
                )}
            </div>
        </div>

        {/* Right side: Details */}
        <div className="lg:col-span-2 space-y-6">
            <div className="w-full h-80 bg-black rounded-2xl flex items-center justify-center border border-gray-800/50">
                <img src={campaign.photo} alt={campaign.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl">
                <h1 className="text-4xl font-bold text-white">{campaign.name}</h1>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl">
                <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 mb-4">Rules & Guidelines</h3>
                <p className="whitespace-pre-wrap text-gray-300">{campaign.rules}</p>
            </div>
        </div>
      </div>
    </>
  );
};

export default CampaignPage;