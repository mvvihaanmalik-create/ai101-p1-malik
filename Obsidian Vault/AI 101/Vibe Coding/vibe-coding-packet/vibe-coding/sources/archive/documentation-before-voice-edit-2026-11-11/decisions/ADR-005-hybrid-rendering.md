# ADR-005: rendered hotel, real-time characters

Date: 2026-11-08
Status: approved by Vihaan for the first visual prototype.

## Decision

Use a hybrid presentation: a single coherent Blender hotel scene rendered from fixed cameras, with real-time 3D guest and butler, atmospheric effects, and matching occlusion in Three.js. Plain HTML/CSS/JavaScript hosts the experience. Three.js earns its place for imported models, perspective cameras and animation; no UI framework is needed.

Vihaan approved this route and authorized continuous work on a visual prototype of the corridor, walking guest and approaching butler, including resources and tools needed. Routine implementation and tuning can proceed without small approvals. The complete game, final visual acceptance and publication are separate milestones.

## Reason

The approved moodboard depends on rich materials and carefully composed lighting. Rendering the static environment offline permits that detail without making every browser calculate it each frame. Camera transforms must come from the same Blender scene so the moving characters have consistent scale and perspective.

## First proof

- One detailed corridor, two connected fixed views and readable spatial movement.
- A faceless guest in a shirt, tie and blazer, with a walk cycle.
- A formally dressed butler who approaches; crucifix repulsion as a practical staging check.
- Rendered backgrounds, matching 3D camera transforms, contact shadows and occlusion.
- Local browser preview, source Blender scene and reproducible generation scripts.

This is a visual and technical proof, not the full randomized game or the course's formal Cycle 1 test run. The twelve-anomaly pool, four-step progression and final reception sequence remain future work.

## Tools and limits

The requested headless Blender MCP is not exposed in this session. Blender 4.3.2 is installed locally, so the prototype uses its supported background Python/CLI workflow instead. This substitution does not change the rendering route.

Serve build/index.html over local HTTP because model loading uses fetch. Do not promise double-click file loading. Pin and retain runtime dependencies locally. Record every actual third-party asset and license; references are direction, not game assets to copy.

## Acceptance evidence

Inspect actual rendered and browser frames for material/lighting fidelity, planted feet, character scale, clipping, camera continuity, hidden guest face, approach/repulsion and stable controls. Record remaining quality gaps honestly before the prototype review.
