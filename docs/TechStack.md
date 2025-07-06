# LyricFren Tech Stack

## Frontend

- **Framework**: Vue 3 with Composition API
- **UI Components**: Vuetify 3
- **Styling**:
  - Vuetify utility classes for layout
  - Material Design Icons (MDI) for icons
  - Custom CSS variables based on Vuetify theming system
- **State Management**: Pinia
- **API Client**: Custom services for backend communication

## Backend

- **Runtime**: Electron Main Process (Node.js)
- **Database**: LowDB (JSON-based local database)
- **Configuration**: YAML-based config with environment variable support

## Development Tools

- **Build Tool**: Vite
- **Package Manager**: PNPM
- **Component Auto-Import**: Vuetify auto-import via vite-plugin-vuetify

## Styling Guidelines

### Vuetify Theming

LyricFren uses Vuetify's theming system with custom dark and light themes. The theme is configured in `main.js` and uses CSS variables for consistent styling across the application.

```javascript
// Example theme configuration in main.js
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: '#38bdf8',
          secondary: '#64748b',
          // ... other colors
        },
      },
      light: {
        colors: {
          primary: '#0ea5e9',
          secondary: '#64748b',
          // ... other colors
        },
      },
    },
  },
});
```

### Layout with Vuetify Utilities

We use Vuetify's utility classes for layout and styling. Vuetify provides a comprehensive set of utility classes based on Material Design principles.

Common Vuetify utility classes:
- `d-flex`, `d-inline-flex` - Display utilities
- `flex-column`, `flex-row` - Flex direction
- `justify-space-between`, `justify-center` - Justify content
- `align-center`, `align-start` - Align items
- `w-100`, `h-100` - Width and height utilities
- `ma-2`, `pa-3` - Margin and padding utilities
- `text-center`, `text-left` - Text alignment

### Custom CSS Classes

We've defined custom CSS classes in `style.css` for common components:

- `.app-card` - Card container
- `.app-header` - Header container
- `.app-sidebar` - Sidebar container
- `.app-footer` - Footer container

These classes use CSS variables that are defined based on the PrimeVue theme:

```css
.app-dark {
  --app-bg-color: var(--p-surface-900);
  --app-text-color: var(--p-surface-0);
  --app-card-bg: var(--p-surface-800);
  --app-sidebar-bg: var(--p-surface-800);
  --app-header-bg: var(--p-surface-800);
  --app-footer-bg: var(--p-surface-800);
  --app-border-color: var(--p-surface-700);
  --app-accent-color: var(--p-primary-color);
}
```

### Component Styling

When styling components:
1. Use Vuetify components when available
2. Use Vuetify utility classes for layout
3. Use semantic classes like `text-primary` for text colors
4. Use custom CSS classes for common patterns

### Dark Mode

Dark mode is enabled by default in the Vuetify theme configuration. The theme automatically adjusts colors based on the selected theme variant.
