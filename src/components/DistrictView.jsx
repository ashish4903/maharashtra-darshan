import { useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import Banner from './Banner';
import Tabs from './Tabs';
import PlaceList from './PlaceList';
import FoodList from './FoodList';
import TalukaList from './TalukaList';
import MaharashtraMap from './MaharashtraMap';
import { coverImage, foodsIn, getDistrict, getRegion, placesIn, plural } from '../lib/catalogue';

export default function DistrictView({ districtId }) {
  const [tab, setTab] = useState('places');
  const district = getDistrict(districtId);
  const region = getRegion(district.region);
  const placeList = placesIn({ district: districtId });
  const foodList = foodsIn({ district: districtId });

  return (
    <article className={`level region-${district.region}`}>
      <Breadcrumbs districtId={districtId} />
      <Banner
        image={coverImage({ district: districtId })}
        icon="📍"
        kicker={`District in ${region.name}`}
        title={district.name}
        titleMr={district.nameMr}
      >
        <p className="banner-stats">
          {plural(placeList.length, 'place')} · {plural(district.talukas.length, 'taluka')}
        </p>
      </Banner>

      <div className="level-layout">
        <div className="level-main">
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
        </div>
        <aside className="level-aside">
          <MaharashtraMap region={district.region} district={districtId} label={`Map showing ${district.name}`} />
          {district.wikipedia && (
            <p className="source-note">
              <a href={district.wikipedia} target="_blank" rel="noreferrer">
                About {district.name} on Wikipedia
              </a>
            </p>
          )}
        </aside>
      </div>
    </article>
  );
}
