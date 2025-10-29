import React from 'react';
import { useStudio } from '../../context/StudioContext';
import './studio.css';

const steps = Array.from({ length: 16 }, (_, index) => index);

export const StepSequencer: React.FC = () => {
  const {
    state: { tracks, currentStep },
    actions: { toggleStep, setStepVelocity },
  } = useStudio();

  return (
    <div className="sequencer glass-panel">
      <header>
        <h2>Step Sequencer</h2>
        <p>Tap to activate hits • Drag up/down to adjust velocity</p>
      </header>
      <div className="sequencer-grid">
        {tracks.map((track) => (
          <div key={track.id} className="sequencer-row">
            <div className="track-label" style={{ borderColor: track.color }}>
              <span className="track-dot" style={{ background: track.color }} />
              {track.name}
            </div>
            <div className="step-grid">
              {steps.map((stepIndex) => {
                const step = track.steps[stepIndex];
                const isActive = step?.active;
                const velocity = step?.velocity ?? 0;
                const isCurrent = currentStep === stepIndex;
                return (
                  <button
                    key={stepIndex}
                    type="button"
                    className={`step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                    style={{
                      '--step-color': track.color,
                      '--step-level': `${velocity}`,
                    } as React.CSSProperties}
                    onClick={() => toggleStep(track.id, stepIndex)}
                    onWheel={(event) => {
                      event.preventDefault();
                      const delta = event.deltaY > 0 ? -0.05 : 0.05;
                      const next = Math.min(1, Math.max(0.1, velocity + delta));
                      setStepVelocity(track.id, stepIndex, Number(next.toFixed(2)));
                    }}
                  >
                    <span className="velocity-indicator" style={{ height: `${velocity * 100}%` }} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

