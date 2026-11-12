import { generated } from '../lib/catalogue';

export default function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Districts, talukas, names and descriptions come from{' '}
        <a href="https://www.wikidata.org/" target="_blank" rel="noreferrer">
          Wikidata
        </a>{' '}
        (CC0). Every place and dish links to its{' '}
        <a href="https://en.wikipedia.org/" target="_blank" rel="noreferrer">
          Wikipedia
        </a>{' '}
        article. Data updated {generated}.
      </p>
      <p>
        <a href="https://github.com/ashish4903/maharashtra-darshan" target="_blank" rel="noreferrer">
          Source code
        </a>{' '}
        · MIT licence
      </p>
    </footer>
  );
}
