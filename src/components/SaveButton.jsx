import useTrip from '../lib/useTrip';

export default function SaveButton({ place, withLabel = false }) {
  const { has, toggle } = useTrip();
  const saved = has(place.id);
  return (
    <button
      type="button"
      className={`save-button${saved ? ' is-saved' : ''}${withLabel ? ' with-label' : ''}`}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : saved ? `Remove ${place.name} from my trip` : `Save ${place.name} to my trip`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(place.id);
      }}
    >
      <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
      {withLabel && (saved ? ' Saved to my trip' : ' Save to my trip')}
    </button>
  );
}
