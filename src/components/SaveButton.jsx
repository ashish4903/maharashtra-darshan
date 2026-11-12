import useTrip from '../lib/useTrip';
import useLang from '../lib/useLang';

export default function SaveButton({ place, withLabel = false }) {
  const { has, toggle } = useTrip();
  const { t, name } = useLang();
  const saved = has(place.id);
  return (
    <button
      type="button"
      className={`save-button${saved ? ' is-saved' : ''}${withLabel ? ' with-label' : ''}`}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : t(saved ? 'card.unsave' : 'card.save', { name: name(place) })}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(place.id);
      }}
    >
      <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
      {withLabel && t(saved ? 'place.saved' : 'place.save')}
    </button>
  );
}
