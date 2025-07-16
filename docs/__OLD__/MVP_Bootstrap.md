**MVP Bootstrap Plan for Style Prompting Module**

This plan is for an LLM-driven coding agent. Keep a running **checklist** of completed items, and consult the API + framework docs before each implementation step.

---

## 1. Objectives

* 🔹 Get a minimal Style Prompt UI up and running
* 🔹 Load built‑in prompts from code
* 🔹 Allow editing & saving iterations to a simple JSON store
* 🔹 Provide a text area for user input and a result display
* 🔹 Bootstrap configuration (API keys + default model params)

## 2. Scope & Exclusions

* **Exclude**: history tracking, Vibes, Lyrics module, Git sync, complex persistence
* **Include**:

  * In‑memory or file‑based JSON store for current prompts
  * Basic config loader (`config.yaml` or env vars)
  * Stubbed or real call to the OpenAI/Suno client for generation

## 3. Project Structure

```
/lyricfren
├─ /backend
│   ├─ index.js          # Express server entrypoint
│   ├─ /routes
│   │   ├─ styles.js     # GET/PUT prompts, POST /generate
│   └─ config.js         # load config.yaml / env
├─ /frontend
│   ├─ App.vue           # main layout with PrimeVue components
│   ├─ /components
│   │   ├─ StyleEditor.vue   # dropdown + text edit + save
│   │   ├─ PromptComposer.vue# user prompt + generate button
│   │   └─ ResultDisplay.vue # shows generated output
│   ├─ /stores
│   │   └─ settings.js    # Pinia store for config
│   ├─ style.css         # Custom CSS and PrimeVue theme variables
│   └─ main.js           # Vue entrypoint with PrimeVue configuration
├─ /docs
│   ├─ Architecture.md   # System architecture documentation
│   ├─ TechStack.md      # Tech stack and styling documentation
│   └─ MVP_Bootstrap.md  # This file
└─ README.md
~/.lyricfren
├─ /data
│   └─ prompts.json      # current system‑prompt definitions
└─ config.yaml           # default API keys + modelParams
```

## 4. Backend Tasks

*

## 5. Frontend Tasks

* [ ] **Settings Store**: load config from `GET /api/config`, allow edits, sync via `PUT /api/config`
* [ ] **StyleEditor Component**:

  * Dropdown of styles
  * Editable textarea bound to `systemPrompt`
  * "Save Prompt" button → `PUT /api/mvp/styles/:id`
* [ ] **PromptComposer Component**:

  * Textarea for free-form user prompt
  * "Generate" button → for MVP, call OpenAI API directly from front-end using JS client and `systemPrompt` + `userPrompt`
  * On future iterations, switch to `POST /api/mvp/generate`
* [ ] **ResultDisplay Component**: show LLM output in scrollable box
* [ ] **App.vue Layout**: place `StyleEditor`, `PromptComposer`, and `ResultDisplay` side by side or stacked

## 6. Styling Approach

* **UI Components**: Use PrimeVue 4 components for all UI elements
* **Layout**: Use PrimeFlex utility classes for layout (not Tailwind CSS)
* **Theming**: Use PrimeVue's theming system with Nora preset
* **Icons**: Use PrimeIcons for all icons
* **Custom Styles**: Define custom CSS variables in style.css based on PrimeVue theme

## 7. Checklist & Documentation

* 📌 **Before Coding**: review Express.js routing docs, Pinia store patterns, and OpenAI API reference
* 📌 **Checklist**: add/remove items as tasks evolve; mark ✅ when done
* 📌 **Testing**: manual smoke test each endpoint + UI interaction
* 📌 **Lint & Formatting**: follow existing project conventions

---

*End of MVP bootstrap plan.*
