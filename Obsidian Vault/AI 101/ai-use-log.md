## Date, Class or setting

- **Tool:** Name the AI tool you used. Write "none" for editing-only sessions.
- **Purpose:** What you wanted from this interaction.
- **Input:** Your prompt or a note describing your edit.
- **Output:** What the tool returned, or "not applicable" for editing-only work.
- **Decision:** Keep, change, or reject, with one reason.

## 2026-09-15, Class 1

- **Tool:** ChatGPT (also installed Obsidian this session).
- **Purpose:** Generate images by tweaking prompts and comparing results across a couple of different models.
- **Input:** Iteratively refined image-generation prompts, re-running with different model options to compare outputs.
- **Output:** Several candidate images of varying quality across prompt/model combinations.
- **Decision:** Keep — iterated a few times and kept the final image after comparing results.

## 2026-09-17, Class 2

Artifact: [[AI 101/AI101_P1_Malik_Vihaan_Poster.svg]]. Three tools this day —
ChatGPT for setup, Claude (Claudian, in Obsidian) for Rounds 1-6, then Codex
from Round 7 on, re-running the same brief for comparison.

### Round 0 — orientation and context kit (ChatGPT)

- **Changed:** Opening session of the day. Asked ChatGPT to confirm it could
  reach the Obsidian vault, locate and read the Project 1 README, and find the
  AI use log so I could start assembling the context kit.
- **Came back:** It identified the README and the AI use log, and summarized
  the project requirements back to me.
- **Decision:** **Keep** — the README and the log's existing structure gave me
  the format to work in, which is what every round below builds on.

### Round 1 — first poster attempt from the bare prompt (Claude)

- **Changed:** Gave the constraints only: "A square poster for a student
  AI-art pin-up, bold flat shapes, exactly three colors, no text." Claude
  asked whether I wanted a generated image, a logged prompt, or a built file;
  I said build it.
- **Came back:** [[AI 101/poster-flat-three-color.svg]] — a 1000×1000 SVG of
  abstract Bauhaus-style geometry (large disc, half-disc, vertical mast, base
  band) in `#F2E8DC`, `#16233A`, `#E2483D`. Hit all four stated constraints.
- **Decision:** **Reject** — it satisfied the constraints but not the subject;
  abstract shapes alone never read as a pin-up poster, just as decoration.

### Round 2 — re-brief against the context kit (Claude)

- **Changed:** Told it to work like an agency creative lead, draw inspiration
  from the context-kit items, and make an actual poster for a student AI-art
  pin-up rather than abstract shapes. Same four constraints. This round it
  actually read the kit first instead of inventing a palette.
- **Came back:** [[AI 101/AI101_P1_Malik_Vihaan_Poster.svg]] — "The Crit Wall."
  Nine sheets pinned to a wall, each tilted under 2.2°, each with a vermilion
  pin and a circular aperture (Open Cosmos device) framing the Sereth
  crescent-and-dot mark. The crescent iterates across the grid from fragments
  to a resolved mark; the ninth sheet flips to vermilion as the kept result.
  Palette pulled from the kit's own board: `#384640`, `#FFE8A1`, `#F56543`.
  Verified three distinct colors, no `<text>`, no gradients.
- **Decision:** **Keep** — the pinned-sheet form carries the subject without
  type, and the palette is traceable to the kit instead of invented.

### Round 3 - hand-drawn, gradients, typography (Claude)

- **Changed:** Called v1 of the grid still too vague and lifted three of the
  original constraints: bespoke iconography in a hand-made sketch style
  instead of simple shapes, gradients allowed, and typography used properly.
  Square format stayed.
- **Came back:** [[AI 101/AI101_P1_Malik_Vihaan_Poster_v2.svg]] - "The Machine
  Eye." A large hand-drawn eye with a spiral iris over a four-stop gradient
  field, ringed by twelve bespoke sketch glyphs (stylus, push-pin, sprout,
  spark, mountains, waves, crescent, rings). Doubled lid strokes for a drawn
  feel, feTurbulence grain overlay, warm bloom behind the iris. Type is
  Arial Black display ("AI-ART" in a butter-to-vermilion gradient, "PIN-UP"
  solid) with mono corner labels and a mono footer reading MAKE, THEN COMPARE.
