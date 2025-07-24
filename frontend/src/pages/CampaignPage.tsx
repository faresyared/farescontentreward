import React, 'useState', useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FullCampaign, Channel } from '../components/CampaignDetailsModal';
import ChannelManager from '../components/ChannelManager';
import DetailsChannel from '../components/channels/DetailsChannel'; // Import our new Details channel
import UpdatesChannel from '../components/channels/UpdatesChannel';
import { Cog6ToothIcon, ChatBubbleBottomCenterTextIcon, InformationCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

// --- CHANGE 1: Define the default channel ---
const defaultChannel: Channel = {
  _id: 'details',
  name: 'Details',
  type: 'details',
};

const channelComponentMap = {
  'details': { component: DetailsChannel, icon: <ClipboardDocumentListIcon className="h-5 w-5"/> },
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
  
  // --- CHANGE 2: Set the active channel to our default channel initially ---
  const [activeChannel, setActiveChannel] = useState<Channel>(defaultChannel);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/campaigns/${campaignId}`);
        setCampaign(res.data);
        // No need to set active channel here anymore, it's already set to default
      } catch (err) { 
        console.error("Failed to fetch campaign details", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchCampaign();
  }, [campaignId]);
  
  const renderActiveChannel = () => {
    if (!campaign) return null; // Campaign data is required now

    const ChannelComponent = channelComponentMap[activeChannel.type]?.component;

    // --- CHANGE 3: Pass props differently based on the component ---
    if (activeChannel.type === 'details') {
      return ChannelComponent ? <ChannelComponent campaign={campaign} /> : null;
    }
    if (campaignId) {
      return ChannelComponent ? <ChannelComponent campaignId={campaignId} /> : null;
    }
    return <div className="text-center text-red-500 p-8">Error: Could not render channel.</div>;
  };

  if (loading) return <p className="text-center text-gray-400">Loading Campaign...</p>;
  if (!campaign) return <p className="text-center text-red-500">Campaign not found.</p>;
  
  // --- CHANGE 4: Combine the default channel with channels from the database ---
  const allChannels = [defaultChannel, ...(campaign.channels || [])];

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
                <div className="space-y-1">
                    {allChannels.map(channel => {
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
                    {/* Display a message if only the default channel exists */}
                    {campaign.channels.length === 0 && (
                        <div className="text-center text-gray-500 pt-4 pb-2">
                            {isAdmin && <p className="text-xs">Click the gear to add more channels.</p>}
                        </div>
                    )}
                </div>
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