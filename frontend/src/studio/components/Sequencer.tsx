import { FaBolt, FaRandom } from 'react-icons/fa';
import { useStudioStore } from '../state/useStudioStore';
import { Step } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const stepClasses = (step: Step, isCurrent: boolean) => {
  const base = 'relative flex h-14 w-full items-end justify-center rounded-md border transition';
  const inactive = 'border-white/5 bg-white/5 text-white/30 hover:border-white/10 hover:bg-white/10';
  const active = 'text-white shadow-[0_0_18px_rgba(0,212,255,0.35)]';
  const current = isCurrent ? 'ring-2 ring-emerald-400/60' : '';
  return `${base} ${step.active ? active : inactive} ${current}`;
};

const Sequencer = () => {
  const {
    tracks,
    currentStep,
    selectedTrackId,
    toggleStep,
    setStepVelocity,
    setStepProbability,
    selectTrack,
    randomizeTrackHumanize,
  } = useStudioStore((state) => ({
    tracks: state.tracks,
    currentStep: state.currentStep,
    selectedTrackId: state.selectedTrackId,
    toggleStep: state.toggleStep,
    setStepVelocity: state.setStepVelocity,
    setStepProbability: state.setStepProbability,
    selectTrack: state.selectTrack,
    randomizeTrackHumanize: state.randomizeTrackHumanize,
  }));

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_35px_rgba(0,212,255,0.12)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">Step Sequencer</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">16 steps · velocity · probability</p>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-white/70">
          <FaBolt className="text-orange-400" />
          Scroll on steps to tweak velocity · Right click to vary probability
        </div>
      </header>
      <div className="flex flex-col gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`rounded-2xl border border-white/5 bg-slate-950/40 p-3 transition ${
              selectedTrackId === track.id ? 'ring-1 ring-emerald-400/40' : 'hover:border-emerald-400/30'
            }`}
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => selectTrack(track.id)}
                className="flex items-center gap-2 text-left text-sm font-semibold text-white/80"
              >
                <span
                  className="inline-flex h-3 w-3 rounded-full"
                  style={{ background: track.color }}
                />
                {track.name}
              </button>
              <button
                onClick={() => randomizeTrackHumanize(track.id)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wide text-white/60 transition hover:border-orange-400/60 hover:text-white"
              >
                <FaRandom /> Humanize
              </button>
            </div>
            <div className="grid grid-cols-16 gap-2">
              {track.steps.map((step, index) => (
                <button
                  key={`${track.id}-${index}`}
                  className={stepClasses(step, currentStep === index)}
                  onClick={() => toggleStep(track.id, index)}
                  onContextMenu={(event) => {
                    event.preventDefault();
                    const newProbability = step.probability > 0.9 ? 0.6 : clamp(step.probability + 0.2, 0, 1);
                    setStepProbability(track.id, index, newProbability);
                  }}
                  onWheel={(event) => {
                    if (event.nativeEvent instanceof WheelEvent) {
                      const delta = event.nativeEvent.deltaY > 0 ? -0.05 : 0.05;
                      const newVelocity = clamp(step.velocity + delta, 0, 1);
                      setStepVelocity(track.id, index, newVelocity);
                    }
                  }}
                  style={
                    step.active
                      ? {
                          borderColor: track.color,
                          background: `linear-gradient(180deg, rgba(0,212,255,0.35), ${track.color}33)`,
                        }
                      : undefined
                  }
                >
                  {step.active && (
                    <div
                      className="pointer-events-none absolute bottom-1 left-1 right-1 rounded-full"
                      style={{
                        height: `${step.velocity * 100}%`,
                        opacity: Math.max(0.4, step.probability),
                        background: `linear-gradient(180deg, rgba(0,212,255,0.6), ${track.color}AA)`,
                      }}
                    />
                  )}
                  <span className="relative z-10 text-[10px] font-semibold text-white/70">{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Sequencer;
