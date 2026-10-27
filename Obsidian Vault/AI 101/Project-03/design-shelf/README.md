# Design Shelf

[Open the app](https://ideaquest-workshop.vercel.app/) and choose **Design Shelf**. It finds free reusable assets for the selected project.

## Use it

Choose a category or ask Pip for something specific. Save useful cards to the project's board. Review the board, then approve the references before handing them to Creative Partner. A save alone is not approval.

The selected project stays shared with Workshop and idea.quest. Pip receives its approved summary, current goal, platform, stage, constraints and saved IDs. Full note bodies and passwords stay out.

## Weekly picks

Start with 10 assets per category. Every Sunday at 15:00 UTC, up to five new picks replace the five oldest. Keep existing picks if fewer qualified replacements pass. Older assets remain in Full collection, search and saved boards. Each asset has one home category. Dates are never reset to make old work look newly published.

The initial set has 220 licensed assets, 80 featured picks across eight categories, and verified local previews for every item. Preview checks exclude broken or missing images. Fonts use real bundled specimens. Details offer original previews; supported motion and 3D libraries also have interactive samples. A docs screenshot is labelled as documentation, not a runnable demo.

Sources are Kenney, Poly Haven, Google Fonts and original repositories. Reviewed sources are in `config/asset-sources.json`. Topic-filtered GitHub discovery looks for new maintained MIT repositories with original README images. License, duplicate and image checks still apply. Quality takes priority over filling five slots.

## Cloud and PC

The existing protected Vercel site runs `/api/shelf-refresh` on Sundays. The approved private Blob store holds public asset metadata and new thumbnails. Collection works when the PC is off. Deployments retain the cloud edition and older additions.

Pip and the other agents still use Codex on the PC. Saved boards and approvals stay with that connection. A cloud-discovered asset is checked against its original source on the PC before saving. No cloud LLM or paid plan was added.

Start all local apps with `../workshop/start.ps1`. Local Shelf is `http://127.0.0.1:8917/`. Rebuild with `node scripts/build.mjs`. A deliberate local source check uses `node scripts/refresh-assets.mjs --force`.

## Current instructions and evidence

Runtime: `agent/pip.md`. Coursework role: `../design-shelf-agent.md`. Source directory and older comparison records are historical; accessible creator posts can help discover assets, but inspiration is outside the current shelf.

The earlier ChatGPT Site and twice-monthly schedule are legacy. The current app uses the Vercel Sunday collector. Private files under `.local`, project caches, environment files, job secrets and runtime journals must stay out of submission and deployment.
