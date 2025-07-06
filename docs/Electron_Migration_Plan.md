# LyricFren → Electron Migration Plan

This plan converts the current PNPM monorepo (Vue + Express) into a cross-platform desktop app powered by Electron.

---

## 1. Goals

- **Single installable binary** (Win/macOS/Linux)
- **No exposed API keys** – keep OpenAI keys in the main process
- **Seamless dev workflow** (hot-reload, Vite, nodemon)
- **Auto-update & code-signing ready**

## 2. Tooling Choices

| Purpose              | Tool/Lib                                |
|----------------------|-----------------------------------------|
| Electron scaffolding | electron-builder + vite-plugin-electron |
| Dev reload           | concurrently (vite + electron)          |
| Packaging/Signing    | electron-builder                        |
| Auto-update          | electron-updater (optional)             |

---

## 3. Repository Structure

```
apps/
  frontend/        – Vue SPA (unchanged)
  server/          – Express services (moved into main process)
  desktop/         – NEW Electron main & preload
```

## 4. Migration Steps

1. **Add desktop package**
   ```bash
   pnpm create vite-plugin-electron@latest apps/desktop
   ```
2. **Move backend logic**
  - Import `/apps/server/routes/*` directly; drop HTTP layer.
  - Expose `meterService.count` & `stylesService` via IPC.
3. **Secure key storage**
  - Use `keytar` or `electron-store` in main process.
4. **Renderer integration**
  - Replace Axios `api.*` calls with `window.api.invoke('meter:count', text)`.
  - Provide a thin wrapper in `/apps/frontend/services/api-electron.js`.
5. **Dev workflow**
   ```json
   "scripts": {
     "electron:dev": "concurrently -n vite,electron -c green,blue \"pnpm --filter frontend dev\" \"pnpm --filter desktop dev\""
   }
   ```
6. **Build & Package**
   ```bash
   pnpm --filter desktop build   # bundles frontend & electron
   ```
7. **Auto-update & Signing** – configure later with GitHub tokens.

---

## 5. Risk & Mitigation

| Risk                | Mitigation                                |
|---------------------|-------------------------------------------|
| Large bundle size   | Enable `asar`, strip unused locales       |
| IPC security        | Use context-isolation, preload white-list |
| Cross-platform bugs | CI build matrix (GH Actions)              |

## 6. Timeline (ideal)

- Week 1: scaffold desktop, run Vue in Electron
- Week 2: port Express routes to IPC, update frontend services
- Week 3: packaging, auto-update POC
- Week 4: QA, release inaugural desktop build

---

**Outcome:** A self-contained LyricFren desktop app with no need for separate server or browser, ready for broader
distribution.
