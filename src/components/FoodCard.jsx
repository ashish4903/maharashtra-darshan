import { getDistrict, shortName } from '../lib/catalogue';

export default function FoodCard({ food, fromHere = false }) {
  const district = food.district && getDistrict(food.district);
  let origin = 'Dish';
  if (fromHere) origin = 'From this district';
  else if (district) origin = `From ${shortName(district.name)}`;

  return (
    <div className="card food-card">
      <p className="card-kind">
        <span aria-hidden="true">🍽️</span> {origin}
      </p>
      <h3 className="card-title">{food.name}</h3>
      {food.nameMr && (
        <p className="card-mr" lang="mr">
          {food.nameMr}
        </p>
      )}
      {food.description && <p className="card-text">{food.description}</p>}
      <p className="card-links">
        <a href={food.wikipedia} target="_blank" rel="noreferrer">
          Wikipedia
        </a>
      </p>
    </div>
  );
}
