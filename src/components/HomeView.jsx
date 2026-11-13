import Hero from './Hero';
import MaharashtraMap from './MaharashtraMap';
import RegionCard from './RegionCard';
import Carousel from './Carousel';
import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import NearMe from './NearMe';
import CircuitCard from './CircuitCard';
import TrailCard from './TrailCard';
import FestivalCard from './FestivalCard';
import BestThisMonth from './BestThisMonth';
import useLang from '../lib/useLang';
import { STATEWIDE, circuits, trails, featuredPlaces, festivals, foodsIn, regions, upcomingFestivals } from '../lib/catalogue';

export default function HomeView() {
  const { t } = useLang();
  return (
    <>
      <Hero />

      <BestThisMonth />

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

      {trails.length > 0 && (
        <Carousel title={t('home.trails')} subtitle={t('home.trailsSub')}>
          {trails.map((tr) => (
            <li key={tr.id}>
              <TrailCard trail={tr} />
            </li>
          ))}
        </Carousel>
      )}

      <Carousel title={t('home.circuits')} subtitle={t('home.circuitsSub')}>
        {circuits.map((c) => (
          <li key={c.id}>
            <CircuitCard circuit={c} />
          </li>
        ))}
      </Carousel>

      {festivals.length > 0 && (
        <Carousel
          title={t('festival.title')}
          subtitle={
            <>
              {t('festival.homeSub')} · <a href="#/festivals">{t('festival.all')}</a>
            </>
          }
        >
          {upcomingFestivals().map((f) => (
            <li key={f.id}>
              <FestivalCard festival={f} />
            </li>
          ))}
        </Carousel>
      )}

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
