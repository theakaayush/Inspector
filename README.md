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
|- manifest.json         # Manifest V3 entry point
|- src/                  # Toolbar handler and isolated overlay
`- test/                 # Minimal manifest test
```

## Development

1. Open `brave://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose this repository folder.
4. Open a normal webpage and click the Inspector extension button.

Run the included check with `node --test test/manifest.test.mjs`.

## Principles

- No framework unless the browser platform cannot cover the need.
- No permanent site changes in the first release.
- Accessible controls and visible keyboard focus.
- Small, dependency-free modules.
