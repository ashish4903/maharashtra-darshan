import Photo from './Photo';
import { coverImage, placesIn, plural, shortName } from '../lib/catalogue';

export default function DistrictGrid({ districts }) {
  return (
    <ul className="district-grid">
      {districts.map((d) => {
        const count = placesIn({ district: d.id }).length;
        return (
          <li key={d.id}>
            <a href={`#/district/${d.id}`} className="district-card">
              <Photo image={coverImage({ district: d.id })} alt="" icon="📍" className="district-photo" />
              <span className="district-text">
                <span className="district-name">{shortName(d.name)}</span>
                <span lang="mr">{d.nameMr}</span>
                <span className="district-stats">
                  {plural(count, 'place')} · {plural(d.talukas.length, 'taluka')}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
