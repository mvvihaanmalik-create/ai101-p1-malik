# Pip audit and fixes

Date: 23 October 2026

## Gaps found

- The embedded Shelf popup used a separate queue from Workshop.
- Saved cards and selected references had no separate approval record.
- Pip pointed to Technologist instead of Creative Partner.
- The standalone bridge included saved IDs from other projects.

## Changed

- The embedded popup now uses Workshop's Pip runner and current project context.
- Pip receives the current goal, direction, route, small test, project summary, source guide, and this project's saved IDs.
- New source links can be imported into Shelf. Saving a card does not approve it.
- Review the project board, then choose **Approve references & hand off**.
- Creative Partner receives a saved snapshot of the approved titles, URLs, dates and summaries. Its request is prepared for the user to send.
- Changing the shortlist clears reference approval. Reopening a plan also clears it.
- The map pauses in amber for reference approval.
- Approved references and their approval time are written to the run's vault journal.
- The hosted standalone popup remains a separate service. This pass connects the local embedded Shelf.

## Checks

Passed isolated API checks with fixture projects and a fixture agent: goal gate, missing reference rejection, explicit reference approval, server-owned source snapshots, Creative Partner context, project-scoped saves, current goal, approval reset, exclusion of unapproved Pip output, vault journal, locked plan, and reopened plan.

Built both apps and checked JavaScript syntax. Reviewed the Workshop map, reference review screen and embedded Shelf controls.

Browser automation could not click controls inside the embedded Shelf frame. A real popup research request and user-approved handoff are still to be tried. No real project gate was approved during the audit.

## Next live run

1. Approve the current goal in Workshop.
2. Open Design Shelf and ask Pip for a few references.
3. Save the useful ones to this project's board.
4. Choose **Review board for Creative Partner**.
5. Review, approve, then send the prepared Creative Partner request.

## Desk changes

Chief opens a notebook. Designer sketches and fans swatches. Technologist assembles blocks. Auditor checks a list and scans it. Pip's cards and Programmer's monitor remain in the same staggered loop. Reduced motion is respected.

## October 26 update

The current hosted Workshop now reads the Sunday cloud asset catalog. The PC checks newly saved cloud assets independently before use. Pip uses assets only. Its source guide, role documents and 10-pick weekly edition now agree. Earlier fixture results above remain dated evidence, not a live test of the new cloud flow. A user-approved real research and Creative Partner handoff remains a useful defense demonstration.
