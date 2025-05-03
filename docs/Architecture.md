**LyricFren Architecture Sketch**

## 1. Overview

LyricFren is a single-page application (SPA) for crafting and versioning AI-powered style prompts and lyrics prompts. It has two primary modules:

* **Style Prompting**: Define and manage reusable style/templates for guiding AI generations.
* **Lyrics Prompting**: Compose songs by combining Style Prompts, Vibes, and free-form text prompts.

Both modules share common building blocks:

* Customizable, versioned system prompts
* Local storage of definitions and history
* Function-driven API surface for managing data

## 2. Core Concepts & Data Models

### 2.1 Vibe

* **id**: string (UUID)
* **text**: string (user-provided prompt fragment)
* **strength**: number (0–100)
* **brief**: string (auto-generated summary if `text.length > X`)
* **createdAt / updatedAt**: timestamps

### 2.2 StylePrompt

* **id**: string (UUID)
* **name**: string
* **systemPromptRef**: object {

  * `id`: string  // system-prompt identifier
  * `version`: semver  // specific version tag
    }

  > Schemas reference prompts by id & version. If the referenced prompt is deleted or missing, the app will detect this and surface an error to the user.
* **createdAt / updatedAt**: timestamps
* **history**: generation metadata (see Versioning)

### 2.3 LyricsGeneration

* **id**: string (UUID)
* **styleRefs**: Array of objects {

  * `id`: string        // StylePrompt.id
  * `version`?: semver  // if you need a specific style version; defaults to the latest
    }

  > Allows referencing multiple styles in one generation; if only one is provided, behaves as before.
* **vibes**: Vibe.id\[] + strength overrides
* **freeFormPrompt**: string
* **modelParams**: (temperature, maxTokens, etc.)
* **result**: string (raw lyrics)
* **createdAt**

### 2.4 GenerationHistoryItem

* **id**: string
* **parentId**: StylePrompt.id or LyricsGeneration.id
* **params**: deep copy of modelParams + input vibes/text or edit instructions
* **output**: string
* **timestamp**: ISO8601

### 2.5 StyleHistoryItem

* **id**: string (UUID)
* **styleId**: StylePrompt.id  // which style this history belongs to
* **versionNumber**: integer    // incremental tag (1,2,3…)
* **editInstructions**: string  // e.g. "More folk than dub"
* **previousPrompt**: string    // system prompt before edit
* **newPrompt**: string         // system prompt after model generation or manual tweak
* **timestamp**: ISO8601

> StyleHistoryItems capture every iterative save/edit of a style. Stored in a namespaced folder (e.g. `styles/history/<styleId>/v<versionNumber>.json`) or as entries in a history table. The UI can present a linear timeline or diff view, without replaying each step automatically.

## 3.1 Style System Prompts & Versioning Style System Prompts & Versioning

* **Storage**: Git-backed JSON/YAML files in `.lyricfren/styles/system-prompts/`
* **Schema**: Each style prompt file includes:

  * `version` (semver)
  * `name` (identifier)
  * `systemPrompt` (guiding instructions)
  * metadata (author, date)
* **Customization**: Users can create or edit style prompts; the UI exposes a version selector and diff viewer.
* **Version History**: On each edit, previous entries are archived under `styles/history/` with timestamped filenames.

## 3.2 Lyrics System Prompts & Versioning

* **Storage**: Git-backed JSON/YAML files in `.lyricfren/lyrics/system-prompts/`
* **Schema**: Each lyrics system prompt carries:

  * `version` (semver)
  * `structureGuidelines` (e.g. allowed sections, stanza lengths)
  * `formatRules` (e.g. plain-text only, no markdown)
  * metadata (author, date)
* **Customization**: Users can define multiple lyrics-system templates (e.g. “Darkwave Ballad”, “G-Funk Flow”); UI allows previewing and swapping templates before generation.
* **Version History**: On edit, older versions are archived under `lyrics/history/` for reference and rollback.

## 4. Backend API (Express.js)## 4. Backend API (Express.js)

```ts
// Vibes
GET    /api/vibes
POST   /api/vibes
PUT    /api/vibes/:id
DELETE /api/vibes/:id

// Style Prompts
GET    /api/styles
POST   /api/styles
PUT    /api/styles/:id
DELETE /api/styles/:id

// Lyrics Generations
POST   /api/lyrics/generate     // trigger model call (accepts one or more styleRefs)
GET    /api/lyrics/history
GET    /api/lyrics/:id

// System Prompts
GET    /api/system-prompts
POST   /api/system-prompts
PUT    /api/system-prompts/:id
```

* **Implementation**: Express.js routes using a lightweight data store (e.g., LowDB) for JSON files
* **Local-first**: All data persists locally; optional sync to remote Git repo

## 5. Frontend (Vue 3 + Composition API + PrimeVue)

* **Store**: Pinia modules for Vibes, Styles, Lyrics, SystemPrompts

* **Components**:

  * `VibeList`, `VibeEditor`
  * `StyleList`, `StyleEditor`
  * `LyricsComposer` (vibes picker, style selector, free-form prompt input)
  * `GenerationResult` (display + history panel)
  * `SystemPromptManager`

* **Function Integration**: Use OpenAPI-generated client to call backend functions

## 6. Function Call Surfaces

```js
// example: generate lyrics
lyricsClient.generate({
  styleId: "...",
  vibes: [{ id: "v1", strength: 50 }, { id: "v2", strength: 80 }],
  freeFormPrompt: "A song about mashed potatoes",
  modelParams: { temperature: 0.7, maxTokens: 512 }
})
```

Behind the scenes, the systemPrompt for the chosen style will be prepended, then each vibe injected based on strength, followed by the free-form prompt.

## 7. Next Steps

1. Scaffold backend routes & data store
2. Define JSON schema & versioning workflow
3. Build Pinia stores & basic UI layout
4. Wire up model integration for Style & Lyrics generation

*This document is a starting point and will evolve as features are refined.*

## 8. Configuration & Settings

* **Config Storage**: Support both user-level (`~/.lyricfren/config.yaml`) and project-level (`./.lyricfren/config.yaml`) files.
* **Config Fields**:

  * `openaiApiKey`: string
  * `sunoApiKey`: string (optional)
  * `defaultModelParams`: object {

    * `model`: string
    * `temperature`: number
    * `maxTokens`: number
    * `topP`: number
    * ...
      }
  * `vibeBriefThreshold`: number (character count threshold for auto-generating briefs)
  * `gitSyncEnabled`: boolean
  * `gitRepoPath`: string (if `gitSyncEnabled` is true)
* **Environment Variables**:

  * `LYRICFREN_OPENAI_KEY`
  * `LYRICFREN_SUNO_KEY`

  > Env vars take precedence over config file.
* **Backend API Endpoints**:

  * `GET /api/config` → returns current config (excluding secrets)
  * `PUT /api/config` → updates config file
* **Frontend**:

  * Pinia `settings` store loads config on startup and persists changes via API
  * Settings UI panel for editing API keys, model defaults, vibes threshold, and git sync toggle

> Users should configure API keys and defaults before generating any prompts; keys are stored locally and never sent to external syncing unless user opts in via git.
