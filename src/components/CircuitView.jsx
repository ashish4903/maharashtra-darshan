import Banner from './Banner';
import Breadcrumbs from './Breadcrumbs';
import TripPlan from './TripPlan';
import ShareButton from './ShareButton';
import useTrip from '../lib/useTrip';
import useLang from '../lib/useLang';
import { circuitPlaces, getCircuit } from '../lib/catalogue';

/** A themed circuit, planned like a trip (map, days, directions). */
export default function CircuitView({ circuitId }) {
  const { t, name, otherName } = useLang();
  const circuit = getCircuit(circuitId);
  const stops = circuitPlaces(circuit);
  const { ids, addMany } = useTrip();
  const allSaved = stops.every((p) => ids.includes(p.id));

  return (
    <article className="level circuit-page">
      <Breadcrumbs current={t('crumb.circuits')} />
      <Banner
        image={stops.find((p) => p.image)?.image}
        icon="🧭"
        kicker={t('circuit.kicker', { stops: t('count.stop', { n: stops.length }) })}
        title={name(circuit)}
        titleMr={otherName(circuit)}
      >
        <p className="banner-stats" lang="en">
          {circuit.about}
        </p>
      </Banner>

      <div className="place-actions circuit-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={() => addMany(stops.map((p) => p.id))}
          disabled={allSaved}
        >
          {t(allSaved ? 'circuit.allAdded' : 'circuit.addAll')}
        </button>
        <ShareButton title={name(circuit)} />
        <a className="button button-ghost" href={circuit.source} target="_blank" rel="noreferrer">
          {t('circuit.source')}
        </a>
      </div>

      <TripPlan places={stops} keepOrder={circuit.ordered} givenLabel="trip.asListed" />
    </article>
  );
}
