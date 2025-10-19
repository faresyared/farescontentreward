import React from 'react';
import type { CampaignAsset, FullCampaign } from '../CampaignDetailsModal';
import { FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from "react-icons/fa6";
import ReactMarkdown from 'react-markdown'; // Import the markdown library

// A small, reusable component to display each detail item neatly.
const DetailItem: React.FC<{ label: string; value?: string | number | React.ReactNode }> = ({ label, value }) => (
  <div className="bg-gray-800/40 p-3 rounded-lg">
    <p className="text-sm text-gray-400">{label}</p>
    <div className="text-lg font-semibold text-white">{value || 'N/A'}</div>
  </div>
);

// A map for our platform icons.
const platformIcons = {
  YouTube: <FaYoutube className="text-red-600" />,
  X: <FaXTwitter className="text-white" />,
  Instagram: <FaInstagram className="text-pink-500" />,
  TikTok: <FaTiktok className="text-white" />,
};

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

const DetailsChannel: React.FC<{ campaign: FullCampaign }> = ({ campaign }) => {
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
        <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-3 mb-4">Campaign Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailItem label="Budget" value={`$${campaign.budget.toLocaleString()}`} />
          <DetailItem label="Reward/1k Views in JD" value={campaign.rewardPer1kViews ? `$${campaign.rewardPer1kViews}` : undefined} />
          <DetailItem label="Min Payout" value={campaign.minPayout ? `$${campaign.minPayout}` : undefined} />
          <DetailItem label="Max Payout" value={campaign.maxPayout ? `$${campaign.maxPayout}` : undefined} />
          <DetailItem 
            label="Platforms" 
            value={
              <div className="flex items-center space-x-3 text-2xl pt-1">
                {campaign.platforms.map(p => <span key={p}>{platformIcons[p]}</span>)}
              </div>
            } 
          />
          <DetailItem
            label="Assets"
            value={
              campaign.assets && campaign.assets.length > 0 ? (
                <div className="flex flex-col space-y-3 pt-1 text-left">
                  {campaign.assets.map((asset, index) => (
                    <div key={`${asset.url}-${index}`} className="bg-gray-900/40 border border-gray-800/50 rounded-lg p-3">
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
              ) : 'N/A'
            }
          />
        </div>
      </div>

      <div className="p-4 bg-gray-900/50 rounded-xl">
        <h3 className="text-xl font-bold text-red-500 border-b border-gray-700 pb-3 mb-4">Rules & Guidelines</h3>
        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
          <ReactMarkdown>{campaign.rules}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default DetailsChannel;