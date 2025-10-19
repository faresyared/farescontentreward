const express = require('express');
const axios = require('axios');
const MusicGeneration = require('../models/musicGenerationModel');
const Campaign = require('../models/campaignModel');
const { auth } = require('../middleware/auth');

const router = express.Router();

const normaliseBaseUrl = (url) => {
    if (!url) return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const mapRemoteStatus = (status) => {
    if (!status) return undefined;
    const normalised = String(status).toLowerCase();
    if (['queued', 'pending', 'scheduled'].includes(normalised)) return 'queued';
    if (['running', 'processing', 'in_progress'].includes(normalised)) return 'processing';
    if (['completed', 'succeeded', 'finished', 'ready'].includes(normalised)) return 'completed';
    if (['failed', 'errored', 'error', 'cancelled', 'canceled'].includes(normalised)) return 'failed';
    return undefined;
};

const clampProgress = (progress) => {
    if (typeof progress !== 'number' || Number.isNaN(progress)) return undefined;
    return Math.min(100, Math.max(0, Math.round(progress)));
};

const buildAuthHeaders = () => {
    const headers = {};
    if (process.env.MUSIC_INFERENCE_API_KEY) {
        headers['Authorization'] = `Bearer ${process.env.MUSIC_INFERENCE_API_KEY}`;
    }
    return headers;
};

const ensureCampaignAsset = async (generation, campaignDoc) => {
    if (!generation || !generation.audioUrl || !generation.campaign) {
        return null;
    }
    const campaign = campaignDoc || await Campaign.findById(generation.campaign);
    if (!campaign) {
        return null;
    }
    const assets = Array.isArray(campaign.assets) ? [...campaign.assets] : [];
    const assetName = generation.title
        || `Brazilian Phonk - ${generation.mood || generation.tempo || new Date(generation.createdAt).toLocaleDateString()}`;

    const hasExisting = assets.some(asset => asset && asset.url === generation.audioUrl);
    if (!hasExisting) {
        assets.push({
            name: assetName,
            url: generation.audioUrl,
            type: 'audio'
        });
        campaign.assets = assets;
        await campaign.save();
    }
    return campaign;
};

router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.MUSIC_WEBHOOK_SECRET;
        if (secret && req.header('x-music-signature') !== secret) {
            return res.status(401).json({ message: 'Invalid webhook signature' });
        }

        const { jobId, status, audioUrl, progress, metadata, waveformUrl, previewUrl, storageKey } = req.body || {};
        if (!jobId) {
            return res.status(400).json({ message: 'jobId is required' });
        }

        const generation = await MusicGeneration.findOne({ externalJobId: jobId });
        if (!generation) {
            return res.status(404).json({ message: 'Generation not found' });
        }

        const mappedStatus = mapRemoteStatus(status);
        if (mappedStatus) {
            generation.status = mappedStatus;
        }
        const boundedProgress = clampProgress(progress);
        if (typeof boundedProgress === 'number') {
            generation.progress = boundedProgress;
        }
        if (audioUrl) {
            generation.audioUrl = audioUrl;
            generation.previewUrl = previewUrl || audioUrl;
            generation.waveformUrl = waveformUrl || generation.waveformUrl;
            generation.storageKey = storageKey || generation.storageKey;
            if (generation.status !== 'failed') {
                generation.status = 'completed';
                generation.progress = 100;
            }
        }
        if (metadata) {
            generation.metadata = { ...(generation.metadata || {}), ...metadata };
        }

        await generation.save();
        if (generation.audioUrl) {
            await ensureCampaignAsset(generation);
        }

        return res.json({ received: true });
    } catch (error) {
        console.error('Failed to process music webhook', error);
        return res.status(500).json({ message: 'Failed to process webhook' });
    }
});

router.use(auth);

router.get('/', async (req, res) => {
    try {
        const generations = await MusicGeneration.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(generations);
    } catch (error) {
        console.error('Failed to list music generations', error);
        res.status(500).json({ message: 'Unable to list Brazilian phonk jobs' });
    }
});

