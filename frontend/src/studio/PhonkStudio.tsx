import { useEffect } from 'react';
import TransportBar from './components/TransportBar';
import Sequencer from './components/Sequencer';
import Mixer from './components/Mixer';
import PianoRoll from './components/PianoRoll';
import AutomationPanel from './components/AutomationPanel';
import FileBrowser from './components/FileBrowser';
import PluginRack from './components/PluginRack';
import HelpTutorial from './components/HelpTutorial';
import { useStudioStore } from './state/useStudioStore';

const PhonkStudio = () => {
  const { isPlaying, start, stop, currentStep } = useStudioStore((state) => ({
    isPlaying: state.isPlaying,
    start: state.start,
    stop: state.stop,
    currentStep: state.currentStep,
  }));

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (isPlaying) {
          stop();
        } else {
          await start();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, start, stop]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col">
        <TransportBar />
        <main className="flex-1 space-y-4 px-4 py-6 lg:px-8">
          <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950/80 via-[#11111a] to-slate-950/80 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40">
            <span>Brazilian Phonk Studio · Powered by WebAudio + WASM</span>
            <span>Current Step: {currentStep + 1}</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-[2fr_1.1fr]">
            <div className="flex flex-col gap-4">
              <Sequencer />
              <PianoRoll />
              <AutomationPanel />
            </div>
            <div className="flex flex-col gap-4">
              <Mixer />
              <PluginRack />
              <FileBrowser />
              <HelpTutorial />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PhonkStudio;
