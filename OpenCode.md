# OpenCode.md

## Build, Lint & Run Commands

- **Install dependencies:** `pnpm install`
- **Start both servers (dev):** `pnpm dev`
- **Frontend only (dev):** `pnpm --filter frontend dev`
- **Backend only (dev):** `pnpm --filter server dev`
- **Frontend build:** `pnpm --filter frontend build`
- **Backend build:** _None needed (Node.js app)_
- **No tests defined** (add tests in `/apps/frontend` or `/apps/server` for more commands)

## Code Style & Guidelines

- **Imports:** Use ES modules (`import ... from '...'`), path aliases (`@`) for frontend.
- **Formatting:** Use 2 spaces, no semicolons in Vue files, semicolons in Node/JS files. Follow idiomatic style for each ecosystem.
- **Types:** Vue3 with composition API in frontend. JSDoc/inline types or TypeScript are optional (not enforced).
- **Naming:** 
  - Components: `PascalCase.vue`
  - Files/folders: `kebab-case` or `camelCase.js`
  - Variables/Props: `camelCase`
- **Error Handling:** Handle async errors (e.g., try/catch in API routes); return plain objects or JSON in API responses.
- **Config:** User config in `~/.lyricfren/config.yaml`.
- **Frontend:** Use PrimeVue & Pinia idioms, keep CSS custom properties for themes in `:root` / `.app-dark`.
- **Comments:** Prefer doc-comments for functions; minimal inline comments.
- **Avoid:** Any secret or API key in repo – keep in user config or env only.
