import { useState } from 'react';
import { districts, getRegion, placesIn, plural, regions, shortName, places } from '../lib/catalogue';
import { MAP_HEIGHT, MAP_WIDTH, outlinePath, project } from '../lib/geo';

/**
 * Interactive map: one bubble per district (coloured by region) and a dot per
 * place. Hover or focus a bubble to see its details; select it to open the
 * district. `region`, `district` and `place` highlight part of the map;
 * `route` (places in order) draws a numbered trip.
 */
export default function MaharashtraMap({ region, district, place, route, label = 'Map of Maharashtra' }) {
  const [hover, setHover] = useState(null);
  const [legendRegion, setLegendRegion] = useState(null);
  const activeRegion = legendRegion ?? region;
  const stops = (route ?? []).filter((p) => p.coords);

  const isDim = (d) =>
    stops.length > 0 && !legendRegion
      ? true
      : district
        ? d.id !== district
        : activeRegion
          ? d.region !== activeRegion
          : false;
  const info = hover ?? (district && districts.find((d) => d.id === district));
  const focusPlace = place && places.find((p) => p.id === place);

  return (
    <figure className="map">
      <div className="map-frame">
        <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="group" aria-label={label}>
          <path d={outlinePath} className="map-land" />

          {places
            .filter((p) => p.coords && p.id !== place)
            .map((p) => {
              const [x, y] = project(p.coords);
              const dim = district ? p.district !== district : activeRegion ? p.region !== activeRegion : false;
              return <circle key={p.id} cx={x} cy={y} r="2.6" className={`map-place${dim ? ' is-dim' : ''}`} />;
            })}

          {districts
            .filter((d) => d.coords)
            .map((d) => {
              const [x, y] = project(d.coords);
              const count = placesIn({ district: d.id }).length;
              const r = 9 + Math.min(count, 12) * 0.9;
              return (
                <a
                  key={d.id}
                  href={`#/district/${d.id}`}
                  aria-label={`${d.name}, ${getRegion(d.region).name}: ${plural(count, 'place')}`}
                  className={`map-district region-${d.region}${isDim(d) ? ' is-dim' : ''}${d.id === district ? ' is-active' : ''}`}
                  onMouseEnter={() => setHover(d)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(d)}
                  onBlur={() => setHover(null)}
                >
                  <circle cx={x} cy={y} r={r} />
                  {d.id === district || hover?.id === d.id ? (
                    <text x={x} y={y - r - 6} textAnchor="middle" className="map-label">
                      {shortName(d.name)}
                    </text>
                  ) : null}
                </a>
              );
            })}

          {stops.length > 1 && (
            <polyline className="map-route" points={stops.map((p) => project(p.coords).join(',')).join(' ')} />
          )}
          {stops.map((p, i) => {
            const [x, y] = project(p.coords);
            return (
              <a key={p.id} href={`#/place/${p.id}`} className="map-stop" aria-label={`Stop ${i + 1}: ${p.name}`}>
                <circle cx={x} cy={y} r="11" />
                <text x={x} y={y + 4} textAnchor="middle">
                  {i + 1}
                </text>
              </a>
            );
          })}

          {focusPlace?.coords &&
            (() => {
              const [x, y] = project(focusPlace.coords);
              return (
                <g className="map-focus">
                  <circle cx={x} cy={y} r="16" className="map-focus-ring" />
                  <circle cx={x} cy={y} r="6" className="map-focus-dot" />
                </g>
              );
            })()}
        </svg>

        <div className="map-info" aria-live="polite">
          {info ? (
            <>
              <strong>{shortName(info.name)}</strong>
              <span>
                {getRegion(info.region).name} · {plural(placesIn({ district: info.id }).length, 'place')} ·{' '}
                {plural(info.talukas.length, 'taluka')}
              </span>
            </>
          ) : (
            <span>Tap a circle to open a district</span>
          )}
        </div>
      </div>

      <figcaption className="map-legend">
        {regions.map((r) => (
          <a
            key={r.id}
            href={`#/region/${r.id}`}
            className={`legend-item region-${r.id}${r.id === activeRegion ? ' is-active' : ''}`}
            onMouseEnter={() => setLegendRegion(r.id)}
            onMouseLeave={() => setLegendRegion(null)}
            onFocus={() => setLegendRegion(r.id)}
            onBlur={() => setLegendRegion(null)}
          >
            <span className="legend-swatch" aria-hidden="true" />
            {r.name}
          </a>
        ))}
      </figcaption>
    </figure>
  );
}
