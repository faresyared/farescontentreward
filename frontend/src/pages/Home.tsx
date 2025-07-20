// src/pages/Home.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard, { Post } from '../components/PostCard';
import Modal from '../components/Modal';
import AddPostForm from '../components/AddPostForm';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/posts');
        setPosts(res.data);
      } catch (err) {
        setError('Failed to load posts.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleAddPostSuccess = (newPost: Post) => {
    setPosts([newPost, ...posts]);
    setIsModalOpen(false);
  };

  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-400">Loading feed...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (posts.length === 0) return <p className="text-center text-gray-400">No posts in the feed yet.</p>;
    return (
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a New Post">
        <AddPostForm 
          onSuccess={handleAddPostSuccess} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>

      <div className="max-w-3xl mx-auto">
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg shadow-red-500/20"
            >
              <PencilSquareIcon className="h-6 w-6 mr-2" />
              Create a New Post
            </button>
          </div>
        )}
        
        {renderContent()}
      </div>
    </>
  );
};

export default Home;