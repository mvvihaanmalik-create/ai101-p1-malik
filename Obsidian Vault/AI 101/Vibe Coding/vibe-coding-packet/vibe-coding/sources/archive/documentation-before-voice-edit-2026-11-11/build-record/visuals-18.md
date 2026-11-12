# Visual pass · v18

**Asset/tool provenance:** The 38 images were re-rendered with headless Blender and Python. No confirmed Blender MCP calls are recorded. Humans use CC0 MakeHuman assets; the dog is 3dskillup.art’s CC BY 4.0 model. [Sources, licences and scripts](../sources/assets-and-tools.md).

**Direction:** Keep the red reception, cold gallery and fixed cameras. Improve what the player can see within those shots: cloth, leather, reflected stamps, the porter’s face and the hotel’s lettering.

| Where | Change |
| --- | --- |
| Hotel and ending | Re-render the existing Blender cameras at 2560 × 1440. Normal and changed views use the same lens, so the camera gives no hint about the answer. |
| Cast and props | Woven uniforms, polished shoes, suitcase seams and clasps. The dog keeps its authored fur and normal maps. The close mirror uses a sharper reflection. |
| Left luggage | Walnut grain, brass edging, velvet, contact shadows and reeded glass behind the guest. The stamp remains the puzzle clue. |
| Display | Show a lightweight image immediately; load the full picture for the current view. Keep three large pictures at most. Reduce the drawing resolution if sustained slow frames would interrupt walking. |

**Evidence:** [Before and after viewer](tests/visual-18/compare.html) · [Route through the ending](tests/visual-18/route/browser-route-result.json) · [Camera and anomaly comparisons](tests/visual-18/camera-audit.json) · [Missing-image check](tests/visual-18/after/browser-visual-fallback-result.json). These are developer checks. Formal Cycle 2 observations belong in the [test card](tests/formal-cycle-2/README.md).

**Later:** Vihaan wants to consider an API feature once the story is final. No feature or provider chosen; no key in the game.

**Release:** [Fixed v18](https://room-zero-m5lhu3ol5-vihaanmalik.vercel.app/) · [Live verification](tests/visual-18/alias-verification.json). All 38 images passed the camera check; all 13 sampled gameplay views displayed their full-resolution image. The [developer tour](tests/visual-18/after/shot-register.json) and [four stills](tests/visual-18/hotel-stills.jpg) are saved here.
