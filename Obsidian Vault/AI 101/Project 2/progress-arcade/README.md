# idea.quest · local progress arcade

A retro ASCII-styled, gamified project dashboard for our AI 101 ideas. It is a **working local website**, not a static mockup. It reads projects.json from this vault on every refresh and checks it again every four seconds while open. New ideas, approvals, revisions, and notes are saved to that file; the selected project's compact status is also written to [[AI 101/Project 2/progress.md]].

Desktop preview: ![[AI 101/Project 2/progress-arcade/preview.png]]

## Run on this Windows computer

1. Open PowerShell.
2. Change to this folder and start the server:

       cd 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\progress-arcade'
       npm start

3. Open <http://127.0.0.1:4177/>. Leave PowerShell open while using the board. Press Ctrl+C to stop it.

Node.js 20 or newer is required; this build uses no npm dependencies, external fonts, analytics, login, or internet service. The server binds only to 127.0.0.1, so the link works on this computer, **not** on a phone or another machine. Hosting or remote synchronization would be a separate privacy/architecture decision.

## What the controls do

- **Start a new idea** adds a 0/5 project at Goal and makes it the current quest.
- **Approve Step** records *your* decision, fills exactly one block, and unlocks the next step. Tests, code, and my confidence never approve a gate automatically.
- **Another pass** records what needs revision without adding progress.
- **Add quest note** saves a dated update without advancing.
- Selecting a project changes the current quest and the Obsidian progress.md card.

The board begins with idea.quest, obsidian-gaze, Image Palette Studio, and the completed Project 1 poster. The poster is a **bonus artifact**, not falsely scored against the later five-step coding workflow. Image Palette Studio's 5/5 reflects its *original accepted run*; its later accent-override side quest is still under review. idea.quest itself is 0/5 approved until the user reviews its scope and design.

## Live source of truth

projects.json is the site registry. Future AI-assisted project work should update this file when an idea starts or its status genuinely changes, then run:

    node 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\progress-arcade\sync-progress.mjs'

That regenerates the current-project Obsidian card if the board is not running. Site actions regenerate it automatically. Do not put private images, passwords, access tokens, or unreviewed claims in project titles or notes: the vault sync may copy this registry to the instructor's GitHub repository.

## Checks and limits

Run npm test from this folder. The tests cover seeded progress, new idea persistence, one-step approval, revision without false progress, invalid input, cross-origin write rejection, and static page delivery. Desktop layout was inspected in a headless browser. The interface is responsive by CSS, but no real-phone touch check has been claimed. There is no account, multi-user collaboration, hosted deployment, backup UI, or automatic parsing of every Vault note. The app tracks the project registry explicitly; it does not pretend to infer approvals from prose.
