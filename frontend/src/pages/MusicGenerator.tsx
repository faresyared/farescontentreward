import React, { useEffect, useMemo, useState } from 'react';
import { useMusicGeneration } from '../context/MusicGenerationContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MusicalNoteIcon,
  PaperAirplaneIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

const tempoOptions = ['120 BPM', '130 BPM', '140 BPM', '150 BPM'];
const moodOptions = ['Gritty', 'Euphoric', 'Dark', 'Uplifting'];
const vocalOptions = ['Instrumental', 'Vocal chops', 'Full vocal'];
const durationOptions = [30, 60, 90, 120, 180];

const statusStyles: Record<string, string> = {
  queued: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  processing: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  completed: 'bg-green-500/20 text-green-300 border-green-500/40',
  failed: 'bg-red-500/20 text-red-300 border-red-500/40'
};

const MusicGenerator: React.FC = () => {
  const { generations, loading, requestGeneration, refreshGeneration, attachGenerationToCampaign } = useMusicGeneration();
  const { joinedCampaigns, fetchJoinedCampaigns } = useAuth();

  const [formState, setFormState] = useState({
    title: '',
    prompt: '',
    tempo: tempoOptions[2],
    mood: moodOptions[0],
    vocals: vocalOptions[0],
    durationSeconds: durationOptions[2],
    campaignId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachingId, setAttachingId] = useState<string | null>(null);
  const [campaignSelections, setCampaignSelections] = useState<Record<string, string>>({});

  const pendingGenerations = useMemo(
    () => generations.filter(gen => gen.status === 'queued' || gen.status === 'processing'),
    [generations]
  );

  useEffect(() => {
    if (pendingGenerations.length === 0) return;
    const interval = setInterval(() => {
      pendingGenerations.forEach(gen => {
        refreshGeneration(gen._id).catch(error => {
          console.error('Failed to refresh generation', error);
        });
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [pendingGenerations, refreshGeneration]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'durationSeconds' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.prompt.trim()) {
      toast.error('Please describe the vibe or references for the track.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        title: formState.title.trim() || undefined,
        prompt: formState.prompt.trim(),
        tempo: formState.tempo,
        mood: formState.mood,
        vocals: formState.vocals,
        durationSeconds: formState.durationSeconds,
        campaignId: formState.campaignId || undefined
      };
      const generation = await requestGeneration(payload);
      toast.success('Brazilian phonk track queued successfully!');
      setFormState(prev => ({
        ...prev,
        title: '',
        prompt: '',
        // retain campaignId so subsequent generations attach automatically if desired
        campaignId: prev.campaignId
      }));
      if (generation.campaign) {
        fetchJoinedCampaigns().catch(err => console.error('Failed to refresh campaigns', err));
      }
    } catch (error: any) {
      console.error('Failed to queue music generation', error);
      const message = error?.response?.data?.message || 'Could not start the generator.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualRefresh = async (id: string) => {
    try {
      await refreshGeneration(id);
    } catch (error) {
      console.error('Failed to refresh generation', error);
      toast.error('Unable to refresh this job right now.');
    }
  };

  const handleAttach = async (generationId: string) => {
    const campaignId = campaignSelections[generationId] || formState.campaignId;
    if (!campaignId) {
      toast.error('Select a campaign to attach this track.');
      return;
    }
    setAttachingId(generationId);
    try {
      const updated = await attachGenerationToCampaign(generationId, campaignId);
      toast.success('Track attached to campaign assets!');
      if (updated.campaign) {
        fetchJoinedCampaigns().catch(err => console.error('Failed to refresh campaigns', err));
      }
    } catch (error: any) {
      console.error('Failed to attach generation', error);
      const message = error?.response?.data?.message || 'Could not attach this track.';
      toast.error(message);
    } finally {
      setAttachingId(null);
    }
  };

  const renderProgress = (progress?: number) => {
    if (typeof progress !== 'number') return null;
    return (
      <div className="mt-3">
        <div className="w-full bg-gray-800/70 h-2 rounded-full overflow-hidden">
          <div className="bg-red-500 h-2" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6">
        <div>
          <p className="text-red-400 uppercase text-xs tracking-widest font-semibold flex items-center gap-2">
            <SparklesIcon className="h-4 w-4" /> AI AUDIO LAB
          </p>
          <h1 className="text-3xl font-bold text-white mt-2">Brazilian Phonk Generator</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Craft gritty Brazilian phonk cues tailored for your campaigns. Configure the mood, tempo and vocal presence, then queue a
            generation job. You can monitor progress in real-time and drop the finished track straight into your campaign assets.
          </p>
        </div>
        <MusicalNoteIcon className="hidden md:block h-20 w-20 text-red-500/60" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="xl:col-span-1 bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <PaperAirplaneIcon className="h-5 w-5 text-red-400" /> New generation request
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-300">Working title (optional)</label>
            <input
              type="text"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              placeholder="Midnight Drift"
              className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Creative brief / prompt</label>
            <textarea
              name="prompt"
              value={formState.prompt}
              onChange={handleInputChange}
              rows={5}
              placeholder="Describe the vibe, references or instruments..."
              className="mt-1 w-full bg-gray-800/60 rounded-lg p-3 border border-gray-700 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">Mention references (e.g., &quot;DJ Alok leads with distorted bass and chopped vocals&quot;).</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Tempo</label>
              <select
                name="tempo"
                value={formState.tempo}
                onChange={handleInputChange}
                className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
              >
                {tempoOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Mood</label>
              <select
                name="mood"
                value={formState.mood}
                onChange={handleInputChange}
                className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
              >
                {moodOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Vocals</label>
              <select
                name="vocals"
                value={formState.vocals}
                onChange={handleInputChange}
                className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
              >
                {vocalOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Duration</label>
              <select
                name="durationSeconds"
                value={formState.durationSeconds}
                onChange={handleInputChange}
                className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
              >
                {durationOptions.map(option => (
                  <option key={option} value={option}>
                    {option} seconds
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Attach to campaign (optional)</label>
            <select
              name="campaignId"
              value={formState.campaignId}
              onChange={handleInputChange}
              className="mt-1 w-full bg-gray-800/60 rounded-lg p-2 border border-gray-700 focus:ring-red-500"
            >
              <option value="">No automatic attachment</option>
              {joinedCampaigns.map(campaign => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              If selected, the finished track will be pushed into that campaign&apos;s assets once ready.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
            {isSubmitting ? 'Queuing request...' : 'Generate Brazilian phonk'}
          </button>
        </form>

        <div className="xl:col-span-2 bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Generation queue</h2>
              <p className="text-sm text-gray-400">Monitor recent jobs, refresh progress, and download finished stems.</p>
            </div>
            <button
              onClick={() => {
                pendingGenerations.forEach(gen => handleManualRefresh(gen._id));
              }}
              className="inline-flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
            >
              <ArrowPathIcon className="h-5 w-5" /> Refresh pending
            </button>
          </div>

          {loading && generations.length === 0 ? (
            <p className="text-gray-400 text-sm mt-6">Loading previous generations...</p>
          ) : generations.length === 0 ? (
            <div className="mt-8 text-center text-gray-400">
              <p className="text-lg font-medium">No tracks generated yet.</p>
              <p className="text-sm mt-2">Submit your first Brazilian phonk prompt to see it appear here.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {generations.map(generation => (
                <div key={generation._id} className="bg-black/40 border border-gray-800/60 rounded-2xl p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {generation.title || generation.prompt.slice(0, 60) || 'Untitled Brazilian phonk'}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[generation.status]}`}>
                          {generation.status.charAt(0).toUpperCase() + generation.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested on {new Date(generation.createdAt).toLocaleString()}
                      </p>
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-400 uppercase tracking-widest">
                        <span>Tempo: <span className="text-gray-200 normal-case">{generation.tempo || 'Auto'}</span></span>
                        <span>Mood: <span className="text-gray-200 normal-case">{generation.mood || 'Auto'}</span></span>
                        <span>Vocals: <span className="text-gray-200 normal-case">{generation.vocals || 'Instrumental'}</span></span>
                        <span>Length: <span className="text-gray-200 normal-case">{generation.durationSeconds || 60}s</span></span>
                      </div>
                      {generation.error && (
                        <p className="text-sm text-red-400 mt-3">{generation.error}</p>
                      )}
                      {renderProgress(generation.progress)}
                    </div>

                    <div className="flex-1 w-full lg:max-w-md">
                      {generation.audioUrl ? (
                        <div className="space-y-3">
                          <audio controls className="w-full">
                            <source src={generation.audioUrl} />
                            Your browser does not support audio playback.
                          </audio>
                          <div className="flex flex-wrap items-center gap-3">
                            <a
                              href={generation.audioUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              <ArrowDownTrayIcon className="h-5 w-5" /> Download
                            </a>
                            <div className="flex items-center gap-2">
                              <select
                                value={campaignSelections[generation._id] || generation.campaign || ''}
                                onChange={(event) =>
                                  setCampaignSelections(prev => ({
                                    ...prev,
                                    [generation._id]: event.target.value
                                  }))
                                }
                                className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
                              >
                                <option value="">Select campaign</option>
                                {joinedCampaigns.map(campaign => (
                                  <option key={campaign._id} value={campaign._id}>
                                    {campaign.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAttach(generation._id)}
                                disabled={attachingId === generation._id}
                                className="bg-gray-800/60 hover:bg-gray-700 text-gray-200 px-3 py-2 rounded-lg text-sm disabled:opacity-60"
                              >
                                {attachingId === generation._id ? 'Attaching...' : 'Attach'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-start gap-3 bg-gray-800/40 border border-dashed border-gray-700 rounded-xl p-4">
                          <p className="text-sm text-gray-300">Audio will appear here once the generator finishes.</p>
                          <button
                            onClick={() => handleManualRefresh(generation._id)}
                            className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
                          >
                            <ArrowPathIcon className="h-4 w-4" /> Refresh status
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicGenerator;
