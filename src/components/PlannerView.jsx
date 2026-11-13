import { useMemo, useState } from 'react';
import Breadcrumbs from './Breadcrumbs';
import TripPlan from './TripPlan';
import Carousel from './Carousel';
import FoodCard from './FoodCard';
import FestivalCard from './FestivalCard';
import ShareButton from './ShareButton';
import useTrip from '../lib/useTrip';
import useLang from '../lib/useLang';
import { districts, shortName } from '../lib/catalogue';
import { INTERESTS, planGetaway } from '../lib/planner';
import { currentMonth, monthName } from '../lib/months';
import { tripLink } from '../lib/route';

const DEFAULT_START = 'Q1797336'; // Pune district

/** "I'm in Pune, I have 2 days, I like forts": a ready plan to save or share. */
export default function PlannerView() {
  const { t, name, lang } = useLang();
  const { ids, addMany } = useTrip();
  const starts = useMemo(
    () => districts.filter((d) => d.coords).sort((a, b) => shortName(name(a)).localeCompare(shortName(name(b)))),
    [name],
  );
  const [startId, setStartId] = useState(DEFAULT_START);
  const [here, setHere] = useState(null); // the visitor's own position, kept on this page only
  const [locating, setLocating] = useState(false);
  const [days, setDays] = useState(2);
  const [interests, setInterests] = useState([]);
  const [month, setMonth] = useState(currentMonth());

  const start = here ?? starts.find((d) => d.id === startId)?.coords;
  const plan = useMemo(
    () => (start ? planGetaway({ start, days, interests, month }) : { places: [], foods: [], festivals: [] }),
    [start, days, interests, month],
  );
  const planIds = plan.places.map((p) => p.id);
  const saved = planIds.length > 0 && planIds.every((id) => ids.includes(id));

  const toggle = (key) => setInterests((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setHere([coords.latitude, coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { maximumAge: 600000, timeout: 15000 },
    );
  };

  return (
    <article className="level planner-page">
      <Breadcrumbs current={t('plan.title')} />
      <header className="trip-head">
        <div>
          <h1>{t('plan.title')}</h1>
          <p className="muted">{t('plan.intro')}</p>
        </div>
      </header>

      <div className="planner-form">
        <label className="planner-field">
          <span>{t('plan.from')}</span>
          <select
            value={here ? 'here' : startId}
            onChange={(e) => {
              if (e.target.value !== 'here') {
                setHere(null);
                setStartId(e.target.value);
              }
            }}
          >
            {here && <option value="here">{t('plan.myLocation')}</option>}
            {starts.map((d) => (
              <option key={d.id} value={d.id}>
                {shortName(name(d))}
              </option>
            ))}
          </select>
          <button type="button" className="chip" onClick={useMyLocation} disabled={locating}>
            📍 {locating ? t('near.finding') : t('plan.useLocation')}
          </button>
        </label>

        <div className="planner-field" role="group" aria-label={t('plan.days')}>
          <span>{t('plan.days')}</span>
          <div className="chips">
            {[1, 2, 3, 4].map((n) => (
              <button key={n} type="button" className="chip" aria-pressed={days === n} onClick={() => setDays(n)}>
                {t('count.day', { n })}
              </button>
            ))}
          </div>
        </div>

        <div className="planner-field" role="group" aria-label={t('plan.likes')}>
          <span>{t('plan.likes')}</span>
          <div className="chips">
            {Object.keys(INTERESTS).map((key) => (
              <button
                key={key}
                type="button"
                className="chip"
                aria-pressed={interests.includes(key)}
                onClick={() => toggle(key)}
              >
                {t(`plan.interest.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <label className="planner-field">
          <span>{t('plan.month')}</span>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {monthName(m, lang)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {plan.places.length === 0 ? (
        <p className="empty">{t('plan.none')}</p>
      ) : (
        <>
          <div className="place-actions planner-actions">
            <button type="button" className="button button-primary" onClick={() => addMany(planIds)} disabled={saved}>
              {t(saved ? 'trip.allSaved' : 'trip.saveAll')}
            </button>
            <ShareButton title={t('plan.title')} url={tripLink(planIds)} label={t('trip.share')} />
          </div>
          <TripPlan
            key={planIds.join(',')}
            places={plan.places}
            keepOrder
            orderName="plan.fromStart"
            initialPerDay={Math.max(2, Math.ceil(plan.places.length / days))}
          />
          {plan.foods.length > 0 && (
            <Carousel title={t('plan.food')} subtitle={t('plan.foodSub')}>
              {plan.foods.map((f) => (
                <li key={f.id}>
                  <FoodCard food={f} />
                </li>
              ))}
            </Carousel>
          )}
          {plan.festivals.length > 0 && (
            <Carousel title={t('plan.festivals', { month: monthName(month, lang) })}>
              {plan.festivals.map((f) => (
                <li key={f.id}>
                  <FestivalCard festival={f} month={month} />
                </li>
              ))}
            </Carousel>
          )}
        </>
      )}
    </article>
  );
}
