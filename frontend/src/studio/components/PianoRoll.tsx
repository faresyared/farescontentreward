import { useMemo } from 'react';
import { FaCopy, FaEraser, FaMusic, FaPlus } from 'react-icons/fa';
import { useStudioStore } from '../state/useStudioStore';

const scaleNotes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'A'];

const PianoRoll = () => {
  const { selectedTrack, stepsPerPattern, toggleStep, setStepVelocity } = useStudioStore((state) => ({
    selectedTrack: state.tracks.find((track) => track.id === state.selectedTrackId),
    stepsPerPattern: state.stepsPerPattern,
    toggleStep: state.toggleStep,
    setStepVelocity: state.setStepVelocity,
  }));

  const velocityAverage = useMemo(() => {
    if (!selectedTrack) return 0;
    const activeSteps = selectedTrack.steps.filter((step) => step.active);
    if (activeSteps.length === 0) return 0;
    const total = activeSteps.reduce((acc, step) => acc + step.velocity, 0);
    return Math.round((total / activeSteps.length) * 100);
  }, [selectedTrack]);

  if (!selectedTrack) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">Piano Roll · {selectedTrack.name}</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Scale lock: Minor · Average velocity {velocityAverage}%
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-white/60">
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:border-emerald-400/60">
            <FaPlus /> Add Pattern
          </button>
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:border-orange-400/60">
            <FaCopy /> Copy Loop
          </button>
          <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:border-rose-400/60">
            <FaEraser /> Clear
          </button>
        </div>
      </header>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-17 bg-white/5 text-[10px] uppercase tracking-wide text-white/40">
          <div className="border-r border-white/10 bg-slate-900/80 px-2 py-1">Note</div>
          {Array.from({ length: stepsPerPattern }).map((_, index) => (
            <div key={index} className="border-l border-white/5 px-2 py-1 text-center">
              {index + 1}
            </div>
          ))}
        </div>
        <div className="max-h-64 overflow-y-auto bg-slate-950/70">
          {scaleNotes.map((note, rowIndex) => (
            <div key={note} className="grid grid-cols-17 border-t border-white/5">
              <div className="flex items-center gap-2 border-r border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white/60">
                <FaMusic className="text-white/30" /> {note}3
              </div>
              {selectedTrack.steps.map((step, stepIndex) => {
                const active = step.active && rowIndex === (stepIndex % scaleNotes.length);
                return (
                  <button
                    key={`${rowIndex}-${stepIndex}`}
                    className={`h-10 border-l border-white/5 transition ${
                      active ? 'bg-emerald-500/40 hover:bg-emerald-400/60' : 'hover:bg-white/5'
                    }`}
                    onClick={() => toggleStep(selectedTrack.id, stepIndex)}
                    onWheel={(event) => {
                      if (event.nativeEvent instanceof WheelEvent) {
                        const delta = event.nativeEvent.deltaY > 0 ? -0.05 : 0.05;
                        const newVelocity = Math.min(1, Math.max(0, step.velocity + delta));
                        setStepVelocity(selectedTrack.id, stepIndex, newVelocity);
                      }
                    }}
                  >
                    {active && (
                      <div
                        className="mx-auto h-2 rounded-full bg-white/80"
                        style={{ width: `${Math.max(6, step.velocity * 48)}px` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PianoRoll;
