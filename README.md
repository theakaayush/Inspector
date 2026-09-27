# Inspector

A minimal visual inspector for Brave and other Chromium browsers. Select an element, edit it in an in-page panel, preview changes immediately, then export CSS.

## Planned capabilities

- Select any visible page element.
- Edit typography, colors, text, and basic layout.
- Undo, redo, reset, and export CSS.
- Keep edits inside the active browser tab.

## Interface

```text
Page
|- Floating toolbar: select | undo | redo | export
`- Side panel: Style | Text | Layout
```

## Project layout

```text
.
|- AI.md                 # Working rules for AI-assisted changes
|- CONTEXT.md            # Current product decisions and session context
|- README.md
|- manifest.json         # Manifest V3 entry point (to be added)
|- src/                  # Overlay, selector, editor, and export code (to be added)
`- icons/                # Extension icons (to be added)
```

## Development

The extension implementation has not been added yet. Once built, it will load as an unpacked extension from this repository through `brave://extensions` or `chrome://extensions`.

## Principles

- No framework unless the browser platform cannot cover the need.
- No permanent site changes in the first release.
- Accessible controls and visible keyboard focus.
- Small, dependency-free modules.
