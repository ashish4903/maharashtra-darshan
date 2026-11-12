import { useEffect, useRef } from 'react';
import useLang from '../lib/useLang';

export default function SearchBox({ value, onChange }) {
  const input = useRef(null);
  const { t } = useLang();

  // Press "/" anywhere to jump to the search box
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '')) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="search">
      <label htmlFor="search" className="visually-hidden">
        {t('search.label')}
      </label>
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>
      <input
        ref={input}
        id="search"
        type="search"
        placeholder={t('search.placeholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        autoComplete="off"
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label={t('search.clear')}>
          ×
        </button>
      )}
    </div>
  );
}
