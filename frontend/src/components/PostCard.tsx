// frontend/src/components/PostCard.tsx

import React from 'react';
import { HandThumbUpIcon, ChatBubbleOvalLeftEllipsisIcon, FaceSmileIcon, PhotoIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export interface Reaction {
  _id: string;
  user: { _id: string; username: string; avatar: string; };
  emoji: string;
}

export interface Comment {
  _id: string;
  user: { _id: string; username: string; avatar: string; };
  text: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  author: { _id: string; username: string; avatar: string; };
  content: string;
  imageUrls?: string[];
  videoUrls?: string[];
  likes: string[];
  comments: Comment[];
  reactions: Reaction[];
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onPostClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void; // New prop for handling delete
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostClick, onEditClick, onDeleteClick }) => {
  const { user } = useAuth();
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const firstImage = post.imageUrls?.[0];
  const firstVideo = post.videoUrls?.[0];
  const mediaCount = (post.imageUrls?.length || 0) + (post.videoUrls?.length || 0);

  const isAuthor = user?.id === post.author._id;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditClick();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick();
  };

  return (
    <div onClick={onPostClick} 
      className="bg-gray-900/50 backdrop-blur-md rounded-2xl border border-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-red-500/20 hover:border-red-500/30 transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img className="h-12 w-12 rounded-full" src={post.author.avatar} alt={post.author.username} />
            <div className="ml-4">
              <div className="text-lg font-bold text-white">{post.author.username}</div>
              <div className="text-xs text-gray-400">{timeAgo}</div>
            </div>
          </div>
          {isAuthor && (
            <div className="flex gap-2">
              <button onClick={handleDelete} className="p-2 rounded-full text-gray-400 hover:bg-red-800/50 hover:text-white transition-colors">
                <TrashIcon className="h-5 w-5" />
              </button>
              <button onClick={handleEdit} className="p-2 rounded-full text-gray-400 hover:bg-blue-600/50 hover:text-white transition-colors">
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

        {(firstImage || firstVideo) && (
          <div className="relative rounded-lg overflow-hidden h-80 bg-black"> 
            {firstImage ? (
              <img className="w-full h-full object-contain" src={firstImage} alt="Post content" />
            ) : (
              <video className="w-full h-full object-contain" src={firstVideo!} />
            )}
            {mediaCount > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold py-1 px-2 rounded-full flex items-center">
                <PhotoIcon className="h-4 w-4 mr-1"/> +{mediaCount - 1}
              </div>
            )}
          </div>
        )}
      </div>

     <div className="border-t border-gray-800/70 px-5 py-3 flex justify-between items-center text-gray-400">
        <div className="flex space-x-5">
           <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <HandThumbUpIcon className="h-6 w-6" /> <span>{post.likes.length}</span>
          </button>
           <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" /> <span>{post.comments.length}</span>
          </button>
        </div>
        <div>
            <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                <FaceSmileIcon className="h-6 w-6" />
                <span>{post.reactions.length}</span> 
            </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;