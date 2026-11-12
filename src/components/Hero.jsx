import SurpriseButton from './SurpriseButton';
import { districts, foods, places, regions } from '../lib/catalogue';

export default function Hero() {
  const talukas = districts.reduce((n, d) => n + d.talukas.length, 0);
  const stats = [
    [regions.length, 'regions'],
    [districts.length, 'districts'],
    [talukas, 'talukas'],
    [places.length, 'places'],
    [foods.length, 'dishes'],
  ];
  return (
    <section className="hero">
      <p className="hero-kicker" lang="mr">
        चला, महाराष्ट्र पाहूया
      </p>
      <h1>Discover Maharashtra, one region at a time</h1>
      <p className="hero-lead">
        Forts on the Sahyadri, caves carved 2,000 years ago, tiger forests and Konkan beaches, and the food to try
        on the way. Every place links to its source.
      </p>
      <div className="hero-actions">
        {/* A button, not a link: the URL hash is used for routing */}
        <button
          type="button"
          className="button button-primary"
          onClick={() => document.getElementById('explore')?.scrollIntoView?.({ behavior: 'smooth' })}
        >
          Explore the map
        </button>
        <SurpriseButton />
      </div>
      <ul className="hero-stats">
        {stats.map(([n, label]) => (
          <li key={label}>
            <strong>{n}</strong> {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
