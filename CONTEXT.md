# Inspector Context

## Product

**Inspector** is a Brave/Chromium browser extension that provides a friendly visual alternative to manually editing styles in browser developer tools.

## Confirmed decisions

- Extension name: **Inspector**.
- No logo or brand mark in the product UI.
- The UI is minimal, modern, light, and uses restrained black accents (`#111111` primary, `#000000` hover).
- The interface follows the page: dark pages get the dark theme, light pages get the light theme; a sun/moon toggle beside the panel close button overrides it for the session.
- Product typeface: **DM Sans** with system fallbacks.
- Icons: **Heroicons** outline set (https://heroicons.com, MIT) — 24x24, 1.5px stroke, `currentColor`, inlined locally; in use: moon, sun, x-mark, arrow-uturn-left, arrow-uturn-right, camera, pencil, arrow-right, arrow-down-tray, copy, check, swatch, h1, squares-2x2, eye-dropper (rectangle/circle are custom pictograms in the same stroke style).
- The extension appears as an in-page overlay on the active tab.
- A selected element receives a visible outline and an element label such as `h1.hero-title`.
- The floating overlay is anchored above the selected element and holds undo, redo, screenshot, and Copy CSS (no select mode; hovering/selecting is always on).
- Screenshot freezes the visible tab on a full-page canvas and hides the floater plus right panel; a bottom bar offers pen, arrow, rectangle, circle, and five colors. Save image and Copy image are always enabled and include annotations; both resume afterwards, as does close/Esc.
- The right panel header reads **Selected element** with a monospace element chip; the breadcrumb path was removed.
- Container selections show one editable Typography group per detected text style (up to 4), each with size, weight, and text color; edits apply to every text sharing that style.
- Copy CSS is disabled until a real style change exists; it exports one rule block per edited element.
- Reset restores every edited element to its session baseline and deselects.

## Terms

- **Right panel**: the side panel holding the editing workspace.
- **Overlay** (aka **Floater**): the floating toolbar (undo, redo, screenshot, Copy CSS) anchored above the selected element.
- **Pointer**: the selection outline that follows the cursor across the page.

## Information architecture

```text
Page overlay (anchored above selection)
|- Overlay: undo | redo | Copy CSS
`- Right panel
   |- Text header + selected-element chip
   |- Style: color, typography, per-style typography groups for containers
   |- Text: content and link details when applicable
   |- Layout: size, spacing, position, display
   `- Reset and Apply
```

## Intended first-release behavior

- Changes preview immediately in the current tab.
- Hovering moves only the pointer; the overlay stays anchored above the selected element.
- Each element keeps its session baseline on first edit, so revisiting it preserves earlier overrides and Copy CSS emits a single rule per element; different elements stay separate.
- Switching selection never carries pending field values to the new element.
- Undo and redo work for the current editing session, including per-style group edits.
- Reset restores all edited elements and deselects.
- Apply confirms current changes in the tab.
- Copy CSS produces CSS for the user to copy.
- Closing Inspector removes its overlay; permanent third-party site changes are not part of the first release.

## Next task

Verify the latest right-panel, overlay-anchor, typography-group, and Copy CSS behavior in Brave or another Chromium browser.

## Update protocol

When the user says “Okay, update the context,” revise this file to reflect the latest confirmed decisions, scope, and next task. Do not record speculation as a decision.
