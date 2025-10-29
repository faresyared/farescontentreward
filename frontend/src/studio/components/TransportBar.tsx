import { useMemo } from 'react';
import { FaCircle, FaCloud, FaClock, FaDownload, FaPause, FaPlay, FaRedo, FaStop } from 'react-icons/fa';
import { useStudioStore } from '../state/useStudioStore';

const formatTimeAgo = (timestamp?: number) => {
  if (!timestamp) return 'never';
  const delta = Date.now() - timestamp;
  if (delta < 1000) return 'just now';
  if (delta < 60_000) return `${Math.round(delta / 1000)}s ago`;
  if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`;
  return `${Math.round(delta / 3_600_000)}h ago`;
};

const TransportBar = () => {
  const {
    isPlaying,
    isRecording,
    bpm,
    swing,
    metronome,
    loop,
    countInBars,
    projectName,
    lastSavedAt,
    demoProjects,
    start,
    stop,
    toggleRecord,
    toggleMetronome,
    toggleLoop,
    setBpm,
    setSwing,
    setCountIn,
    loadDemoProject,
    setProjectName,
  } = useStudioStore((state) => ({
    isPlaying: state.isPlaying,
    isRecording: state.isRecording,
    bpm: state.bpm,
    swing: state.swing,
    metronome: state.metronome,
    loop: state.loop,
    countInBars: state.countInBars,
    projectName: state.projectName,
    lastSavedAt: state.lastSavedAt,
    demoProjects: state.demoProjects,
    start: state.start,
    stop: state.stop,
    toggleRecord: state.toggleRecord,
    toggleMetronome: state.toggleMetronome,
    toggleLoop: state.toggleLoop,
    setBpm: state.setBpm,
    setSwing: state.setSwing,
    setCountIn: state.setCountIn,
    loadDemoProject: state.loadDemoProject,
    setProjectName: state.setProjectName,
  }));

  const playIcon = isPlaying ? <FaPause className="text-emerald-300" /> : <FaPlay className="text-emerald-300" />;

  const lastSavedLabel = useMemo(() => formatTimeAgo(lastSavedAt), [lastSavedAt]);

  const handlePlay = async () => {
    if (isPlaying) {
      stop();
    } else {
      await start();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-4 border-b border-white/5 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div className="flex flex-1 items-center gap-3">
        <button
          onClick={handlePlay}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30 transition hover:bg-emerald-400/20"
          aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
        >
          {playIcon}
        </button>
        <button
          onClick={stop}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
          aria-label="Stop playback"
        >
          <FaStop />
        </button>
        <button
          onClick={toggleRecord}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            isRecording ? 'bg-rose-500/30 ring-1 ring-rose-400/80 text-rose-200' : 'bg-white/5 ring-1 ring-white/10'
          }`}
          aria-label="Toggle recording"
        >
          <FaCircle />
        </button>
        <div className="ml-4 flex flex-col">
          <label htmlFor="projectName" className="text-xs uppercase tracking-wide text-white/40">
            Project
          </label>
          <input
            id="projectName"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            className="min-w-[220px] rounded-md border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/90 focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
        <div className="ml-6 hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 lg:flex">
          <FaCloud className="text-emerald-300" />
          Autosaved {lastSavedLabel}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex flex-col">
          <label htmlFor="bpm" className="text-xs uppercase tracking-wide text-white/40">
            BPM
          </label>
          <input
            id="bpm"
            type="number"
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
            className="w-20 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-right focus:border-emerald-400/60 focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="swing" className="text-xs uppercase tracking-wide text-white/40">
            Swing
          </label>
          <input
            id="swing"
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={swing}
            onChange={(event) => setSwing(Number(event.target.value))}
            className="w-32 accent-orange-400"
          />
          <span className="text-right text-[10px] text-white/40">{Math.round(swing * 100)}%</span>
        </div>
        <div className="flex flex-col">
          <label htmlFor="countin" className="text-xs uppercase tracking-wide text-white/40">
            Count-in
          </label>
          <input
            id="countin"
            type="number"
            min={0}
            max={4}
            value={countInBars}
            onChange={(event) => setCountIn(Number(event.target.value))}
            className="w-16 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-right focus:border-emerald-400/60 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMetronome}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              metronome
                ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200'
                : 'border-white/10 bg-white/5 text-white/70'
            }`}
          >
            <FaClock /> Metronome
          </button>
          <button
            onClick={toggleLoop}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              loop ? 'border-orange-400/60 bg-orange-500/20 text-orange-200' : 'border-white/10 bg-white/5 text-white/70'
            }`}
          >
            <FaRedo /> Loop
          </button>
        </div>

        <div className="flex items-center gap-2">
          <FaDownload className="text-white/40" />
          <select
            onChange={(event) => {
              const value = event.target.value;
              if (value) {
                loadDemoProject(value);
              }
            }}
            className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/80 focus:border-emerald-400/60 focus:outline-none"
          >
            <option value="">Load Demo</option>
            {demoProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default TransportBar;
