import React, { useEffect } from 'react';
import { StudioProvider } from '../context/StudioContext';
import { TransportControls } from '../studio/components/TransportControls';
import { StepSequencer } from '../studio/components/StepSequencer';
import { MixerPanel } from '../studio/components/MixerPanel';
import { KitBrowser } from '../studio/components/KitBrowser';
import { PianoRoll } from '../studio/components/PianoRoll';
import { AutomationPanel } from '../studio/components/AutomationPanel';
import '../studio/components/studio.css';

const PhonkStudioInner: React.FC = () => {
  useEffect(() => {
    document.body.style.backgroundColor = '#050507';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  return (
    <div className="phonk-studio">
      <TransportControls />
      <StepSequencer />
      <MixerPanel />
      <KitBrowser />
      <PianoRoll />
      <AutomationPanel />
    </div>
  );
};

const PhonkStudioPage: React.FC = () => (
  <StudioProvider>
    <PhonkStudioInner />
  </StudioProvider>
);

export default PhonkStudioPage;

