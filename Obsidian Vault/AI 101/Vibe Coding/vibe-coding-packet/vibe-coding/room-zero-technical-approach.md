# Room 0: technical approach and first visual proof

Approved November 8, 2026. See [ADR-005](decisions/ADR-005-hybrid-rendering.md).

## Current revision: hostile reception ending 06

An isolated Three.js scene runs after the unlocked suite-door interaction. It reuses the reception plate and character models, adds two matched reception cameras, and uses an original weighted skeleton aligned to the butler's rig. Flesh opacity fades while bone geometry becomes visible. The reverse shot stages all C2-C6 figures around the viewer and advances their placements and walking phase together. The ordinary loop is not simulated during the ending.

A pure timeline maps simulation time to shots, reveal, blur, darkness, enclosure and completion. Escape/visibility pause freezes the timeline. The final image is terminal until explicit replay. The same greeting constant is used at the beginning and end. Input cannot cast or score during the ending.

The ending renders to a half-float target and composites a restrained glow, defocus and vignette. Facial textures remain visible; furniture has lower emission than figures. Reduced-motion preference disables defocus and the small bone-light pulse. Ending shaders, textures and geometry are warmed before entry. The final cast scene contains 349,598 submitted triangles and 138 draw calls, plus the composite quad. A 60-sample completed-render probe measured 2.3 ms median / 5.8 ms p95 at an 1111 x 625 drawing buffer. This is renderer cost on this machine, not sustained FPS or a cross-device guarantee.

[Implementation, verification and limitations](build-record/ending-06.md). The original skeleton is stylized, not a scanned anatomical asset; the dog retains its articulated sculpture rather than gaining a full walk rig.

## Historical revision: encounter expansion 05

All twelve catalogue IDs now run in the existing pure-JavaScript passage loop. One character vignette is rendered per passage. Normal passages can select any of the six; character anomalies select their own cast. Environmental anomalies use an ordinary cast, with E6 retaining the side-standing butler so figures do not intersect the breathing runner. Eight matched detail cameras join the original nine. E opens/closes them; animation continues, movement stops, and Escape pauses both. C1 refuses inspection so the threat cannot be frozen through a close-up.

Live props and skinned actors provide C2-C6/E5. Matched Blender plates provide E1/E3/E4, including the mirror seen from the coat close-up. The mirror contains actual rendered stair geometry visible only to reflection rays; its ordinary reflection is static. The portrait shadow and dog shadows use projected human/dog meshes. These are authored hybrid effects, not real-time ray tracing. Five human exports retain 53-bone rigs. The dog has articulated head nodes and separate standing/seated shadow meshes, not a full skeletal walk rig.

The visible-only scheduler, output cap and prewarmed shaders remain. The two-child passage measured 276,992 submitted triangles, 66 draw calls and 1.0 ms median / 1.7 ms p95 completed rendering time at 1280 x 720 on this machine. Scheduling can still stall in the embedded preview; this measurement is not an FPS guarantee. [V5 evidence and source details](build-record/encounters-05.md).

## Historical revision: anomaly loop 04

The v3 hybrid rendering foundation is retained. A pure JavaScript state machine owns orientation, seed, the anomaly bag, progress, one-time decisions and suite unlock. Physical threshold crossings call it; scoring is independent of frame timing. Live rain lines and a subdivided runner share the existing world coordinates and matched camera. The normal bell follows the butler's hand position; the anomalous bell floats separately. No new dependency, new downloaded asset, or additional Blender render was needed for this pass.

The visible-only scheduler, distance-driven animation, 1.18 camera/plate crop and original lighting remain. The first pool is C1/E2/E6; additional props and characters will extend the catalogue after their visual cues are implemented. Review fixtures are gated behind `?review` and are absent from ordinary play. [Tests and limits](build-record/anomaly-loop-04.md).

## Previous visual foundation: prototype 03

The hybrid approach now covers six connected locations and nine fixed shots: three in the corridor, two on the stairs, and one each in reception, the lift landing, suite threshold and night bar. Camera transforms and lens-derived field of view are exported in `hotel-v3.json`. E operates room transitions and brief notices. The stairs use a smooth collision slope; dedicated foot placement on individual treads remains future work.

Both figures together contain roughly 79k triangles. Submitted corridor geometry, including shadows, fell from 444,804 to 158,928 triangles. Fifteen distributed point lights were replaced by two local lights, with a warm key and cold rim. The shadow map is 512 pixels; output resolution is capped. Shaders are prepared before entry. Paused/static scenes redraw only when necessary.

The embedded preview sometimes delayed requestAnimationFrame despite reporting a visible document. A visible-only timer watchdog invokes the same update/render function when rAF stalls beyond 100 ms. Hidden or blurred gameplay pauses. Diagnostics separate scheduling interval from render submission cost and an explicit completed-frame probe. Stable live checks reached approximately 16.7 ms/frame at the tested viewport; this is not a hardware-wide guarantee.

Walk phase follows actual distance moved, including retreat. The authored leg solve keeps stance ankles fixed, with foot lift and heel/toe articulation. Idle/walk weights blend, and the crucifix uses an additive right-arm gesture so walking legs continue. [V3 evidence and remaining limits](build-record/visual-prototype-03.md).

