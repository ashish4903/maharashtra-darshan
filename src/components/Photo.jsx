import { useState } from 'react';

/** A Wikimedia Commons photo, or a coloured panel with an icon when there is none. */
export default function Photo({ image, alt, icon, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  if (!image || failed) {
    return (
      <div className={`photo photo-empty ${className}`} aria-hidden="true">
        <span>{icon}</span>
      </div>
    );
  }
  return (
    <img
      className={`photo ${className}`}
      src={image.src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
