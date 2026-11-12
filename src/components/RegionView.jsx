import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import Banner from './Banner';
import Tabs from './Tabs';
import DistrictGrid from './DistrictGrid';
import PlaceList from './PlaceList';
import FoodList from './FoodList';
import MaharashtraMap from './MaharashtraMap';
import { coverImage, districtsOf, foodsIn, getRegion, placesIn, plural } from '../lib/catalogue';

export default function RegionView({ regionId }) {
  const [tab, setTab] = useState('districts');
  const region = getRegion(regionId);
  const districtList = districtsOf(regionId);
  const placeList = placesIn({ region: regionId });
  const foodList = foodsIn({ region: regionId });

  return (
    <article className={`level region-${regionId}`}>
      <Breadcrumbs regionId={regionId} />
      <Banner image={coverImage({ region: regionId })} icon="🗺️" kicker="Region" title={region.name} titleMr={region.nameMr}>
        <p className="banner-stats">
          {plural(districtList.length, 'district')} · {plural(placeList.length, 'place')} ·{' '}
          {plural(foodList.length, 'dish', 'dishes')}
        </p>
      </Banner>

      <div className="level-layout">
        <div className="level-main">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'districts', label: 'Districts', count: districtList.length },
              { id: 'places', label: 'Places', count: placeList.length },
              { id: 'food', label: 'Food', count: foodList.length },
            ]}
          />
          {tab === 'districts' && <DistrictGrid districts={districtList} />}
          {tab === 'places' && <PlaceList places={placeList} showDistrict />}
          {tab === 'food' && <FoodList foods={foodList} />}
        </div>
        <aside className="level-aside">
          <MaharashtraMap region={regionId} label={`Map of ${region.name}`} />
          <p className="source-note">
            Districts as listed on{' '}
            <a href={region.source} target="_blank" rel="noreferrer">
              Wikipedia
            </a>
            .
          </p>
        </aside>
      </div>
    </article>
  );
}
