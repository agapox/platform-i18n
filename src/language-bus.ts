import {
  AppLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGE_CHANGED_EVENT,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from './i18n-contract';

export function getStoredLanguage(): AppLanguage {
  const value = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (value && SUPPORTED_LANGUAGES.includes(value as AppLanguage)) {
    return value as AppLanguage;
  }

  return DEFAULT_LANGUAGE;
}

export function setGlobalLanguage(lang: AppLanguage): void {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

  window.dispatchEvent(
    new CustomEvent(LANGUAGE_CHANGED_EVENT, {
      detail: lang,
    })
  );
}

export function onGlobalLanguageChange(
  callback: (lang: AppLanguage) => void
): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<AppLanguage>;
    callback(customEvent.detail);
  };

  window.addEventListener(LANGUAGE_CHANGED_EVENT, handler);

  return () => window.removeEventListener(LANGUAGE_CHANGED_EVENT, handler);
}