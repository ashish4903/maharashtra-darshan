import Photo from './Photo';
import useLang from '../lib/useLang';
import { coverImage, foodsIn, placesIn } from '../lib/catalogue';

/** `onHighlight` (optional) hears the region while the card is hovered or focused, then null */
export default function RegionCard({ region, onHighlight }) {
  const { t, name, otherName, lang } = useLang();
  const show = onHighlight && (() => onHighlight(region.id));
  const hide = onHighlight && (() => onHighlight(null));
  return (
    <a
      href={`#/region/${region.id}`}
      className={`region-card region-${region.id}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <Photo image={coverImage({ region: region.id })} alt="" icon="🗺️" className="region-photo" />
      <span className="region-overlay">
        <span className="region-name">{name(region)}</span>
        <span className="region-mr" lang={lang === 'mr' ? 'en' : 'mr'}>
          {otherName(region)}
        </span>
        <span className="region-stats">
          {t('count.district', { n: region.districts.length })} ·{' '}
          {t('count.place', { n: placesIn({ region: region.id }).length })} ·{' '}
          {t('count.dish', { n: foodsIn({ region: region.id }).length })}
        </span>
      </span>
    </a>
  );
}
