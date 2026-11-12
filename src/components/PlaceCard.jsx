import { KINDS, getDistrict, mapUrl, shortName } from '../lib/catalogue';

export default function PlaceCard({ place, showDistrict }) {
  const kind = KINDS[place.kind];
  const district = getDistrict(place.district);
  return (
    <div className="card">
      <p className="card-kind">
        <span aria-hidden="true">{kind.icon}</span> {kind.one}
      </p>
      <h3 className="card-title">{place.name}</h3>
      {place.nameMr && (
        <p className="card-mr" lang="mr">
          {place.nameMr}
        </p>
      )}
      {place.description && <p className="card-text">{place.description}</p>}
      <p className="card-links">
        {showDistrict && <a href={`#/district/${district.id}`}>{shortName(district.name)}</a>}
        <a href={place.wikipedia} target="_blank" rel="noreferrer">
          Wikipedia
        </a>
        {place.coords && (
          <a href={mapUrl(place.coords)} target="_blank" rel="noreferrer">
            Map
          </a>
        )}
      </p>
    </div>
  );
}
