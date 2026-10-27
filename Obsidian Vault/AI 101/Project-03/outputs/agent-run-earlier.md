# Technologist agent run — idea.quest redesign

**Comparison input:** `Project 2/outputs/idea-quest/01-define-the-goal.md` (same approved goal used for `p2-run.md`). I also read `Project 2/00-start-here.md`, as allowed by the agent file. I did not use other vault files.

## Goal and missing facts

Build a readable, interactive potion-room view for idea.quest with three jars whose fill reflects approved gate counts (0/5, 2/5, 5/5). Users must be able to open real project details and return to the table. Keep the public site read-only, preserve all project records, and support the Windows review setup, public link, narrow layouts, keyboard, touch, and reduced motion.

The goal does not specify an effort/budget ceiling, the actual phone/browser for testing, or a visual-quality threshold for the first prototype. The target is a web page, and Windows is the primary review computer. I will not assume that narrow-layout support proves real-phone performance.

## Route options

| Route | Fit | Main cost or risk |
|---|---|---|
| Layered HTML/CSS and SVG jars (recommended) | Can bind jar fill to gate data and use ordinary labelled buttons and HTML details. Smallest first interaction to build. | Layered art may not meet the desired 3D look; responsive composition still needs review. |
| Canvas 2D with HTML controls | One drawn scene with data-linked jars. | Custom hit-testing and accessible fallback need care. |
| Three.js scene | Real 3D depth and object picking fit a fully dimensional room. Three.js documents raycasting for picking and responsive renderer sizing. | More rendering and interaction work, plus greater phone-performance uncertainty. |

Official Three.js references: [picking](https://threejs.org/manual/pages/picking.html) and [responsive design](https://threejs.org/manual/pages/responsive.html). These document available approaches; they do not establish how this specific scene will perform on the user's phone.

## Recommendation and smallest test

Start with layered HTML/CSS and SVG jars while keeping the interface and data rules in the approved goal. Render only the three jars and a simple table. Use a copied fixture with 0/5, 2/5, and 5/5 counts. Check that each fill and numeric label match; selecting a jar opens the matching details; keyboard activation also works; returning does not change any gate. Try desktop and a narrow viewport. If a convincing 3D look is essential to the user's success criteria, compare the Three.js version against this small slice before expanding the room.

**Human check:** Review the evidence and choose the visual route and test scope. No route approval or new build is claimed in this run.

## Limits of this run

The agent's listed inputs excluded the existing Project 2 feasibility research, implementation details, and earlier route decision. This recommendation therefore uses the approved goal plus current Three.js documentation; it cannot compare the proposal against the existing app's code or reproduce every fact in the Project 2 feasibility output.
