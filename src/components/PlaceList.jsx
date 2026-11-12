import { useState } from 'react';
import KindFilter from './KindFilter';
import PlaceCard from './PlaceCard';
import EmptyState from './EmptyState';
import { countKinds } from '../lib/catalogue';

export default function PlaceList({ places, showDistrict = false }) {
  const [kind, setKind] = useState(null);
  if (places.length === 0) return <EmptyState what="places" />;
  const shown = kind ? places.filter((p) => p.kind === kind) : places;
  return (
    <>
      <KindFilter counts={countKinds(places)} active={kind} onChange={setKind} />
      <ul className="card-grid">
        {shown.map((p) => (
          <li key={p.id}>
            <PlaceCard place={p} showDistrict={showDistrict} />
          </li>
        ))}
      </ul>
    </>
  );
}
