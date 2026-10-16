# Inspector

A minimal visual inspector for Brave and other Chromium browsers. Select an element, edit it in an in-page panel, preview changes immediately, then export CSS.

## Planned capabilities

- Select any visible page element.
- Edit typography, colors, text, and basic layout.
- Undo, redo, reset, and export CSS.
- Keep edits inside the active browser tab.

## Development

1. Open `brave://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose this repository folder.
4. Open a normal webpage and click the Inspector extension button.

## Principles

- No framework unless the browser platform cannot cover the need.
- No permanent site changes in the first release.
- Accessible controls and visible keyboard focus.
- Small, dependency-free modules.
