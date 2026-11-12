import { foodsIn, placesIn, plural } from '../lib/catalogue';

export default function RegionCard({ region }) {
  return (
    <a href={`#/region/${region.id}`} className={`region-card region-${region.id}`}>
      <span className="region-name">{region.name}</span>
      <span className="region-mr" lang="mr">
        {region.nameMr}
      </span>
      <span className="region-stats">
        {plural(region.districts.length, 'district')} · {plural(placesIn({ region: region.id }).length, 'place')} ·{' '}
        {plural(foodsIn({ region: region.id }).length, 'dish', 'dishes')}
      </span>
    </a>
  );
}