- **Decision:** **Change** - the direction is right but it is not finished:
  the three-colour rule is now broken (8 hex values, all tints of the kit's
  three, because gradient interpolation needs intermediate stops), the poster
  still carries no date or venue, and I had no rasteriser available so the
  visual result is unverified.

### Round 4 - typography removed, composition rebuilt (Claude)

- **Changed:** "no text!" - reversed the Round 3 instruction to use typography
  and went back to the original no-text constraint. Sketch style and gradients
  stayed.
- **Came back:** [[AI 101/AI101_P1_Malik_Vihaan_Poster_v3.svg]]. Not a strip of
  the text layer: deleting six type elements would have hollowed out the bottom
  third, so the composition was rebuilt. The eye moved from y=405 to optical
  centre y=585 and scaled 1.26x to carry the square alone, the twelve glyphs
  went from a scattered field to a full ring at radius 440-470 and scaled ~1.45x,
  and twelve hand-struck tick marks now fill the band between eye and ring.
  Both type gradients were dropped as dead defs, taking the count to 7 hex values.
- **Decision:** **Keep** - holds the square without type, and losing the words
  put the sketch work back in charge of the poster.

### Round 5 - strict three colours, editorial layout (Claude)

- **Changed:** Ruled the colour question: three colours only, keep it editorial
  quality, and take layout cues from the context-kit references. No text still
  standing from Round 4.
- **Came back:** [[AI 101/AI101_P1_Malik_Vihaan_Poster_v4.svg]]. Gradients,
  partial opacity and the grain filter all removed - each one generates
  intermediate values and would have broken the count. Lightness is now carried
  by line weight and dash density instead of transparency. Layout rebuilt from
  the references rather than invented: centred aperture, wide margins and
  four-corner registration from Open Cosmos; an evenly pitched glyph column
  from the Sereth board; a sidebar-against-hero split from the palette board.
  Iris is flat butter, spiral pupil is the field forest so all three colours
  interlock. Verified 3 distinct hex values, 0 opacity attributes, 0 filters.
- **Decision:** **Keep** - first version that satisfies every original
  constraint at once, and the borrowed layout grid is what finally makes it
  read as a designed plate rather than an illustration on a background.

### Round 6 - exhibit elevation, three new references (Claude)

- **Changed:** Uploaded three new references and told me to drop the eye and
  the glyph vocabulary entirely, then build the effect of art pieces in an
  exhibit using shapes and colour alone - black for shadows, one colour for
  the wall, one for the objects.
- **Came back:** [[AI 101/AI101_P1_Malik_Vihaan_Poster_v5.svg]] - "Elevation."
  A gallery wall: three canvases hung on pins above three plinth-mounted
  objects, on a three-column grid at 300 / 600 / 900. Colour is assigned by
  role - butter wall, vermilion for every lit surface, black for every shadow.
  Volume comes only from black: cast shadows behind the canvases, a dark
  interior ellipse in the cylinder, a terminator crescent on the sphere,
  contact ellipses under each plinth. What each reference contributed: the
  rhythm of three and the hard elliptical ground shadow from the Pole lamp
  poster; flat-shape volume with black doing the shadow work from Russian
  Contemporary Art Week; the full-bleed hard-edged colour field from TijanaT.
  Verified 3 colours, 0 opacity, 0 filters, 0 strokes, every object base
  seated exactly on the plinth top at y=922, light direction consistent
  upper-left across all six shadows.
- **Decision:** **Keep** - assigning colour by role instead of decoratively is
  what finally makes flat shapes read as a lit room.

### Round 7 - same brief, switched tool to Codex (Codex)

- **Changed:** Re-ran the bare brief in Codex: square poster for a student
  AI-art pin-up, bold flat shapes, exactly three colours, no text. The first
  attempt was blocked by a missing local Codex host executable; after retrying,
  Codex used its built-in ImageGen tool. It generated one version, then ran a
  second colour-correction pass asking for only ultramarine `#2145D9`, coral
  `#FF5A4F`, and cream `#FFF1D0`, with all gradients and shading removed.
- **Came back:** [[AI 101/student-ai-art-poster.png]] - a 1254x1254 raster
  poster of a fully clothed art student holding a stylus and tablet, surrounded
  by geometric artwork and studio objects. Codex displayed the result in chat
  and then copied the selected version into the AI 101 folder. It has no text,
  but a pixel audit sampled 10,111 distinct RGB values, so the generated raster
  only looks three-colour and does not literally meet the exact-colour rule.
