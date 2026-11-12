import SurpriseButton from './SurpriseButton';
import useLang from '../lib/useLang';
import { districts, foods, places, regions } from '../lib/catalogue';

export default function Hero() {
  const { t } = useLang();
  const talukas = districts.reduce((n, d) => n + d.talukas.length, 0);
  const stats = [
    ['count.region', regions.length],
    ['count.district', districts.length],
    ['count.taluka', talukas],
    ['count.place', places.length],
    ['count.dish', foods.length],
  ];
  return (
    <section className="hero">
      <p className="hero-kicker" lang="mr">
        चला, महाराष्ट्र पाहूया
      </p>
      <h1>{t('hero.title')}</h1>
      <p className="hero-lead">{t('hero.lead')}</p>
      <div className="hero-actions">
        {/* A button, not a link: the URL hash is used for routing */}
        <button
          type="button"
          className="button button-primary"
          onClick={() => document.getElementById('explore')?.scrollIntoView?.({ behavior: 'smooth' })}
        >
          {t('hero.explore')}
        </button>
        <SurpriseButton />
      </div>
      <ul className="hero-stats">
        {stats.map(([key, n]) => (
          <li key={key}>
            <strong>{t(key, { n })}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
