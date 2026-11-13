import useLang from '../lib/useLang';
import { suggestUrl } from '../lib/catalogue';

/** "Know a place we're missing?" with a link to the suggestion form. */
export default function SuggestLink({ districtId }) {
  const { t } = useLang();
  return (
    <p className="suggest-note">
      {t('suggest.prompt')}{' '}
      <a href={suggestUrl(districtId)} target="_blank" rel="noreferrer">
        {t('suggest.link')}
      </a>
    </p>
  );
}
