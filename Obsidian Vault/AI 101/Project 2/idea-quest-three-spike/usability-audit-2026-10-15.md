# Usability audit — October 15, 2026

Scope: the current IdeaQuest workshop, project collection/journals, organization, focus, and audio. This was a code review and browser walkthrough, not a study with independent participants.

| Finding | Change | Verification |
| --- | --- | --- |
| Closing a journal discarded the user's collection/search context. | Journals opened from search return to that collection, with the query and filter retained. Room artifacts return to the room. | Searched Palette, opened it, returned to the same filtered results. |
| Saved focus was invisible after the overview cards were removed. | A small Continue shortcut opens the chosen project. A running countdown appears beside it. | Opened the saved project from the room; no overview scroll cards added. |
| Focus was hidden in Room extras and reset on reload. | Start/end focus in the project journal; valid 15-minute sessions persist across reloads. It never marks a milestone complete. | Started, returned, reloaded, and observed 14:53 → 14:52; ended the test session. Expired/deleted/invalid sessions rejected by tests. |
| Worktable/shelf controls changed text without a clear view change. | Shelf selection moves the camera toward the shelf on desktop and phone, hides table labels, and retains an explicit Worktable return. Dragging out of the shelf view pulls the camera back. | Emulated phone shelf selection, Worktable return, and selected labels checked. |
| Labels used the previous camera transform when motion was paused. | Update the camera world matrix before projecting the name labels. | Paused shelf view showed the label beneath its artifact after the fix. |
| Bringing work back to a full table failed after the user clicked. | Disable the unavailable action with a stated three-project limit; retired work can restore directly to the shelf. Notifications use the full project name. | Retired the shelf keepsake, restored it to the shelf while three table slots were occupied, and restored the original arrangement. |
| Search had no explicit reset and its public empty state suggested an unavailable Add action. | Clear filters action, correct empty-state guidance, and search in last-change/live-link fields. | Filter reset and returning focus to search checked. |
| Audio was a generic double beep, obscure, and forgotten on reload. | Optional synthesized potion, paper, keepsake, placement/Undo, purr, hearth, lantern and completion cues; clear Sound on/off, remembered volume and ambience. | Signal tests check bounded nonzero PCM and silent boundaries; controller tests check opt-in, persistence, background/mute stopping and failure handling. Browser toggles, volume/ambience persistence, and absence of runtime errors checked. |

## Checks and limits

- **24 automated tests passed**, including existing local vault/API, approvals, publishing, rendering, and new audio/focus checks.
- Browser walkthroughs covered 1440×900 desktop and 390×844 phone layouts, in the hosted snapshot and local vault edition. No horizontal overflow was observed. The existing room artwork and on-selection journals were retained.
- The status-only publisher deliberately failed its old visual pins during development. Its five exact pins were updated to the new reviewed package; its rejection of unintended visual drift remains tested. No status watch process was running at the time checked. Automatic restart after Windows login remains the separate pending decision already recorded in the project.
- Sounds are generated locally with Web Audio, start after a user enables them, and require no audio downloads or microphone access. The implementation follows [MDN's Web Audio guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices). Audio is optional and has no effect on project data.
- Physical-device sound quality, touch feel, frame rate, cross-browser behavior and a complete 15-minute timer run were not independently tested. Synthetic signal/controller tests are not a listening test.
- Hosted project editing is still unavailable: the public site is a read-only published collection. Local vault saves and the separately run status publisher remain the route for updates. Course approval records were preserved.
