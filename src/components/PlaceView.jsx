import Breadcrumbs from './Breadcrumbs';
import Banner from './Banner';
import SaveButton from './SaveButton';
import ShareButton from './ShareButton';
import WikiSummary from './WikiSummary';
import MaharashtraMap from './MaharashtraMap';
import Carousel from './Carousel';
import PlaceCard from './PlaceCard';
import FoodCard from './FoodCard';
import { KINDS, commonsUrl, foodsIn, getDistrict, getPlace, getRegion, mapUrl, places, shortName } from '../lib/catalogue';
import { nearest } from '../lib/geo';

export default function PlaceView({ placeId }) {
  const place = getPlace(placeId);
  const district = getDistrict(place.district);
  const region = getRegion(place.region);
  const kind = KINDS[place.kind];
  const nearby = place.coords ? nearest(place.coords, places, 8, place.id) : [];
  const food = foodsIn({ district: place.district });
  const taluka = place.taluka && district.talukas.find((t) => t.id === place.taluka);

  return (
    <article className={`level place-page region-${place.region}`}>
      <Breadcrumbs districtId={place.district} placeName={place.name} />
      <Banner
        image={place.image}
        icon={kind.icon}
        kicker={`${kind.icon} ${kind.one}`}
        title={place.name}
        titleMr={place.nameMr}
      >
        {place.highlight && <p className="banner-highlight">★ {place.highlight}</p>}
        {place.description && <p className="banner-stats">{place.description}</p>}
      </Banner>

      <div className="level-layout">
        <div className="level-main">
          <div className="place-actions">
            <SaveButton place={place} withLabel />
            <ShareButton title={place.name} />
            {place.coords && (
              <a className="button button-ghost" href={mapUrl(place.coords)} target="_blank" rel="noreferrer">
                🗺️ Open map
              </a>
            )}
            <a className="button button-ghost" href={place.wikipedia} target="_blank" rel="noreferrer">
              📖 Wikipedia
            </a>
          </div>

          <dl className="facts">
            <div>
              <dt>Region</dt>
              <dd>
                <a href={`#/region/${region.id}`}>{region.name}</a>
              </dd>
            </div>
            <div>
              <dt>District</dt>
              <dd>
                <a href={`#/district/${district.id}`}>{shortName(district.name)}</a>
              </dd>
            </div>
            {taluka && (
              <div>
                <dt>Taluka</dt>
                <dd>{shortName(taluka.name)}</dd>
              </div>
            )}
            {place.coords && (
              <div>
                <dt>Coordinates</dt>
                <dd>
                  {place.coords[0].toFixed(3)}°N, {place.coords[1].toFixed(3)}°E
                </dd>
              </div>
            )}
          </dl>

          <WikiSummary url={place.wikipedia} />

          {place.image && (
            <p className="source-note">
              Photo:{' '}
              <a href={commonsUrl(place.image.file)} target="_blank" rel="noreferrer">
                Wikimedia Commons
              </a>{' '}
              (see the file page for its author and licence).
            </p>
          )}
        </div>

        <aside className="level-aside">
          <MaharashtraMap region={place.region} place={place.id} label={`Map showing ${place.name}`} />
        </aside>
      </div>

      {nearby.length > 0 && (
        <Carousel title="Nearby places" subtitle="Closest first, as the crow flies">
          {nearby.map(({ place: p, km }) => (
            <li key={p.id}>
              <PlaceCard place={p} km={km} showDistrict />
            </li>
          ))}
        </Carousel>
      )}

      {food.length > 0 && (
        <Carousel title="Food to try nearby" subtitle={`Dishes of ${region.name}`}>
          {food.map((f) => (
            <li key={f.id}>
              <FoodCard food={f} fromHere={f.district === place.district} />
            </li>
          ))}
        </Carousel>
      )}
    </article>
  );
}
