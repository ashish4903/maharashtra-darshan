import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

/** { lang, setLang, t, kind, name, otherName } */
export default function useLang() {
  return useContext(LanguageContext);
}
