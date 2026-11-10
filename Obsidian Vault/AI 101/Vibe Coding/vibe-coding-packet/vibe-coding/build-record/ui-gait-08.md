# Room 0: interface and guest movement 08

November 9, 2026. Vihaan requested clearer UI without tiny illegible text, survival-horror fonts/buttons, and a more natural player walk.

## Interface

Cinzel headings, IBM Plex Sans controls, warm ivory text and restrained brass highlights. Title and pause menus use large text rows with a selection chevron, generous click targets and visible keyboard focus. Standard buttons are approximately 49 px high with 18 px text; compact buttons are at least 44 px high with 17 px text. Instructions use readable keycaps. Removed the small build-edition/footer copy and duplicate in-play controls. Captions and interaction prompts are larger, with contrast against the scene. Audio controls remain in the pause menu. The compact pause panel fits without scrolling at the checked 653 px window width; desktop checked at 1280 × 720.

## Guest movement

The existing detailed mesh, textures and 53-bone rig are retained. Headless Blender authored six clips: Idle, Walk, WalkBack, StepLeft, StepRight and Raise. Forward and retreat stance are narrower; the previous constant crouch was replaced by a smaller contact-to-midstance weight shift, with lower foot clearance, quieter shoulders and restrained opposite-arm swing. Side steps have their own wider contact spacing.

Runtime animation follows actual world displacement after bounds checks, rather than the pressed key. This corrects the gait direction across fixed-camera angles and eliminates forward-walking legs during side travel. Forward pace is 1.22 m/s, retreat .86 m/s and side steps .68 m/s, with bounded acceleration and braking. Diagonal steps blend directional clips at a shared footfall phase. Standing against a wall no longer advances the step phase; the pose blends back to idle. Footstep sound follows alternating contact phases. Room resets/restart clear velocity and gait; pause clears velocity. Held input keeps its existing movement basis across camera cuts. The guest's concealed face is preserved.

Source: `build/tools/refine_guest_gait_v8.py`, editable `build/assets/guest-locomotion-v8.blend`, runtime `guest-v8.glb`, and `build/src/guest-locomotion.js`. The old model remains in source history. This is a procedural rig animation pass, not motion capture or a new character model. Stairs retain the existing floor-height system rather than per-step foot IK.

## Verification

- All 20 automated tests pass: 15 existing loop/ending/music tests and five locomotion tests for actual direction, diagonal displacement, blocked movement, stopping distance, and frame-rate consistency.
- Syntax and runtime asset checks pass; guest asset contains one weighted 53-bone rig and six clips, approximately 3.08 MB.
- Authored stance measurements over 19 samples per clip show sub-micrometre ankle drift when combined with each clip's matching root translation. This measures the authored single-clip stance, not zero runtime sliding during transitions or on stairs.
- Browser checked intro, pause, resume, restart, forward travel through corridor camera cuts, retreat, side travel and crucifix input. Runtime diagnostic samples show the expected forward/back/side blends and no recorded errors. Restart clears phase, velocity and gait.
- Screenshots and measurements: `build-record/tests/ui-gait-08/`. `gait-study.png` is a neutral Blender pose study, not a gameplay screenshot. Compact and desktop menu screenshots show the actual interface.

These are developer checks. Vihaan's subjective movement/visual review and formal coursework human testing are still pending.

## Font provenance

Self-hosted fonts downloaded from Google Fonts: [Cinzel](https://fonts.google.com/specimen/Cinzel) 600 and [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) 400/500. Full SIL Open Font License texts are bundled in `build/assets/fonts/Cinzel-OFL.txt` and `IBM-Plex-Sans-OFL.txt`, sourced from the official Google Fonts repository. No runtime font service or new JavaScript dependency is required.

## Deployment

Published to [the existing private Room 0 URL](https://room-zero-ashy.vercel.app/). Deployment `dpl_7jnETw9DScDCSDAdSfejxo6Ygjvn` is READY under VihaanM/room-zero. Authenticated remote downloads of index.html, main.js, style.css, guest-locomotion.js, guest-v8.glb, Cinzel 600 and Plex Sans 400 match local SHA-256 hashes. The connector confirms all-URL Vercel Authentication remains enabled. Anonymous root request returns HTTP 302 to authentication. The staged runtime contains 78 files, approximately 34.18 MB, excluding Blender source, vault notes, tools and obsolete assets.
