# Visual pass · v18

**Direction:** Keep the red reception, cold gallery and fixed cameras. Improve what the player can see within those shots: cloth, leather, reflected stamps, the porter’s face and the hotel’s lettering.

| Where | Change |
| --- | --- |
| Hotel and ending | Re-render the existing Blender cameras at 2560 × 1440. Normal and changed views use the same lens, so the camera gives no hint about the answer. |
| Cast and props | Woven uniforms, polished shoes, suitcase seams and clasps. The dog keeps its authored fur and normal maps. The close mirror uses a sharper reflection. |
| Left luggage | Walnut grain, brass edging, velvet, contact shadows and reeded glass behind the guest. The stamp remains the puzzle clue. |
| Display | Show a lightweight image immediately; load the full picture for the current view. Keep three large pictures at most. Reduce the drawing resolution if sustained slow frames would interrupt walking. |

**Evidence:** [Camera and anomaly comparisons](tests/visual-18/camera-audit.json) · [Missing-image check](tests/visual-18/after/browser-visual-fallback-result.json). These are developer checks. Formal Cycle 2 observations belong in the [test card](tests/formal-cycle-2/README.md).

**Later:** Vihaan wants to consider an API feature once the story is final. No feature or provider chosen; no key in the game.
