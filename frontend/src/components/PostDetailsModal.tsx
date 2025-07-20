// src/components/PostDetailsModal.tsx

import React from 'react';
import Modal from './Modal';
import { Post } from './PostCard'; // We'll import the Post type from PostCard
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { formatDistanceToNow } from 'date-fns';

const PostDetailsModal: React.FC<{ post: Post | null; isOpen: boolean; onClose: () => void }> = ({ post, isOpen, onClose }) => {
  if (!post) return null;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const allMedia = [
    ...(post.imageUrls || []).map(url => ({ type: 'image', url })),
    ...(post.videoUrls || []).map(url => ({ type: 'video', url })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Post Details">
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        {/* Post Header */}
        <div className="flex items-center mb-4">
          <img className="h-12 w-12 rounded-full" src={post.author.avatar} alt={post.author.username} />
          <div className="ml-4">
            <div className="text-lg font-bold text-white">{post.author.username}</div>
            <div className="text-xs text-gray-400">{timeAgo}</div>
          </div>
        </div>
        
        {/* Content */}
        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Media Slider */}
        {allMedia.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={10}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            className="rounded-lg"
          >
            {allMedia.map((media, index) => (
              <SwiperSlide key={index}>
                {media.type === 'image' ? (
                  <img src={media.url} alt={`Post media ${index + 1}`} className="w-full h-auto max-h-[60vh] object-contain" />
                ) : (
                  <video src={media.url} controls className="w-full h-auto max-h-[60vh]" />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </Modal>
  );
};

export default PostDetailsModal;