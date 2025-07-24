import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FullCampaign } from '../components/CampaignDetailsModal';
import ChannelManager from '../components/ChannelManager';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const CampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [campaign, setCampaign] = useState<FullCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChannelManagerOpen, setIsChannelManagerOpen] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/campaigns/${id}`);
        setCampaign(res.data);
      } catch (err) { 
        console.error("Failed to fetch campaign details", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCampaign();
  }, [id]);

  if (loading) return <p className="text-center text-gray-400">Loading Campaign...</p>;
  if (!campaign) return <p className="text-center text-red-500">Campaign not found.</p>;

  return (
    <>
      {/* The ChannelManager modal, only rendered for admins */}
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
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Channels</h3>
                    {isAdmin && (
                        <button 
                          onClick={() => setIsChannelManagerOpen(true)} 
                          className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                          aria-label="Manage Channels"
                        >
                            <Cog6ToothIcon className="h-5 w-5 text-gray-400"/>
                        </button>
                    )}
                </div>
                {campaign.channels && campaign.channels.length > 0 ? (
                    <div className="space-y-2">
                        {campaign.channels.map(channel => (
                            <div key={channel._id || channel.type} className="p-2 text-gray-300 rounded-lg hover:bg-gray-800/50">
                                # {channel.name}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        <p>No channels yet.</p>
                        {isAdmin && <p className="text-xs mt-1">Click the gear icon to add one.</p>}
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
                <p className="mt-2 text-gray-400">{campaign.type} • {campaign.category}</p>
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