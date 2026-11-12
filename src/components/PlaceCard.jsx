import Photo from './Photo';
import SaveButton from './SaveButton';
import { KINDS, getDistrict, shortName } from '../lib/catalogue';
import { formatKm } from '../lib/geo';

export default function PlaceCard({ place, showDistrict = false, km }) {
  const kind = KINDS[place.kind];
  const district = getDistrict(place.district);
  const taluka = place.taluka && district.talukas.find((t) => t.id === place.taluka);
  return (
    <div className={`card place-card region-${place.region}`}>
      <a href={`#/place/${place.id}`} className="card-link">
        <div className="card-media">
          <Photo image={place.image} alt={place.name} icon={kind.icon} />
          <span className="card-badge">
            <span aria-hidden="true">{kind.icon}</span> {kind.one}
          </span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{place.name}</h3>
          {place.nameMr && (
            <p className="card-mr" lang="mr">
              {place.nameMr}
            </p>
          )}
          {place.highlight && <p className="card-highlight">★ {place.highlight}</p>}
          {place.description && <p className="card-text">{place.description}</p>}
          <p className="card-meta">
            {showDistrict && <span>📍 {shortName(district.name)}</span>}
            {taluka && <span>{shortName(taluka.name)} taluka</span>}
            {km !== undefined && <span>{formatKm(km)} away</span>}
          </p>
        </div>
      </a>
      <SaveButton place={place} />
    </div>
  );
}
