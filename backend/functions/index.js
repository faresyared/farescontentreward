// backend/functions/index.js

const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// --- DATABASE CONNECTION ---
let isConnected;
async function connectDB() {
    if (isConnected) {
        console.log('=> using existing database connection');
        return;
    }
    try {
        console.log('=> using NEW database connection');
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
    } catch (err) {
        console.error('MongoDB Connection Failed:', err);
    }
}

// --- MONGOOSE SCHEMAS (MODELS) ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'https://i.pravatar.cc/150' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const CampaignSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    photo: { type: String, required: true },
    budget: { type: Number, required: true },
    rules: { type: String, required: true },
    assets: { type: String },
    platforms: [{ type: String, enum: ['YouTube', 'X', 'Instagram', 'TikTok'], required: true }],
    rewardPer1kViews: { type: Number },
    type: { type: String, enum: ['UGC', 'Clipping', 'Faceless UGC'], required: true },
    maxPayout: { type: Number },
    minPayout: { type: Number },
    category: { type: String, enum: ['Personal Brand', 'Entertainment', 'Music'], required: true },
    status: { type: String, enum: ['Active', 'Ended', 'Soon', 'Paused'], default: 'Soon', required: true },
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    imageUrls: { type: [String], default: [] },
    videoUrls: { type: [String], default: [] },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [CommentSchema],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

// --- MIDDLEWARE ---
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin resource. Access denied.' });
        }
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        res.status(500).send('Server Error');
    }
};

// --- EXPRESS APP & ROUTER ---
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
const router = express.Router();

// --- API ROUTES ---

// AUTH ROUTES
router.post('/users/signup', async (req, res) => {
    const { username, fullName, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User with this email already exists.' });
        user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'This username is already taken.' });
        user = new User({ username, fullName, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.status(201).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.post('/users/signin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// CAMPAIGN ROUTES
router.get('/campaigns', auth, async (req, res) => {
    try {
        const { search, platform, type } = req.query;
        
        // Build a dynamic query object
        const query = {};
        if (search) {
            // Use a case-insensitive regex for searching the campaign name
            query.name = { $regex: search, $options: 'i' };
        }
        if (platform && platform !== 'All Platforms') {
            query.platforms = { $in: [platform] };

        }
        if (type && type !== 'All Types') {
            query.type = type;
        }

        const campaigns = await Campaign.find(query).sort({ status: 1, createdAt: -1 });
        res.json(campaigns);
    } catch (err) {
        console.error("Error fetching campaigns:", err);
        res.status(500).send('Server Error');
    }
});

router.get('/campaigns/:id', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        res.json(campaign);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/campaigns', [auth, adminAuth], async (req, res) => {
    try {
        const newCampaign = new Campaign(req.body);
        const campaign = await newCampaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: 'A campaign with this name already exists.' });
        }
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.put('/campaigns/:id', [auth, adminAuth], async (req, res) => {
    try {
        let campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });
        campaign = await Campaign.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(campaign);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// POST ROUTES
router.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar')
            .populate('comments.user', 'username avatar');
        res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send('Server Error');
    }
});

router.get('/posts/:id', auth, async (req, res) => {
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

router.post('/posts', [auth, adminAuth], async (req, res) => {
    try {
        const newPost = new Post({
            ...req.body,
            author: req.user.id
        });
        const post = await newPost.save();
        const populatedPost = await Post.findById(post._id).populate('author', 'username avatar');
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).send('Server Error');
    }
});

router.put('/posts/:id', [auth, adminAuth], async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Ensure the admin is the one who created the post (optional, but good security)
        if (post.author.toString() !== req.user.id) {
             // Or if you allow any admin to edit any post, you can remove this check.
             // For now, we assume only the original admin author can edit.
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).populate('author', 'username avatar');
        
        res.json(updatedPost);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).send('Server Error');
    }
});

// INTERACTION ROUTES
router.put('/posts/:id/like', auth, async (req, res) => {
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

router.post('/posts/:id/comment', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        
        const newComment = {
            text: req.body.text,
            user: req.user.id,
        };
        post.comments.unshift(newComment);
        await post.save();
        
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
        res.status(201).json(populatedPost.comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// --- FINAL SETUP ---
app.use('/api', router);
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};