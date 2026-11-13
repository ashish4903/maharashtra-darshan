import { useEffect, useState } from 'react';

/**
 * The opening paragraph of a Wikipedia article, from its REST summary.
 * Returns { loading, text }; text is '' if it can't load (offline, blocked)
 * and nothing is fetched when there is no url.
 */
export default function useWikiSummary(url) {
  const [summary, setSummary] = useState({ url: null, text: null });
  const title = url ? decodeURIComponent(url.split('/wiki/')[1] ?? '') : '';

  useEffect(() => {
    if (!url) return undefined;
    const controller = new AbortController();
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setSummary({ url, text: json?.extract ?? '' }))
      .catch(() => setSummary({ url, text: '' }));
    return () => controller.abort();
  }, [url, title]);

  if (!url) return { loading: false, text: '' };
  return summary.url === url ? { loading: false, text: summary.text } : { loading: true, text: '' };
}
