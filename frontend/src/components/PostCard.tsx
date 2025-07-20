// frontend/src/components/PostCard.tsx

import React from 'react';
import { HandThumbUpIcon, ChatBubbleOvalLeftEllipsisIcon, FaceSmileIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

// Define the structure of a post coming from the API
export interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    avatar: string;
  };
  content: string;
  imageUrls?: string[];
  videoUrls?: string[];
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onPostClick: () => void; // A function to handle when the card is clicked
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostClick }) => {
  // Format the timestamp to be user-friendly (e.g., "about 5 hours ago")
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const firstImage = post.imageUrls?.[0];
  const firstVideo = post.videoUrls?.[0];
  const mediaCount = (post.imageUrls?.length || 0) + (post.videoUrls?.length || 0);

  return (
    <div 
      onClick={onPostClick} 
      className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-red-500/20 hover:border-red-500/30 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="p-5">
        {/* Post Header */}
        <div className="flex items-center mb-4">
          <img className="h-12 w-12 rounded-full" src={post.author.avatar} alt={post.author.username} />
          <div className="ml-4">
            <div className="text-lg font-bold text-white">{post.author.username}</div>
            <div className="text-xs text-gray-400">{timeAgo}</div>
          </div>
        </div>

        {/* Post Content */}
        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Media Preview */}
        {(firstImage || firstVideo) && (
          <div className="relative">
            {firstImage ? (
              <img className="rounded-lg w-full max-h-[500px] object-cover" src={firstImage} alt="Post content" />
            ) : (
              // Use a video tag that doesn't autoplay or have controls for the preview
              <video className="rounded-lg w-full max-h-[500px] object-cover" src={firstVideo!} />
            )}
            {mediaCount > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full flex items-center">
                <PhotoIcon className="h-4 w-4 mr-1"/> +{mediaCount - 1}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Actions (Likes, Comments, Emojis) */}
      <div className="border-t border-gray-800/70 px-5 py-3 flex justify-between items-center text-gray-400">
        <div className="flex space-x-5">
           <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <HandThumbUpIcon className="h-6 w-6" /> <span>0</span>
          </button>
           <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" /> <span>0</span>
          </button>
        </div>
        <div>
            <button className="hover:text-red-500 transition-colors">
                <FaceSmileIcon className="h-6 w-6" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;