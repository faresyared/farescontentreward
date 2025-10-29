import { FaInfoCircle, FaListOl } from 'react-icons/fa';

const steps = [
  'Set BPM to 165 and enable swing at 12%.',
  'Program the tamborzão kick and cowbell groove.',
  'Layer the Bruxo 808 with glide and saturation.',
  'Add Phonk Radio vocals with the Radio Filter preset.',
  'Automate the Master Phonkizer for the drop and export your track.',
];

const HelpTutorial = () => {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white/70">
      <header className="mb-3 flex items-center gap-2 text-white">
        <FaInfoCircle className="text-emerald-300" />
        <div>
          <h2 className="text-base font-semibold tracking-wide">Quickstart · 5 Minute Phonk Beat</h2>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Interactive tutorial</p>
        </div>
      </header>
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold text-white/70">
              {index + 1}
            </span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
        <FaListOl /> Explore the manual in the top-right help menu for deep dives.
      </div>
    </section>
  );
};

export default HelpTutorial;
