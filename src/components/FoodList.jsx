import FoodCard from './FoodCard';
import EmptyState from './EmptyState';
import useLang from '../lib/useLang';
import { areaName, getDistrict, mapsSearchUrl, shortName } from '../lib/catalogue';

/** Dishes for an area, with a Google Maps search for the area's best-rated restaurants. */
export default function FoodList({ foods, districtId }) {
  const { t, name } = useLang();
  if (foods.length === 0) return <EmptyState what="dishes" />;
  return (
    <>
      {districtId && (
        <p className="food-spots-banner">
          {t('food.hungry')}{' '}
          <a
            href={mapsSearchUrl(`best restaurants in ${areaName(districtId)}`)}
            target="_blank"
            rel="noreferrer"
          >
            {t('food.restaurantsIn', { area: shortName(name(getDistrict(districtId))) })}
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
