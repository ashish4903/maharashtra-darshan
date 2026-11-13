// Month names in the visitor's language, from the browser's own data (Intl).
export const monthName = (month, lang = 'en', style = 'long') =>
  new Intl.DateTimeFormat(lang === 'mr' ? 'mr-IN' : 'en-IN', { month: style }).format(new Date(2026, month - 1, 1));

export const currentMonth = () => new Date().getMonth() + 1;
