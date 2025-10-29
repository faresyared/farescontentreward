import React from 'react';
import { useStudio } from '../../context/StudioContext';
import './studio.css';

const bpmMarks = [120, 140, 165, 190, 220];

export const TransportControls: React.FC = () => {
  const {
    state: { bpm, isPlaying, swing },
    actions: { setBpm, setPlaying, setSwing },
  } = useStudio();

  return (
    <div className="transport-panel glass-panel">
      <div className="transport-buttons">
        <button
          type="button"
          className={`transport-btn ${isPlaying ? 'active' : ''}`}
          onClick={() => setPlaying(!isPlaying)}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="transport-btn" onClick={() => setPlaying(false)}>
          Stop
        </button>
        <button type="button" className="transport-btn muted" disabled>
          Record
        </button>
      </div>
      <div className="transport-controls">
        <label className="control-group">
          <span>BPM</span>
          <input
            type="range"
            min={120}
            max={220}
            value={bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
          />
          <div className="bpm-display">{bpm}</div>
          <div className="bpm-marks">
            {bpmMarks.map((mark) => (
              <span key={mark} className="bpm-mark" style={{ left: `${((mark - 120) / 100) * 100}%` }}>
                {mark}
              </span>
            ))}
          </div>
        </label>
        <label className="control-group">
          <span>Swing</span>
          <input
            type="range"
            min={0}
            max={0.25}
            step={0.01}
            value={swing}
            onChange={(event) => setSwing(Number(event.target.value))}
          />
          <div className="bpm-display">{Math.round(swing * 100)}%</div>
        </label>
      </div>
    </div>
  );
};

