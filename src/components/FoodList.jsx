import FoodCard from './FoodCard';
import EmptyState from './EmptyState';
import { areaName, mapsSearchUrl } from '../lib/catalogue';

/** Dishes for an area, with a Google Maps search for the area's best-rated restaurants. */
export default function FoodList({ foods, districtId }) {
  if (foods.length === 0) return <EmptyState what="dishes" />;
  return (
    <>
      {districtId && (
        <p className="food-spots-banner">
          Hungry? See{' '}
          <a
            href={mapsSearchUrl(`best restaurants in ${areaName(districtId)}`)}
            target="_blank"
            rel="noreferrer"
          >
            top-rated restaurants in {areaName(districtId)} on Google Maps ↗
          </a>
        </p>
      )}
      <ul className="card-grid">
        {foods.map((f) => (
          <li key={f.id}>
            <FoodCard food={f} districtId={districtId} fromHere={Boolean(districtId) && f.district === districtId} />
          </li>
        ))}
      </ul>
    </>
  );
}
