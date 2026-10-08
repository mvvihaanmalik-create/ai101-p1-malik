# obsidian-gaze — approved Step 2 route

Approved 2026-10-08. This is a plan, not a verified plugin.

**Recommended route:** Build the offline desktop Obsidian plugin with TypeScript, Canvas pixel processing, Web Audio effects, and the official sample plugin's esbuild/CommonJS pattern. Use a separate disposable vault for the first installation, not the main AI 101 vault. Build dependencies may require network during setup; image processing at runtime must not use a service.

**Manifest decisions:** The project is named `obsidian-gaze`; the installed plugin folder and manifest ID will be `gaze`, display name `Gaze`, and `isDesktopOnly: true`. The in-modal logo remains `gaze.`. Add `directors.ts`, which the proposed UI imports but the supplied tree omitted. A root-level `styles.css` is used; `loadData()` is not the CSS loader. The author value is taken from the student's existing AI 101 Git identity and should be checked before any public release.

**Evidence checked 2026-10-08:** [Obsidian build guide](https://docs.obsidian.md/Plugins/Getting%20started/Build%20a%20plugin) documents Node/npm build, `main.js`, plugin installation, and a separate test vault; [official esbuild template](https://github.com/obsidianmd/obsidian-sample-plugin/blob/master/esbuild.config.mjs) uses bundled CommonJS with `obsidian` external; [manifest reference](https://docs.obsidian.md/Reference/Manifest) disallows `obsidian` in a published ID and punctuation in a published name; [Obsidian CSS guide](https://docs.obsidian.md/Plugins/User%20interface/HTML%20elements) uses `styles.css`. [FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL), [Canvas pixel access](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData), and [PNG export](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL) support the core pipeline. [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) note user-gesture playback limits.

**Local tools observed:** Windows Node v24.15.0, npm 11.12.1, Git 2.54.0, Obsidian desktop 1.13.7. Presence is not a functionality test.

**Later correction:** 1.13.7 came from the executable's file metadata; the running Obsidian window title reports 1.14.4. Neither is an in-app Gaze test.

**Alternative:** A local browser page is simpler but fails command/ribbon integration. CSS/canvas built-in color filters are easier but cannot reproduce the four requested pixel-level recipes.

**Biggest risk and first test:** On a separate test vault, confirm command/ribbon → click/drop PNG/JPEG → Canvas grade → preview → PNG download, plus bad-file behavior and responsiveness on a large image. The supplied 1600px cap limits output dimensions, and the original source was not provided, so visual recipes are interpretations rather than exact copies. A naive multi-pass blur may be slow; use efficient passes and test. This test is not yet run.

**Effort estimate:** 1–3 hours for setup/end-to-end test, approximately 8–16 more hours for four grades, modal, SFX, and checks, with uncertainty from visual tuning/performance. No runtime service fee expected. No community release is authorized.
