# idea.quest · local context-chat test

This is a **separate local-only, read-only prototype**, not a modification to either public idea.quest deployment or to the Three.js potion-room prototype. It uses the installed Codex CLI on this Windows PC. It is not the same live Claudian conversation.

## Run

In PowerShell:

```powershell
node 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\idea-quest-chat-spike\server.mjs'
```

Open <http://127.0.0.1:4189/> on **this computer** while the terminal remains open. Press Ctrl+C to stop it. No npm install or additional package is needed. Codex CLI must already be locally installed and signed in.

## What this slice does

- Lists the existing projects and their recorded five-gate status from `progress-arcade/projects.json` (refreshed every 15 seconds in the page).
- Shows the actual vault-relative context sources loaded for a selected project. Before **each** prompt, it re-reads the registry and curated notes; a short [[AI 101/Project 2/idea-quest-chat-spike/handoff.md|handoff]] summarizes the current conversation's key decisions for idea.quest.
- Sends the prompt and refreshed context to a new **ephemeral**, read-only Codex CLI run in this vault. The last three Q/A exchanges in this browser tab are included for follow-up questions. Answers return when the CLI turn completes; this is not yet token-by-token streaming.
- Gives a visible READY → READING VAULT → ANSWER READY or CHECK NEEDED state. It does not save chat transcripts, edit the registry, approve a step, deploy, or expose this service on the network. The browser session's conversation disappears on reload.

## Boundaries

The server binds only to `127.0.0.1` and checks Host, Origin, content type, and a per-server CSRF token before running a prompt. Only predefined context files are loaded. Codex is invoked with read-only sandbox, no approval prompts, and an ephemeral session. This is defense-in-depth for a local prototype, **not a security review or permission to make it publicly reachable**. The installed Codex CLI may use its existing account/network connection for inference, so “local-only” describes access to this website, not offline model execution. Do not expose port 4189 or add public chat until a separate authenticated design and review.

## Check

```powershell
node --test 'C:\Users\91982\Documents\Obsidian Vault\AI 101\Project 2\idea-quest-chat-spike\tests\chat.test.mjs'
```

Ask: **“Which idea.quest gates are approved, what happened to the 3D room, why must the public tracker stay live, and what needs my decision?”** A grounded answer should say **Goal and Route approved (2/5); Step 3 prototype unapproved and paused; public ASCII tracker unchanged**, citing the registry/notes. An answer is not itself an approval. The user should check the local browser UI and decide whether to keep or revise this context-chat direction before any remote access or write actions.

**Observed October 11 check:** `node --test tests/chat.test.mjs` passed 3/3 checks, including a copied-registry 2/5→3/5 freshness test and cross-origin rejection. A real HTTP Codex prompt correctly reported 2/5, the unapproved paused 3D prototype, and the reason the public tracker stays live. A second prompt saw the updated note that the chat test had in fact run. Chrome rendered the desktop page; a CDP-emulated 390px viewport had 390px document width with all four project buttons, and a browser-submitted prompt produced a grounded answer. The first live attempt failed because this account rejected the CLI's default `gpt-6-sol`; explicit `gpt-5.6-sol` worked, so this prototype uses that model. The user has not yet reviewed the page on their device. These checks do not prove phone access, production security, or exact Claudian-session continuity.

Preview images: ![[AI 101/Project 2/idea-quest-chat-spike/preview-desktop.png]] and ![[AI 101/Project 2/idea-quest-chat-spike/preview-narrow.png]]. The narrow image shows the chat after a test prompt; Chrome DevTools emulation is not a real phone.
