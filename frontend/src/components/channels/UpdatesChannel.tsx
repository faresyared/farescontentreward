import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface UpdatePost {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface UpdatesChannelProps {
  campaignId: string;
}

const UpdatesChannel: React.FC<UpdatesChannelProps> = ({ campaignId }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [updates, setUpdates] = useState<UpdatePost[]>([]);
  const [newUpdateContent, setNewUpdateContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/campaigns/${campaignId}/updates`);
        setUpdates(res.data);
      } catch (err) {
        toast.error('Could not load campaign updates.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, [campaignId]);

  const handlePostUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUpdateContent.trim()) return;

    try {
      const res = await axios.post(`/api/campaigns/${campaignId}/updates`, { content: newUpdateContent });
      setUpdates([res.data, ...updates]); // Add new update to the top of the list
      setNewUpdateContent(''); // Clear the textarea
      toast.success('Update posted!');
    } catch (err) {
      toast.error('Failed to post update.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Post Form */}
      {isAdmin && (
        <form onSubmit={handlePostUpdate} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800/50">
          <textarea
            value={newUpdateContent}
            onChange={(e) => setNewUpdateContent(e.target.value)}
            className="w-full bg-gray-800/60 rounded-lg p-3 border border-gray-700 focus:ring-red-500 text-white placeholder-gray-500"
            placeholder="Write an update for the creators..."
            rows={4}
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Post Update
            </button>
          </div>
        </form>
      )}

      {/* Updates Feed */}
      {loading ? (
        <p className="text-center text-gray-400">Loading updates...</p>
      ) : updates.length > 0 ? (
        updates.map((update) => (
          <div key={update._id} className="bg-gray-900/50 p-5 rounded-xl border border-gray-800/50">
            <div className="flex items-center mb-3">
              <img src={update.author.avatar} alt={update.author.username} className="h-10 w-10 rounded-full" />
              <div className="ml-3">
                <p className="font-bold text-white">{update.author.username}</p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">{update.content}</p>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-8">No updates posted for this campaign yet.</p>
      )}
    </div>
  );
};

export default UpdatesChannel;