import TripPlan from './TripPlan';
import ShareButton from './ShareButton';
import useTrip from '../lib/useTrip';
import useLang from '../lib/useLang';
import { getPlace } from '../lib/catalogue';
import { tripLink } from '../lib/route';

/** My saved places as a day-by-day plan, or a trip someone shared (`sharedIds`). */
export default function TripView({ sharedIds }) {
  const { t } = useLang();
  const { ids, clear, addMany } = useTrip();
  const shared = Boolean(sharedIds);
  const list = (sharedIds ?? ids).map(getPlace).filter(Boolean);
  const allSaved = shared && sharedIds.every((id) => ids.includes(id));

  return (
    <article className="level trip-page">
      <header className="trip-head">
        <div>
          <h1>{t(shared ? 'trip.sharedTitle' : 'trip.title')}</h1>
          <p className="muted">{t(shared ? 'trip.sharedIntro' : 'trip.intro')}</p>
        </div>
        {list.length > 0 && (
          <div className="trip-actions">
            {shared ? (
              <button
                type="button"
                className="button button-primary"
                onClick={() => addMany(sharedIds)}
                disabled={allSaved}
              >
                {t(allSaved ? 'trip.allSaved' : 'trip.saveAll')}
              </button>
            ) : (
              <ShareButton title={t('trip.shareTitle')} url={tripLink(ids)} label={t('trip.share')} />
            )}
            {shared ? (
              <a href="#/trip" className="button button-ghost">
                {t('trip.mine')}
              </a>
            ) : (
              <button type="button" className="button button-ghost" onClick={clear}>
                {t('trip.clear')}
              </button>
            )}
          </div>
        )}
      </header>

      {list.length === 0 ? (
        <div className="empty">
          <p>{t('trip.empty')}</p>
          <a href="#/" className="button button-primary">
            {t('trip.start')}
          </a>
        </div>
      ) : (
        <TripPlan places={list} removable={!shared} />
      )}
    </article>
  );
}
