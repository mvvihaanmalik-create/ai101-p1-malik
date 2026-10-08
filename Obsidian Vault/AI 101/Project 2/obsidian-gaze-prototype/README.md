# obsidian-gaze

An offline, desktop-only Obsidian image-grading plugin. Four fixed grades, one image input, PNG output. No remote services or AI model calls at runtime.

> [!important] Working prototype, not an accepted Step 3 output. This vault folder is a source/build snapshot for review. Do **not** run `npm install` here: it would place `node_modules` in the synced vault. The isolated working build is at `C:\Users\91982\AppData\Local\AI101Projects\obsidian-gaze\`, and the disposable test vault is at `C:\Users\91982\AppData\Local\AI101Projects\obsidian-gaze-test-vault\`. The three installation files (`main.js`, `manifest.json`, `styles.css`) are now also in this vault's `.obsidian/plugins/gaze/`. If Gaze is missing from **Settings → Community plugins → Installed plugins**, click the small **Reload plugins** icon beside that heading. Obsidian then lists Gaze with its switch off; enable it yourself when ready. The command cannot appear in Ctrl+P until Gaze is enabled.

## Build

On Windows, in the isolated working build folder (not this synced snapshot):

```powershell
npm install
npm test
npm run build
```

The build command type-checks the source and writes `main.js`. The plugin is installed by copying `main.js`, `manifest.json`, and `styles.css` into `<test vault>/.obsidian/plugins/gaze/`, then enabling **Gaze** in Obsidian's Community plugins settings. Restart Obsidian after changing `manifest.json`; reload after code changes. Do not first test an unreviewed plugin in an important vault.

## Use

Run **Gaze: Open** in the command palette or click its camera ribbon icon. Click the image area or drop a local raster image onto the modal; choose a director; optionally use **Show original**; click **Download →** for the selected graded PNG. Download always saves the grade, even if the original is currently displayed.

The header's **−** button collapses the modal to a compact bar; **□** restores it. The expand button toggles between the centered and full-window layouts. Obsidian's small **×** at the top right closes it. Minimize is an in-modal collapse, not an operating-system window minimize; Obsidian remains behind the modal until it is closed.

The visual treatment uses a film-strip frame around the image, sprocket-hole edges, numbered director cards, and a frame counter that follows the selected look. These are interface cues only; they do not alter the export or add any new image-processing step. The updated files are installed in this vault, but an already-running Gaze instance may still show the earlier layout until Obsidian is restarted after saving any open notes.

The app rejects SVG and non-images, files over 30 MB, images over 40 megapixels, and formats Obsidian cannot decode. It downsizes the longest edge to at most 1600 pixels before grading/export. For now the filter recipes are bounded interpretations of the supplied numeric instructions, not copies of an unavailable original implementation.

## Files

- `main.ts`: Obsidian command and ribbon.
- `GazeModal.ts`: all plugin UI and local image pipeline.
- `directors.ts`: the four supplied director records.
- `filters.ts`: pure pixel grades plus a Canvas adapter.
- `sounds.ts`: generated shutter and film-wind effects only.
- `styles.css`: isolated modal styling.
- `manifest.json`, `package.json`, `tsconfig.json`, `esbuild.config.mjs`: plugin metadata and build setup.
- `tests/`: pixel behavior tests and a local performance benchmark.

No community-directory submission or public release has been made.
