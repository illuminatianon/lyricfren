# LyricFren Tech Stack

## Frontend

- **Framework**: Vue 3 with Composition API
- **UI Components**: PrimeVue 4
- **Styling**: 
  - PrimeFlex for layout utilities
  - PrimeIcons for icons
  - Custom CSS variables based on PrimeVue theming system
- **State Management**: Pinia
- **API Client**: Custom services for backend communication

## Backend

- **Server**: Express.js
- **Database**: LowDB (JSON-based local database)
- **Configuration**: YAML-based config with environment variable support

## Development Tools

- **Build Tool**: Vite
- **Package Manager**: Yarn
- **Component Auto-Import**: unplugin-vue-components with PrimeVueResolver

## Styling Guidelines

### PrimeVue Theming

LyricFren uses PrimeVue's theming system with a custom preset based on the Nora theme. The theme is configured in `main.js` and uses CSS variables for consistent styling across the application.

```javascript
// Example theme configuration in main.js
const LyricFrenPreset = definePreset(Nora, {
  semantic: {
    // Custom theme tokens can be defined here
  }
});

app.use(PrimeVue, {
  theme: {
    preset: LyricFrenPreset,
    options: {
      darkModeSelector: '.app-dark',
    }
  },
  ripple: true,
  unstyled: false
});
```

### Layout with PrimeFlex

We use PrimeFlex for layout utilities instead of Tailwind CSS. PrimeFlex provides a set of utility classes that work seamlessly with PrimeVue components.

Common PrimeFlex classes:
- `flex`, `inline-flex` - Display utilities
- `flex-column`, `flex-row` - Flex direction
- `justify-content-between`, `justify-content-center` - Justify content
- `align-items-center`, `align-items-start` - Align items
- `w-full`, `h-full` - Width and height utilities
- `m-2`, `p-3` - Margin and padding utilities
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
1. Use PrimeVue components when available
2. Use PrimeFlex utility classes for layout
3. Use semantic classes like `text-primary` for text colors
4. Use custom CSS classes for common patterns

### Dark Mode

Dark mode is enabled by default using the `.app-dark` class on the root HTML element. The theme automatically adjusts colors based on this class.
