import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FullCampaign, Channel } from '../components/CampaignDetailsModal';
import ChannelManager from '../components/ChannelManager';
import UpdatesChannel from '../components/channels/UpdatesChannel'; // Import our new channel
import { Cog6ToothIcon, ChatBubbleBottomCenterTextIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

// A map to link channel types to their components and icons
const channelComponentMap = {
  'feed': { component: UpdatesChannel, icon: <InformationCircleIcon className="h-5 w-5"/> },
  'chat': { component: () => <div className="text-center text-gray-500 p-8">Chat feature coming soon!</div>, icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5"/> },
  // Add other channels here as you build them
};

const CampaignPage = () => {
  const { id: campaignId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [campaign, setCampaign] = useState<FullCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChannelManagerOpen, setIsChannelManagerOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/campaigns/${campaignId}`);
        setCampaign(res.data);
        // Set the first channel as active by default
        if (res.data.channels && res.data.channels.length > 0) {
          setActiveChannel(res.data.channels[0]);
        }
      } catch (err) { 
        console.error("Failed to fetch campaign details", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCampaign();
  }, [campaignId]);
  
  // A function to render the currently active channel component
  const renderActiveChannel = () => {
    if (!activeChannel || !campaignId) {
      return <div className="text-center text-gray-500 p-8">Select a channel to get started.</div>;
    }

    const ChannelComponent = channelComponentMap[activeChannel.type]?.component;
    return ChannelComponent ? <ChannelComponent campaignId={campaignId} /> : <div className="text-center text-red-500 p-8">Error: Channel type "{activeChannel.type}" not found.</div>;
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left side: Channel Navigation */}
        <div className="lg:col-span-1 space-y-6">
            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Channels</h3>
                    {isAdmin && (
                        <button onClick={() => setIsChannelManagerOpen(true)} className="p-2 rounded-full hover:bg-gray-700/50 transition-colors" aria-label="Manage Channels">
                            <Cog6ToothIcon className="h-5 w-5 text-gray-400"/>
                        </button>
                    )}
                </div>
                {campaign.channels && campaign.channels.length > 0 ? (
                    <div className="space-y-1">
                        {campaign.channels.map(channel => {
                            const isActive = activeChannel?.type === channel.type;
                            const channelInfo = channelComponentMap[channel.type];
                            return (
                                <button 
                                  key={channel._id || channel.type} 
                                  onClick={() => setActiveChannel(channel)}
                                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${isActive ? 'bg-red-500/10 text-red-400' : 'text-gray-300 hover:bg-gray-800/50'}`}
                                >
                                    {channelInfo?.icon}
                                    <span>{channel.name}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        <p>No channels yet.</p>
                        {isAdmin && <p className="text-xs mt-1">Click the gear icon to add one.</p>}
                    </div>
                )}
            </div>
        </div>

        {/* Right side: Active Channel Content */}
        <div className="lg:col-span-3">
            {renderActiveChannel()}
        </div>
      </div>
    </>
  );
};

export default CampaignPage;