import Banner from './Banner';
import TripPlan from './TripPlan';
import ShareButton from './ShareButton';
import useTrip from '../lib/useTrip';
import { circuitPlaces, getCircuit, plural } from '../lib/catalogue';

/** A themed circuit, planned like a trip (map, days, directions). */
export default function CircuitView({ circuitId }) {
  const circuit = getCircuit(circuitId);
  const stops = circuitPlaces(circuit);
  const { ids, addMany } = useTrip();
  const allSaved = stops.every((p) => ids.includes(p.id));

  return (
    <article className="level circuit-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <a href="#/">Maharashtra</a>
        <span aria-hidden="true"> › </span>
        <span aria-current="page">Circuits</span>
      </nav>
      <Banner
        image={stops.find((p) => p.image)?.image}
        icon="🧭"
        kicker={`Circuit · ${plural(stops.length, 'stop')}`}
        title={circuit.name}
        titleMr={circuit.nameMr}
      >
        <p className="banner-stats">{circuit.about}</p>
      </Banner>

      <div className="place-actions circuit-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={() => addMany(stops.map((p) => p.id))}
          disabled={allSaved}
        >
          {allSaved ? '✓ All in my trip' : '♥ Add all to my trip'}
        </button>
        <ShareButton title={circuit.name} />
        <a className="button button-ghost" href={circuit.source} target="_blank" rel="noreferrer">
          📖 Source on Wikipedia
        </a>
      </div>

      <TripPlan places={stops} keepOrder={circuit.ordered} givenLabel="As listed" />
    </article>
  );
}
