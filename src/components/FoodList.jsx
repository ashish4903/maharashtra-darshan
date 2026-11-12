import FoodCard from './FoodCard';
import EmptyState from './EmptyState';

export default function FoodList({ foods, districtId }) {
  if (foods.length === 0) return <EmptyState what="dishes" />;
  return (
    <ul className="card-grid">
      {foods.map((f) => (
        <li key={f.id}>
          <FoodCard food={f} fromHere={Boolean(districtId) && f.district === districtId} />
        </li>
      ))}
    </ul>
  );
}
