import useTrip from '../lib/useTrip';

export default function Header({ view }) {
  const { ids } = useTrip();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#/" className="brand" aria-label="Maharashtra Darshan home">
          <span className="brand-mark" aria-hidden="true">
            ⛰️
          </span>
          <span className="brand-text">
            <span className="brand-name">Maharashtra Darshan</span>
            <span className="brand-mr" lang="mr">
              महाराष्ट्र दर्शन
            </span>
          </span>
        </a>
        <nav className="site-nav" aria-label="Main">
          <a href="#/" aria-current={view === 'home' ? 'page' : undefined}>
            Explore
          </a>
          <a href="#/trip" aria-current={view === 'trip' ? 'page' : undefined}>
            ♥ My trip{ids.length > 0 && <span className="nav-count">{ids.length}</span>}
          </a>
        </nav>
      </div>
    </header>
  );
}
