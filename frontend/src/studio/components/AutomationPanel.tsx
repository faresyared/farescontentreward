import React from 'react';
import './studio.css';

export const AutomationPanel: React.FC = () => (
  <div className="automation glass-panel">
    <header>
      <h2>Automation</h2>
      <p>Draw envelopes for volume, filters & FX</p>
    </header>
    <div className="automation-grid">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="automation-lane">
          <div className="automation-label">Lane {index + 1}</div>
          <div className="automation-curve">
            <svg viewBox="0 0 120 32">
              <polyline
                points="0,28 20,10 40,22 60,6 80,18 100,4 120,14"
                fill="none"
                stroke="url(#grad)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      ))}
    </div>
  </div>
);

