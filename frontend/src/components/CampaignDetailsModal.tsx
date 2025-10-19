import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import toast from 'react-hot-toast'; // Import toast for notifications

export interface Channel {
  name: string;
  type: string;
  _id: string;
}

export interface CampaignAsset {
  name: string;
  url: string;
  type?: 'audio' | 'image' | 'video' | 'document' | 'other';
}

export interface FullCampaign {
  _id: string; name: string; photo: string; budget: number; rules: string;
  assets?: CampaignAsset[];
  platforms: ('YouTube' | 'X' | 'Instagram' | 'TikTok')[];
  rewardPer1kViews?: number; type: 'UGC' | 'Clipping' | 'Faceless UGC';
  maxPayout?: number; minPayout?: number; category: 'Personal Brand' | 'Entertainment' | 'Music';
  status: 'Active' | 'Ended' | 'Soon' | 'Paused';
  isPrivate: boolean;
  participants: string[];
  waitlist: string[];
  channels: Channel[];
}

const statusStyles = { Active: 'bg-green-500/20 text-green-400 border-green-500/30', Ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30', Soon: 'bg-blue-500/20 text-blue-400 border-blue-500/30', Paused: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', };
const platformIcons = { YouTube: <FaYoutube />, X: <FaXTwitter />, Instagram: <FaInstagram />, TikTok: <FaTiktok />, };
const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => ( <div> <p className="text-sm text-gray-400">{label}</p> <p className="text-lg font-semibold text-white">{value || 'N/A'}</p> </div> );

const isAudioAsset = (asset: CampaignAsset) => {
  if (!asset?.url) return false;
  if (asset.type === 'audio') return true;
  try {
    const fromUrl = new URL(asset.url);
    return /\.(mp3|wav|m4a|aac|flac|ogg)$/i.test(fromUrl.pathname || '');
  } catch (err) {
    return /\.(mp3|wav|m4a|aac|flac|ogg)$/i.test(asset.url);
  }
};

const CampaignDetailsModal: React.FC<{ campaign: FullCampaign; isOpen: boolean; onClose: () => void; onJoinSuccess: () => void; }> = ({ campaign, isOpen, onClose, onJoinSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const isParticipant = user ? campaign.participants.includes(user.id) : false;
  const isOnWaitlist = user ? campaign.waitlist.includes(user.id) : false;

  const handleJoin = async () => {
    try {
      await axios.post(`/api/campaigns/${campaign._id}/join`);
      toast.success(campaign.isPrivate ? 'Successfully joined the waitlist!' : 'Successfully joined the campaign!');
      onJoinSuccess();
      onClose();
    } catch (err: any) {
      // --- THIS IS THE FIX ---
      // We now check for the specific error message from the backend.
      if (err.response && err.response.data && err.response.data.msg) {
        toast.error(err.response.data.msg);
      } else {
        toast.error('Failed to join campaign. Please try again.');
      }
      console.error("Failed to join campaign", err);
    }
  };
  
  const navigateToCampaignPage = () => { navigate(`/dashboard/campaign/${campaign._id}`); };

  const renderJoinButton = () => {
    if (isParticipant) { return <button onClick={navigateToCampaignPage} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors">View Campaign Page</button>; }
    if (isOnWaitlist) { return <button className="w-full bg-yellow-600 text-white font-bold py-3 rounded-lg cursor-not-allowed">Pending Approval</button>; }
    if (campaign.isPrivate) { return <button onClick={handleJoin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">Join Waitlist</button>; }
    return <button onClick={handleJoin} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">Join Campaign</button>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={campaign.name}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-gray-300">
        <div className="w-full h-64 bg-black rounded-lg flex items-center justify-center"> <img src={campaign.photo} alt={campaign.name} className="max-w-full max-h-full object-contain" /> </div>
        <div className="pt-2">{renderJoinButton()}</div>
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2">Campaign Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
          <DetailItem label="Budget" value={`$${campaign.budget}`} />
          <DetailItem label="Category" value={campaign.category} />
          <DetailItem label="Type" value={campaign.type} />
          <div><p className="text-sm text-gray-400">Status</p><span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusStyles[campaign.status]}`}> {campaign.status} </span></div>
          <DetailItem label="Reward/1k Views" value={campaign.rewardPer1kViews ? `$${campaign.rewardPer1kViews}` : 'N/A'} />
          <DetailItem label="Min Payout" value={campaign.minPayout ? `$${campaign.minPayout}` : 'N/A'} />
          <DetailItem label="Max Payout" value={campaign.maxPayout ? `$${campaign.maxPayout}` : 'N/A'} />
        </div>
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 pt-4">Platforms</h3>
        <div className="flex items-center space-x-4"> {campaign.platforms.map(p => ( <div key={p} className="flex items-center space-x-2 text-2xl text-white"> {platformIcons[p]} <span className="text-base">{p}</span> </div> ))} </div>
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 pt-4">Rules</h3>
        <p className="whitespace-pre-wrap">{campaign.rules}</p>
        {Array.isArray(campaign.assets) && campaign.assets.length > 0 && (
          <>
            <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-2 pt-4">Assets</h3>
            <div className="space-y-3">
              {campaign.assets.map((asset, index) => (
                <div key={`${asset.url}-${index}`} className="bg-gray-900/40 border border-gray-800/60 rounded-lg p-3">
                  <p className="text-sm font-semibold text-white">{asset.name || `Asset ${index + 1}`}</p>
                  {isAudioAsset(asset) ? (
                    <audio controls className="w-full mt-2">
                      <source src={asset.url} />
                      Your browser does not support audio playback.
                    </audio>
                  ) : (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm"
                    >
                      Open asset
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CampaignDetailsModal;