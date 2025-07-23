const express = require('express');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// GET all posts
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar')
            .populate('comments.user', 'username avatar')
            .populate('reactions.user', 'username avatar');
        res.json(posts);
    } catch (err) { 
        console.error("Error fetching posts:", err); 
        res.status(500).send('Server Error'); 
    }
});

// GET a single post by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username avatar');
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        console.error("Error fetching single post:", err);
        res.status(500).send('Server Error');
    }
});

// POST (create) a new post (Admin Only)
router.post('/', [auth, adminAuth], async (req, res) => {
    try {
        const newPost = new Post({ ...req.body, author: req.user.id });
        const post = await newPost.save();
        const populatedPost = await Post.findById(post._id).populate('author', 'username avatar');
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).send('Server Error');
    }
});

// PUT (update) a post (Admin Only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).populate('author', 'username avatar');
        res.json(updatedPost);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).send('Server Error');
    }
});

// DELETE a post (Admin Only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Post removed' });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).send('Server Error');
    }
});

// PUT to like/unlike a post
router.put('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        
        if (post.likes.some(like => like.equals(req.user.id))) {
            post.likes = post.likes.filter(like => !like.equals(req.user.id));
        } else {
            post.likes.push(req.user.id);
        }
        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// POST to add a comment
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        
        const newComment = { text: req.body.text, user: req.user.id };
        post.comments.unshift(newComment);
        await post.save();
        
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
        res.status(201).json(populatedPost.comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// PUT to edit a comment
router.put('/:postId/comments/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });
        
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        comment.text = req.body.text;
        await post.save();
        
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
        res.json(populatedPost.comments);
    } catch (err) { 
        console.error(err); 
        res.status(500).send('Server Error'); 
    }
});

// DELETE a comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        const currentUser = await User.findById(req.user.id);
        if (comment.user.toString() !== req.user.id && currentUser.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        comment.remove();
        await post.save();
        
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
        res.json(populatedPost.comments);
    } catch (err) { 
        console.error(err); 
        res.status(500).send('Server Error'); 
    }
});

// PUT to add/change a reaction
router.put('/:id/react', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        
        const { emoji } = req.body;
        const userId = req.user.id;
        
        const existingReactionIndex = post.reactions.findIndex(r => r.user.equals(userId));

        if (existingReactionIndex > -1) {
            if (post.reactions[existingReactionIndex].emoji === emoji) {
                post.reactions.splice(existingReactionIndex, 1);
            } else {
                post.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            post.reactions.push({ user: userId, emoji });
        }
        
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('reactions.user', 'username avatar');
        res.json(populatedPost.reactions);
    } catch (err) { 
        console.error(err); 
        res.status(500).send('Server Error'); 
    }
});

module.exports = router;