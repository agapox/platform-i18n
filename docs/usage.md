

# Usage Guide – @platform/i18n

Step-by-step guide to integrate and use `@platform/i18n` inside a microfrontend or shell application.

---

## Overview

`@platform/i18n` provides a shared contract and a browser-level event bus to synchronize language across applications.

It does NOT render translations. You must use your app’s translation engine (e.g., ngx-translate) and connect it to this library.

---

## Prerequisites

- The package `@platform/i18n` is installed in your project
- Your app has a translation engine (e.g., `@ngx-translate/core`)

---

## 1) Install the package

### Local install

```bash
npm i ../platform-i18n
```

### Private registry

```bash
npm i @platform/i18n
```

---

## 2) Import the API

```ts
import {
  AppLanguage,
  getStoredLanguage,
  onGlobalLanguageChange,
  setGlobalLanguage,
} from '@platform/i18n';
```

---

## 3) Initialize language on app start

Read the current language and apply it to your translation engine.

```ts
const lang = getStoredLanguage();
translateService.use(lang);
```

> Do this during app bootstrap or component initialization.

---

## 4) Listen to global language changes

Subscribe to language updates so your app reacts when another app (or the shell) changes the language.

```ts
const unsubscribe = onGlobalLanguageChange((lang) => {
  translateService.use(lang);
});
```

### Cleanup (important)

```ts
unsubscribe();
```

In Angular, call this in `ngOnDestroy`.

---

## 5) Change language from your UI

When the user selects a language, always use the library API:

```ts
setGlobalLanguage('en');
// or
setGlobalLanguage('es');
```

This will:
- persist the value in `localStorage`
- emit the global event
- update all listening applications

---

## 6) Angular + ngx-translate example (standalone)

```ts
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {
  AppLanguage,
  getStoredLanguage,
  onGlobalLanguageChange,
  setGlobalLanguage,
} from '@platform/i18n';

@Component({
  selector: 'app-root',
  template: `
    <select [formControl]="langControl">
      <option value="es">ES</option>
      <option value="en">EN</option>
    </select>

    <h1>{{ 'common.hello' | translate }}</h1>
  `,
})
export class AppComponent implements OnInit, OnDestroy {
  langControl = new FormControl<AppLanguage | null>(null);
  translate = inject(TranslateService);
  private unsubscribe?: () => void;

  ngOnInit() {
    const lang = getStoredLanguage();

    this.translate.use(lang);
    this.langControl.setValue(lang, { emitEvent: false });

    this.unsubscribe = onGlobalLanguageChange((newLang) => {
      this.translate.use(newLang);
      this.langControl.setValue(newLang, { emitEvent: false });
    });

    this.langControl.valueChanges.subscribe((lang) => {
      if (!lang) return;
      setGlobalLanguage(lang);
    });
  }

  ngOnDestroy() {
    this.unsubscribe?.();
  }
}
```

---

## 7) Provide translation files (ngx-translate)

Ensure your app serves translation files, for example:

```text
public/i18n/es.json
public/i18n/en.json
```

Example `es.json`:

```json
{
  "common": {
    "hello": "Hola"
  }
}
```

Example `en.json`:

```json
{
  "common": {
    "hello": "Hello"
  }
}
```

---

## 8) (Shell only) Initialize language before bootstrap

In the shell, initialize the global language before bootstrapping the app:

```ts
import { getStoredLanguage, setGlobalLanguage } from '@platform/i18n';

export function initLanguage() {
  const lang = getStoredLanguage();
  setGlobalLanguage(lang);
}
```

Call this before starting Angular.

---

## 9) Native Federation note

If your app uses Native Federation, add the package to `skip`:

```js
skip: ['@platform/i18n']
```

This prevents runtime resolution errors and ensures the package is bundled locally.

---

## 10) Expected behavior

- Language persists across reloads
- All applications update when language changes
- No app manages its own independent language state

---

## 11) Troubleshooting

### Language does not change

- Ensure `setGlobalLanguage()` is called
- Ensure subscription via `onGlobalLanguageChange()`
- Ensure translation files exist for the target language

### Language resets on reload

- Ensure `getStoredLanguage()` is used on init
- Ensure no other key is used in `localStorage`

### No reaction to events

- Ensure correct event name is used (via library)
- Ensure subscription happens after app init

---

## Summary

To integrate `@platform/i18n`:

1. Install the package
2. Initialize language with `getStoredLanguage()`
3. Apply it to your translation engine
4. Listen with `onGlobalLanguageChange()`
5. Change language with `setGlobalLanguage()`

This guarantees synchronization across all applications.