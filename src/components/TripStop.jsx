import Photo from './Photo';
import SaveButton from './SaveButton';
import { KINDS, getDistrict, shortName } from '../lib/catalogue';
import { formatKm } from '../lib/geo';

export default function TripStop({ place, number, hopKm, removable }) {
  const kind = KINDS[place.kind];
  return (
    <li className={`trip-stop region-${place.region}`}>
      <span className="trip-number" aria-hidden="true">
        {number}
      </span>
      <a href={`#/place/${place.id}`} className="trip-stop-link">
        <Photo image={place.image} alt="" icon={kind.icon} className="trip-photo" />
        <span className="trip-stop-text">
          <strong>{place.name}</strong>
          <span className="muted">
            {kind.one} · {shortName(getDistrict(place.district).name)}
          </span>
          {hopKm > 0 && <span className="trip-hop">↳ {formatKm(hopKm)} from the previous stop</span>}
        </span>
      </a>
      {removable && <SaveButton place={place} />}
    </li>
  );
}
