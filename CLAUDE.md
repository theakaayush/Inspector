# Inspector

Inspector is a Manifest V3 Brave/Chromium extension that lets users select a page element and visually preview edits to its text, styles, and layout.

## Commands

```powershell
# Development: open brave://extensions, enable Developer mode, then Load unpacked and select this project folder.
# Test: manually run the smoke checklist on a normal webpage; no automated suite exists yet.
# Build: Compress-Archive -Path manifest.json,src,icons -DestinationPath Inspector.zip -Force
# Syntax check: Get-ChildItem src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Project Structure

```text
manifest.json       Manifest V3 configuration
src/background.js   Toolbar-click handler and script injection
src/inspector.js    In-page selection, UI, edits, and history
src/inspector.css   Isolated overlay styles
icons/              Extension icons
```

## Conventions

- Use plain JavaScript, native DOM APIs, and CSS. Do not add a framework or build tool. # advisory
- Inject Inspector only after the user clicks the extension action; use `activeTab` and `scripting`, not broad host permissions.
- Keep all overlay markup inside a shadow root so site CSS cannot alter the interface.
- Keep every user-visible change reversible during the active tab session.
- Use `data-inspector-*` attributes only on Inspector-owned nodes.
- Name work branches `feature/<short-description>` and open pull requests into `main`. # advisory

## Non-Negotiables

- IMPORTANT: Never use `innerHTML` with page-derived content.
- IMPORTANT: Never send page content to a network service or add external APIs without explicit user approval.
- IMPORTANT: Never persist edits to a third-party site by default; export CSS instead.
- IMPORTANT: Do not modify page elements unless the user selected them through Inspector.
- IMPORTANT: Keep interactive controls keyboard-accessible with visible focus.

## Environment

- No environment variables, server, database, or external service is required.
- The extension must use Manifest V3 and package all executable code locally.

## Reference Docs

- Chrome scripting API — https://developer.chrome.com/docs/extensions/reference/api/scripting | Read when changing injection or permissions.
- Chrome content scripts — https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts | Read when changing page-context behavior.
- Manifest file format — https://developer.chrome.com/docs/extensions/reference/manifest | Read when changing `manifest.json`.
