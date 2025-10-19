# Reelify Platform

## Brazilian Phonk Generator

The platform now ships with an end-to-end Brazilian phonk generation workflow that lets authenticated creators queue AI music jobs, monitor progress, and pipe the resulting audio into campaign assets.

### Backend configuration

1. **Model hosting / inference service**
   - Deploy a Brazilian phonk model behind an HTTPS API that accepts POST requests at `<MUSIC_INFERENCE_URL>/generations`.
   - The request payload sent by Reelify includes `prompt`, `tempo`, `mood`, `vocals`, `durationSeconds`, `style`, optional `title`, and optional `campaignId`.
   - If your service supports callbacks, expose a JSON webhook that can call back into `POST /api/music/webhook` with `{ jobId, status, audioUrl, progress, metadata }`.

2. **Environment variables** (configure for Netlify functions or your chosen Node runtime):

   | Variable | Description |
   | --- | --- |
   | `MUSIC_INFERENCE_URL` | Base URL to your inference service (no trailing slash). Required for live generation. |
   | `MUSIC_INFERENCE_API_KEY` | Bearer token passed to the inference service. Optional if the service is public. |
   | `MUSIC_WEBHOOK_URL` | Public URL to `POST /api/music/webhook` so the inference service can push job updates. Optional if you rely on polling. |
   | `MUSIC_WEBHOOK_SECRET` | Shared secret compared against the `x-music-signature` header for webhook validation. Optional but recommended. |
   | `MUSIC_STORAGE_BUCKET` | Storage bucket identifier passed to the inference service (useful when persisting audio in S3/Cloud Storage). Optional. |
   | `MUSIC_FALLBACK_AUDIO_URL` | A static MP3/OGG URL used for local demos when no inference service is configured. Optional. |

3. **Database**
   - The `MusicGeneration` Mongoose model stores job metadata, status, external job identifiers, and audio URLs.
   - When `campaignId` is provided, completed tracks are automatically appended to the campaign’s `assets` array with `type: 'audio'`.

### Frontend usage

1. Sign in as a verified creator and open **Dashboard → Music Studio**.
2. Fill in the prompt, tempo, mood, vocals, duration, and (optionally) a campaign to attach the track to.
3. Submit the form to queue a generation job. Progress auto-refreshes every few seconds.
4. Once complete, stream the audio directly in the dashboard or download the file. Use the **Attach** button to push the track into any joined campaign.
5. Campaign detail views and the campaign dashboard will surface audio assets with inline playback controls.

### Storage & assets

- Audio URLs returned by the inference service should be publicly accessible or signed so the browser can stream them.
- If using an object store (S3, GCS, etc.), ensure generated files are retained beyond the lifetime of the job response and that CORS permits playback from the Reelify frontend origin.
- Consider setting up lifecycle rules or cleanup jobs for stale generations to manage storage costs.

### Local development tips

- Without a live inference endpoint you can set `MUSIC_FALLBACK_AUDIO_URL` to a sample MP3 so developers can exercise the full UX locally.
- Use `netlify dev` (or `npm run dev`) to run both the frontend and Netlify Functions locally; the `/api/music` routes are available under the same origin via the Netlify proxy.

