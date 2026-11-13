import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import useLang from '../lib/useLang';
import { RATES, getState, pause, pickVoice, resume, speak, speechSupported, stop, subscribe } from '../lib/speech';

// The listening speed is remembered in this browser only.
const RATE_KEY = 'maharashtra-darshan-rate-v1';

function savedRate() {
  try {
    const r = Number(localStorage.getItem(RATE_KEY));
    return RATES.includes(r) ? r : 1;
  } catch {
    return 1;
  }
}

/** The device's voices, which some browsers load a moment after the page. */
function useVoices() {
  const [voices, setVoices] = useState(() => (speechSupported() ? window.speechSynthesis.getVoices() : []));
  useEffect(() => {
    if (!speechSupported()) return undefined;
    const synth = window.speechSynthesis;
    const update = () => setVoices(synth.getVoices());
    synth.addEventListener?.('voiceschanged', update);
    return () => synth.removeEventListener?.('voiceschanged', update);
  }, []);
  return voices;
}

/**
 * 🔊 Listen: reads `script(lang)` aloud with the device's own voice, with
 * pause, stop and speed. Hidden where the browser can't speak.
 */
export default function ListenButton({ script, label, compact = false }) {
  const { t, lang } = useLang();
  const owner = useId();
  const player = useSyncExternalStore(subscribe, getState, getState);
  const voices = useVoices();
  const [rate, setRate] = useState(savedRate);
  const mine = player.owner === owner;

  // Stop reading when the page (or this day) goes away
  useEffect(() => () => getState().owner === owner && stop(), [owner]);

  if (!speechSupported()) return null;

  // No Marathi or Hindi voice on this device: read the English text instead
  const fallback = lang === 'mr' && voices.length > 0 && !pickVoice(voices, 'mr');
  const readIn = fallback ? 'en' : lang;

  const changeRate = (next) => {
    setRate(next);
    try {
      localStorage.setItem(RATE_KEY, String(next));
    } catch {
      // Storage blocked: the speed lasts until the tab closes
    }
    if (mine) speak(owner, script(readIn), next);
  };

  return (
    <div className={`listen${compact ? ' listen-compact' : ''}`}>
      {!mine ? (
        <button
          type="button"
          className={compact ? 'chip' : 'button button-ghost'}
          onClick={() => speak(owner, script(readIn), rate)}
          aria-label={label}
          title={label}
        >
          🔊 {t('listen.play')}
        </button>
      ) : (
        <>
          {player.status === 'paused' ? (
            <button type="button" className={compact ? 'chip' : 'button button-ghost'} onClick={resume}>
              ▶ {t('listen.resume')}
            </button>
          ) : (
            <button type="button" className={compact ? 'chip' : 'button button-ghost'} onClick={pause}>
              ⏸ {t('listen.pause')}
            </button>
          )}
          <button type="button" className={compact ? 'chip' : 'button button-ghost'} onClick={stop}>
            ⏹ {t('listen.stop')}
          </button>
          <label className="listen-rate">
            {t('listen.speed')}{' '}
            <select value={rate} onChange={(e) => changeRate(Number(e.target.value))}>
              {RATES.map((r) => (
                <option key={r} value={r}>
                  {r}×
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      {mine && fallback && <p className="listen-note">{t('listen.noMarathi')}</p>}
    </div>
  );
}
