import { useEffect, useRef } from 'react';

export default function SearchBox({ value, onChange }) {
  const input = useRef(null);

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
        Search
      </label>
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>
      <input
        ref={input}
        id="search"
        type="search"
        placeholder="Search a district, taluka, place or dish (English or मराठी)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        autoComplete="off"
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}
