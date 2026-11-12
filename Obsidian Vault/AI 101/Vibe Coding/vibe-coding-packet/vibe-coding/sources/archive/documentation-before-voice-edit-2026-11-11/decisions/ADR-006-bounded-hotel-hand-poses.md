# ADR-006: stable hotel hand poses

- Date: November 10, 2026. Vihaan requested this repair after observing formal T1.
- Context: T1 feedback called hotel hand/finger movement unnatural, fake and off-putting. The procedural grip added rotation each frame; constant animation tracks may not rewrite an unchanged property, allowing the correction to accumulate.
- Decision: restore authored arm/hand rotations before the animation mixer and procedural reach; apply bounded, differentiated finger bends with eased grip/release. Preserve the current characters, route and anomaly timing.
- Consequence: pose offsets cannot accumulate with elapsed time or frame rate. A mechanical regression test is useful, but visual realism still requires a human judgment.
- Evidence: `build-record/tests/repairs-14/`, including automated regression and visual checks. This is repair verification, not a fabricated formal Cycle 2 result.

Verification refinement: close-up review also exposed incorrect finger bend axes and an unreachable glass trajectory. Palm-relative axes and grip orientation now come from the actual bones. A modest server-scale/counter-height/receiver-position adjustment keeps the ordinary trajectory reachable; the sampled seven-second cycle had maximum target error 0 m for the server and 0.002 m for the receiver. See handoff-reach-sweep.json. The intentionally separated anomalous glass remains independent of the hand.