- **Decision:** **Keep, with caveat** - kept as the selected Codex comparison
  image because the subject and poster energy are much clearer than the first
  abstract attempt, but it is not a strict three-ink final and would need
  deterministic posterisation before print.

### Round 8 - exhibition focus and negative-space rebuild (Codex)

- **Changed:** Called the Round 7 poster too vague and illustration-like.
  Asked Codex to remove plants and random studio objects, focus on the student
  and AI-art exhibition, reduce clutter, and improve negative space while
  keeping the original square / three-colour / no-text brief. Codex reviewed
  the context-kit examples and used the Pole poster, Russian Contemporary Art
  Week poster, and TijanaT poster as layout references for repeated forms,
  large silhouettes, hard colour fields, and gallery-poster clarity.
- **Came back:** [[AI 101/student-ai-art-poster-v2.png]] - a 1254x1254 raster
  with one student on the left actively pinning a work and exactly three
  evenly spaced exhibition panels on the right. The panels show an evolving
  curve, node lattice, and morphing ribbon form. Plants, desk, tablet, tools,
  books, loose shapes, and other studio clutter are gone; the lower-right
  quarter is left open as deliberate negative space. The image visually uses
  ultramarine, coral, and cream with no text, but a sampled pixel audit still
  found 8,546 RGB values because the raster generator introduced blended edge
  and tonal values.
- **Decision:** **Keep, with caveat** - the subject/action and exhibition read
  are now immediate, and the composition is substantially calmer. It is the
  stronger art direction, but still needs deterministic three-colour
  posterisation if the colour rule is judged at pixel level.

### Round 9 - avant-garde artwork as focal point (Codex)

- **Changed:** Said Round 8 still felt too much like an illustration. Asked
  for a more avant-garde, artistic result with intentional structure rather
  than random decoration, and made the exhibited AI artwork the focal point.
  Codex radically reduced the human figure to a cropped silhouette and built
  one dominant work around the concept “the work looks back”: the same profile
  mutates through contour lines, a node structure, and a resolved solid form.
- **Came back:** [[AI 101/student-ai-art-poster-v3.png]] - a 1254x1254 square
  dominated by one coral exhibition sheet. A small ultramarine student at the
  far-left edge pins it up, while three linked states of one face-like form
  move across the artwork. The gallery room, floor, furniture, tools, and
  separate picture grid are gone. The student now works as scale and context;
  the exhibited process is the hero. No text appears. A sampled pixel audit
  found 7,661 RGB values, so the visual palette remains three-colour in intent
  rather than being a literal three-ink raster.
- **Decision:** **Keep, with caveat** - this is the first Codex version whose
  hierarchy is led by the art rather than by a character scene. The repeated
  transformation gives the abstraction a reason, but exact colour compliance
  still requires deterministic posterisation.

### Round 10 - final compliance and submission documentation (Codex + hand edit)

- **Changed:** Audited the project against the submission checklist. Replaced
  the context kit's broken Obsidian embed with a self-contained copy of the
  brief, documented every context item and its job, and prepared the decision
  note and one-sentence disclosure. Applied a deterministic nearest-palette
  hand edit to the Round 9 raster so every pixel uses one of the three intended
  colours rather than thousands of blended RGB values.
- **Came back:** [[AI 101/Project 1/AI101_P1_Malik_Vihaan_Poster.png]] - the
  final 1254x1254 poster, verified at exactly three RGB values: `#2145D9`,
  `#FF5A4F`, and `#FFF1D0`. The project folder now contains the required
  artifact, context kit and README, AI use log, decision note, and disclosure.
- **Decision:** **Keep** - this preserves the Round 9 art direction while
  making the original three-colour constraint technically true and packaging
  the required evidence in one submission folder.

### Round 11 - psychological-thriller escalation (Codex + hand edit)

- **Changed:** Asked for a much tenser, darker, goosebumps-inducing direction:
  an artist painting something impossible, with thriller-cover perspective,
  aggressive angles, and permission to replace the palette. Kept the original
  square / exactly-three-colours / no-text rules. Directed Codex to use an
  extreme low angle, a Dutch tilt, severe foreshortening, and one monumental
  canvas where a recursive painted figure appears to reach back toward the
  artist.
