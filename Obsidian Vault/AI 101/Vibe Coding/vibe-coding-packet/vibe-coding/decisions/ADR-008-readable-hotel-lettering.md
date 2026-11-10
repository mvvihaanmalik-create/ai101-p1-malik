# ADR-008: readable hotel lettering

- Date: November 10, 2026. Vihaan requested clearer, heavier wall text after formal T1.
- Context: the live observer found the existing wall lettering unclear and too light.
- Decision: render the same hotel shots with bold serif lettering, restrained ivory contrast, slightly larger sizes and less widely spaced headings; increase prop-label texture resolution and letter weight.
- Consequence: baked environment text gains weight without adding floating interface labels or extra live geometry. Retain shot transforms and anomaly differences. Existing v13 plates remain available in the frozen baseline.
- Evidence: `build-record/tests/repairs-14/`, with source render log and sign settings. Readability at the user's normal viewing size still needs their review; no formal outcome is assumed.
