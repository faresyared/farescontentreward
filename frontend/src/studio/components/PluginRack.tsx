import { FaFilter, FaKeyboard, FaSave } from 'react-icons/fa';
import { useStudioStore } from '../state/useStudioStore';

const PluginRack = () => {
  const { plugins } = useStudioStore((state) => ({ plugins: state.plugins }));

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">Plugin Rack & SDK</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Drag to channel · MIDI learn ready</p>
        </div>
        <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70 transition hover:border-emerald-400/60">
          <FaSave /> Save Preset
        </button>
      </header>
      <div className="space-y-3">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{plugin.name}</h3>
                <p className="text-xs text-white/60">{plugin.description}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wide text-white/60">
                {plugin.type}
              </span>
            </div>
            <div className="mb-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-white/50">
              {plugin.parameters.map((parameter) => (
                <span key={parameter.name} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                  {parameter.name}: {parameter.defaultValue}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <FaFilter className="text-orange-300" /> Presets:
              <div className="flex flex-wrap gap-2">
                {plugin.presets.map((preset) => (
                  <span key={preset} className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide">
                    {preset}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/40 p-4 text-center text-sm text-white/60">
          <FaKeyboard className="mx-auto mb-2 text-2xl text-emerald-300" />
          Drop WebAudio Module (.wam) files here to sideload community plugins.
        </div>
      </div>
    </section>
  );
};

export default PluginRack;
