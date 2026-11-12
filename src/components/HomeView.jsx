import Hero from './Hero';
import MaharashtraMap from './MaharashtraMap';
import RegionCard from './RegionCard';
import Carousel from './Carousel';
import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import NearMe from './NearMe';
import CircuitCard from './CircuitCard';
import useLang from '../lib/useLang';
import { STATEWIDE, circuits, featuredPlaces, foodsIn, regions } from '../lib/catalogue';

export default function HomeView() {
  const { t } = useLang();
  return (
    <>
      <Hero />

      <section id="explore" className="explore" aria-labelledby="explore-heading">
        <h2 id="explore-heading">{t('home.chooseRegion')}</h2>
        <div className="explore-layout">
          <MaharashtraMap />
          <div className="region-grid">
            {regions.map((r) => (
              <RegionCard key={r.id} region={r} />
            ))}
          </div>
        </div>
      </section>

      <Carousel title={t('home.circuits')} subtitle={t('home.circuitsSub')}>
        {circuits.map((c) => (
          <li key={c.id}>
            <CircuitCard circuit={c} />
          </li>
        ))}
      </Carousel>

      <Carousel title={t('home.mustSee')} subtitle={t('home.mustSeeSub')}>
        {featuredPlaces(3).map((p) => (
          <li key={p.id}>
            <PlaceCard place={p} showDistrict />
          </li>
        ))}
      </Carousel>

      <Carousel title={t('home.taste')} subtitle={t('home.tasteSub')}>
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