## Previous revision: art pass 02

Vihaan rejected the first proof's blocky figures. The live build now uses detailed CC0 MakeHuman humans, fitted suits, skin/hair/eye textures and weighted 53-bone rigs generated through MPFB. The guest is back-facing; the butler is older and gaunter, with silver receding hair, gloves, brass buttons and a held head tilt. Each GLB includes Idle, Walk and Raise clips. Three.js AnimationMixer blends those clips; retreat reverses the guest's walking clip. The crucifix follows the guest's hand bone. Mouth interiors remain in the files but are hidden in this closed-mouth visual study to avoid unnecessary draw cost.

The new hotel plates correct a blocked-light problem: moonlight sources were inside the window mullions. They now sit behind the frames, with stronger cool light across the warm corridor. The windows admit the light, the wooden floor has roughness variation, and the runtime adds a live floor shadow to the contact shadows. Camera transforms and depth occluders remain shared with the original scene.

V2 files: `characters-v2.blend`, `hotel-lighting-v2.blend`, `guest-v2.glb`, `butler-v2.glb`, `arrival-v2.png`, `passage-v2.png`, `scene-v2.json`. The original files below are retained as v1 history. The original JavaScript and camera metadata were also copied to `sources/archive/visual-prototype-01/` before replacing them.

See [character provenance and reproduction](sources/room-zero-character-assets.md), [current README](README.md) and [art pass 02 engineering evidence](build-record/visual-prototype-02.md). The rig has skin weights and authored skeletal clips, but no facial performance or cloth simulation. The leg animation uses an offline two-bone solve, without runtime ground-contact IK. The live shadow is approximate, not an offline-matched physical shadow catcher. Further animation, material wear, lighting matching and performance work remain. This is a substantial topology/detail replacement, not a claim of final moodboard fidelity.

## Built in the first proof

- One original Blender hotel corridor, with walnut joinery, doors, olive damask, an oxblood runner, brass sconces, rainy windows, a foreground rail, framed landscapes, consoles and flowers.
- Two 1920 × 1080 offline Cycles renders from cameras in the same scene. Warm practical lights, cool window light and a low-density volume are rendered into these plates.
- Original articulated guest and butler GLBs. The guest wears a shirt, tie and charcoal jacket and stays back-facing in both cameras. Joint nodes drive walking and arm poses at runtime; this is not a captured human performance or a fully skinned production rig.
- Three.js draws the characters over the rendered image using the exact camera position, target and field of view exported by Blender. Invisible low-poly meshes write depth for the walls, rail and tables. Soft contact-shadow planes help place the characters on the floor.
- WASD/arrows, a camera cut and return cut, an approaching butler with a floating bell, F crucifix repulsion/cooldown, contact return, Escape pause, and a restart control.
- Original synthesized drone, rain-like noise, footfalls and bell tones through Web Audio. No sound recordings were downloaded.

## Files and reproducibility

- Browser entry: `build/index.html`. Runtime: `build/src/main.js`; interface: `build/src/style.css`.
- Editable scene: `build/assets/room-zero.blend`, including packed texture images.
- Models: `build/assets/guest.glb`, `butler.glb`, `occlusion.glb`.
- Camera/render contract: `build/assets/scene.json`, `arrival.png`, `passage.png`.
- Generation scripts: `make_textures.py`, `build_scene.py`, `refine_lighting.py`, `refine_characters.py` in `build/tools/`.
- Three.js 0.187.0 is pinned and its required runtime files are retained locally under `build/vendor/three/`, with the MIT license. No runtime CDN or external service is required.

Blender MCP was not exposed in the session. The installed Blender 4.3.2 was run headlessly with Python scripts through its CLI. OptiX on the installed RTX 4060 Laptop GPU rendered the final plates. The Blender MCP add-on registering during startup is not evidence that MCP calls were used.

## What this proof establishes

The hybrid camera/plate approach works in a browser. Characters can move in depth and cross a camera boundary, while the static corridor retains its offline lighting. The guest and butler can interact with a timed repulsion and contact return. Browser engineering checks and screenshots are in [the prototype report](build-record/visual-prototype-01.md).

## V1 assessment, retained for comparison

The image is still a prototype. Character anatomy, facial detail, clothing surfaces and movement are noticeably simpler than Visual Study 02. The hotel also needs more convincing wear, denser decorative detail and more deliberate cold-light shafts to reach that board's level. This proof does not establish final visual parity or portfolio readiness.

The current contact shadows are soft planes, not physically matched moving shadow catchers. Dynamic characters use a simpler lighting model than the baked AgX environment. Further compositing and lighting matching are necessary. Foot planting uses a procedural gait without inverse kinematics. Real-time cloth and facial animation are absent.

The full stairs/landing route, E inspection close-ups, randomized twelve-anomaly pool, normal encounters, four-step progress, story clues and reception ending are not implemented. The far doorway currently ends the visual study, not the story. Touch controls and mobile play are not part of this desktop proof.

Vihaan has approved the technical route and prototype work. Acceptance of the resulting visual direction is still for his review.
