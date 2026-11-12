import RegionCard from './RegionCard';
import FoodList from './FoodList';
import { STATEWIDE, districts, foodsIn, places, regions } from '../lib/catalogue';

export default function HomeView() {
  const talukas = districts.reduce((n, d) => n + d.talukas.length, 0);
  return (
    <>
      <section aria-labelledby="regions-heading">
        <h1 id="regions-heading">Choose a region</h1>
        <p className="lead">
          {regions.length} regions, {districts.length} districts, {talukas} talukas and {places.length} places, each
          linked to its source.
        </p>
        <div className="region-grid">
          {regions.map((r) => (
            <RegionCard key={r.id} region={r} />
          ))}
        </div>
      </section>
      <section aria-labelledby="statewide-heading">
        <h2 id="statewide-heading">Across Maharashtra</h2>
        <FoodList foods={foodsIn({ region: STATEWIDE })} />
      </section>
    </>
  );
}
