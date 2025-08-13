# Boxels CLI (`box`)

La **CLI de Boxels**, invocable con el comando `box`, es una herramienta de línea de comandos diseñada para facilitar el desarrollo, construcción y manejo de proyectos frontend con **Boxels**, un framework basado en [Vite](https://vitejs.dev/).

---

## 🔗 Relación con Boxels

Este paquete proporciona la CLI oficial de [Boxels](https://github.com/kkokotero/boxels). Úsala para crear, construir, testear y configurar tus proyectos de manera sencilla.

## Instalación

Puedes instalar la CLI globalmente o como dependencia de desarrollo en tu proyecto.

### Opción 1: Uso global (recomendado)

Instala el paquete de manera global para poder usar el comando `box` desde cualquier lugar:

```bash
npm install -g boxels-config
```

Luego simplemente ejecuta:

```bash
box serve
```

---

### Opción 2: Uso local (por proyecto)

También puedes instalar la CLI como una dependencia de desarrollo:

```bash
npm install --save-dev boxels-config
```

Y agregar un script en tu `package.json` para facilitar su uso:

```json
"scripts": {
  "dev": "box serve",
  "build": "box build",
  "test": "box test"
}
```

Después puedes ejecutar los comandos así:

```bash
npm run dev
npm run build
npm run test
```

---

### Requisitos

- Node.js v18 o superior
- NPM v7 o superior

## ¿Qué puedes hacer con `box`?

| Comando                   | Descripción                                                           |
| ------------------------- | --------------------------------------------------------------------- |
| `box serve`               | Inicia un servidor de desarrollo con recarga en caliente.             |
| `box build`               | Compila el proyecto para producción.                                  |
| `box preview`             | Sirve la aplicación construida para pruebas locales.                  |
| `box share`               | Sirve públicamente la build de producción.                            |
| `box test`                | Ejecuta pruebas con soporte para `Vitest` + entorno DOM.              |
| `box integrate:capacitor` | Integra Capacitor al proyecto y añade plataformas como Android o iOS. |
| `box integrate:electron`  | Integra Electron al proyecto para empaquetar apps de escritorio.      |
| `box new`                 | Crea un nuevo proyecto Boxels. _(Actualmente deshabilitado)_          |
| `box --help`              | Muestra la ayuda general y los comandos disponibles.                  |

---

### `box integrate:capacitor`

Integra **Capacitor** en el proyecto actual, permitiéndote crear aplicaciones móviles con tu código web.

```bash
box integrate:capacitor --app-name "MiApp" --app-id "com.ejemplo.miapp" --platforms android,ios
```

**Opciones:**

- `--app-name <nombre>` → Nombre de la aplicación.
- `--app-id <id>` → Identificador único en formato reverso de dominio (ej. `com.ejemplo.app`).
- `--platforms <lista>` → Plataformas a añadir separadas por comas (`android`, `ios`).

**Qué hace este comando:**

1. Instala las dependencias de Capacitor.
2. Inicializa Capacitor en tu proyecto.
3. Añade las plataformas indicadas.
4. Sincroniza tu código con Capacitor.
5. Actualiza tu `package.json` con scripts útiles (`cap sync`, `cap open android`, etc.).

---

### `box integrate:electron`

Integra **Electron** al proyecto para empaquetarlo como aplicación de escritorio.

```bash
box integrate:electron --app-name "MiApp" --app-id "com.ejemplo.miapp"
```

**Opciones:**

- `--app-name <nombre>` → Nombre de la aplicación de escritorio.
- `--app-id <id>` → Identificador único de la app.

**Qué hace este comando:**

1. Instala las dependencias necesarias para Electron.
2. Genera un archivo de entrada (`main.js` o `main.ts`) con la configuración básica.
3. Añade scripts al `package.json` para ejecutar y empaquetar la app con Electron Builder.
4. Deja la estructura lista para personalizar el empaquetado.

### `box serve`

Inicia el servidor de desarrollo.

```bash
box serve [opciones]
```

**Opciones útiles:**

- `--port <port>`: Puerto del servidor (ej. `3000`)
- `--host <host>`: IP o nombre del host (ej. `127.0.0.1`)
- `--open <true|false|navegador>`: Abre el navegador automáticamente
- `--base <base>`: Ruta base (ej. `/subpath/`)
- `--mode <modo>`: Modo de ejecución (`development`, `staging`, etc.)
- `--root <ruta>`: Directorio raíz del proyecto
- `--public-dir <ruta>`: Carpeta para archivos estáticos

---

### `box build`

Compila el proyecto para producción.

```bash
box build [opciones]
```

**Opciones comunes:**

- `--base <base>`: Ruta base para assets
- `--mode <modo>`: Modo de build (`production`, `staging`, etc.)
- `--root <ruta>`: Carpeta raíz del proyecto
- `--public-dir <ruta>`: Archivos estáticos adicionales

---

### `box preview`

Sirve la versión construida del proyecto localmente para pruebas.

```bash
box preview [opciones]
```

**Opciones disponibles:**

- `--port <port>`: Puerto para el preview
- `--host <host>`: IP o hostname
- `--open <true|false>`: Abre el navegador automáticamente
- `--mode <modo>`: Modo de entorno (`production`, etc.)
- `--root <ruta>`: Raíz del proyecto
- `--public-dir <ruta>`: Carpeta pública

---

### `box test`

Ejecuta pruebas usando [Vitest](https://vitest.dev). Soporta configuración personalizada del entorno de pruebas.

```bash
box test [opciones]
```

**Opciones disponibles:**

- `--watch`: Activa modo observación
- `--coverage`: Genera informe de cobertura
- `--ui`: Abre la interfaz gráfica de Vitest

**Nota:** Para entornos DOM realistas puedes importar manualmente el archivo `setupTestingBoxels` en tu configuración de pruebas:

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import { setupTestingBoxels } from "boxels/test";

export default defineConfig({
  test: {
    setupFiles: [setupTestingBoxels],
    environment: "happy-dom",
  },
});
```

---

### `box new` _(deshabilitado)_

Comando para crear un nuevo proyecto desde una plantilla:

```bash
box new --name my-app --template basic --styles scss --install
```

> Actualmente este comando está deshabilitado temporalmente.

---

## Modo de ejecución

Boxels define el modo de entorno con la propiedad `mode`, configurable desde la CLI:

```ts
type Mode = "development" | "production";
```

---

## Configuración del proyecto

Boxels permite definir configuraciones personalizadas mediante un archivo de configuración en la raíz del proyecto.

> **Importante:** `boxels.config.ts` **no es soportado**. Usa extensiones `.js`, `.cjs` o `.mjs`.

### Archivos soportados:

- `boxels.config.js`
- `boxels.config.mjs`
- `boxels.config.cjs`

### Ejemplo mínimo (`boxels.config.mjs`):

```js
import { defineConfig } from "boxels-config";

export default defineConfig({
  root: "src",
  alias: {
    "@": "./src",
  },
  build: {
    outDir: "dist",
    input: "index.html",
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## Referencia de opciones de configuración

### `alias`

Permite definir rutas de importación más cortas.

```js
alias: {
  '@': './src',
}
```

---

### `define`

Constantes globales inyectadas en tiempo de compilación.

```js
define: {
  __VERSION__: '1.0.0',
}
```

---

### `root`

Directorio raíz del proyecto. Por defecto es el directorio actual.

---

### `globalStyles`

Archivo de estilos globales que se inyecta automáticamente.

```js
globalStyles: "./styles/global.css";
```

---

### `publicDir`

Directorio con archivos estáticos públicos (como imágenes o fuentes).

```js
publicDir: "static";
```

---

### `server`

Opciones para el servidor de desarrollo.

```js
server: {
  port: 3000,
  open: true,
  host: '127.0.0.1',
  strictPort: true,
}
```

---

### `build`

Configuración para la compilación de producción.

```js
build: {
  outDir: 'dist',
  target: 'esnext',
  emptyOutDir: true,
  input: 'index.html',
  manifest: true,
  chunkSizeWarningLimit: 500,
}
```

---

### `plugins`

Extiende la funcionalidad con plugins de Vite o personalizados.

```js
plugins: [myCustomPlugin()];
```

---

## Recursos adicionales

- Documentación de configuración de Vite: [https://vitejs.dev/config/](https://vitejs.dev/config/)
- Repositorio oficial de Boxels: [Boxels](https://github.com/kkokotero/boxels)
