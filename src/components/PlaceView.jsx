import Breadcrumbs from './Breadcrumbs';
import Banner from './Banner';
import SaveButton from './SaveButton';
import ShareButton from './ShareButton';
import WikiSummary from './WikiSummary';
import MaharashtraMap from './MaharashtraMap';
import Carousel from './Carousel';
import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import Weather from './Weather';
import useLang from '../lib/useLang';
import {
  KINDS,
  areaName,
  circuitsWith,
  commonsUrl,
  festivalsAt,
  foodsIn,
  getDistrict,
  getPlace,
  getRegion,
  mapUrl,
  mapsSearchUrl,
  places,
  shortName,
} from '../lib/catalogue';
import { nearest } from '../lib/geo';

export default function PlaceView({ placeId }) {
  const { t, kind, name, otherName } = useLang();
  const place = getPlace(placeId);
  const district = getDistrict(place.district);
  const region = getRegion(place.region);
  const icon = KINDS[place.kind].icon;
  const nearby = place.coords ? nearest(place.coords, places, 8, place.id) : [];
  const food = foodsIn({ district: place.district });
  const taluka = place.taluka && district.talukas.find((x) => x.id === place.taluka);
  const partOf = circuitsWith(place.id);

  return (
    <article className={`level place-page region-${place.region}`}>
      <Breadcrumbs districtId={place.district} placeName={name(place)} />
      <Banner
        image={place.image}
        icon={icon}
        kicker={`${icon} ${kind(place.kind)}`}
        title={name(place)}
        titleMr={otherName(place)}
      >
        {place.highlight && <p className="banner-highlight">★ {place.highlight}</p>}
        {place.description && (
          <p className="banner-stats" lang="en">
            {place.description}
          </p>
        )}
      </Banner>

      <div className="level-layout">
        <div className="level-main">
          <div className="place-actions">
            <SaveButton place={place} withLabel />
            <ShareButton title={name(place)} />
            {place.coords && (
              <a className="button button-ghost" href={mapUrl(place.coords)} target="_blank" rel="noreferrer">
                {t('place.map')}
              </a>
            )}
            <a className="button button-ghost" href={place.wikipedia} target="_blank" rel="noreferrer">
              {t('place.wikipedia')}
            </a>
            <a
              className="button button-ghost"
              href={mapsSearchUrl(`restaurants near ${place.name}, ${areaName(place.district)}`)}
              target="_blank"
              rel="noreferrer"
              title={t('place.restaurantsTitle')}
            >
              {t('place.restaurants')}
            </a>
          </div>

          <dl className="facts">
            <div>
              <dt>{t('place.region')}</dt>
              <dd>
                <a href={`#/region/${region.id}`}>{name(region)}</a>
              </dd>
            </div>
            <div>
              <dt>{t('place.district')}</dt>
              <dd>
                <a href={`#/district/${district.id}`}>{shortName(name(district))}</a>
              </dd>
            </div>
            {taluka && (
              <div>
                <dt>{t('place.taluka')}</dt>
                <dd>{shortName(name(taluka))}</dd>
              </div>
            )}
            {place.coords && (
              <div>
                <dt>{t('place.coords')}</dt>
                <dd>
                  {place.coords[0].toFixed(3)}°N, {place.coords[1].toFixed(3)}°E
                </dd>
              </div>
            )}
          </dl>

          <Weather coords={place.coords} />

          {partOf.length > 0 && (
            <p className="part-of">
              {t('place.partOf')}{' '}
              {partOf.map((c, i) => (
                <span key={c.id}>
                  {i > 0 && ', '}
                  <a href={`#/circuit/${c.id}`}>🧭 {name(c)}</a>
                </span>
              ))}
            </p>
          )}

          {festivalsAt(place.id).length > 0 && (
            <p className="part-of">
              {t('festival.here')}{' '}
              {festivalsAt(place.id).map((f, i) => (
                <span key={f.id}>
                  {i > 0 && ', '}
                  <a href={f.wikipedia} target="_blank" rel="noreferrer">
                    🪔 {name(f)}
                  </a>{' '}
                  <span className="muted" lang="en">
                    ({f.when})
                  </span>
                </span>
              ))}
            </p>
          )}

          <WikiSummary url={place.wikipedia} />

          {place.image && (
            <p className="source-note">
              {t('place.photo')}{' '}
              <a href={commonsUrl(place.image.file)} target="_blank" rel="noreferrer">
                Wikimedia Commons
              </a>{' '}
              {t('place.photoNote')}
            </p>
          )}
        </div>

        <aside className="level-aside">
          <MaharashtraMap region={place.region} place={place.id} label={t('map.showing', { name: name(place) })} />
        </aside>
      </div>

      {nearby.length > 0 && (
        <Carousel title={t('place.nearby')} subtitle={t('place.nearbySub')}>
          {nearby.map(({ place: p, km }) => (
            <li key={p.id}>
              <PlaceCard place={p} km={km} showDistrict />
            </li>
          ))}
        </Carousel>
      )}

      {food.length > 0 && (
        <Carousel title={t('place.foodNearby')} subtitle={t('place.foodSub', { region: name(region) })}>
          {food.map((f) => (
            <li key={f.id}>
              <FoodCard food={f} fromHere={f.district === place.district} near={place.name} />
            </li>
          ))}
        </Carousel>
      )}
    </article>
  );
}
