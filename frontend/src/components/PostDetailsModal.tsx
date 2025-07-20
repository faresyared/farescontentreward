/ frontend/src/components/PostDetailsModal.tsx

import React, { useState, Fragment } from 'react';
import axios from 'axios';
import Modal from './Modal';
import { Post, Comment } from './PostCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { HandThumbUpIcon, FaceSmileIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { HandThumbUpIcon as HandThumbUpIconOutline, FaceSmileIcon as FaceSmileIconOutline } from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';

const EMOJIS = ['👍', '🔥', '😂', '😯', '😢'];

interface PostDetailsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdate: (updatedPost: Post) => void;
}

const PostDetailsModal: React.FC<PostDetailsModalProps> = ({ post, isOpen, onClose, onPostUpdate }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedText, setEditedText] = useState('');
  
  if (!post) return null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const allMedia = [
    ...(post.imageUrls || []).map(url => ({ type: 'image', url })),
    ...(post.videoUrls || []).map(url => ({ type: 'video', url })),
  ];
  const hasUserLiked = user ? post.likes.includes(user.id) : false;
  const userReaction = user ? post.reactions.find(r => r.user._id === user.id) : null;

  const handleLike = async () => {
    try {
      const res = await axios.put(`/api/posts/${post._id}/like`);
      onPostUpdate({ ...post, likes: res.data });
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
        const res = await axios.put(`/api/posts/${post._id}/react`, { emoji });
        onPostUpdate({ ...post, reactions: res.data });
    } catch (err) {
        console.error("Failed to react to post", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const textToSubmit = editingComment ? editedText : newComment;
    if (!textToSubmit.trim()) return;
    try {
      let res;
      if (editingComment) {
        res = await axios.put(`/api/posts/${post._id}/comments/${editingComment._id}`, { text: textToSubmit });
      } else {
        res = await axios.post(`/api/posts/${post._id}/comment`, { text: textToSubmit });
      }
      onPostUpdate({ ...post, comments: res.data });
      setNewComment('');
      setEditingComment(null);
      setEditedText('');
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
        try {
            const res = await axios.delete(`/api/posts/${post._id}/comments/${commentId}`);
            onPostUpdate({ ...post, comments: res.data });
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    }
  };
  
  const startEditing = (comment: Comment) => {
    setEditingComment(comment);
    setEditedText(comment.text);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditedText('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Details">
      <div className="max-h-[80vh] overflow-y-auto pr-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="w-full">
          {allMedia.length > 0 && (
            <Swiper modules={[Navigation, Pagination]} spaceBetween={10} slidesPerView={1} navigation pagination={{ clickable: true }} className="rounded-lg bg-black">
              {allMedia.map((media, index) => (
                <SwiperSlide key={index}>
                  {media.type === 'image' ? <img src={media.url} alt={`Post media ${index + 1}`} className="w-full h-auto max-h-[70vh] object-contain" /> : <video src={media.url} controls className="w-full h-auto max-h-[70vh]" />}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        <div className="flex flex-col h-full max-h-[70vh]">
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
            <Popover className="relative">
              <Popover.Button className="flex items-center space-x-2 hover:text-red-500 transition-colors outline-none">
                {userReaction ? <span className="text-2xl">{userReaction.emoji}</span> : <FaceSmileIconOutline className="h-6 w-6" />}
                <span>{post.reactions.length} Reactions</span>
              </Popover.Button>
              <Transition as={Fragment} enter="transition ease-out duration-200" enterFrom="opacity-0 translate-y-1" enterTo="opacity-100 translate-y-0" leave="transition ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-1">
                <Popover.Panel className="absolute z-10 bottom-full mb-2 w-max p-2 bg-gray-800 rounded-full shadow-lg">
                  <div className="flex gap-2">
                    {EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => handleReaction(emoji)} className="text-2xl p-1 rounded-full hover:bg-gray-700/50 transition-colors">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </Popover.Panel>
              </Transition>
            </Popover>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
            {post.comments.map(comment => (
              <div key={comment._id} className="flex items-start space-x-3 group">
                <img src={comment.user.avatar} alt={comment.user.username} className="h-8 w-8 rounded-full"/>
                <div className="flex-grow bg-gray-800/50 p-2 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm">{comment.user.username}</span>
                        {/* --- THIS IS THE KEY CHANGE --- */}
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1 text-gray-400">
                            {/* The Edit button is ONLY visible if the logged-in user is the author of the comment */}
                            {user?.id === comment.user._id && (
                                <button onClick={() => startEditing(comment)} className="p-1 hover:text-white"><PencilIcon className="h-4 w-4"/></button>
                            )}
                            {/* The Delete button is visible if the user is the author OR an admin */}
                            {(user?.id === comment.user._id || user?.role === 'admin') && (
                                <button onClick={() => handleDeleteComment(comment._id)} className="p-1 hover:text-white"><TrashIcon className="h-4 w-4"/></button>
                            )}
                        </div>
                    </div>
                    {editingComment?._id === comment._id ? (
                        <input type="text" value={editedText} onChange={(e) => setEditedText(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && cancelEditing()} autoFocus className="w-full bg-gray-700 rounded p-1 text-sm text-gray-200 mt-1"/>
                    ) : (
                        <p className="text-gray-300 text-sm mt-1">{comment.text}</p>
                    )}
                  <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-700">
            <input type="text" value={editingComment ? editedText : newComment} onChange={(e) => editingComment ? setEditedText(e.target.value) : setNewComment(e.target.value)} placeholder={editingComment ? "Edit your comment... (Enter to save, Esc to cancel)" : "Add a comment..."} className="w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500 text-white" />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">{editingComment ? 'Save' : 'Post'}</button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailsModal;