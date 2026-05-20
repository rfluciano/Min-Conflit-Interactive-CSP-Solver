# Min-Conflit Solver Chrome Extension

This folder contains a Manifest V3 extension version of the project.

## Goals

- run N-Queens and Sudoku fully offline
- keep all logic bundled in the extension package
- avoid host permissions
- reuse the same app page as a portfolio demo when needed

## Load unpacked in Chrome or Chromium

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select:

```text
X:\Projets\M2\ADOMC\projet-min-conflit\browser-extension
```

## Package for the Chrome Web Store

Run:

```powershell
.\scripts\package-browser-extension.ps1
```

Output:

```text
X:\Projets\M2\ADOMC\projet-min-conflit\dist\browser-extension\
```

## Test the local solvers

Run:

```powershell
.\scripts\run-extension-tests.ps1
```

## Key files

- `manifest.json`: Chrome extension manifest
- `popup.html`: launcher popup
- `app.html`: full workspace page
- `worker.js`: background compute worker for the app page
- `lib/solvers.js`: local algorithm engine ported from Python
- `store-listing.md`: draft Chrome Web Store copy
- `privacy-policy.md`: privacy policy draft

## Notes for publishing

- this extension only asks for the `storage` permission
- no host permission is requested
- no remote JavaScript is loaded
- all solver logic is bundled locally for Manifest V3 compliance
