# @platform/i18n

Librería compartida para manejo global de idioma en una arquitectura de microfrontends.

## Contenido de la documentación

- [Información de la librería](#información-de-la-librería)
- [Uso de la librería](#uso-de-la-librería)

## Información de la librería

### Propósito

`@platform/i18n` centraliza el contrato y la sincronización del idioma entre múltiples aplicaciones en una misma página o ecosistema.

La librería permite:

- definir un idioma global
- persistir el idioma actual
- emitir cambios de idioma a nivel browser
- escuchar cambios de idioma desde cualquier aplicación

> Esta librería **no renderiza traducciones** ni reemplaza otras librerías para el manejo de traducciones como `ngx-translate`.
> Su responsabilidad es proveer el **contrato compartido** y el **bus global de idioma**.

---

### Casos de uso

Esta librería está pensada para escenarios como:

- múltiples aplicaciones que deben reaccionar al mismo cambio de idioma
- sistemas donde el idioma es una preocupación transversal de plataforma

---

### Alcance

`@platform/i18n` resuelve:

- persistencia del idioma actual
- idioma por defecto
- idiomas soportados
- persistencia del idioma en `localStorage`
- evento global de cambio de idioma
- sincronización entre apps
- desacoplamiento

`@platform/i18n` no resuelve:

- carga de archivos de traducción
- renderizado de textos
- integración automática con Angular, React o Vue
- definición de catálogos i18n

> Eso lo resuelve cada app consumidora.

---

### Estructura del paquete

```text
platform-i18n/
  src/
    i18n-contract.ts
    language-bus.ts
    index.ts
  dist/
  package.json
  tsconfig.json
  .nvmrc
```

### Estructura del build

```text
dist/
  index.js
  index.d.ts
  i18n-contract.js
  i18n-contract.d.ts
  language-bus.js
  language-bus.d.ts
```

## Uso de la librería

### Uso de `@platform/i18n` en un microfrontend

Guía paso a paso para integrar la librería `@platform/i18n` en un microfrontend.

### Objetivo

Este documento explica cómo:

- instalar `@platform/i18n`
- inicializar el idioma actual
- escuchar cambios globales de idioma
- cambiar idioma desde el microfrontend
- integrarlo con un motor de traducción como `ngx-translate`

---

### Cuándo usar esta librería

Usa `@platform/i18n` cuando tu microfrontend necesite:

- compartir el idioma con un shell u otros MFEs
- reaccionar a cambios globales de idioma
- persistir el idioma actual
- mantener un contrato común de idiomas soportados

---

### Qué hace la librería

La librería provee:

- `getStoredLanguage()`
- `setGlobalLanguage()`
- `onGlobalLanguageChange()`
- tipos y constantes compartidas de idioma

No renderiza traducciones por sí sola.  
Para eso debes integrarla con el motor de traducción de tu app, por ejemplo `ngx-translate`.

---

### Paso 1. Instalar la librería

Instala `@platform/i18n` en tu microfrontend.

#### Instalación local

```bash
npm i ../platform-i18n
```

### Paso 2. Importar la API del paquete

En el archivo donde manejarás el idioma, importa lo necesario:

```typescript
import {
  AppLanguage,
  getStoredLanguage,
  onGlobalLanguageChange,
  setGlobalLanguage,
} from '@platform/i18n';
```

### Paso 3. Leer el idioma inicial

Cuando tu microfrontend arranque, lee el idioma actual:

```typescript
const lang = getStoredLanguage();
```

Esto devuelve:
-	el idioma guardado en localStorage, si es válido
- o el idioma por defecto definido por la plataforma

### Paso 4. Aplicar el idioma en tu microfrontend

Si usas un motor de traducción, aplícalo al iniciar la app.

Ejemplo con ngx-translate:

```typescript
const lang = getStoredLanguage();
translateService.use(lang);
```

### Paso 5. Escuchar cambios globales de idioma

Suscribe tu microfrontend a cambios de idioma global:

```typescript
const unsubscribe = onGlobalLanguageChange((newLang) => {
  translateService.use(newLang);
});
```

Esto permite que el microfrontend se actualice automáticamente cuando:
- el shell cambie idioma
- otro microfrontend cambie idioma
- cualquier app emita el evento global correcto

### Paso 6. Limpiar la suscripción

Cuando tu componente o aplicación se destruya, elimina el listener:

```typescript
unsubscribe();
```

Si estás en Angular, esto normalmente va en ngOnDestroy.

### Paso 7. Cambiar idioma desde el microfrontend

Si tu microfrontend tiene un selector de idioma, usa siempre:

```typescript
// en o es según sea el caso
setGlobalLanguage('en');
```

Esto hace 2 cosas:
- guarda el idioma en localStorage
- emite el evento global de cambio

### Paso 8. No cambies idioma manualmente fuera del contrato

No hagas esto:

```typescript
localStorage.setItem('app-language', 'en');
window.dispatchEvent(new CustomEvent('language-changed', { detail: 'en' }));
```

Eso rompe el contrato de plataforma.

Debes usar siempre:

```typescript
import { setGlobalLanguage } from '@platform/i18n';

// Método que viene importado de nuestra librería
setGlobalLanguage(lang);
```

### Paso 9. Integración recomendada con Angular + ngx-translate

Ejemplo completo


```typescript
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
  template: '',
})
export class AppComponent implements OnInit, OnDestroy {
  langControl = new FormControl<AppLanguage | null>(null);
  translateService = inject(TranslateService);
  private removeLanguageListener?: () => void;

  ngOnInit() {
    const lang = getStoredLanguage();

    this.translateService.use(lang);
    this.langControl.setValue(lang, { emitEvent: false });

    this.removeLanguageListener = onGlobalLanguageChange((newLang) => {
      this.translateService.use(newLang);
      this.langControl.setValue(newLang, { emitEvent: false });
    });

    this.langControl.valueChanges.subscribe((lang) => {
      if (!lang) return;
      setGlobalLanguage(lang);
    });
  }

  ngOnDestroy() {
    this.removeLanguageListener?.();
  }
}
```