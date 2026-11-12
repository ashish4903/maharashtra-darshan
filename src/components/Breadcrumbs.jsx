import useLang from '../lib/useLang';
import { getDistrict, getRegion, shortName } from '../lib/catalogue';

export default function Breadcrumbs({ regionId, districtId, placeName, current }) {
  const { t, name } = useLang();
  const district = districtId && getDistrict(districtId);
  const region = getRegion(regionId ?? district?.region);
  const crumbs = [{ href: '#/', label: t('crumb.home') }];
  if (region) crumbs.push({ href: `#/region/${region.id}`, label: name(region) });
  if (district) crumbs.push({ href: `#/district/${district.id}`, label: shortName(name(district)) });
  if (placeName) crumbs.push({ label: placeName });
  if (current) crumbs.push({ label: current });
  const last = crumbs.length - 1;

  return (
    <nav className="breadcrumbs" aria-label={t('crumb.label')}>
      {crumbs.map((c, i) => (
        <span key={c.label}>
          {i > 0 && <span aria-hidden="true"> › </span>}
          {i === last ? <span aria-current="page">{c.label}</span> : <a href={c.href}>{c.label}</a>}
        </span>
      ))}
    </nav>
  );
}
