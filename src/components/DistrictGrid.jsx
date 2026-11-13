import Photo from './Photo';
import useLang from '../lib/useLang';
import { coverImage, placesIn, shortName } from '../lib/catalogue';

export default function DistrictGrid({ districts }) {
  const { t, name, otherName, lang } = useLang();
  return (
    <ul className="district-grid">
      {districts.map((d) => {
        const count = placesIn({ district: d.id }).length;
        return (
          <li key={d.id}>
            <a href={`#/district/${d.id}`} className="district-card">
              <Photo image={coverImage({ district: d.id })} alt="" icon="📍" className="district-photo" width={250} />
              <span className="district-text">
                <span className="district-name">{shortName(name(d))}</span>
                <span lang={lang === 'mr' ? 'en' : 'mr'}>{otherName(d)}</span>
                {d.knownFor?.length > 0 && (
                  <span className="district-known">
                    {d.knownFor
                      .slice(0, 2)
                      .map((k) => k.label)
                      .join(' · ')}
                  </span>
                )}
                <span className="district-stats">
                  {t('count.place', { n: count })} · {t('count.taluka', { n: d.talukas.length })}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
