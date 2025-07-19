import React from 'react';
import {
  HandThumbUpIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  FaceSmileIcon,
} from '@heroicons/react/24/outline';

// تعريف وتصدير نوع Post بشكل مباشر
export interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-red-500/20 hover:border-red-500/30 transform hover:-translate-y-1">
      {/* محتوى البوست */}
      <div className="p-5">
        <div className="flex items-center mb-4">
          <img className="h-12 w-12 rounded-full" src={post.author.avatar} alt={post.author.name} />
          <div className="ml-4">
            <div className="text-lg font-bold text-white">{post.author.name}</div>
            <div className="text-xs text-gray-400">{post.timestamp}</div>
          </div>
        </div>
        <p className="text-gray-300 mb-4">{post.content}</p>
        {post.imageUrl && (
          <img className="rounded-lg w-full max-h-[400px] object-cover" src={post.imageUrl} alt="Post content" />
        )}
        {post.videoUrl && (
          <video className="rounded-lg w-full" controls>
            <source src={post.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
      <div className="border-t border-gray-800/70 px-5 py-3 flex justify-between items-center text-gray-400">
        <div className="flex space-x-5">
          <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <HandThumbUpIcon className="h-6 w-6" /> <span>{post.likes}</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" /> <span>{post.commentsCount}</span>
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
