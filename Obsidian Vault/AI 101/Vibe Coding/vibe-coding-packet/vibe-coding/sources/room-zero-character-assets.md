# Room 0 character assets: art pass 02

**Receptionist, v22.** I supplied a front-facing reference for her face shape and hair. Codex fitted the face and smile, shaped the long01 hair foundation, and built the side-parted shoulder waves, eyeliner and gold hoops in Blender. The existing 53-bone rig carries the greeting. [Portrait](../build-record/tests/receptionist-22/portrait.png) · [Facial fitting](../build/tools/build_receptionist_v22.py) · [Hair and finishing](../build/tools/finish_receptionist_v22.py).

**Earlier desert arrival, v20:** The adult desk receptionist has her own CC0 MakeHuman model, fitted with bob02 hair and female_elegantsuit01 clothing. The older butler appears in the gallery and ending, and the porter handles luggage. [Blender source](../build/tools/build_receptionist_v20.py).


**Current v18 credits:** [Models, licences, adaptations and Blender workflow](assets-and-tools.md). The sections below preserve the earlier build history.

**November 10, v15:** The rolling porcelain likeness is derived from the existing CC0 child model used by the two figures. Blender retained the face, eyes and hair, removed the body, closed the cut mesh, and assigned fired-clay materials. The red rubber toy remains the ordinary version. [Adaptation source](../build/tools/build_stair_study_v15.py) · [In-game study](../build-record/tests/repairs-15/porcelain-game.jpg). No new download.

November 8, 2026. Vihaan rejected the blocky first characters and requested more detailed, realistic, rigged replacements. These assets are now used by the local visual prototype. Visual acceptance remains pending his review.

## Source and permission

**V3 update:** The same licensed MakeHuman sources now produce `guest-v3.glb` and `butler-v3.glb`, with editable source `characters-v3.blend`. The new factory reuses v2's known asset setup, uses smooth base meshes for clothing/accessories, omits unseen mouth interiors from runtime export, and retains the weighted rigs. Codex authored new distance-matched walking, a dark service-uniform material, central buttons, a small collar, further face/neck shaping and a more inclined butler pose. No additional third-party character pack was introduced. Current exports are approximately 2.93 MB and 2.79 MB. The v2 source details below remain historical provenance.

The replacement humans use **MakeHuman Community MPFB 2.0.18**, the official Blender character-generation tool, with MakeHuman's CC0 core and system assets. MPFB's code is GPL-3.0; its graphical assets are CC0. The tool's code license and the exported character assets are distinct. These are adapted third-party assets, not entirely original models made by Codex.

