import { useEffect, useRef, useState } from 'react';
import TripProvider from './components/TripProvider';
import LanguageProvider from './components/LanguageProvider';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import HomeView from './components/HomeView';
import RegionView from './components/RegionView';
import DistrictView from './components/DistrictView';
import PlaceView from './components/PlaceView';
import TripView from './components/TripView';
import CircuitView from './components/CircuitView';
import FestivalsView from './components/FestivalsView';
import SeasonsView from './components/SeasonsView';
import PlannerView from './components/PlannerView';
import Footer from './components/Footer';
import { parseHash } from './lib/route';

function View({ route }) {
  switch (route.view) {
    case 'region':
      return <RegionView regionId={route.id} />;
    case 'district':
      return <DistrictView districtId={route.id} />;
    case 'place':
      return <PlaceView placeId={route.id} />;
    case 'circuit':
      return <CircuitView circuitId={route.id} />;
    case 'festivals':
      return <FestivalsView />;
    case 'seasons':
      return <SeasonsView />;
    case 'plan':
      return <PlannerView />;
    case 'trip':
      return <TripView sharedIds={route.ids} />;
    default:
      return <HomeView />;
  }
}

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [query, setQuery] = useState('');
  const main = useRef(null);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
      setQuery('');
      document.documentElement.scrollTop = 0;
      // Move keyboard and screen-reader focus to the new page
      main.current?.focus({ preventScroll: true });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const searching = query.trim().length >= 2;
  const key = `${route.view}/${route.id ?? route.ids?.join(',') ?? ''}`;

  return (
    <LanguageProvider>
      <TripProvider>
        <Header view={route.view} />
        <main className="page" ref={main} tabIndex={-1}>
          <SearchBox value={query} onChange={setQuery} />
          <div className="view" key={searching ? 'search' : key}>
            {searching ? <SearchResults query={query} /> : <View route={route} />}
          </div>
        </main>
        <Footer />
      </TripProvider>
    </LanguageProvider>
  );
}
