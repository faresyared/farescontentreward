import { FaCloudUploadAlt, FaFolderOpen, FaPlay } from 'react-icons/fa';
import { useStudioStore } from '../state/useStudioStore';

const FileBrowser = () => {
  const { kits, activeKitId, loadKit, previewSample } = useStudioStore((state) => ({
    kits: state.kits,
    activeKitId: state.activeKitId,
    loadKit: state.loadKit,
    previewSample: state.previewSample,
  }));

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-wide text-white">Files & Kits</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Drag & drop samples · preview instantly</p>
        </div>
        <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-wide text-white/70 transition hover:border-emerald-400/60">
          <FaCloudUploadAlt /> Import Kit
        </button>
      </header>
      <div className="space-y-4">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className={`rounded-2xl border p-4 transition ${
              kit.id === activeKitId ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-emerald-400/30'
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{kit.name}</h3>
                <p className="text-xs text-white/60">{kit.description}</p>
              </div>
              <button
                onClick={() => loadKit(kit.id)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wide text-white/70 transition hover:border-emerald-400/60"
              >
                <FaFolderOpen /> Load Kit
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {kit.samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => previewSample(sample.id)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-left text-xs text-white/70 transition hover:border-orange-400/50 hover:text-white"
                >
                  <div>
                    <p className="font-semibold text-white/80">{sample.name}</p>
                    <p className="text-[10px] uppercase tracking-wide text-white/40">{sample.category} · {sample.tags.join(', ')}</p>
                  </div>
                  <FaPlay className="text-emerald-300" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FileBrowser;
