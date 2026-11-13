import { useEffect, useState } from 'react';
import { galleryUrl, parseGallery } from './commons';

/**
 * Freely licensed photos from a Commons category: { loading, photos }.
 * Nothing is fetched without a category; photos is [] if it can't load.
 */
export default function useCommonsGallery(category, skipFile) {
  const [state, setState] = useState({ category: null, photos: [] });

  useEffect(() => {
    if (!category) return undefined;
    const controller = new AbortController();
    fetch(galleryUrl(category), { signal: controller.signal, referrerPolicy: 'no-referrer' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setState({ category, photos: parseGallery(json, { skipFile }) }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ category, photos: [] });
      });
    return () => controller.abort();
  }, [category, skipFile]);

  if (!category) return { loading: false, photos: [] };
  return state.category === category ? { loading: false, photos: state.photos } : { loading: true, photos: [] };
}
