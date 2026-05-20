# Store assets

This folder holds Chrome Web Store and portfolio presentation assets.

## Suggested workflow

1. Generate the extension icons with:

```powershell
.\scripts\generate-extension-icons.ps1
```

2. Capture screenshots with:

```powershell
.\scripts\capture-extension-screenshots.ps1
```

3. Review the screenshots in:

```text
browser-extension/store-assets/screenshots/
```

4. Use the approved images in:

- Chrome Web Store listing
- portfolio case study page
- README or project presentation slides

## Note about headless Chrome

On some Windows environments, Chrome headless may fail before writing screenshots because of local GPU driver issues.

If `.\scripts\capture-extension-screenshots.ps1` fails with a GPU process error:

1. open the hosted routes manually in Chrome
2. capture the images with the browser UI or OS screenshot tools
3. save the final files back into `browser-extension/store-assets/screenshots/`
