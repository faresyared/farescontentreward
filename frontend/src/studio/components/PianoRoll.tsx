import React from 'react';
import { useStudio } from '../../context/StudioContext';
import './studio.css';

const scaleNotes = [
  { label: 'C', freq: 261.63 },
  { label: 'D', freq: 293.66 },
  { label: 'D#', freq: 311.13 },
  { label: 'F', freq: 349.23 },
  { label: 'G', freq: 392 },
  { label: 'A#', freq: 466.16 },
  { label: 'C5', freq: 523.25 },
];

export const PianoRoll: React.FC = () => {
  const { engine } = useStudio();

  return (
    <div className="piano-roll glass-panel">
      <header>
        <h2>Piano Roll</h2>
        <p>Tap to audition notes • Scale lock: Minor</p>
      </header>
      <div className="piano-keys">
        {scaleNotes.map((note) => (
          <button
            key={note.label}
            type="button"
            className="piano-key"
            onClick={() => engine.triggerNote(note.freq)}
          >
            <span>{note.label}</span>
          </button>
        ))}
      </div>
      <div className="piano-grid">
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div key={rowIndex} className="piano-row">
            {Array.from({ length: 16 }).map((__, columnIndex) => (
              <div key={columnIndex} className="piano-cell" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

