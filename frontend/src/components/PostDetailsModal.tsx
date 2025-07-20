// frontend/src/components/PostDetailsModal.tsx

import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { Post } from './PostCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { HandThumbUpIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpIconOutline } from '@heroicons/react/24/outline';

interface PostDetailsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdate: (updatedPost: Post) => void;
}

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({ post, isOpen, onClose, onPostUpdate }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  
  if (!post) return null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const allMedia = [
    ...(post.imageUrls || []).map(url => ({ type: 'image', url })),
    ...(post.videoUrls || []).map(url => ({ type: 'video', url })),
  ];
  const hasUserLiked = user ? post.likes.includes(user.id) : false;

  const handleLike = async () => {
    try {
      const res = await axios.put(`/api/posts/${post._id}/like`);
      onPostUpdate({ ...post, likes: res.data });
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/api/posts/${post._id}/comment`, { text: newComment });
      onPostUpdate({ ...post, comments: res.data });
      setNewComment('');
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Details">
      <div className="max-h-[80vh] overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full">
          {allMedia.length > 0 && (
            <Swiper modules={[Navigation, Pagination]} spaceBetween={10} slidesPerView={1} navigation pagination={{ clickable: true }} className="rounded-lg">
              {allMedia.map((media, index) => (
                <SwiperSlide key={index}>
                  {media.type === 'image' ? <img src={media.url} alt={`Post media ${index + 1}`} className="w-full h-auto max-h-[70vh] object-contain" /> : <video src={media.url} controls className="w-full h-auto max-h-[70vh]" />}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-center mb-4">
            <img className="h-12 w-12 rounded-full" src={post.author.avatar} alt={post.author.username} />
            <div className="ml-4">
              <div className="text-lg font-bold text-white">{post.author.username}</div>
              <div className="text-xs text-gray-400">{timeAgo}</div>
            </div>
          </div>
          <p className="text-gray-300 mb-4 pb-4 border-b border-gray-700 whitespace-pre-wrap">{post.content}</p>

          <div className="flex items-center space-x-4 text-gray-300 mb-4">
            <button onClick={handleLike} className="flex items-center space-x-2 hover:text-red-500 transition-colors">
              {hasUserLiked ? <HandThumbUpIcon className="h-6 w-6 text-red-500" /> : <HandThumbUpIconOutline className="h-6 w-6" />}
              <span>{post.likes.length} Likes</span>
            </button>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-4 mb-4">
            {post.comments.map(comment => (
              <div key={comment._id} className="flex items-start space-x-3">
                <img src={comment.user.avatar} alt={comment.user.username} className="h-8 w-8 rounded-full"/>
                <div>
                  <p className="text-sm">
                    <span className="font-bold text-white">{comment.user.username}</span>{' '}
                    <span className="text-gray-300">{comment.text}</span>
                  </p>
                  <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-700">
            <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500 text-white" />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Post</button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailsModal;