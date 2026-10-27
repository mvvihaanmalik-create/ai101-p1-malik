# Workshop checks · October 23, 2026

The user approved the visual concept and asked for real projects, connected agents, smooth switching, and explicit approval stops.

## Checked

- Seven integration tests passed using temporary project records and a fixture model. They cover historical approval isolation, gate order, project/chat/draft isolation, stale tabs, changed notes, failed audit and explicit fix, restart recovery, cancellation, duplicate requests, request protection, file scope, and JavaScript syntax failures.
- The live interface loaded all five project summaries from the vault and the existing local Design Shelf collection.
- Connected through the existing Codex login and received an actual Chief of Staff answer from gpt-6-astra for IdeaQuest Final. It correctly said the new run needed goal approval despite the historical completed workflow. The real run stayed at 0/5.
- In the browser, an unsent Chief draft survived a switch to Design Shelf and back. The test draft was cleared afterward. The live reply also survived reload.
- A separate browser fixture applied a prototype, displayed its isolated preview, and counted two clicks. Prototype acceptance advanced to the audit stop. The human-check field accepted written evidence and the required acknowledgement, then exposed the final decision. These approvals affected fixture data only.
- Mobile-width navigation, the room, role views, and the real reference collection were inspected. Day mode was checked at mobile width. The desktop room had no horizontal overflow at 1265px, and its browser error log was empty.

## Scope

The live check covers the common Codex connection and one actual role response. It is not a quality benchmark for all six agents. The audit model reviews supplied source and actual syntax-check evidence; it does not perform browser tests. Hands-on checks remain explicit and required in the human review.

Programmer creates separate browser prototypes. Native/plugin/backend builds, edits to original project source, deployment, and hosted Shelf synchronization are not available through this version. No existing project gate was changed and no new site was published.

New source import uses the existing Shelf metadata importer. No new external source was added merely to test this integration. Existing references were displayed; their publication dates were not re-audited in this session.

The original integration-test attempt could not connect to its temporary localhost server inside the sandbox. The same checks passed with local network access. A browser check found a button-state bug after save; it was fixed before the final checks.

## Connected app check, October 23, 2026

- Live browser: changing the project inside Design Shelf updated the shared header, then idea.quest showed the same project. Changing it inside idea.quest updated the header and Shelf. Changing the shared selector to obsidian-gaze reached both original apps.
- Used actual keyboard controls inside the embedded apps because the browser tool's direct iframe clicks were unavailable. No project approvals or messages were submitted.
- An unsent Chief draft survived Workshop → Shelf → idea.quest → Workshop. The temporary text was removed and the prior draft restored.
- Refresh retained the active Shelf view and selected project.
- Fixed hidden idea.quest opening/focusing its inspector during background project updates. It now defers that action until visible, using the latest selection.
- 50 existing automated tests passed across the three apps. Four new source-handler regression tests passed for hidden updates, rapid changes, repeated/invalid selection, and startup ordering.
- Six larger characters use distinct greetings on hover and keyboard focus. Browser inspection confirmed the matching animation rules for each focused character. Reduced motion keeps characters positioned correctly and disables movement.
- No browser console errors appeared during this pass. Hosted apps were not published or changed.
