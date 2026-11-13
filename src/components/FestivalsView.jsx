import Breadcrumbs from './Breadcrumbs';
import FestivalCard from './FestivalCard';
import useLang from '../lib/useLang';
import { festivals } from '../lib/catalogue';

/** A year of festivals, month by month, starting from the current month. */
export default function FestivalsView({ month = new Date().getMonth() + 1 }) {
  const { t, lang } = useLang();
  const monthName = (m) =>
    new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', { month: 'long' }).format(new Date(2026, m - 1, 1));
  const order = Array.from({ length: 12 }, (_, i) => ((month - 1 + i) % 12) + 1);
  const occasional = festivals.filter((f) => f.months.length === 0);

  return (
    <article className="level festivals-page">
      <Breadcrumbs current={t('festival.title')} />
      <header className="trip-head">
        <div>
          <h1>{t('festival.title')}</h1>
          <p className="muted">{t('festival.intro')}</p>
        </div>
      </header>

      {order.map((m) => {
        const list = festivals.filter((f) => f.months.includes(m));
        if (list.length === 0) return null;
        return (
          <section key={m} className="festival-month" aria-label={monthName(m)}>
            <h2>
              {monthName(m)}
              {m === month && <span className="festival-now">{t('festival.thisMonth')}</span>}
            </h2>
            <ul className="card-grid">
              {list.map((f) => (
                <li key={f.id}>
                  <FestivalCard festival={f} month={month} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {occasional.length > 0 && (
        <section className="festival-month" aria-label={t('festival.occasional')}>
          <h2>{t('festival.occasional')}</h2>
          <ul className="card-grid">
            {occasional.map((f) => (
              <li key={f.id}>
                <FestivalCard festival={f} month={month} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="source-note">{t('festival.note')}</p>
    </article>
  );
}
