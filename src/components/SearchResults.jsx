import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import useLang from '../lib/useLang';
import { getDistrict, search, shortName } from '../lib/catalogue';

export default function SearchResults({ query }) {
  const { t, name } = useLang();
  const r = search(query);
  const areas = r.regions.length + r.districts.length + r.talukas.length;
  if (areas + r.places.length + r.foods.length === 0) {
    return <p className="empty">{t('search.none', { q: query.trim() })}</p>;
  }

  return (
    <section aria-label={t('search.results')} className="results">
      {areas > 0 && (
        <>
          <h2>{t('search.areas')}</h2>
          <ul className="result-links">
            {r.regions.map((x) => (
              <li key={x.id}>
                <a href={`#/region/${x.id}`}>{name(x)}</a> <span className="muted">{t('search.region')}</span>
              </li>
            ))}
            {r.districts.map((x) => (
              <li key={x.id}>
                <a href={`#/district/${x.id}`}>{name(x)}</a>
                {x.knownFor?.length > 0 && (
                  <span className="muted">{t('search.knownFor', { list: x.knownFor.map((k) => k.label).join(', ') })}</span>
                )}
              </li>
            ))}
            {r.talukas.map((x) => (
              <li key={x.id}>
                <a href={`#/district/${x.district}`}>{name(x)}</a>{' '}
                <span className="muted">{t('search.in', { area: shortName(name(getDistrict(x.district))) })}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {r.places.length > 0 && (
        <>
          <h2>{t('search.places')}</h2>
          <ul className="card-grid">
            {r.places.map((p) => (
              <li key={p.id}>
                <PlaceCard place={p} showDistrict />
              </li>
            ))}
          </ul>
        </>
      )}
      {r.foods.length > 0 && (
        <>
          <h2>{t('search.food')}</h2>
          <ul className="card-grid">
            {r.foods.map((f) => (
              <li key={f.id}>
                <FoodCard food={f} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
