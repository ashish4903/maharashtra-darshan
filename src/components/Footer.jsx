import { Fragment } from 'react';
import useLang from '../lib/useLang';
import { SUGGEST_URL, generated } from '../lib/catalogue';

const LINKS = {
  wikidata: ['https://www.wikidata.org/', 'Wikidata'],
  wikipedia: ['https://en.wikipedia.org/', 'Wikipedia'],
  commons: ['https://commons.wikimedia.org/', 'Wikimedia Commons'],
  naturalEarth: ['https://www.naturalearthdata.com/', 'Natural Earth'],
};

export default function Footer() {
  const { t } = useLang();
  // The sentence is translated as a whole; {placeholders} become links
  const parts = t('footer.data', { date: generated }).split(/\{(\w+)\}/);
  return (
    <footer className="site-footer">
      <p>
        {parts.map((part, i) =>
          i % 2 === 1 && LINKS[part] ? (
            <a key={i} href={LINKS[part][0]} target="_blank" rel="noreferrer">
              {LINKS[part][1]}
            </a>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          ),
        )}
      </p>
      <p>
        <a href="https://github.com/ashish4903/maharashtra-darshan" target="_blank" rel="noreferrer">
          {t('footer.code')}
        </a>{' '}
        ·{' '}
        <a href={SUGGEST_URL} target="_blank" rel="noreferrer">
          {t('footer.suggest')}
        </a>{' '}
        · {t('footer.licence')}
      </p>
    </footer>
  );
}
