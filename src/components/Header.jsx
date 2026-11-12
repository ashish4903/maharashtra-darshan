import useTrip from '../lib/useTrip';
import useLang from '../lib/useLang';
import { translate } from '../lib/i18n';

export default function Header({ view }) {
  const { ids } = useTrip();
  const { lang, setLang, t } = useLang();
  const other = lang === 'mr' ? 'en' : 'mr';
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#/" className="brand" aria-label={t('nav.home')}>
          <span className="brand-mark" aria-hidden="true">
            ⛰️
          </span>
          <span className="brand-text">
            <span className="brand-name">{t('app.name')}</span>
            <span className="brand-mr" lang={other}>
              {translate(other, 'app.name')}
            </span>
          </span>
        </a>
        <nav className="site-nav" aria-label={t('nav.main')}>
          <a href="#/" aria-current={view === 'home' ? 'page' : undefined}>
            {t('nav.explore')}
          </a>
          <a href="#/trip" aria-current={view === 'trip' ? 'page' : undefined}>
            ♥ {t('nav.trip')}
            {ids.length > 0 && <span className="nav-count">{ids.length}</span>}
          </a>
          <button
            type="button"
            className="lang-switch"
            lang={other}
            aria-label={t('lang.switchLabel')}
            onClick={() => setLang(other)}
          >
            {t('lang.switch')}
          </button>
        </nav>
      </div>
    </header>
  );
}