- **Came back:** [[AI 101/student-ai-art-poster-v4.png]] - a 1254x1254 poster
  seen from below, with the artist compressed into the lower-left and a tilted
  canvas consuming the frame. Repeating profiles collapse into a vortex around
  an impossible painted hand meeting the real brush. The palette was changed
  to near-black blue `#080B18`, arterial crimson `#D72638`, and aged bone
  `#E7DDC7`. A deterministic posterisation pass verified exactly three pixel
  colours and removed the generator's blended tones.
- **Decision:** **Keep as a current candidate** - the forced perspective,
  opposing diagonals, and almost-touching hands create a specific source of
  tension rather than relying on random horror decoration.

### Round 12 - the painting remembers first (Codex + palette edit, 2026-09-22)

- **Context:** Codex could see the Round 11 poster as a visual reference and
  the preceding brief and steering history. The earlier context-kit gallery
  references remained part of the art direction, but were not re-attached to
  this generation call.
- **Instruction and direction:** Asked for a more profound psychological-horror
  manga visual grammar without imitating a specific artist. Kept the extreme
  low angle, Dutch tilt, giant canvas, square format, no text, and exactly
  three colours. Replaced the vortex of repeated profiles with one causal
  paradox: the student paints a colossal self-portrait that is already
  painting back; a smaller echo appears inside the painted figure's hollow
  head. Asked for oppressive black, sparse hatching, a dramatic near-contact
  between brushes, and no gore or random horror props.
- **Came back:** [[AI 101/student-ai-art-poster-v5.png]] - a 1254x1254 poster
  with the real artist compressed into the lower-left, an immense painted
  double looming from a tilted canvas, and a nested painting visible inside
  its head. The two brushes nearly meet. I converted the generated raster to
  exactly three verified RGB values: coal `#0B0C12`, vermilion `#C72D32`, and
  paper `#E5DCC8`.
- **Decision:** **Keep as a new candidate** - the nested self-portrait and
  mirrored gesture make the horror psychological and specific, while the
  perspective and negative-space gap retain the tension of Round 11. The
  submission artifact has not yet been replaced with this candidate.

### 2026-09-22, Class 3 - project-folder structure check (Codex)

- **Context:** I supplied a photo of the course setup guide showing the
  expected project root (`README.md`, `ai-use-log.md`, `decision-note.md`,
  `disclosure.md`, the named artifact, and `context-kit/`) and showing three
  separately named context notes: `palette.md`, `style-note.md`, and
  `intent.md`. Codex checked the existing `AI 101/Project 1` folder against
  that diagram and read the project and context-kit READMEs.
- **Instruction and direction:** Asked Codex to note the organization, fix
  anything required, and continue logging today's Class 3 activity. This was
  a documentation pass, not a new image-generation round.
- **Came back:** The six submission-root items already existed, but the three
  named context notes were only embedded as sections of the kit README. Codex
  created `context-kit/palette.md`, `context-kit/style-note.md`, and
  `context-kit/intent.md`, then updated both READMEs to identify their jobs.
  Each new note is explicitly dated as a Class 3 formalization so it does not
  falsely appear to have been an input to earlier image rounds. The folder
  remains named `Project 1`; `project-01` in the screenshot is a sample root
  label, not a missing required file.
- **Decision:** **Keep** - the required files now match the guide's structure
  without disturbing links or misrepresenting when the context notes were
  created. The latest horror poster remains a candidate; this pass did not
  replace the submission artifact.

### 2026-09-22, Class 3 - GitHub upload preflight (Codex)

- **Context:** I supplied `https://github.com/mvvihaanmalik-create/ai101-p1-malik`
  and described it as a private repository. The assignment requires the
  complete project folder and nothing private in the instructor-shared repo.
- **Instruction and direction:** Asked Codex to upload the vault. In light of
  the assignment and repository name, Codex scoped the intended upload to the
  complete `AI 101/Project 1` submission folder rather than unrelated vault
  notes and app settings, then checked its files for obvious credentials and
  contact strings before transfer.
- **Came back:** The repository is empty, but its GitHub page and public
  repository API both report `visibility: public` and `private: false`,
  contrary to the stated private setting. No project files were pushed.
