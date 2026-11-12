import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import Banner from './Banner';
import Tabs from './Tabs';
import DistrictGrid from './DistrictGrid';
import PlaceList from './PlaceList';
import FoodList from './FoodList';
import MaharashtraMap from './MaharashtraMap';
import useLang from '../lib/useLang';
import { coverImage, districtsOf, foodsIn, getRegion, placesIn } from '../lib/catalogue';

export default function RegionView({ regionId }) {
  const { t, name, otherName } = useLang();
  const [tab, setTab] = useState('districts');
  const region = getRegion(regionId);
  const districtList = districtsOf(regionId);
  const placeList = placesIn({ region: regionId });
  const foodList = foodsIn({ region: regionId });
  const [before, after] = t('region.source').split('{link}');

  return (
    <article className={`level region-${regionId}`}>
      <Breadcrumbs regionId={regionId} />
      <Banner
        image={coverImage({ region: regionId })}
        icon="🗺️"
        kicker={t('region.kicker')}
        title={name(region)}
        titleMr={otherName(region)}
      >
        <p className="banner-stats">
          {t('count.district', { n: districtList.length })} · {t('count.place', { n: placeList.length })} ·{' '}
          {t('count.dish', { n: foodList.length })}
        </p>
      </Banner>

      <div className="level-layout">
        <div className="level-main">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'districts', label: t('tab.districts'), count: districtList.length },
              { id: 'places', label: t('tab.places'), count: placeList.length },
              { id: 'food', label: t('tab.food'), count: foodList.length },
            ]}
          />
          {tab === 'districts' && <DistrictGrid districts={districtList} />}
          {tab === 'places' && <PlaceList places={placeList} showDistrict />}
          {tab === 'food' && <FoodList foods={foodList} />}
        </div>
        <aside className="level-aside">
          <MaharashtraMap region={regionId} label={t('map.of', { name: name(region) })} />
          <p className="source-note">
            {before}
            <a href={region.source} target="_blank" rel="noreferrer">
              Wikipedia
            </a>
            {after}
          </p>
        </aside>
      </div>
    </article>
  );
}
