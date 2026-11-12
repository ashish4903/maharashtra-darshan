import { useCallback, useEffect, useMemo, useState } from 'react';
import { LanguageContext } from '../lib/LanguageContext';
import { LANGUAGES, kindText, translate } from '../lib/i18n';

// The visitor's choice is remembered in this browser only.
const KEY = 'maharashtra-darshan-lang-v1';

function initialLanguage() {
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch {
    // Storage blocked: fall through to the browser's language
  }
  const preferred = (navigator.languages ?? [navigator.language]).map((l) => (l ?? '').slice(0, 2));
  return preferred.includes('mr') ? 'mr' : 'en';
}

export default function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate(lang, 'app.name');
  }, [lang]);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage blocked: the choice lasts until the tab closes
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      kind: (k, many) => kindText(lang, k, many),
      // Names in the chosen language, with the other one as a subtitle
      name: (item) => (lang === 'mr' && item?.nameMr ? item.nameMr : item?.name),
      otherName: (item) => (lang === 'mr' ? (item?.nameMr ? item.name : undefined) : item?.nameMr),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
