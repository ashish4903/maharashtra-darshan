import { useRef } from 'react';

/** A horizontal, swipeable row of cards with arrow buttons on wider screens. */
export default function Carousel({ title, subtitle, children }) {
  const track = useRef(null);
  const scroll = (direction) => {
    const el = track.current;
    el?.scrollBy?.({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="carousel" aria-label={title}>
      <div className="carousel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        <div className="carousel-arrows">
          <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} back`}>
            ‹
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} forward`}>
            ›
          </button>
        </div>
      </div>
      <ul className="carousel-track" ref={track}>
        {children}
      </ul>
    </section>
  );
}
