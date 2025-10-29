import { FaBezierCurve, FaPlusCircle } from 'react-icons/fa';
import { useStudioStore } from '../state/useStudioStore';

const AutomationPanel = () => {
  const { automation } = useStudioStore((state) => ({ automation: state.automation }));

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_35px_rgba(147,51,234,0.12)]">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">Automation & Macros</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Draw envelopes · record live</p>
        </div>
        <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70 transition hover:border-emerald-400/60">
          <FaPlusCircle /> Add Lane
        </button>
      </header>
      <div className="space-y-3">
        {automation.map((lane) => (
          <div key={lane.id} className="rounded-2xl border border-white/5 bg-slate-950/60 p-3">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
              <span className="flex items-center gap-2">
                <FaBezierCurve className="text-purple-300" /> {lane.target}
              </span>
              <span>{lane.points.length} points</span>
            </div>
            <div className="h-24 w-full rounded-xl bg-gradient-to-r from-purple-500/20 via-emerald-500/10 to-orange-500/20">
              <svg viewBox="0 0 100 40" className="h-full w-full opacity-80">
                <polyline
                  fill="none"
                  stroke="url(#automationGradient)"
                  strokeWidth={2}
                  points={lane.points.map((point) => `${point.time * 100},${40 - point.value * 40}`).join(' ')}
                />
                <defs>
                  <linearGradient id="automationGradient" gradientTransform="rotate(45)">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="50%" stopColor="#ff6b35" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AutomationPanel;
