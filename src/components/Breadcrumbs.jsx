import { getDistrict, getRegion, shortName } from '../lib/catalogue';

export default function Breadcrumbs({ regionId, districtId }) {
  const district = districtId && getDistrict(districtId);
  const region = getRegion(regionId ?? district?.region);
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <a href="#/">Maharashtra</a>
      {region && (
        <>
          <span aria-hidden="true">›</span>
          {district ? (
            <a href={`#/region/${region.id}`}>{region.name}</a>
          ) : (
            <span aria-current="page">{region.name}</span>
          )}
        </>
      )}
      {district && (
        <>
          <span aria-hidden="true">›</span>
          <span aria-current="page">{shortName(district.name)}</span>
        </>
      )}
    </nav>
  );
}