router.post('/generate', async (req, res) => {
    const { prompt, tempo, mood, vocals, durationSeconds, campaignId, title, style } = req.body || {};
    const trimmedPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    if (!trimmedPrompt) {
        return res.status(400).json({ message: 'A prompt or creative brief is required.' });
    }

    const numericDuration = Number(durationSeconds);
    const boundedDuration = Number.isFinite(numericDuration)
        ? Math.min(600, Math.max(30, Math.round(numericDuration)))
        : 60;

    const generation = new MusicGeneration({
        user: req.user.id,
        prompt: trimmedPrompt,
        tempo,
        mood,
        vocals,
        durationSeconds: boundedDuration,
        title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
        style: typeof style === 'string' && style.trim() ? style.trim() : 'Brazilian Phonk',
        status: 'queued',
        progress: 0
    });

    let campaign = null;
    if (campaignId) {
        campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        const isAdmin = req.user.role === 'admin';
        const isParticipant = (campaign.participants || []).some(participant => String(participant) === req.user.id);
        if (!isAdmin && !isParticipant) {
            return res.status(403).json({ message: 'You must join the campaign before attaching audio.' });
        }
        generation.campaign = campaignId;
    }

    await generation.save();

    const inferenceBase = normaliseBaseUrl(process.env.MUSIC_INFERENCE_URL);
    if (!inferenceBase) {
        if (process.env.MUSIC_FALLBACK_AUDIO_URL) {
            generation.audioUrl = process.env.MUSIC_FALLBACK_AUDIO_URL;
            generation.status = 'completed';
            generation.progress = 100;
            await generation.save();
            if (generation.campaign) {
                await ensureCampaignAsset(generation, campaign);
            }
            return res.status(202).json(generation);
        }
        generation.status = 'failed';
        generation.error = 'MUSIC_INFERENCE_URL is not configured';
        await generation.save();
        return res.status(500).json({ message: 'Brazilian phonk inference service is not configured.' });
    }

    try {
        const callbackUrl = process.env.MUSIC_WEBHOOK_URL;
        const payload = {
            prompt: trimmedPrompt,
            tempo,
            mood,
            vocals,
            durationSeconds: boundedDuration,
            style: generation.style,
            referenceId: String(generation._id)
        };
        if (generation.title) {
            payload.title = generation.title;
        }
        if (generation.campaign) {
            payload.campaignId = String(generation.campaign);
        }
        if (process.env.MUSIC_STORAGE_BUCKET) {
            payload.storageBucket = process.env.MUSIC_STORAGE_BUCKET;
        }
        if (callbackUrl) {
            payload.callbackUrl = callbackUrl;
        }

        const response = await axios.post(`${inferenceBase}/generations`, payload, {
            headers: buildAuthHeaders()
        });

        const data = response.data || {};
        generation.externalJobId = data.id || data.jobId || data.requestId || generation.externalJobId;

        const inferredStatus = mapRemoteStatus(data.status);
        if (inferredStatus) {
            generation.status = inferredStatus;
        }

        const boundedProgress = clampProgress(data.progress);
        if (typeof boundedProgress === 'number') {
            generation.progress = boundedProgress;
        }

        if (data.audioUrl) {
            generation.audioUrl = data.audioUrl;
            generation.previewUrl = data.previewUrl || data.audioUrl;
            generation.waveformUrl = data.waveformUrl || generation.waveformUrl;
            generation.storageKey = data.storageKey || generation.storageKey;
            if (generation.status !== 'failed') {
                generation.status = 'completed';
                generation.progress = 100;
            }
        }

        if (data.metadata) {
            generation.metadata = data.metadata;
        }

        await generation.save();
        if (generation.audioUrl) {
            await ensureCampaignAsset(generation, campaign);
        }

        return res.status(202).json(generation);
    } catch (error) {
        console.error('Failed to start Brazilian phonk generation', error.response?.data || error.message);
        generation.status = 'failed';
        generation.error = error.response?.data?.message || error.message || 'Unknown error';
        await generation.save();
        return res.status(500).json({ message: 'Failed to start Brazilian phonk generation', error: generation.error });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const generation = await MusicGeneration.findOne({ _id: req.params.id, user: req.user.id });
        if (!generation) {
            return res.status(404).json({ message: 'Generation not found' });
        }

        if (generation.status !== 'completed' && generation.status !== 'failed' && generation.externalJobId) {
            const inferenceBase = normaliseBaseUrl(process.env.MUSIC_INFERENCE_URL);
            if (inferenceBase) {
                try {
                    const response = await axios.get(`${inferenceBase}/generations/${generation.externalJobId}`, {
                        headers: buildAuthHeaders()
                    });
                    const data = response.data || {};
                    const inferredStatus = mapRemoteStatus(data.status);
                    if (inferredStatus) {
                        generation.status = inferredStatus;
                    }
                    const boundedProgress = clampProgress(data.progress);
                    if (typeof boundedProgress === 'number') {
                        generation.progress = boundedProgress;
                    }
                    if (data.audioUrl) {
                        generation.audioUrl = data.audioUrl;
                        generation.previewUrl = data.previewUrl || data.audioUrl;
                        generation.waveformUrl = data.waveformUrl || generation.waveformUrl;
                        generation.storageKey = data.storageKey || generation.storageKey;
                        if (generation.status !== 'failed') {
                            generation.status = 'completed';
                            generation.progress = 100;
                        }
                    }
                    if (data.metadata) {
                        generation.metadata = { ...(generation.metadata || {}), ...data.metadata };
                    }
                    await generation.save();
                    if (generation.audioUrl) {
                        await ensureCampaignAsset(generation);
                    }
                } catch (pollError) {
                    console.error('Failed to poll inference status', pollError.response?.data || pollError.message);
                }
            }
        }

        return res.json(generation);
    } catch (error) {
        console.error('Failed to fetch music generation', error);
        return res.status(500).json({ message: 'Failed to fetch generation' });
    }
});

router.post('/:id/attach', async (req, res) => {
    try {
        const { campaignId } = req.body || {};
        if (!campaignId) {
            return res.status(400).json({ message: 'campaignId is required' });
        }
        const generation = await MusicGeneration.findOne({ _id: req.params.id, user: req.user.id });
        if (!generation) {
            return res.status(404).json({ message: 'Generation not found' });
        }
        if (!generation.audioUrl) {
            return res.status(400).json({ message: 'Audio is not ready yet for this generation.' });
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        const isAdmin = req.user.role === 'admin';
        const isParticipant = (campaign.participants || []).some(participant => String(participant) === req.user.id);
        if (!isAdmin && !isParticipant) {
            return res.status(403).json({ message: 'You must join the campaign before attaching audio.' });
        }

        generation.campaign = campaignId;
        await generation.save();
        const updatedCampaign = await ensureCampaignAsset(generation, campaign);
        const refreshedGeneration = await MusicGeneration.findById(generation._id);
        return res.json({ generation: refreshedGeneration, campaign: updatedCampaign });
    } catch (error) {
        console.error('Failed to attach music generation to campaign', error);
        return res.status(500).json({ message: 'Failed to attach generation to campaign' });
    }
});

module.exports = router;
