import React, { useMemo } from 'react';
import { useStudio } from '../../context/StudioContext';
import './studio.css';

const kitGroups = [
  {
    title: 'Phonk Essentials Vol. 1',
    description: 'Cowbells, claps, 808s, sirens, rims',
    categories: ['Drums', '808s'],
  },
  {
    title: 'Rio Drums Pack',
    description: 'Tamborzão rhythms & swingy grooves',
    categories: ['Drums'],
  },
  {
    title: 'Bruxo 808s Pack',
    description: 'Deep distorted 808s with glide',
    categories: ['808s'],
  },
  {
    title: 'Funk Carioca FX',
    description: 'Risers, radio cuts, textures',
    categories: ['FX'],
  },
];

export const KitBrowser: React.FC = () => {
  const { engine } = useStudio();
  const samples = useMemo(() => engine.getFactorySamples(), [engine]);

  return (
    <div className="kit-browser glass-panel">
      <header>
        <h2>Files & Kits</h2>
        <p>Drag to tracks or preview instantly</p>
      </header>
      <div className="kit-list">
        {kitGroups.map((kit) => (
          <div key={kit.title} className="kit-card">
            <div className="kit-header">
              <h3>{kit.title}</h3>
              <p>{kit.description}</p>
            </div>
            <div className="kit-samples">
              {samples
                .filter((sample) => kit.categories.includes(sample.category))
                .map((sample) => {
                  const categoryClass = `category-${sample.category
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')}`;
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      className={`kit-sample ${categoryClass}`}
                      onClick={() => engine.previewSample(sample.id)}
                    >
                      <span className="sample-category">{sample.category}</span>
                      {sample.name}
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

