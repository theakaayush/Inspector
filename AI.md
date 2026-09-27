# AI Working Guide

## Project goal

Build **Inspector**, a Manifest V3 Brave/Chromium extension for visually editing the current page through an in-page overlay.

## Working rules

- Read `CONTEXT.md` and `ponytail.md` before changing the project.
- Follow `ponytail.md` (Lazy Senior Dev Mode, default: full) for every coding task.
- Update `CONTEXT.md` whenever the user says: “Okay, update the context.”
- Keep dependencies at zero unless a browser API cannot do the job.
- Use **Heroicons** outline (https://heroicons.com, 24x24, 1.5px stroke, `currentColor`, inlined via `icon()`) for every UI icon. Never use text glyphs or emoji as icons.
- Prefer native browser APIs, small focused modules, and clear names.
- Preserve page content and styles unless Inspector is actively applying a user change.
- Keep editing non-destructive: preview in the active tab, support undo/redo, and export CSS rather than writing to a site’s source files.
- Treat page markup as untrusted. Do not inject page HTML with `innerHTML`.
- Keep keyboard operation and visible focus states working.

## Scope for the first release

- Select an element on the active page.
- Open a right-side Inspector panel and a small floating contextual toolbar.
- Edit typography, colors, text, and basic layout values with live preview.
- Undo, redo, reset the selected element, and export CSS.

## Deliberately out of scope

- Editing a site’s source code or server data.
- Saving permanent changes to third-party websites.
- Breakpoint-specific rule generation, collaboration, accounts, or a build framework.

## Quality bar

- Keep each change small and verify the relevant behavior in Brave or another Chromium browser.
- Do not add abstractions, dependencies, or files without an immediate use.
