import { useState } from 'react';
import { thumbAt } from '../lib/catalogue';

/**
 * A Wikimedia Commons photo, or a coloured panel with an icon when there is none.
 * `width` picks a smaller thumbnail for small slots (cards 500, thumbnails 250):
 * a 500px card photo is about a third of the 960px one.
 */
export default function Photo({ image, alt, icon, className = '', eager = false, width = 500 }) {
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
      src={thumbAt(image.src, width)}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
