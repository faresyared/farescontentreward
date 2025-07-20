// frontend/src/pages/Home.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard, { Post } from '../components/PostCard';
import Modal from '../components/Modal';
import ConfirmationModal from '../components/ConfirmationModal'; // Import confirmation modal
import AddPostForm from '../components/AddPostForm';
import PostDetailsModal from '../components/PostDetailsModal';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null); // State for post to delete

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

  const handleFormSuccess = (updatedPost: Post) => {
    if (postToEdit) {
      // If editing, update the post in the list
      setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    } else {
      // If creating, add to the top of the list
      setPosts([updatedPost, ...posts]);
    }
    setIsFormModalOpen(false);
    setPostToEdit(null);
  };

 const handleFormSuccess = (updatedPost: Post) => {
    if (postToEdit) {
      setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    } else {
      setPosts([updatedPost, ...posts]);
    }
    setIsFormModalOpen(false);
    setPostToEdit(null);
  };

    const handlePostUpdate = (updatedPost: Post) => {
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    setSelectedPost(updatedPost);
  };

  const openAddModal = () => { setPostToEdit(null); setIsFormModalOpen(true); };
  const openEditModal = (post: Post) => { setPostToEdit(post); setIsFormModalOpen(true); };
  const openDetailsModal = (post: Post) => { setSelectedPost(post); setIsDetailsModalOpen(true); };

const openDeleteModal = (post: Post) => {
    setPostToDelete(post);
    setIsDeleteModalOpen(true);
  };

const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await axios.delete(`/api/posts/${postToDelete._id}`);
      setPosts(posts.filter(p => p._id !== postToDelete._id));
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error("Failed to delete post", err);
      setIsDeleteModalOpen(false);
    }
  };


  const renderContent = () => {
    if (loading) return <p className="text-center text-gray-400">Loading feed...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (posts.length === 0) return <p className="text-center text-gray-400">No posts in the feed yet.</p>;
   return (
      <div className="space-y-8">
        {posts.map((post) => (
          <PostCard 
            key={post._id} post={post} 
            onPostClick={() => openPostDetails(post)}
            onEditClick={() => openEditModal(post)}
            onDeleteClick={() => openDeleteModal(post)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={postToEdit ? 'Edit Post' : 'Create a New Post'}>
        <AddPostForm onSuccess={handleFormSuccess} onClose={() => setIsFormModalOpen(false)} postToEdit={postToEdit} />
      </Modal>

      <PostDetailsModal post={selectedPost} isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} onPostUpdate={handlePostUpdate} />
      
 <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Delete Post"
        message="Are you sure you want to permanently delete this post? This action cannot be undone."
      />

      <div className="max-w-3xl mx-auto">
        {isAdmin && (
          <div className="mb-6">
            <button
              onClick={openAddModal}
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