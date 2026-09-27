# Inspector Context

## Product

**Inspector** is a Brave/Chromium browser extension that provides a friendly visual alternative to manually editing styles in browser developer tools.

## Confirmed decisions

- Extension name: **Inspector**.
- No logo or brand mark in the product UI.
- The UI is minimal, modern, light, and uses restrained indigo selection accents.
- The extension appears as an in-page overlay on the active tab.
- A selected element receives a visible outline and an element label such as `h1.hero-title`.
- The center overlay is a **floating contextual toolbar** for select mode, undo, redo, and CSS export.
- The right-side Inspector panel contains the editing workspace.

## Information architecture

```text
Page overlay
|- Contextual toolbar: select, undo, redo, export
`- Inspector panel
   |- Current selection and breadcrumb
   |- Style: typography, colors, border, visibility
   |- Text: content and link details when applicable
   |- Layout: size, spacing, position, display
   `- Reset and Apply
```

## Intended first-release behavior

- Changes preview immediately in the current tab.
- Undo and redo work for the current editing session.
- Reset restores the selected element’s original session state.
- Apply confirms current changes in the tab.
- Export produces CSS for the user to copy or download.
- Closing Inspector removes its overlay; permanent third-party site changes are not part of the first release.

## Next task

Build the GitHub-ready Manifest V3 extension after the user authorizes implementation.

## Update protocol

When the user says “Okay, update the context,” revise this file to reflect the latest confirmed decisions, scope, and next task. Do not record speculation as a decision.
