import { useEffect, useState } from 'react';

/**
 * The opening paragraph of the place's Wikipedia article, loaded when the page
 * opens. It is shown with a credit and a link, as Wikipedia's licence asks.
 * If it can't load (offline, blocked), the section is simply left out.
 */
export default function WikiSummary({ url }) {
  const [summary, setSummary] = useState({ url: null, text: null });
  const title = decodeURIComponent(url.split('/wiki/')[1] ?? '');

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => setSummary({ url, text: json?.extract ?? '' }))
      .catch(() => setSummary({ url, text: '' }));
    return () => controller.abort();
  }, [url, title]);

  if (summary.url !== url) return <p className="summary-loading">Loading the story from Wikipedia…</p>;
  if (!summary.text) return null;
  return (
    <section className="summary" aria-label="About this place">
      <p>{summary.text}</p>
      <p className="source-note">
        From{' '}
        <a href={url} target="_blank" rel="noreferrer">
          Wikipedia
        </a>
        , available under{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>
        .
      </p>
    </section>
  );
}
