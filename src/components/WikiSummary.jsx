import useLang from '../lib/useLang';
import useWikiSummary from '../lib/useWikiSummary';

/**
 * The opening paragraph of a Wikipedia article, with a credit and a link,
 * as Wikipedia's licence asks. Pass `summary` from useWikiSummary when the
 * page also needs the text (the place page reads it aloud); otherwise it
 * loads its own. If it couldn't load (offline, blocked), it is left out.
 */
export default function WikiSummary({ url, summary: given }) {
  const { t } = useLang();
  const own = useWikiSummary(given ? null : url);
  const summary = given ?? own;
  if (summary.loading) return <p className="summary-loading">{t('summary.loading')}</p>;
  if (!summary.text) return null;
  const [before, middle, after] = t('summary.from').split(/\{wikipedia\}|\{licence\}/);
  return (
    <section className="summary" aria-label={t('summary.label')}>
      <p lang="en">{summary.text}</p>
      <p className="source-note">
        {before}
        <a href={url} target="_blank" rel="noreferrer">
          Wikipedia
        </a>
        {middle}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
          CC BY-SA 4.0
        </a>
        {after}
      </p>
    </section>
  );
}
