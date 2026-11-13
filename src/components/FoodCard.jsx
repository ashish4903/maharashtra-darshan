import Photo from './Photo';
import SeasonNote from './SeasonNote';
import useLang from '../lib/useLang';
import { foodSpotQuery, getDistrict, getRegion, mapsSearchUrl, shortName } from '../lib/catalogue';

/**
 * A dish or local produce. The card opens its Wikipedia article; the footer
 * link searches Google Maps for top-rated spots (Google shows the ratings).
 */
export default function FoodCard({ food, fromHere = false, districtId, near }) {
  const { t, name, otherName, lang } = useLang();
  const district = food.district && getDistrict(food.district);
  const region = getRegion(food.region);
  const area = district ? shortName(name(district)) : region ? name(region) : t('food.statewide');
  const produce = food.type === 'produce';

  let origin = region ? name(region) : t('food.statewide');
  if (produce) {
    if (fromHere) origin = t('food.produceHere');
    else if (district) origin = t('food.produceOf', { area });
    else origin = t('food.produce', { area });
  } else if (fromHere) origin = t('food.fromHere');
  else if (district) origin = t('food.from', { area });

  // Maps searches stay in English: they match far more listings
  const query = foodSpotQuery(food, { districtId, near });

  return (
    <div className={`card food-card region-${food.region}`}>
      <a href={food.wikipedia ?? food.source} target="_blank" rel="noreferrer" className="card-link">
        <div className="card-media">
          <Photo image={food.image} alt={name(food)} icon={produce ? '🧺' : '🍽️'} />
          <span className="card-badge">
            <span aria-hidden="true">{produce ? '🧺' : '🍽️'}</span> {origin}
          </span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{name(food)}</h3>
          {otherName(food) && (
            <p className="card-mr" lang={lang === 'mr' ? 'en' : 'mr'}>
              {otherName(food)}
            </p>
          )}
          <SeasonNote item={food} />
          {food.description && (
            <p className="card-text" lang="en">
              {food.description}
            </p>
          )}
          <p className="card-meta">
            <span>{food.wikipedia ? t('card.readWikipedia') : t('card.readSource', { site: food.sourceName })}</span>
          </p>
        </div>
      </a>
      <a
        className="food-spots"
        href={mapsSearchUrl(query)}
        target="_blank"
        rel="noreferrer"
        title={t('food.spotsTitle', { q: query })}
      >
        <span aria-hidden="true">📍</span> {t(produce ? 'food.buy' : 'food.spots')}
      </a>
    </div>
  );
}
