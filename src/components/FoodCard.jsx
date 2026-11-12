import Photo from './Photo';
import { foodSpotQuery, getDistrict, getRegion, mapsSearchUrl, shortName } from '../lib/catalogue';

/**
 * A dish or local produce. The card opens its Wikipedia article; the footer
 * link searches Google Maps for top-rated spots (Google shows the ratings).
 */
export default function FoodCard({ food, fromHere = false, districtId, near }) {
  const district = food.district && getDistrict(food.district);
  const region = getRegion(food.region);
  const produce = food.type === 'produce';
  let origin = region ? region.name : 'Across Maharashtra';
  if (fromHere) origin = 'From this district';
  else if (district) origin = `From ${shortName(district.name)}`;
  if (produce) {
    if (fromHere) origin = 'Local produce from here';
    else if (district) origin = `Local produce of ${shortName(district.name)}`;
    else origin = `Local produce · ${origin}`;
  }

  const query = foodSpotQuery(food, { districtId, near });

  return (
    <div className={`card food-card region-${food.region}`}>
      <a href={food.wikipedia} target="_blank" rel="noreferrer" className="card-link">
        <div className="card-media">
          <Photo image={food.image} alt={food.name} icon={produce ? '🧺' : '🍽️'} />
          <span className="card-badge">
            <span aria-hidden="true">{produce ? '🧺' : '🍽️'}</span> {origin}
          </span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{food.name}</h3>
          {food.nameMr && (
            <p className="card-mr" lang="mr">
              {food.nameMr}
            </p>
          )}
          {food.description && <p className="card-text">{food.description}</p>}
          <p className="card-meta">
            <span>Read on Wikipedia ↗</span>
          </p>
        </div>
      </a>
      <a
        className="food-spots"
        href={mapsSearchUrl(query)}
        target="_blank"
        rel="noreferrer"
        title={`Search Google Maps for “${query}”`}
      >
        <span aria-hidden="true">📍</span> {produce ? 'Where to buy' : 'Top-rated spots'} on Google Maps ↗
      </a>
    </div>
  );
}
