# Grid

This document outlines the design for the `Grid` UI component.

## Core Concepts

A `Grid` is a simple tiling window manager for arranging `Panel`s. It is inspired by tiling window managers like i3 and Hyprland, but with a much simpler set of rules.

### Tiling Behavior

*   **Initial Panel**: The first `Panel` added to a `Grid` will occupy the entire space.
*   **Splitting**: When a second `Panel` is added, the `Grid` will split vertically, with each `Panel` taking half of the space. Subsequent panels will continue to split the available space.
*   **Resizing**: The border between two `Panel`s in a `Grid` will be draggable, allowing the user to resize them.

### Panel Management

*   **Moving Panels**: Users can move `Panel`s within the `Grid` by dragging their title bars.
*   **Hiding Panels**: `Panel`s can be hidden and sent to a sidebar.
