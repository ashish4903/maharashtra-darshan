import { useEffect, useState } from 'react';
import Banner from './Banner';
import Breadcrumbs from './Breadcrumbs';
import MaharashtraMap from './MaharashtraMap';
import ListenButton from './ListenButton';
import Photo from './Photo';
import ShareButton from './ShareButton';
import TripPlan from './TripPlan';
import useLang from '../lib/useLang';
import useTrip from '../lib/useTrip';
import { KINDS, getDistrict, getTrail, shortName, trailStops } from '../lib/catalogue';
import { toHash } from '../lib/route';

const PLAY_MS = 7000;

/** The trail's text in a language (Marathi falls back to English). */
const say = (stop, lang, field) => (lang === 'mr' && stop[`${field}Mr`]) || stop[field];
const nameIn = (item, lang) => (lang === 'mr' && item.nameMr) || item.name;

/**
 * A history trail: move through time with the slider (or play it), and the
 * map draws the story up to the current stop. Each event cites its source.
 * The current stop is kept in the URL (#/trail/<id>/<n>) so it can be shared.
 */
export default function TrailView({ trailId, stop: startAt }) {
  const { t, lang, name, otherName } = useLang();
  const trail = getTrail(trailId);
  const stops = trailStops(trail);
  const last = stops.length - 1;
  const [at, setAt] = useState(() => Math.min(Math.max((startAt ?? 1) - 1, 0), last));
  const [playing, setPlaying] = useState(false);
  const { ids, addMany } = useTrip();
  const allSaved = stops.every((s) => ids.includes(s.place.id));

  // Keep the stop in the address without reloading the page
  useEffect(() => {
    window.history.replaceState(null, '', toHash({ view: 'trail', id: trail.id, stop: at + 1 }));
  }, [trail.id, at]);

  // Play: move to the next stop every few seconds; it stops at the end
  const isPlaying = playing && at < last;
  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = setTimeout(() => setAt((i) => Math.min(i + 1, last)), PLAY_MS);
    return () => clearTimeout(timer);
  }, [isPlaying, at, last]);

  const go = (i) => {
    setPlaying(false);
    setAt(Math.min(Math.max(i, 0), last));
  };

  const current = stops[at];
  const place = current.place;
  const district = getDistrict(place.district);
  const script = (l) => [
    { lang: l, text: `${say(current, l, 'when')}. ${nameIn(place, l)}. ${say(current, l, 'event')}` },
  ];

  return (
    <article className="level trail-page">
      <Breadcrumbs current={t('trail.crumb')} />
      <Banner
        image={stops.find((s) => s.place.image)?.place.image}
        icon={trail.icon}
        kicker={t('trail.kicker', { stops: t('count.stop', { n: stops.length }) })}
        title={name(trail)}
        titleMr={otherName(trail)}
      >
        <p className="banner-stats">{say(trail, lang, 'about')}</p>
      </Banner>

      <div className="place-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={() => addMany(stops.map((s) => s.place.id))}
          disabled={allSaved}
        >
          {t(allSaved ? 'circuit.allAdded' : 'circuit.addAll')}
        </button>
        <ShareButton title={name(trail)} />
      </div>

      <section className="trail-player level-layout" aria-label={t('trail.player')}>
        <div className="level-main">
          <div className="trail-now" aria-live="polite">
            <Photo image={place.image} alt="" icon={KINDS[place.kind]?.icon ?? trail.icon} className="trail-photo" />
            <div className="trail-now-text">
              <p className="trail-when">{say(current, lang, 'when')}</p>
              <h2 className="trail-place">
                <a href={`#/place/${place.id}`}>{name(place)}</a>
              </h2>
              {district && <p className="muted trail-district">{shortName(name(district))}</p>}
              <p className="trail-event">{say(current, lang, 'event')}</p>
              <p className="source-note">
                {t('trail.source')}{' '}
                {current.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ', '}
                    <a href={s.url} target="_blank" rel="noreferrer" lang="en">
                      Wikipedia: {s.title}
                    </a>
                  </span>
                ))}
              </p>
            </div>
          </div>

          <div className="trail-controls">
            <button type="button" className="chip" onClick={() => go(at - 1)} disabled={at === 0}>
              {t('trail.prev')}
            </button>
            <button
              type="button"
              className="chip trail-play"
              onClick={() => {
                if (isPlaying) return setPlaying(false);
                if (at >= last) setAt(0);
                return setPlaying(true);
              }}
            >
              {t(isPlaying ? 'trail.pause' : 'trail.play')}
            </button>
            <button type="button" className="chip" onClick={() => go(at + 1)} disabled={at === last}>
              {t('trail.next')}
            </button>
            <ListenButton key={at} compact script={script} label={t('trail.listenLabel', { name: name(place) })} />
          </div>

          <label className="trail-slider">
            <span className="visually-hidden">{t('trail.slider')}</span>
            <input
              type="range"
              min="0"
              max={last}
              step="1"
              value={at}
              onChange={(e) => go(Number(e.target.value))}
              aria-valuetext={`${say(current, lang, 'when')}: ${name(place)}`}
            />
          </label>
          <p className="trail-step muted">
            {t('trail.step', { n: at + 1, total: stops.length })} · {say(stops[0], lang, 'when')} →{' '}
            {say(stops[last], lang, 'when')}
          </p>
        </div>
        <aside className="level-aside">
          <MaharashtraMap
            route={stops.slice(0, at + 1).map((s) => s.place)}
            place={place.id}
            label={t('trail.mapLabel', { name: name(place) })}
          />
        </aside>
      </section>

      <section className="trail-timeline" aria-labelledby="trail-timeline">
        <h2 id="trail-timeline">{t('trail.timeline')}</h2>
        <ol>
          {stops.map((s, i) => (
            <li key={s.place.id} className={i === at ? 'is-current' : i < at ? 'is-past' : undefined}>
              <button type="button" onClick={() => go(i)} aria-current={i === at ? 'step' : undefined}>
                <span className="trail-when">{say(s, lang, 'when')}</span>
                <strong>{name(s.place)}</strong>
                <span className="trail-event-short">{say(s, lang, 'event')}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="source-note">
          {t('trail.sourceNote')}{' '}
          <a href={trail.source} target="_blank" rel="noreferrer">
            {t('circuit.source')}
          </a>
        </p>
      </section>

      <section className="trail-visit" aria-labelledby="trail-visit">
        <h2 id="trail-visit">{t('trail.visit')}</h2>
        <p className="muted">{t('trail.visitNote')}</p>
        <TripPlan places={stops.map((s) => s.place)} orderName="trail.timeOrder" />
      </section>
    </article>
  );
}
