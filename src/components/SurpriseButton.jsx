import { randomPlace } from '../lib/catalogue';
import useLang from '../lib/useLang';

export default function SurpriseButton() {
  const { t } = useLang();
  return (
    <button
      type="button"
      className="button button-ghost"
      onClick={() => {
        window.location.hash = `#/place/${randomPlace().id}`;
      }}
    >
      {t('hero.surprise')}
    </button>
  );
}
