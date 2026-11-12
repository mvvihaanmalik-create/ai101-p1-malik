# ADR-005 · Rendered hotel, moving characters
November 8, 2026

**Why:** I wanted the game to look as close to the moodboard as possible in a browser.

**My decision:** I chose Blender-rendered backgrounds with live 3D characters and effects in Three.js. The cameras match so they share perspective.

**Tradeoff:** Rich lighting costs less during play. I trade free camera movement for composed fixed views. Blender MCP was unavailable; the documented work used headless Blender scripts. [Technical approach](../room-zero-technical-approach.md).
