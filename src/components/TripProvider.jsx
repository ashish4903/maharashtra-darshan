import { useCallback, useEffect, useMemo, useState } from 'react';
import { TripContext } from '../lib/TripContext';

// Saved places stay in this browser only. Nothing is sent anywhere.
const KEY = 'maharashtra-darshan-trip-v1';

function load() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function save(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked (private mode): the trip still works until the tab closes.
  }
}

export default function TripProvider({ children }) {
  const [ids, setIds] = useState(load);

  // Keep several open tabs in step
  useEffect(() => {
    const onStorage = (e) => e.key === KEY && setIds(load());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    save([]);
    setIds([]);
  }, []);

  const value = useMemo(() => ({ ids, has: (id) => ids.includes(id), toggle, clear }), [ids, toggle, clear]);
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}
