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
The game has 38 rendered hotel, anomaly and ending images at 2560 × 1440. It first shows smaller images, then loads the full picture for the current view. It keeps at most three large pictures in memory.

I asked for more realistic characters after the first blocky prototype. The cast now uses adapted CC0 MakeHuman assets. The dog uses a credited CC BY 4.0 German Shepherd model. [Credits and scripts](sources/assets-and-tools.md).

The hotel, props and most decorative work were generated for this project. The current scenes still reuse architecture, and the animations are authored rather than motion capture.

[Visual comparison](build-record/tests/visual-18/compare.html) · [Developer checks](build-record/visuals-18.md) · [Detailed technical history](sources/archive/documentation-before-voice-edit-2026-11-11/room-zero-technical-approach.md).
