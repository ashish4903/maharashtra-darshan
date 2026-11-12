import { placesIn, plural, shortName } from '../lib/catalogue';

export default function DistrictGrid({ districts }) {
  return (
    <ul className="district-grid">
      {districts.map((d) => {
        const count = placesIn({ district: d.id }).length;
        return (
          <li key={d.id}>
            <a href={`#/district/${d.id}`} className="district-card">
              <span className="district-name">{shortName(d.name)}</span>
              <span lang="mr">{d.nameMr}</span>
              <span className="district-stats">
                {plural(d.talukas.length, 'taluka')}
                {count > 0 && ` · ${plural(count, 'place')}`}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
