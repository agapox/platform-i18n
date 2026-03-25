

# AI Guidelines – @platform/i18n

## Purpose

This document provides strict guidelines for AI tools (GitHub Copilot, Claude, Codex, etc.) when generating or modifying code that uses `@platform/i18n`.

This library is the **single source of truth for language state** across applications.

---

## Core Principles

- Language state is **global and shared across applications**
- Language synchronization is handled at the **browser level**, not framework level
- Each application maintains its own translation engine (e.g. ngx-translate)
- This library must be used as the **only mechanism** for language state

---

## Mandatory Rules

### ALWAYS

- Use `getStoredLanguage()` to read the current language
- Use `setGlobalLanguage()` to change the language
- Use `onGlobalLanguageChange()` to react to language updates
- Keep all language logic aligned with this contract

### NEVER

- Access `localStorage` directly for language
- Dispatch custom events manually
- Use different storage keys
- Use different event names
- Hardcode language state outside this library

---

## Language Contract

```ts
type AppLanguage = 'es' | 'en';
```

Storage key:

```ts
platform-language
```

Event name:

```ts
platform:language-changed
```

---

## Correct Usage Patterns

### Initialization

```ts
const lang = getStoredLanguage();
translateService.use(lang);
```

---

### React to Language Changes

```ts
onGlobalLanguageChange((lang) => {
  translateService.use(lang);
});
```

---

### Change Language

```ts
setGlobalLanguage('en');
```

---

## Angular Integration Example

```ts
ngOnInit() {
  const lang = getStoredLanguage();

  this.translate.use(lang);

  this.unsubscribe = onGlobalLanguageChange((newLang) => {
    this.translate.use(newLang);
  });
}
```

---

## Anti-Patterns (DO NOT GENERATE)

### ❌ Direct localStorage access

```ts
localStorage.setItem('app-language', 'en');
```

### ❌ Custom event dispatching

```ts
window.dispatchEvent(new CustomEvent('language-changed', { detail: 'en' }));
```

### ❌ Local-only language change

```ts
this.translate.use('en');
```

---

## Federation Rule

When using Native Federation:

```js
skip: ['@platform/i18n']
```

This library must NOT be shared via federation runtime.

---

## Expected Behavior

- All applications must stay synchronized when language changes
- Language must persist across reloads
- No duplicated state management should exist

---

## Architecture Notes

- This library is framework-agnostic
- It works across Angular, legacy apps, and web components
- It relies on browser primitives: `localStorage` and `CustomEvent`

---

## Summary

`@platform/i18n` is the ONLY allowed mechanism for language synchronization.

All generated code must respect this contract strictly.