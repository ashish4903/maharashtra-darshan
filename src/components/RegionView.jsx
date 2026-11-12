import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import Tabs from './Tabs';
import DistrictGrid from './DistrictGrid';
import PlaceList from './PlaceList';
import FoodList from './FoodList';
import { districtsOf, foodsIn, getRegion, placesIn } from '../lib/catalogue';

export default function RegionView({ regionId }) {
  const [tab, setTab] = useState('districts');
  const region = getRegion(regionId);
  const districtList = districtsOf(regionId);
  const placeList = placesIn({ region: regionId });
  const foodList = foodsIn({ region: regionId });

  return (
    <article className={`level region-${regionId}`}>
      <Breadcrumbs regionId={regionId} />
      <h1>
        {region.name} <span lang="mr">{region.nameMr}</span>
      </h1>
      <p className="source-note">
        Districts as listed on{' '}
        <a href={region.source} target="_blank" rel="noreferrer">
          Wikipedia
        </a>
      </p>
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
    </article>
  );
}
