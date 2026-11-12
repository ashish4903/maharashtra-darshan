import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import Tabs from './Tabs';
import PlaceList from './PlaceList';
import FoodList from './FoodList';
import TalukaList from './TalukaList';
import { foodsIn, getDistrict, placesIn } from '../lib/catalogue';

export default function DistrictView({ districtId }) {
  const [tab, setTab] = useState('places');
  const district = getDistrict(districtId);
  const placeList = placesIn({ district: districtId });
  const foodList = foodsIn({ district: districtId });

  return (
    <article className={`level region-${district.region}`}>
      <Breadcrumbs districtId={districtId} />
      <h1>
        {district.name} <span lang="mr">{district.nameMr}</span>
      </h1>
      {district.wikipedia && (
        <p className="source-note">
          <a href={district.wikipedia} target="_blank" rel="noreferrer">
            About {district.name} on Wikipedia
          </a>
        </p>
      )}
      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'places', label: 'Places', count: placeList.length },
          { id: 'food', label: 'Food', count: foodList.length },
          { id: 'talukas', label: 'Talukas', count: district.talukas.length },
        ]}
      />
      {tab === 'places' && <PlaceList places={placeList} />}
      {tab === 'food' && <FoodList foods={foodList} districtId={districtId} />}
      {tab === 'talukas' && <TalukaList talukas={district.talukas} />}
    </article>
  );
}