- [Official MPFB repository](https://github.com/makehumancommunity/mpfb2), commit `6ff1eb358f6c1959ced77e79e6dd2406d9a71f49`.
- [Official Blender Extensions listing](https://extensions.blender.org/add-ons/mpfb/).
- [MakeHuman license explanation](https://www.makehumancommunity.org/about/license.html).
- [Official system assets CC0 archive](https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip).
- Downloaded archive SHA-256: `b542127a8e25547c7c29c19f2d1d2adb9a664c80396ecd694095dbc8028a0107`.

The archive's pack manifest labels the selected assets CC0 and credits `makehuman_system`. Individual asset headers state a September 2020 CC0 release and identify Data Collection AB, Joel Palmius and Jonas Hauquier as the copyright holders at that release. Local license copies and the selected manifest are in `build/vendor/licenses/makehuman/`. The official tool source and its original licenses remain in `build/tools/vendor/mpfb2/`.

## Assets actually used

| Component | MakeHuman asset | Project adaptation |
|---|---|---|
| Human topology, morphs, weights | MPFB core human and `game_engine` rig | Separate guest and older, leaner butler proportions; 53 bones each |
| Guest skin | `middleage_caucasian_male` | Fitted to the guest; face hidden in gameplay |
| Butler skin | `old_caucasian_male` | Elongated head, reduced cheek volume, stronger cheekbones, eye bags, narrower chin, head inclination |
| Suit | `male_elegantsuit01` | Both figures; fitted blazer, shirt, tie and trousers; brass buttons added to butler |
| Shoes | `shoes03` | Formal black shoes on both figures |
| Hair | `short01`, `short04` | Guest short hair; butler hair recolored silver and mesh cut back for a receding crown |
| Eyes and face details | `high-poly`, `eyebrow001`, `eyelashes01`, `teeth_base`, `tongue01` | Fitted and weighted to each human |
| Gloves, buttons, bell and crucifix | Original project material/geometry | Butler hands assigned ivory glove material; buttons weighted to chest; bell floats independently |

The exploratory casual suit, sneakers and `short02` hair were rejected. They are not in the final GLBs.

## Authoring and reproduction

Headless Blender 4.3.2 ran MPFB locally, fitted clothing and weighted rigs, baked subdivision and body masks, and exported `guest-v2.glb` and `butler-v2.glb`. Codex authored the Idle, Walk and Raise clips, using bone poses and an analytic two-bone leg solve. They are not motion capture. Images are limited to 2048 pixels and embedded as WebP. Final GLBs are approximately 6.73 MB and 6.28 MB.

Sources: `build/tools/mpfb_bootstrap.py`, `extract_character_assets.py`, `build_characters_v2.py`, `render_character_study_v2.py`. Editable packed source: `build/assets/characters-v2.blend`. MPFB runs with project-local data and preference directories; no globally installed MPFB add-on is required.

To reproduce after a fresh checkout, clone the official MPFB repository into `build/tools/vendor/mpfb2`, check out the commit above, and download the archive to `build/tools/vendor/makehuman_system_assets_cc0.zip`. From `build/`, run `python tools/extract_character_assets.py`, then run Blender in background mode with `--python tools/build_characters_v2.py`. The vendor tooling/cache folder is ignored by Git; the exported runtime assets and license evidence are retained separately.

No characters, textures, animation or sound were extracted from Twin Peaks, Resident Evil, Silent Hill, Hokum or The Exit 8. Those works remain aesthetic and gameplay references.

## Encounter expansion 05 sources

November 8: `child-v5.glb` (2.96 MB), `attendant-v5.glb` (2.88 MB) and `porter-v5.glb` (2.52 MB) reuse MPFB and the retained official CC0 archive above. Each export has seven meshes, one 53-bone weighted skin, and authored Idle/Walk/Raise clips. The child has child proportions and `young_caucasian_male` skin; the attendant uses `young_caucasian_female2`; the porter uses the existing middle-age male skin. Fitted suits, shoes, hair and face components retain the existing asset provenance. The children are two differently scaled/tinted instances of the child model.

The two added skin manifest entries and material headers are retained under `build/vendor/licenses/makehuman/`. No new download occurred. Sources: `build_child_v5.py`, `build_staff_v5.py`, packed `child-v5.blend` and `staff-v5.blend`.

`build_props_v5.py` creates the original dog standing/seated sculptures and extracts an empty coat from the licensed fitted suit. The dog has articulated head nodes, not a full skeletal animation rig. Its shadow is a projected mesh silhouette; the seated shape is shown only as the anomalous shadow. The coat remains a CC0-derived garment. Runtime trolley, cloche, red ball, suitcase, glass and service cabinet are original project geometry in `character-encounters.js`.

The founder portraits are actual Blender renders of the adapted butler character. E1's escaped silhouette is projected from that human mesh. E4's staircase is actual geometry rendered only into the mirror reflection. The environment/lighting and props are project-authored. No film/game meshes, images or sound were extracted. Three.js RoundedBoxGeometry was copied from the already installed MIT package and added to the runtime vendoring script.

## Hostile ending 06 source update

`butler-skeleton-v6.glb` is original stylized bone geometry authored in `build_ending_v6.py`: carved eye/nasal cavities, separate teeth, open jaw, rib cage, vertebrae, pelvis and limb/finger bones. It is weighted to the existing CC0-derived 53-bone butler rig and reuses its authored clips. This is not a downloaded scan or a claim of medical anatomical accuracy. Editable source: `ending-skeleton-v6.blend`. The GLB is about 3.07 MB.

The cast in the final reverse shot reuses the same child, attendant, porter and dog assets as the encounters. No new person/animal asset was downloaded. The dog advances with its group and articulated head, not a newly authored skeletal gait. `ending-reception-v6.blend` adds a closed entrance and red curtains for the reverse view, retaining the hotel's existing authored materials. The original v5 gameplay plates are unchanged.

## German Shepherd replacement, v14, November 10, 2026

German Shepherd by 3dskillup.art, https://3dskillup.art/free-assets/german-shepherd/ , licensed CC BY 4.0: https://creativecommons.org/licenses/by/4.0/ . The creator permits modification and redistribution with attribution; no account or purchase was required. Original ZIP and source HTML retained under sources/assets/german-shepherd/. Download SHA256 recorded with repair evidence.

Adaptations: retain textured canine anatomy and rig; create seated shadow pose, convert to GLB/WebP, tune material, add quiet head motion, use the same dog in the spectral ending. 4,991 vertices / 9,978 triangles for the visible dog, 1024px packed textures, approximately 1.07 MB GLB including the shadow mesh. The source page advertises 2K; actual inspected file dimensions take precedence. Credit is visible in the game's Credits page. Original dog sculptures remain archived in v13, but are no longer the live cast.

## Receptionist · local v23

I chose Lana Del Rey’s face and the side-swept waves in the portrait I supplied. Codex fitted the photo’s brows, nose, smile and jaw landmarks to the existing rigged MakeHuman head in headless Blender. The eyes, teeth, swept hair and hoops have their own geometry. The front photo guides the likeness. The profile comes from the sculpt.

The MakeHuman base uses CC0 assets. The photographer and reuse licence for my supplied image are unconfirmed. This local model contains photo-derived facial colour. [Portrait](../build-record/tests/face-sound-23/portrait.png) · [Blender fitting script](../build/tools/fit_receptionist_face.py)

## Red dress and narrower face · v24

I wanted a slimmer face and a red dress at reception. Codex narrowed the cheeks and jaw on the existing rigged head. The fitted shoulders and sleeves come from MakeHuman’s CC0 elegant suit. Codex cut the bodice at the waist and built a flared satin skirt with a dark red waistband in headless Blender. [Character source](../build/tools/receptionist_dress.py) · [Portrait](../build-record/tests/dress-24/portrait.png)

## Night receptionist · v25

I replaced the portrait-based receptionist with **Female Adult 11** from Microsoft Rocketbox. Her original face, swept-back hair, belt and pleated dress suit the front desk. I kept the dress red. Codex recoloured the cloth, fitted the library’s breathing animation to her rig in headless Blender and exported the model for the browser.

[Model and source textures](https://github.com/microsoft/Microsoft-Rocketbox/tree/0943055db6ec570bcef9f2c8b41c9e5467c808f9/Assets/Avatars/Adults/Female_Adult_11) · [Breathing animation](https://github.com/microsoft/Microsoft-Rocketbox/blob/0943055db6ec570bcef9f2c8b41c9e5467c808f9/Assets/Animations/all_animations_max_motextr_static/f_idle_breathe_01.max.fbx) · [MIT licence, copyright 2020 Microsoft](../build/assets/rocketbox-LICENSE.txt) · [Portrait](../build-record/tests/rocketbox-25/portrait.png)

## Silent check-in · v29

I restored the receptionist from the screenshot I supplied. She wears the original striped blouse and short bob. The game loads `receptionist-v20.glb`, built from the MakeHuman CC0 female base, bob02 hair and female_elegantsuit01 outfit. The butler returns at the end. [Original fitting script](../build/tools/build_receptionist_v20.py)
