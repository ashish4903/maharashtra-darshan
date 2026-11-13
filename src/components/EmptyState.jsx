import useLang from '../lib/useLang';
import { suggestUrl } from '../lib/catalogue';

export default function EmptyState({ what, districtId }) {
  const { t } = useLang();
  return (
    <p className="empty">
      {t(what === 'dishes' ? 'empty.dishes' : 'empty.places')}{' '}
      <a href={suggestUrl(districtId)} target="_blank" rel="noreferrer">
        {t('empty.suggest')}
      </a>
      .
    </p>
  );
}
