import React from 'react';
import { useStudio } from '../../context/StudioContext';
import './studio.css';

export const MixerPanel: React.FC = () => {
  const {
    state: { tracks },
    actions: { setTrackVolume },
  } = useStudio();

  return (
    <div className="mixer glass-panel">
      <header>
        <h2>Mixer</h2>
        <p>Fine-tune levels & stereo energy</p>
      </header>
      <div className="mixer-channels">
        {tracks.map((track) => (
          <div key={track.id} className="mixer-channel">
            <div className="channel-header" style={{ color: track.color }}>
              <span className="track-dot" style={{ background: track.color }} />
              {track.name}
            </div>
            <div className="fader">
              <input
                type="range"
                min={0}
                max={1.2}
                step={0.01}
                value={track.volume}
                onChange={(event) => setTrackVolume(track.id, Number(event.target.value))}
              />
              <span className="fader-value">{Math.round(track.volume * 100)}%</span>
            </div>
            <div className="meter">
              <div className="meter-bar" style={{ background: track.color }} />
            </div>
            <div className="channel-actions">
              <button type="button" className="channel-btn">
                Mute
              </button>
              <button type="button" className="channel-btn">
                Solo
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

