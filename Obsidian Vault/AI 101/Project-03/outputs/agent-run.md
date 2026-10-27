[ESF: no PS for agent-run-claudian.md; note one?]

# Technologist rerun — original idea.quest feasibility

**Rerun:** October 20, 2026. **Frame:** Reassess the original Step 2 question from the accepted October 11 Step 1 goal, before choosing a rendering route. This is a retrospective feasibility exercise, not a new build or a reversal of a later decision.

[■□□□□] **Historical starting point:** 1/5 gates approved · 01 Goal ✅  02 Route ▶  03 Prototype ○  04 Human check ○  05 Decide ○

**Now:** Choose the smallest rendering approach that can make the three-jar potion room a *working tracker*, not merely an illustration.

**Evidence or change**
- The independent Technologist run used only [[AI 101/Project 2/00-start-here.md]] and [[AI 101/Project 2/outputs/idea-quest/01-define-the-goal.md]], the two inputs listed in [[AI 101/Project 2/agents/Technologist.md]]. It did not inspect app code or the earlier Step 2 answer.
- After that run, I separately cross-checked its claims against [[AI 101/Project-03/outputs/p2-run.md|the saved original feasibility evidence]]. That cross-check is marked below so the agent's input boundary remains visible. The saved copy matches [[AI 101/Project 2/outputs/idea-quest/02-check-feasibility.md|the Project 2 Step 2 note]] byte-for-byte.

**Count audit by the coordinator · 2026-10-20 (not an agent input):** I compared [[AI 101/Project 2/progress-arcade/projects.json|the local project record]], [[AI 101/Project 2/progress.md|the generated progress note]], the public `projects.json`, and the live journal's accessible progress values. All current gate counts agreed: idea.quest **5/5**, Gaze **2/5**, Image Palette Studio **5/5**. Project 1 has **no five-gate score** and appeared as a released keepsake, not a progress bar. The **1/5 strip above is historical**, from the Step 1 point. The **0/5, 2/5, 5/5 examples in this rerun and the archived [[AI 101/Project-03/outputs/p2-run.md|Project 2 run]] and [[AI 101/Project-03/outputs/agent-run.md|agent run]] are test fixtures**, not today's three live jar values; those archival copies remain unchanged. No live count conflict was found; the agent did not perform this later verification.

## Goal, data contract, and missing facts

The first test needs one table, one original cat witch, and three selectable project jars. Each jar must show a legible name and numeric approved-gate count, with liquid height derived from the same registry count—not painted into the background. Choosing a jar should bring that project forward and open its real title, approved gates, current/next step, and dated updates. Return or Escape closes details; selecting never approves a gate. Preserve the whole registry, including Project 1 as an artifact rather than a fabricated 5/5 workflow, Image Palette Studio's pending accent side quest, the local explicit-decision and `progress.md` sync path, and the hosted read-only boundary.

**Important inconsistency in the Step 1 input:** It calls idea.quest 0/5 in the three-jar prototype but also says its Goal gate is approved (1/5). A 0/5, 2/5, 5/5 *fixture* can demonstrate all fill levels, but a real project jar must use the registry's actual approved count. Do not hard-code an attractive empty jar or alter accepted records to make the illustration match.

The permitted inputs do not establish a time/budget ceiling, the user's phone/browser, exact art-quality threshold, registry schema, existing build tool, or current deployment mechanics. Those are unknown, not permission to guess.

## Route comparison

| Route | Fit and main tradeoff | Rough effort for an unpolished functional slice* |
| --- | --- | --- |
| **A. Layered 2.5D SVG/CSS + HTML controls — recommended** | SVG shapes and a clipped liquid layer can respond to data; HTML buttons and details keep labels, focus, and text usable. Best fit for a fixed storybook table. Depth is illustrated rather than freely navigable; original layered art and narrow layout still need work. | Agent estimate: **1–3 developer days**, with art polish additional and unknown. |
| **B. Canvas 2D + HTML overlay** | Allows one cohesive painted scene and motion, but jar hit-testing, redraw, resizing, focus, and matching HTML controls add plumbing for only three jars. | Agent estimate: **2–5 developer days**. |
| **C. Three.js real-time 3D + HTML overlay** | Real depth, camera motion, light, and dimensional jars. Requires geometry/assets, renderer/camera, picking, responsive layout, WebGL fallback, and phone-performance checks. | Agent estimate: **5–12+ developer days**, highly dependent on art ambitions. |

*Planning judgments, not measured timings or cost promises. Assumes an experienced developer and reuse of existing data/actions. A still simpler **three-card HTML/CSS view** could validate the data and navigation contract before producing room art.

The browser mechanisms are documented: SVG [`<clipPath>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/clipPath) restricts a drawing area; [native buttons](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) provide a keyboard-activatable control; [Canvas guidance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage) calls for useful fallback content; [Three.js installation guidance](https://threejs.org/manual/pages/installation.html) describes npm/build-tool or CDN setup; its [WebGL utility](https://threejs.org/docs/pages/WebGL.html) can test WebGL 2 availability. [Reduced-motion preference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) can suppress nonessential zoom, bobbing, and flicker. These sources establish available techniques, **not** that any route is already accessible, beautiful, or fast on this user's phone.

## Recommendation and smallest falsifying test

**Recommend A for the original first prototype:** keep the existing registry/actions, make the table and cat restrained layers, draw simple SVG jars, and put the interactive target and detail text in HTML. This minimizes new dependencies and tests the room as a tracker before investing in scenery. It is a recommendation, **not** route approval.

**Test only after human approval:** Start with **one** minimally styled jar connected to one actual registry record, not a pre-painted liquid level. Confirm its numeric label and SVG fill agree; activate its native button by pointer and keyboard; read the correct HTML details; close with Return/Escape; and confirm that no gate changed. Deliberately change or refetch a *copied/test* record through the existing authorized path and check the level updates. Test on the Windows review browser and a narrow viewport, including focus order and reduced motion. If data cannot safely drive even one jar, stop before drawing the full room. A physical-phone usability check remains separate.

**Historical human check:** At this original Step 2 point, the Technologist would ask Vihaan to choose A, B, or C and approve or revise this small test. It must not advance the gate on its own.

## Separate cross-check against existing Project 2 feasibility evidence

The original [[AI 101/Project-03/outputs/p2-run.md|Project 2 run]] likewise recommended layered 2.5D SVG/CSS first, compared Canvas and Three.js, preserved the four records and approval boundary, and proposed a small data-driven interaction before visual polish. Unlike the restricted agent, that run recorded local app/server inspection, Node/npm availability, and public polling behavior as **October 11 evidence**. This rerun did not reproduce those checks, so they are not presented here as fresh verification.

The effort estimates differ materially: the original note guessed **3–6 hours** for a very simple Route A spike, while this agent guessed **1–3 developer days** for an unpolished functional slice. Their scope and art assumptions are not identical, and neither figure was measured; do not use the difference as proof that one route became easier or harder.

The original Step 2 note later records Vihaan choosing **Route C, Three.js**, and approving an isolated side-build while the older public site stayed live. That historical choice is not undone by this rerun's Route A recommendation. No new route approval, prototype, or progress-gate change is claimed here.
