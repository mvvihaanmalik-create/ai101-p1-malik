# How I’m building Hotel of Horror
I chose a hybrid approach to get close to the moodboard: render the hotel’s lighting and architecture in Blender, then draw moving 3D characters over those images in the browser.

## What each tool does
| Tool | Role |
| --- | --- |
| Blender 4.3.2 | Build and render the hotel, fit characters, author animation and export models |
| Three.js | Draw characters, props, mirrors and effects using cameras matched to Blender |
| HTML, CSS and JavaScript | Run the game, controls, menus and anomaly rules |
| Python, NumPy and Pillow | Generate decorative textures, material studies and smaller preview images |
| Web Audio and licensed music | Play ambience, cues and the hotel/ending score |
| Vercel | Host the game |

I asked for Blender MCP. The documented work used headless Blender with Python scripts because MCP tools were unavailable. Add-on startup messages do not establish MCP use.

## Current visuals
The game shows a smaller image first, then loads the full picture for the active camera. It keeps up to three large pictures in memory.

## How I got there
1. I chose one hotel, fixed views and an observation rule. I selected the darker moodboard as a guide for the rooms and lighting.
2. Codex built room geometry and rendered matching camera views in headless Blender. Three.js uses the same view to draw the rigged figures, moving props, reflections and effects.
3. I reviewed normal and changed scenes, then asked for changes where a clue was hard to read or a pose broke the illusion. Codex checked the rigs, routes and browsers after each pass.
4. I chose to show a recorded run in class. Codex captured all twelve sightings and the full finale with game audio. FFmpeg encoded the 4K walkthrough, with the opening and ending rendered frame by frame.

I asked for more realistic characters after the first blocky prototype. The cast uses adapted CC0 MakeHuman assets. The dog is 3dskillup.art’s CC BY 4.0 German Shepherd. The exterior car uses Khronos Car Concept, and the exit adapts a Microsoft Rocketbox motion reference. [Credits and scripts](sources/assets-and-tools.md).

The hotel, props and most decorative work were generated for this project. The current scenes still reuse architecture, and the animations are authored rather than motion capture.

[Visual comparison](file:///C:/Users/91982/Videos/Hotel%20of%20Horror%20Archive/build-record/tests/visual-18/compare.html) · [Developer checks](file:///C:/Users/91982/Videos/Hotel%20of%20Horror%20Archive/build-record/visuals-18.md) · [Detailed technical history](file:///C:/Users/91982/Videos/Hotel%20of%20Horror%20Archive/sources/archive/documentation-before-voice-edit-2026-11-11/room-zero-technical-approach.md).
