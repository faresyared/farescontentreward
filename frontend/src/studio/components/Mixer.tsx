import { FaBalanceScale, FaHeadphones, FaVolumeUp } from 'react-icons/fa';
import { useStudioStore } from '../state/useStudioStore';

const Mixer = () => {
  const { tracks, setTrackVolume, setTrackPan, toggleTrackMute, toggleTrackSolo } = useStudioStore((state) => ({
    tracks: state.tracks,
    setTrackVolume: state.setTrackVolume,
    setTrackPan: state.setTrackPan,
    toggleTrackMute: state.toggleTrackMute,
    toggleTrackSolo: state.toggleTrackSolo,
  }));

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_0_35px_rgba(255,107,53,0.1)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">Mixer & FX</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Volume · Pan · Sends</p>
        </div>
        <div className="flex items-center gap-4 text-xs uppercase tracking-wide text-white/50">
          <FaHeadphones className="text-emerald-300" /> Real-time monitoring enabled
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((track) => (
          <div key={track.id} className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span
                  className="inline-flex h-3 w-3 rounded-full"
                  style={{ background: track.color }}
                />
                {track.name}
              </div>
              <div className="flex gap-2 text-[10px] uppercase">
                <button
                  onClick={() => toggleTrackMute(track.id)}
                  className={`rounded-full px-3 py-1 transition ${
                    track.muted ? 'bg-rose-500/30 text-rose-200' : 'bg-white/10 text-white/70'
                  }`}
                >
                  Mute
                </button>
                <button
                  onClick={() => toggleTrackSolo(track.id)}
                  className={`rounded-full px-3 py-1 transition ${
                    track.solo ? 'bg-emerald-500/30 text-emerald-200' : 'bg-white/10 text-white/70'
                  }`}
                >
                  Solo
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
                <span className="flex items-center gap-2">
                  <FaVolumeUp className="text-white/60" /> Volume
                </span>
                <span>{Math.round(track.volume * 100)}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={track.volume}
                onChange={(event) => setTrackVolume(track.id, Number(event.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
                <span className="flex items-center gap-2">
                  <FaBalanceScale className="text-white/60" /> Pan
                </span>
                <span>{track.pan.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={track.pan}
                onChange={(event) => setTrackPan(track.id, Number(event.target.value))}
                className="w-full accent-orange-400"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">FX Chain</h3>
              <ul className="space-y-2 text-xs text-white/70">
                {track.pluginChain.map((pluginId) => (
                  <li key={pluginId} className="rounded-md border border-white/5 bg-white/5 px-3 py-2">
                    {pluginId}
                  </li>
                ))}
                {track.pluginChain.length === 0 && (
                  <li className="rounded-md border border-dashed border-white/10 px-3 py-2 text-white/40">
                    Drag plugins from the rack
                  </li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Mixer;
