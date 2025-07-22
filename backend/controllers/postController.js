const Post = require('../models/Post');

// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar');
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

// Create a post
exports.createPost = async (req, res) => {
    try {
        const newPost = new Post({ ...req.body, author: req.user.id });
        const post = await newPost.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
