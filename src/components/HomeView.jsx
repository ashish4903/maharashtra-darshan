import Hero from './Hero';
import MaharashtraMap from './MaharashtraMap';
import RegionCard from './RegionCard';
import Carousel from './Carousel';
import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import NearMe from './NearMe';
import CircuitCard from './CircuitCard';
import { STATEWIDE, circuits, featuredPlaces, foodsIn, regions } from '../lib/catalogue';

export default function HomeView() {
  return (
    <>
      <Hero />

      <section id="explore" className="explore" aria-labelledby="explore-heading">
        <h2 id="explore-heading">Choose a region</h2>
        <div className="explore-layout">
          <MaharashtraMap />
          <div className="region-grid">
            {regions.map((r) => (
              <RegionCard key={r.id} region={r} />
            ))}
          </div>
        </div>
      </section>

      <Carousel title="Circuits and pilgrimages" subtitle="Ready-made routes: plan them in days, or add them to your trip">
        {circuits.map((c) => (
          <li key={c.id}>
            <CircuitCard circuit={c} />
          </li>
        ))}
      </Carousel>

      <Carousel title="Must-see places" subtitle="A few highlights from every region">
        {featuredPlaces(3).map((p) => (
          <li key={p.id}>
            <PlaceCard place={p} showDistrict />
          </li>
        ))}
      </Carousel>

      <Carousel title="Taste of Maharashtra" subtitle="Dishes you’ll find across the state">
        {foodsIn({ region: STATEWIDE }).map((f) => (
          <li key={f.id}>
            <FoodCard food={f} />
          </li>
        ))}
      </Carousel>

      <NearMe />
    </>
  );
}
