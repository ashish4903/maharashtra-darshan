import { randomPlace } from '../lib/catalogue';

export default function SurpriseButton() {
  return (
    <button
      type="button"
      className="button button-ghost"
      onClick={() => {
        window.location.hash = `#/place/${randomPlace().id}`;
      }}
    >
      🎲 Surprise me
    </button>
  );
}
