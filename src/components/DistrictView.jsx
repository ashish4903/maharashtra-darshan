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
import { coverImage, foodsIn, getDistrict, getRegion, placesIn, plural, talukaCounts } from '../lib/catalogue';

export default function DistrictView({ districtId }) {
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
          {district.knownFor?.length > 0 && (
            <section className="district-intro" aria-label={`What ${district.name} is known for`}>
              <h2 className="intro-heading">Known for</h2>
              <KnownFor items={district.knownFor} />
            </section>
          )}

          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'places', label: 'Places', count: placeList.length },
              { id: 'food', label: 'Food', count: foodList.length },
              { id: 'talukas', label: 'Talukas', count: district.talukas.length },
              { id: 'about', label: 'About', count: '' },
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
