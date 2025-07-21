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
    if (isConnected) { return; }
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
    } catch (err) { console.error('MongoDB Connection Failed:', err); }
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
    assets: {
        name: { type: String },
        url: { type: String }
    },
    platforms: [{ type: String, enum: ['YouTube', 'X', 'Instagram', 'TikTok'], required: true }],
    rewardPer1kViews: { type: Number },
    type: { type: String, enum: ['UGC', 'Clipping', 'Faceless UGC'], required: true },
    maxPayout: { type: Number },
    minPayout: { type: Number },
    category: { type: String, enum: ['Personal Brand', 'Entertainment', 'Music'], required: true },
    status: { type: String, enum: ['Active', 'Ended', 'Soon', 'Paused'], default: 'Soon', required: true },
}, { timestamps: true });

const ReactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
});

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
    reactions: [ReactionSchema], // Array of reaction objects
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

// GET the logged-in user's profile
router.get('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// UPDATE the logged-in user's profile
router.put('/users/me', auth, async (req, res) => {
    const { fullName, email, avatar } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.avatar = avatar || user.avatar;
        
        await user.save();
        
        // --- THIS IS CRUCIAL ---
        // We create a NEW token with the updated user info and send it back.
        // This ensures the frontend stays in sync instantly.
        const payload = {
            user: {
                id: user.id,
                role: user.role,
                username: user.username,
                avatar: user.avatar
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// CAMPAIGN ROUTES
router.get('/campaigns', auth, async (req, res) => {
    try {
        const { search, platform, type } = req.query;
        const query = {};
        if (search) {
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

router.delete('/campaigns/:id', [auth, adminAuth], async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
            return res.status(404).json({ msg: 'Campaign not found' });
        }
        await Campaign.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Campaign removed' });
    } catch (err) {
        console.error("Error deleting campaign:", err);
        res.status(500).send('Server Error');
    }
});

// POST ROUTES
router.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'username avatar')
            .populate('comments.user', 'username avatar')
            .populate('reactions.user', 'username avatar'); // Also populate reaction users
        res.json(posts);
    } catch (err) { console.error("Error fetching posts:", err); res.status(500).send('Server Error'); }
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
        const newPost = new Post({ ...req.body, author: req.user.id });
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
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }).populate('author', 'username avatar');
        res.json(updatedPost);
    } catch (err) {
        console.error("Error updating post:", err);
        res.status(500).send('Server Error');
    }
});

router.delete('/posts/:id', [auth, adminAuth], async (req, res) => {
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
        const newComment = { text: req.body.text, user: req.user.id, };
        post.comments.unshift(newComment);
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
        res.status(201).json(populatedPost.comments);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// EDIT A COMMENT
router.put('/posts/:postId/comments/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });
        
        // Ensure the user is the author of the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        comment.text = req.body.text;
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
        res.json(populatedPost.comments);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// DELETE A COMMENT
router.delete('/posts/:postId/comments/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ msg: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });

        const currentUser = await User.findById(req.user.id);
        // Allow deletion if user is the comment author OR an admin
        if (comment.user.toString() !== req.user.id && currentUser.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        
        comment.remove();
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('comments.user', 'username avatar');
        res.json(populatedPost.comments);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// ADD / CHANGE A REACTION
router.put('/posts/:id/react', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        
        const { emoji } = req.body;
        const userId = req.user.id;
        
        const existingReactionIndex = post.reactions.findIndex(r => r.user.equals(userId));

        if (existingReactionIndex > -1) {
            // If user has already reacted
            if (post.reactions[existingReactionIndex].emoji === emoji) {
                // If they click the same emoji, remove the reaction
                post.reactions.splice(existingReactionIndex, 1);
            } else {
                // If they click a different emoji, update it
                post.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            // If user has not reacted, add a new reaction
            post.reactions.push({ user: userId, emoji });
        }
        
        await post.save();
        const populatedPost = await Post.findById(post._id).populate('reactions.user', 'username avatar');
        res.json(populatedPost.reactions);
    } catch (err) { console.error(err); res.status(500).send('Server Error'); }
});

// --- FINAL SETUP ---
app.use('/api', router);
const handler = serverless(app);

module.exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await connectDB();
    return await handler(event, context);
};