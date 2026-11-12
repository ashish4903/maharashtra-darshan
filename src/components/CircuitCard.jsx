import Photo from './Photo';
import { circuitPlaces, plural } from '../lib/catalogue';

export default function CircuitCard({ circuit }) {
  const stops = circuitPlaces(circuit);
  const cover = stops.find((p) => p.image)?.image;
  return (
    <a href={`#/circuit/${circuit.id}`} className="card circuit-card">
      <div className="card-media">
        <Photo image={cover} alt="" icon="🧭" />
        <span className="card-badge">
          <span aria-hidden="true">🧭</span> Circuit · {plural(stops.length, 'stop')}
        </span>
      </div>
      <div className="card-body">
        <h3 className="card-title">{circuit.name}</h3>
        <p className="card-mr" lang="mr">
          {circuit.nameMr}
        </p>
        <p className="card-text">{circuit.about}</p>
      </div>
    </a>
  );
}
