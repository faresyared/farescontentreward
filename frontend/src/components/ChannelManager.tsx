// frontend/src/components/ChannelManager.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { FullCampaign } from './CampaignDetailsModal';
import Modal from './Modal';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

// --- THIS IS THE KEY CHANGE ---
// We have updated the list of available channels.
const AVAILABLE_CHANNELS = [
  { name: 'Updates', type: 'feed' }, // Your better name for Announcements
  { name: 'Chat', type: 'chat' },
  { name: 'Creator Spotlight', type: 'spotlight' },
  { name: 'Progress Tracker', type: 'progress' },
];

interface ChannelManagerProps {
  campaign: FullCampaign;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCampaign: FullCampaign) => void;
}

const ChannelManager: React.FC<ChannelManagerProps> = ({ campaign, isOpen, onClose, onUpdate }) => {
  const [channels, setChannels] = useState(campaign.channels || []);
  const [selectedChannelType, setSelectedChannelType] = useState(AVAILABLE_CHANNELS[0].type);
  const [error, setError] = useState('');

  const addChannel = () => {
    const channelToAdd = AVAILABLE_CHANNELS.find(c => c.type === selectedChannelType);
    if (channelToAdd && !channels.some(c => c.type === channelToAdd.type)) {
      setChannels([...channels, channelToAdd]);
    }
  };

  const removeChannel = (channelType: string) => {
    setChannels(channels.filter(c => c.type !== channelType));
  };

  const handleSaveChanges = async () => {
    try {
      const res = await axios.put(`/api/campaigns/${campaign._id}`, { channels });
      onUpdate(res.data);
      onClose();
    } catch (err) {
      setError('Failed to save channels.');
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Channels for "${campaign.name}"`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <select 
            value={selectedChannelType}
            onChange={(e) => setSelectedChannelType(e.target.value)}
            className="flex-grow bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
          >
            {AVAILABLE_CHANNELS.map(ch => <option key={ch.type} value={ch.type}>{ch.name}</option>)}
          </select>
          <button onClick={addChannel} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg">
            <PlusIcon className="h-5 w-5"/>
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-300">Current Channels</h3>
          {channels.length > 0 ? (
            channels.map(ch => (
              <div key={ch.type} className="flex items-center justify-between bg-gray-800/50 p-2 rounded-lg">
                <span className="text-white">{ch.name}</span>
                <button onClick={() => removeChannel(ch.type)} className="text-red-500 hover:text-red-400">
                  <TrashIcon className="h-5 w-5"/>
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No channels added yet.</p>
          )}
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="flex justify-end pt-4">
          <button onClick={handleSaveChanges} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChannelManager;