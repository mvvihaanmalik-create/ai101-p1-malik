# Room 0 v15: the numbered ascent

November 10, 2026. Vihaan requested implementation of [Test 2](../formal-cycle-1/T2-result.md) and [Test 3](../formal-cycle-1/T3-result.md) feedback before the next formal test. v15 includes the v14 hand, dog and lettering repairs. The v13 recordings and their results have not been rewritten.

## Live release

[Public game](https://room-zero-ashy.vercel.app/) · [Fixed v15 game](https://room-zero-dc83ablcv-vihaanmalik.vercel.app/) · [Fixed v15 review fixtures for Test 4](https://room-zero-dc83ablcv-vihaanmalik.vercel.app/?review=1). Deployment `dpl_BUX5zmFBvACf8B18k7fbWjTz4sDK` was staged, verified and promoted on November 10. Thirteen unauthenticated responses matched the staged file hashes on both the [fixed release](fixed-verification.json) and [public alias](alias-verification.json). Only the runtime files were published.

## What to play

From reception, walk to the broken lift and take the red door. The first gallery and the children's stair landing form an ordinary, unscored tour. Back at the register, E takes the short east stair; walking through the red door takes the longer west gallery. Look at the shared lift before choosing. A correct gallery decision or a correct retreat earns the next climb. Continuing correctly at the top of an observation flight takes you straight to the next floor. The fourth correct decision earns the suite.

A scored route has one staged subject, not a hallway of competing guests. The upper landing hosts the children, the dog or the hanging coat. The gallery hosts the butler, room service, the bar, the late traveller, founder, rain, mirror or runner. The lift can be the change at the common entrance. Normal and changed scenes share a camera and register description. The hotel decides whether a visit is changed before the route is picked; subsequent route selection does not reroll that decision. Subject decks shuffle independently by route and condition. Moving between routes does not guarantee a single nonrepeating global sequence.

Press Escape for the **night register**, which describes ordinary conditions. E holds an available detail shot until the player steps away. Three new Blender shots cover the upper landing, bell and runner. The children keep a slow rhythm with a pause at either end; the strange toy is a glazed cast of a third child's face made from the project's existing CC0-derived model. No new recording, third-party character or library was added.

The warning gives a 5.5-second head start before pursuit. Walking into the butler's body still triggers contact during that interval. A result caption distinguishes passing a change, retreating on an ordinary visit and being caught. The full cast still appears in the reception ending.

## Developer evidence, separate from the formal tests

- [25 automated checks](unit-tests.txt) include both route pools, normal/changed reachability for all twelve subjects, duplicate-score protection, threshold crossing, locomotion and the ending. [Asset check](asset-check.txt) covers the registered cameras and shipping assets.
- [Mixed-route browser checkpoints](browser-checkpoints.json): a fresh ordinary tour remained unscored; the developer alternated east stair and west gallery, reached 4/4, entered the suite and triggered the reception ending. This draw contained four changes (dog, rain, coat, trolley), so it exercised four correct retreats. The browser check used diagnostics to select the expected answer, not a player's unaided recognition.
- [Butler check](browser-edge-checkpoints.json): a retreat earned 1/4. After selecting his encounter again, one contact returned the player to the landing at 0/4; movement resumed. The first engineering attempt exposed a grace-period collision bug ([original log](edge-before-contact-fix.log)); it was fixed before delivery. [Final check](browser-edge-result.json).
- [Ordinary exits and shared landing](browser-boundaries-checkpoints.json): the top of an ordinary observation flight earned floor one, the far end of an ordinary gallery earned floor two, and retreating from the changed shared lift earned floor three. [Ordinary children](ordinary-children.jpg), [changed children](porcelain-game.jpg), [butler bell](bell-study.jpg) and [gallery handoff](gallery-last-order.jpg) are in-game fixture stills refreshed on the signed build.
- [Guidance decision](../../../decisions/ADR-009-night-register.md) and [staging decision](../../../decisions/ADR-010-separate-the-ascent.md). Gameplay checks were developer-operated in an isolated browser. They cannot establish newcomer comprehension, perceived horror, audio quality or human acceptance.
- [Next formal test: T4](../../test-4-v15.md). It is pending. Recording T4 on this version will make Cycle 1 a mixed-build record, with no v13 T4 for comparison.

The first browser captures used the revised mechanics before the final destination-sign rerender. The final art pass changes the gallery's old suite sign to WEST STAIR, the red door to WEST GALLERY, and the stair door to UPPER LANDING where visible, including anomaly variants. Historic v14 plates remain intact.
