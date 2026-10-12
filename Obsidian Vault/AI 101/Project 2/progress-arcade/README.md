# idea.quest · local progress arcade

A retro ASCII-styled, gamified project dashboard for our AI 101 ideas. It is a **working local website**, not a static mockup. It reads projects.json from this vault on every refresh and checks it again every four seconds while open. New ideas, approvals, revisions, and notes are saved to that file; the selected project's compact status is also written to [[AI 101/Project 2/progress.md]].

Desktop preview: ![[AI 101/Project 2/progress-arcade/preview.png]]

## Hosted link

Latest deployment check: **October 10, 2026**. Republished saved version **4** (including the ASCII cat animation); Sites returned **succeeded** at the existing link. The site is now **public** and remains read-only online. Local JavaScript, CSS, and project registry matched the saved hosted source; the hosted HTML's added `data-mode="hosted"` flag selects read-only mode. Public access changed on October 10. This was a deployment check, not a new phone or visual test.

**[Open idea.quest](https://idea-quest-ai101.mv-vihaanmalik.chatgpt.site)** — a **public, read-only** web mirror anyone with the link can visit. It fetches projects.json from the public GitHub vault repository and checks for changes every two minutes while open; new vault edits appear there after the vault sync pushes to GitHub and the next check succeeds. If GitHub is temporarily unavailable on first load, the hosted copy falls back to its last packaged snapshot and labels it as such. The hosted site cannot approve gates or add ideas. Those actions remain in the local vault-backed version below.

**[Open the Vercel copy](https://idea-quest-ai101.vercel.app)** — also public and read-only. This is a snapshot deployment of the current hosted files, not a Git-connected deployment; changes will not appear here automatically and require another Vercel deployment. Vercel project-level SSO protection is disabled so the link can be shared.

The hosted Site project ID is appgprj_6ac817efa8c08191a5bd4042c61e210c. Its separate source checkout is under C:\Users\91982\AppData\Local\AI101Projects\idea-quest-site; no Site credential is stored in this vault. Keep this ID if revising the hosted site rather than creating a replacement.

## Run on this Windows computer

1. Open PowerShell.
2. Change to this folder and start the server:

       cd 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\progress-arcade'
       npm start

3. Open <http://127.0.0.1:4177/>. Leave PowerShell open while using the board. Press Ctrl+C to stop it.

Node.js 20 or newer is required; the local build uses no npm dependencies, external fonts, analytics, login, or internet service. The server binds only to 127.0.0.1, so that editable link works on this computer, **not** on a phone or another machine. The hosted mirror above is public and read-only.

## What the controls do

- **Start a new idea** adds a 0/5 project at Goal and makes it the current quest.
- **Approve Step** records *your* decision, fills exactly one block, and unlocks the next step. Tests, code, and my confidence never approve a gate automatically.
- **Another pass** records what needs revision without adding progress.
- **Add quest note** saves a dated update without advancing.
- Selecting a project changes the current quest and the Obsidian progress.md card.

The board begins with idea.quest, obsidian-gaze, Image Palette Studio, and the completed Project 1 poster. The poster is a **bonus artifact**, not falsely scored against the later five-step coding workflow. Image Palette Studio's 5/5 reflects its *original accepted run*; its later accent-override side quest is still under review. idea.quest's potion-room [[AI 101/Project 2/outputs/idea-quest/01-define-the-goal.md|Goal]] and [[AI 101/Project 2/outputs/idea-quest/02-check-feasibility.md|Three.js route]] were approved on October 11 (**2/5**). Its isolated [[AI 101/Project 2/idea-quest-three-spike/README.md|3D side prototype]] is ready for a Step 3 human review, not approved or deployed. The public UI is still this existing ASCII tracker, not the potion room.

**Motion language:** The live indicator breathes, the tiny rocket floats, stars twinkle, and icons answer hover, focus, or press. A new idea gets a brief arrival flash; an explicitly approved gate gets one checkpoint pop and XP flash. The board does not animate every card at once. The system reduced-motion preference turns these animations and transitions off.

## Quest companion · 2D integration under review

The existing local 2D board now includes a chat panel in the same retro ASCII/pixel style. It uses the separate context-chat prototype's refreshed, curated vault notes and the signed-in **local Codex CLI**, while preserving all project records and approval controls. Questions and answers live only in this browser tab. The companion cannot edit notes or approve gates. The user confirmed the separate chat prototype worked but looked generic, then directed this visual integration before returning to the 3D potion-room work.

On the **public static mirror**, the same panel offers a limited **status guide**: it answers status/next-step prompts deterministically from the public project registry, labels that source, and says when a question needs the local AI companion. It is **not** a hosted AI chat and cannot read the rest of the vault. The owner's local Codex login cannot safely be used as a public backend. A hosted model service, access policy, cost limit, and security review are still needed for open-ended public chat. The existing site remains shareable; the 3D version remains separate and on hold.

The ASCII quest cat now blinks and flicks its tail, then returns to the same resting pose; hovering makes it wink. It stays visible in the compact layout too. It does not animate in a hidden tab or when reduced motion is preferred.

## Live source of truth

projects.json is the site registry. Future AI-assisted project work should update this file when an idea starts or its status genuinely changes, then run:

    node 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\progress-arcade\sync-progress.mjs'

That regenerates the current-project Obsidian card if the board is not running. Site actions regenerate it automatically. Do not put private images, passwords, access tokens, or unreviewed claims in project titles or notes: the vault sync may copy this registry to the instructor's GitHub repository.

## Checks and limits

Run npm test from this folder. The tests cover seeded progress, new idea persistence, one-step approval, revision without false progress, invalid input, cross-origin write rejection, and static page delivery. Local and hosted desktop layouts were inspected in a headless browser; the hosted deployment succeeded. The interface is responsive by CSS, but no real-phone touch check has been claimed. There is no multi-user editing, hosted write capability, backup UI, or automatic parsing of every Vault note. The app tracks the project registry explicitly; it does not pretend to infer approvals from prose.
