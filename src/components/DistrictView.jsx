import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import Banner from './Banner';
import Tabs from './Tabs';
import PlaceList from './PlaceList';
import FoodList from './FoodList';
import TalukaList from './TalukaList';
import TalukaFilter from './TalukaFilter';
import KnownFor from './KnownFor';
import WikiSummary from './WikiSummary';
import MaharashtraMap from './MaharashtraMap';
import useLang from '../lib/useLang';
import { coverImage, foodsIn, getDistrict, getRegion, placesIn, talukaCounts } from '../lib/catalogue';

export default function DistrictView({ districtId }) {
  const { t, name, otherName } = useLang();
  const [tab, setTab] = useState('places');
  const [taluka, setTaluka] = useState(null);
  const district = getDistrict(districtId);
  const region = getRegion(district.region);
  const placeList = placesIn({ district: districtId });
  const foodList = foodsIn({ district: districtId });
  const counts = talukaCounts(districtId);
  const shown = taluka ? placeList.filter((p) => p.taluka === taluka) : placeList;

  const openTaluka = (id) => {
    setTaluka(id);
    setTab('places');
  };

  return (
    <article className={`level region-${district.region}`}>
      <Breadcrumbs districtId={districtId} />
      <Banner
        image={coverImage({ district: districtId })}
        icon="📍"
        kicker={t('district.kicker', { region: name(region) })}
        title={name(district)}
        titleMr={otherName(district)}
      >
        <p className="banner-stats">
          {t('count.place', { n: placeList.length })} · {t('count.taluka', { n: district.talukas.length })}
        </p>
      </Banner>

      <div className="level-layout">
        <div className="level-main">
          {district.knownFor?.length > 0 && (
            <section className="district-intro" aria-label={t('district.knownFor')}>
              <h2 className="intro-heading">{t('district.knownFor')}</h2>
              <KnownFor items={district.knownFor} />
            </section>
          )}

          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'places', label: t('tab.places'), count: placeList.length },
              { id: 'food', label: t('tab.food'), count: foodList.length },
              { id: 'talukas', label: t('tab.talukas'), count: district.talukas.length },
              { id: 'about', label: t('tab.about'), count: '' },
            ]}
          />
          {tab === 'places' && (
            <>
              <TalukaFilter talukas={district.talukas} counts={counts} active={taluka} onChange={setTaluka} />
              <PlaceList key={taluka ?? 'all'} places={shown} />
            </>
          )}
          {tab === 'food' && <FoodList foods={foodList} districtId={districtId} />}
          {tab === 'talukas' && <TalukaList talukas={district.talukas} counts={counts} onOpen={openTaluka} />}
          {tab === 'about' && district.wikipedia && <WikiSummary url={district.wikipedia} />}
        </div>
        <aside className="level-aside">
          <MaharashtraMap
            region={district.region}
            district={districtId}
            label={t('map.showing', { name: name(district) })}
          />
          {district.wikipedia && (
            <p className="source-note">
              <a href={district.wikipedia} target="_blank" rel="noreferrer">
                {t('district.wikipedia', { name: name(district) })}
              </a>
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}
