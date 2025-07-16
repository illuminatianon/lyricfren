# Panel

This document outlines the design for the `Panel` UI component.

## Core Concepts

A `Panel` is a fundamental UI element that acts as a container for other components.

*   **Composition**: Panels are designed to be composable. They can contain other UI elements, including `Grid`s, which in turn can contain more `Panel`s.
*   **Header**: Each panel has a title bar that displays its title.
*   **Movability**: Panels can be moved within a `Grid` by dragging their title bar.
*   **Hiding**: Panels can be "hidden" to a sidebar. When hidden, an icon representing the panel will appear in the sidebar, allowing the user to restore it.
*   **Content**: The main body of the panel, which can hold any other UI component.
