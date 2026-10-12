# obsidian-gaze — approved Step 1 goal

Approved 2026-10-08.

**Goal:** Build a minimal, offline Obsidian desktop plugin that opens one local image, applies one of exactly four cinematic color grades in a modal, lets the user show the original, and downloads the graded result as a PNG. One image in, one graded image out.

**Audience and environment:** An Obsidian desktop user. Build and test first on the user's Windows computer. Mobile support is not required for version 1.

**Input and output:** Input is an image chosen by file picker or dropped onto the modal. Output is an immediate Canvas-rendered preview and a downloaded PNG. No image upload or external service. Exact file-type and size limits remain to be checked.

**Must-have:** `Gaze: Open` command and camera ribbon entry; dark modal with image workspace; exactly the supplied Wes Anderson, Wong Kar-wai, Greta Gerwig, and David Lynch presets; click-to-choose and drag-and-drop; selected-filter preview; Show original button; PNG download; shutter and film-wind effects only. Use the supplied numerical filter recipes; no unavailable original source is claimed to have been copied.

**Out of scope:** Onboarding, music, Polaroid animation, AI director studio, custom presets, clipboard export, stickers, spacebar before/after toggle, and mobile support.

**Observable success:** In an enabled desktop Obsidian vault, the command and ribbon open the modal; choosing or dropping a supported image shows it; each preset changes its preview without network access; Show original toggles visibly; Download produces a PNG matching the selected grade; unsupported files fail visibly, not with a stale preview.

**Design choice delegated by user:** Use a large centered modal capped around 900px wide and 90vh high, with a narrow-window fallback, rather than literal edge-to-edge fullscreen.

**Step 2 issues to assess:** Reconcile desktop-only scope with the supplied manifest; resolve the omitted `directors.ts` import; check current Obsidian plugin build/install requirements and image-processing constraints. No code or plugin test has been done yet.
