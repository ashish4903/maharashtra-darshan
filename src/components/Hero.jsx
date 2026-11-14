import Photo from './Photo';
import SurpriseButton from './SurpriseButton';
import useLang from '../lib/useLang';
import { commonsUrl, districts, foods, getPlace, places, regions } from '../lib/catalogue';

// The hero's backdrop: Sinhagad's own Commons photo, credited below
const HERO_PLACE = 'Q3078248';

export default function Hero() {
  const { t, name } = useLang();
  const talukas = districts.reduce((n, d) => n + d.talukas.length, 0);
  const stats = [
    ['count.region', regions.length],
    ['count.district', districts.length],
    ['count.taluka', talukas],
    ['count.place', places.length],
    ['count.dish', foods.length],
  ];
  const backdrop = getPlace(HERO_PLACE);
  return (
    <section className="hero">
      {backdrop?.image && <Photo image={backdrop.image} alt="" className="hero-photo" eager width={1280} />}
      <div className="hero-content">
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
          <a href="#/plan" className="button button-ghost">
            {t('plan.cta')}
          </a>
          <SurpriseButton />
        </div>
        <ul className="hero-stats">
          {stats.map(([key, n]) => {
            // "36 districts" → a big number over a small label
            const [num, ...label] = t(key, { n }).split(' ');
            return (
              <li key={key}>
                <strong>{num}</strong> <span>{label.join(' ')}</span>
              </li>
            );
          })}
        </ul>
      </div>
      {backdrop?.image && (
        <p className="hero-credit">
          {t('place.photo')}{' '}
          <a href={commonsUrl(backdrop.image.file)} target="_blank" rel="noreferrer">
            {name(backdrop)}
          </a>
        </p>
      )}
    </section>
  );
}
