# My latest visual pass · v18
I asked for more polish across everything on screen: resolution, materials, characters and lighting.

| Part | What changed |
| --- | --- |
| Hotel and ending | 38 images re-rendered at 2560 × 1440 from the original Blender scenes |
| Characters and props | More material detail in uniforms, shoes, leather and brass; clearer close reflections |
| Luggage room | Walnut grain, velvet, contact shadows and a reflected reeded-glass window |
| Loading | Smaller images appear first; the current view loads in full detail, with up to three large images kept in memory |

I used Codex to carry out this pass through headless Blender, Python and Three.js. The humans remain MakeHuman adaptations; the dog remains 3dskillup.art’s model. [Credits](../sources/assets-and-tools.md).

**Checked:** The route reached the suite and ending, all 38 images passed the camera check, and all 13 sampled views displayed their full-resolution image. These are developer checks; formal Cycle 2 feedback is still pending.

[Compare before and after](tests/visual-18/compare.html) · [Game stills](tests/visual-18/hotel-stills.jpg) · [Route check](tests/visual-18/route/browser-route-result.json) · [Image check](tests/visual-18/camera-audit.json) · [Live-file verification](tests/visual-18/alias-verification.json).

I’ll consider an API feature once the story is final. I have not chosen its purpose or provider.
