# ADR-007: replace the sculpted dog with a textured canine

- Date: November 10, 2026. Vihaan requested a free reusable replacement after formal T1.
- Context: the primitive-based dog looked extremely fake to the live observer.
- Decision: adapt German Shepherd by 3dskillup.art, CC BY 4.0, from https://3dskillup.art/free-assets/german-shepherd/ . Retain its anatomy, UV textures and rig; export a browser model, pose a seated shadow, add restrained head motion and integrate it into the ending.
- Consequence: the dog is third-party artwork, not an original model by the student or Codex. Credit and adaptation details appear in the game's credits and the vault. The download contains a 4,991-vertex mesh and 1024px packed textures despite the landing page advertising 2K.
- Evidence: original ZIP and source page in `sources/assets/german-shepherd/`; adaptation facts and visual checks in `build-record/tests/repairs-14/`. Normal/anomalous behavior remains a standing dog whose shadow changes posture.
