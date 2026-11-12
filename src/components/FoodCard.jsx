import Photo from './Photo';
import { getDistrict, getRegion, shortName } from '../lib/catalogue';

export default function FoodCard({ food, fromHere = false }) {
  const district = food.district && getDistrict(food.district);
  const region = getRegion(food.region);
  const produce = food.type === 'produce';
  let origin = region ? region.name : 'Across Maharashtra';
  if (fromHere) origin = 'From this district';
  else if (district) origin = `From ${shortName(district.name)}`;
  if (produce) origin = `Local produce · ${origin.replace(/^From /, '')}`;

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
    </div>
  );
}
