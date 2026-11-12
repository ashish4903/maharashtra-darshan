import { createContext } from 'react';
import { kindText, translate } from './i18n';

/** Current language. Provided by components/LanguageProvider.jsx. */
export const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, vars) => translate('en', key, vars),
  kind: (k, many) => kindText('en', k, many),
  name: (item) => item?.name,
  otherName: (item) => item?.nameMr,
});
