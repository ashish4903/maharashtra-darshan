import Photo from './Photo';
import SaveButton from './SaveButton';
import SeasonNote from './SeasonNote';
import useLang from '../lib/useLang';
import { KINDS, getDistrict, shortName, usefulDescription } from '../lib/catalogue';
import { formatKm } from '../lib/geo';

export default function PlaceCard({ place, showDistrict = false, km, showSeason = false }) {
  const { t, kind, name, otherName, lang } = useLang();
  const icon = KINDS[place.kind].icon;
  const district = getDistrict(place.district);
  const taluka = place.taluka && district.talukas.find((x) => x.id === place.taluka);
  const description = usefulDescription(place);
  return (
    <div className={`card place-card region-${place.region}`}>
      <a href={`#/place/${place.id}`} className="card-link">
        <div className="card-media">
          <Photo image={place.image} alt={name(place)} icon={icon} />
          <span className="card-badge">
            <span aria-hidden="true">{icon}</span> {kind(place.kind)}
          </span>
        </div>
        <div className="card-body">
          <h3 className="card-title">{name(place)}</h3>
          {otherName(place) && (
            <p className="card-mr" lang={lang === 'mr' ? 'en' : 'mr'}>
              {otherName(place)}
            </p>
          )}
          {showSeason && <SeasonNote item={place} />}
          {place.highlight && <p className="card-highlight">★ {place.highlight}</p>}
          {description && (
            <p className="card-text" lang="en">
              {description}
            </p>
          )}
          <p className="card-meta">
            {showDistrict && <span>📍 {shortName(name(district))}</span>}
            {taluka && <span>{t('taluka.of', { name: shortName(name(taluka)) })}</span>}
            {km !== undefined && <span>{t('card.away', { km: formatKm(km) })}</span>}
          </p>
        </div>
      </a>
      <SaveButton place={place} />
    </div>
  );
}
