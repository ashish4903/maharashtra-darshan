import Photo from './Photo';
import { coverImage, foodsIn, placesIn, plural } from '../lib/catalogue';

export default function RegionCard({ region }) {
  return (
    <a href={`#/region/${region.id}`} className={`region-card region-${region.id}`}>
      <Photo image={coverImage({ region: region.id })} alt="" icon="🗺️" className="region-photo" />
      <span className="region-overlay">
        <span className="region-name">{region.name}</span>
        <span className="region-mr" lang="mr">
          {region.nameMr}
        </span>
        <span className="region-stats">
          {plural(region.districts.length, 'district')} · {plural(placesIn({ region: region.id }).length, 'place')} ·{' '}
          {plural(foodsIn({ region: region.id }).length, 'dish', 'dishes')}
        </span>
      </span>
    </a>
  );
}
