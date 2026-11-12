import { getDistrict, getRegion, shortName } from '../lib/catalogue';

export default function Breadcrumbs({ regionId, districtId, placeName }) {
  const district = districtId && getDistrict(districtId);
  const region = getRegion(regionId ?? district?.region);
  const crumbs = [{ href: '#/', label: 'Maharashtra' }];
  if (region) crumbs.push({ href: `#/region/${region.id}`, label: region.name });
  if (district) crumbs.push({ href: `#/district/${district.id}`, label: shortName(district.name) });
  if (placeName) crumbs.push({ label: placeName });
  const last = crumbs.length - 1;

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={c.label}>
          {i > 0 && <span aria-hidden="true"> › </span>}
          {i === last ? <span aria-current="page">{c.label}</span> : <a href={c.href}>{c.label}</a>}
        </span>
      ))}
    </nav>
  );
}
