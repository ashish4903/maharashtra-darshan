import Photo from './Photo';
import SaveButton from './SaveButton';
import useLang from '../lib/useLang';
import { KINDS, getDistrict, shortName } from '../lib/catalogue';
import { formatKm } from '../lib/geo';

export default function TripStop({ place, number, hopKm, removable }) {
  const { t, kind, name } = useLang();
  const icon = KINDS[place.kind].icon;
  return (
    <li className={`trip-stop region-${place.region}`}>
      <span className="trip-number" aria-hidden="true">
        {number}
      </span>
      <a href={`#/place/${place.id}`} className="trip-stop-link">
        <Photo image={place.image} alt="" icon={icon} className="trip-photo" width={250} />
        <span className="trip-stop-text">
          <strong>{name(place)}</strong>
          <span className="muted">
            {kind(place.kind)} · {shortName(name(getDistrict(place.district)))}
          </span>
          {hopKm > 0 && <span className="trip-hop">{t('trip.hop', { km: formatKm(hopKm) })}</span>}
        </span>
      </a>
      {removable && <SaveButton place={place} />}
    </li>
  );
}
