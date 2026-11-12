import useLang from '../lib/useLang';

const CONTRIBUTE = 'https://github.com/ashish4903/maharashtra-darshan#adding-a-place-or-dish';

export default function EmptyState({ what }) {
  const { t } = useLang();
  return (
    <p className="empty">
      {t(what === 'dishes' ? 'empty.dishes' : 'empty.places')}{' '}
      <a href={CONTRIBUTE} target="_blank" rel="noreferrer">
        {t('empty.suggest')}
      </a>
      .
    </p>
  );
}
