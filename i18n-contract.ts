export type AppLanguage = "es" | "en";

export const DEFAULT_LANGUAGE: AppLanguage = "es";

export const SUPPORTED_LANGUAGES: AppLanguage[] = ["es", "en"];

export const LANGUAGE_STORAGE_KEY = "platform-language";

export const LANGUAGE_CHANGED_EVENT = "platform:language-changed";
