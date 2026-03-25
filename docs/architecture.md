

# Architecture – @platform/i18n

## Overview

`@platform/i18n` is a platform-level library that defines a **global language contract** and a **browser-based synchronization mechanism** for applications (shell and microfrontends).

It is **framework-agnostic** and relies on browser primitives to coordinate state across independently deployed apps.

---

## Problem Statement

In a microfrontend architecture, multiple applications can coexist on the same page:

- Shell (host)
- Modern MFEs (e.g., Angular 21 via federation)
- Legacy MFEs (e.g., Angular 13 as web components)

Challenges:

- Each app has its own runtime and dependency injector
- Sharing framework services (e.g., Angular DI singletons) is not reliable across runtimes
- Language must remain consistent across all apps
- Language changes must propagate instantly without tight coupling

---

## Design Goals

- **Single source of truth** for language state
- **Loose coupling** between applications
- **Framework independence** (Angular, React, legacy)
- **Deterministic synchronization** across apps
- **Persistence** across reloads
- **Minimal runtime overhead**

---

## Non-Goals

- Rendering translations
- Managing translation catalogs
- Enforcing a specific i18n library (e.g., ngx-translate)
- Sharing framework services across apps

---

## Core Concepts

### 1) Language Contract

A shared, typed contract used by all applications:

```ts
type AppLanguage = 'es' | 'en';
```

Constants:

- `DEFAULT_LANGUAGE`
- `SUPPORTED_LANGUAGES`
- `LANGUAGE_STORAGE_KEY`
- `LANGUAGE_CHANGED_EVENT`

This ensures all apps agree on:

- valid languages
- storage key
- event name

---

### 2) Browser-Level State

Language state is stored in:

```text
localStorage
```

Key:

```text
platform-language
```

Rationale:

- Shared across all apps in the same origin
- Survives page reloads
- Simple and deterministic

---

### 3) Event-Based Synchronization

Language changes are propagated via:

```text
window.dispatchEvent(new CustomEvent(...))
```

Event name:

```text
platform:language-changed
```

Rationale:

- Works across independent runtimes
- No direct coupling between apps
- Immediate propagation

---

## Architecture Diagram (Conceptual)

```text
           ┌─────────────────────────┐
           │        Shell            │
           │  setGlobalLanguage()    │
           └────────────┬────────────┘
                        │
                        ▼
        localStorage + CustomEvent (browser)
                        │
        ┌───────────────┼───────────────┐
        ▼                               ▼
┌──────────────────┐         ┌──────────────────┐
│   MFE Angular 21 │         │   MFE Angular 13 │
│ onGlobalLanguage │         │ onGlobalLanguage │
│ translate.use()  │         │ translate.use()  │
└──────────────────┘         └──────────────────┘
```

---

## Runtime Flow

### Initialization

1. App starts
2. Reads language from `localStorage`
3. Applies it to its translation engine

```ts
const lang = getStoredLanguage();
translateService.use(lang);
```

---

### Language Change

1. User selects a language
2. App calls:

```ts
setGlobalLanguage(lang);
```

3. Library:
   - updates `localStorage`
   - emits `platform:language-changed`

4. All apps listening:

```ts
onGlobalLanguageChange((lang) => {
  translateService.use(lang);
});
```

---

### Synchronization Guarantee

All applications:

- observe the same event
- read/write the same storage key
- follow the same contract

Result:

- consistent language across the page

---

## Integration Strategy

### With Angular (ngx-translate)

Each app:

- owns its own `TranslateService`
- maps global language → local translation engine

```ts
translateService.use(getStoredLanguage());

onGlobalLanguageChange((lang) => {
  translateService.use(lang);
});
```

---

### With Microfrontends

- Shell initializes language
- MFEs subscribe to changes
- Any app can trigger a change

Key rule:

> State is shared at the browser level, not via framework DI

---

## Federation Considerations

When using Native Federation:

```js
skip: ['@platform/i18n']
```

Rationale:

- Avoid runtime resolution issues
- Keep the package bundled locally in each app
- Prevent unnecessary cross-app coupling

---

## Trade-offs

### Pros

- Simple and predictable
- Works across frameworks and versions
- No shared runtime dependency
- Easy to debug (localStorage + events)

### Cons

- Requires discipline (must follow contract)
- No centralized enforcement at runtime
- Event-based (no strong typing across boundaries)

---

## Alternatives Considered

### Shared Angular Service

Rejected because:

- Does not work across multiple Angular runtimes
- Breaks with web components / legacy apps

### Global State Library (e.g., Redux)

Rejected because:

- Adds unnecessary complexity
- Requires shared runtime
- Hard to integrate across heterogeneous MFEs

### URL-based Language (query params)

Rejected because:

- Not reactive
- Requires routing coordination
- Poor UX for dynamic changes

---

## Best Practices

- Always use library APIs (never bypass them)
- Initialize language before app bootstrap (shell)
- Clean up event listeners
- Keep translation catalogs aligned with supported languages

---

## Future Enhancements

Potential improvements:

- BroadcastChannel support (multi-tab sync)
- Language detection (browser / user profile)
- Namespaced translations
- Remote config for supported languages

---

## Summary

`@platform/i18n` provides a **lightweight, robust, and framework-agnostic** solution for language synchronization in microfrontend architectures.

It ensures consistency by:

- defining a shared contract
- persisting state in the browser
- broadcasting changes via events

while keeping applications **decoupled and independently deployable**.