- **Decision:** **Change / hold upload** - uploading class work and reference
  images to a public repository would violate the privacy expectation behind
  this instruction. Wait until repository visibility is confirmed private or
  I explicitly approve public publication.

### 2026-09-22, Class 3 - public vault upload preparation (Codex)

- **Context:** I explicitly approved uploading the Obsidian vault folder to
  the public `mvvihaanmalik-create/ai101-p1-malik` repository. The earlier
  assignment instruction still calls for no private material in the shared
  repository.
- **Instruction and direction:** Asked Codex to upload the vault rather than
  only the Project 1 submission folder. Codex inventoried the vault, checked
  text files for obvious credentials/contact strings, and prepared a copy
  rooted at `Obsidian Vault/` inside the repository.
- **Came back:** The prepared copy includes all notes, posters, context-kit
  images, and non-sensitive Obsidian core configuration. It intentionally
  omits 14 local app-state files under `.claudian/`, `.claudian-plus/`, and
  `.obsidian` plugin/workspace paths, including device/session identifiers.
  A repository README points to `AI 101/Project 1/`, and `.gitignore` guards
  against later accidental inclusion of local state. Push verification is
  pending at the time of this entry.
- **Decision:** **Keep the prepared copy; do not publish local session state**
  - this respects the explicit public-upload request without turning app
  telemetry and machine-specific state into public project artifacts.
- **Upload result:** Pushed the prepared vault copy to the repository's `main`
  branch and verified that the remote branch points to commit
  `1801db01fb5223de830f8f6d0dbe5d8343b00091`. The repository is public.
  This upload does not verify that the instructor has been invited or that
  externally sourced reference images are cleared for public redistribution.

### 2026-09-22, Class 3 - recurring repository sync setup (Codex)

- **Context:** I asked for repository updates after every Tuesday and Thursday
  class at 5:00 p.m. The source is this Obsidian vault; the destination is the
  public `mvvihaanmalik-create/ai101-p1-malik` GitHub repository.
- **Instruction and direction:** Set up a twice-weekly unattended sync at
  5:00 p.m. Eastern time. Keep the same public-content boundary used for the
  first upload: sync notes, art, context-kit files, and safe Obsidian settings,
  but exclude local Claudian sessions, device identifiers, plugins, and
  workspace state. Fail rather than push if the source looks incomplete, a
  potential credential appears, or a large unexpected deletion occurs.
- **Came back:** A persistent local Git clone and PowerShell sync script were
  created outside the vault, and a Windows task named `AI101 Vault GitHub
  Sync` was scheduled weekly on Tuesday and Thursday at 5:00 p.m. The next
  scheduled run is Thursday, 2026-09-24 at 5:00 p.m. A dry run and a manually
  started task both returned success; there were no vault changes in those
  tests. Each run writes a timestamped result to the local sync log.
- **Decision:** **Keep** - the task is registered and tested, while guarded
  sync logic preserves the public/private boundary. It depends on this PC
  being available and GitHub authentication/network access continuing to work;
  it is configured to wake a sleeping PC and to start when available after a
  missed run. A second manually started task pushed this setup entry and
  verified remote commit `26acc98ccca87e931fc3a8d5aa07a7011310efb0`.

### Notes carried forward

- Round 7 is a tool comparison, not a new direction. The thing worth recording
  is where Codex and Claude diverge on an identical brief: whether it reads the
  references before designing, whether it holds the three-colour count without
  being told twice, and whether it reaches for an exhibit layout unprompted.
- Rounds 1-6 ran through six briefs, so the Claude side of the comparison is
  really "six rounds of correction", not one attempt. Worth saying out loud in
  the decision note rather than comparing round 7 against round 6 alone.
- Colour roles are fixed: wall / object / shadow. Any new element has to pick
  one of the three, which is a useful constraint to design against.
- The three canvases hold abstract compositions (cropped arc, wedge and disc,
  stacked bars) rather than depictions, to avoid reintroducing symbols.
- Still no type, so still not an actionable flyer. Unchanged since Round 4.
- Codex rendered and displayed its raster output directly, which made visual
  review possible. That is an advantage over the unrendered SVG rounds, but
  image generation did not preserve the exact three-colour constraint at the
  pixel level even after a correction pass.
