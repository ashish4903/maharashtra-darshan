import { useEffect, useState } from 'react';
import Header from './components/Header';
import SearchBox from './components/SearchBox';
import SearchResults from './components/SearchResults';
import HomeView from './components/HomeView';
import RegionView from './components/RegionView';
import DistrictView from './components/DistrictView';
import Footer from './components/Footer';
import { parseHash } from './lib/route';

export default function App() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
      setQuery('');
      document.documentElement.scrollTop = 0;
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  let view = <HomeView />;
  if (route.view === 'region') view = <RegionView key={route.id} regionId={route.id} />;
  if (route.view === 'district') view = <DistrictView key={route.id} districtId={route.id} />;

  return (
    <>
      <Header />
      <main className="page">
        <SearchBox value={query} onChange={setQuery} />
        {query.trim().length >= 2 ? <SearchResults query={query} /> : view}
      </main>
      <Footer />
    </>
  );
}
