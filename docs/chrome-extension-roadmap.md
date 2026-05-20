# Chrome extension roadmap and publishing plan

This repository now includes a Manifest V3 browser extension under `browser-extension/`.

## Why the extension is local-first

The Chrome Web Store Manifest V3 rules require extension logic to remain bundled inside the submitted package. Because of that, we do not rely on Flask inside the extension itself. The Python solver logic was ported to JavaScript and bundled locally in `browser-extension/lib/solvers.js`.

This gives us:

- no remote hosted code risk
- no host permissions
- easier review for the Chrome Web Store
- an easier story for the portfolio: "offline algorithm visualizer"

## Repository structure

- `browser-extension/manifest.json`: Manifest V3 entrypoint
- `browser-extension/popup.*`: small launcher
- `browser-extension/app.*`: full workspace UI
- `browser-extension/worker.js`: worker to keep the UI responsive
- `browser-extension/lib/solvers.js`: algorithm engine
- `browser-extension/store-listing.md`: Chrome Web Store copy draft
- `browser-extension/privacy-policy.md`: privacy policy draft
- `scripts/package-browser-extension.ps1`: zip package builder

## Store publication checklist

1. Load the extension unpacked and test the popup and app page.
2. Run `.\scripts\run-extension-tests.ps1`.
3. Generate and verify icons with `.\scripts\generate-extension-icons.ps1`.
4. Build the submission zip with `.\scripts\package-browser-extension.ps1`.
5. Create a Chrome Web Store developer account.
6. Upload the zip in the Developer Dashboard.
7. Fill out:
   - store listing
   - privacy tab
   - distribution tab
8. Add screenshots and the 128px icon.
9. Submit for review.

## Portfolio integration checklist

1. Add a dedicated project page on the portfolio:
   - problem solved
   - architecture
   - screenshots
   - key technical constraints
   - Chrome Web Store link once live
2. Add a short "how it was built" section:
   - Python to JavaScript solver port
   - worker-based local execution
   - MV3 packaging constraints
   - zero host-permission design
3. Add visuals:
   - popup screenshot
   - N-Queens replay
   - Sudoku replay
   - benchmark panel
4. Add a "What I learned" section:
   - CSP visualization
   - browser extension product design
   - Chrome Web Store publishing workflow

## Recommended next implementation steps

1. Add final production icons and screenshots.
2. Improve copywriting and branding for the public listing.
3. Add an automated validation pass for the packaged extension.
4. Build a dedicated portfolio case study page that links to the extension.

## Current screenshot status

- the repository includes `.\scripts\capture-extension-screenshots.ps1`
- the script starts the local Flask server and tries to capture showcase, workspace, popup, and privacy pages with Chrome headless
- on this machine, Chrome headless currently fails with a GPU process crash before writing screenshots, so manual browser screenshots remain the fallback path
