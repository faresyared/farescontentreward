import React from 'react';
import PostCard from '../components/PostCard';

// استخدم نوع Post محلياً هنا بدل استيراده من PostCard.tsx
interface Post {
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

const mockPosts: Post[] = [
  {
    id: 1,
    author: { name: 'Reelify Admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
    content: 'Welcome to the new Reelify platform! We have some exciting campaigns coming up. Get ready to create amazing content!',
    timestamp: '2 hours ago',
    likes: 132,
    commentsCount: 12,
  },
  {
    id: 2,
    author: { name: 'Reelify Admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
    content: 'Check out the new campaign for "Neon Nights"! We are looking for stunning UGC content capturing city nightlife. Budget: $500, Payout: $50/1k views.',
    imageUrl: 'https://images.unsplash.com/photo-1531972133428-5a3d76b43d83?q=80&w=2070&auto=format&fit=crop',
    timestamp: '1 day ago',
    likes: 458,
    commentsCount: 45,
  },
  {
    id: 3,
    author: { name: 'Reelify Admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
    content: 'Quick tip: High-quality audio can make or break your video. Always check your sound before submitting!',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    timestamp: '3 days ago',
    likes: 210,
    commentsCount: 28,
  }
];

const isAdmin = true;

const Home = () => {
  return (
    <div className="max-w-3xl mx-auto">
      {isAdmin && (
        <div className="mb-6">
          <button className="w-full flex items-center justify-center bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg shadow-red-500/20">
            Create a New Post
          </button>
        </div>
      )}
      <div className="space-y-8">
        {mockPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Home;