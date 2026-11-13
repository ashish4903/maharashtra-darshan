import { useCallback, useEffect, useRef, useState } from 'react';
import useLang from '../lib/useLang';

/**
 * A horizontal, swipeable row of cards with arrow buttons on wider screens.
 * The arrows only show when the row has more cards than fit, and each one is
 * turned off at its end of the row.
 */
export default function Carousel({ title, subtitle, children }) {
  const { t } = useLang();
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // A pixel or two of slack: scroll positions can be fractional
    const start = el.scrollLeft <= 1;
    const end = el.scrollLeft >= max - 1;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [measure]);

  // The cards can change (language, month, a different place)
  useEffect(measure, [children, measure]);

  const scroll = (direction) => {
    const el = track.current;
    el?.scrollBy?.({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };
  const fits = edges.start && edges.end;

  return (
    <section className="carousel" aria-label={title}>
      <div className="carousel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        {!fits && (
          <div className="carousel-arrows">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={edges.start}
              aria-label={t('carousel.back', { title })}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={edges.end}
              aria-label={t('carousel.forward', { title })}
            >
              ›
            </button>
          </div>
        )}
      </div>
      <ul className="carousel-track" ref={track}>
        {children}
      </ul>
    </section>
  );
}
