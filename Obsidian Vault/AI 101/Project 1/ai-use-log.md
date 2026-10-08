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

Artifact: [[AI101_P1_Malik_Vihaan_Poster.svg]]. Three tools this day —
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
- **Came back:** [[poster-flat-three-color.svg]] — a 1000×1000 SVG of
  abstract Bauhaus-style geometry (large disc, half-disc, vertical mast, base
  band) in `#F2E8DC`, `#16233A`, `#E2483D`. Hit all four stated constraints.
- **Decision:** **Reject** — it satisfied the constraints but not the subject;
  abstract shapes alone never read as a pin-up poster, just as decoration.

### Round 2 — re-brief against the context kit (Claude)

- **Changed:** Told it to work like an agency creative lead, draw inspiration
  from the context-kit items, and make an actual poster for a student AI-art
  pin-up rather than abstract shapes. Same four constraints. This round it
  actually read the kit first instead of inventing a palette.
- **Came back:** [[AI101_P1_Malik_Vihaan_Poster.svg]] — "The Crit Wall."
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
- **Came back:** [[AI101_P1_Malik_Vihaan_Poster_v2.svg]] - "The Machine
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
- **Came back:** [[AI101_P1_Malik_Vihaan_Poster_v3.svg]]. Not a strip of
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
- **Came back:** [[AI101_P1_Malik_Vihaan_Poster_v4.svg]]. Gradients,
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
- **Came back:** [[AI101_P1_Malik_Vihaan_Poster_v5.svg]] - "Elevation."
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
- **Came back:** [[student-ai-art-poster.png]] - a 1254x1254 raster
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
- **Came back:** [[student-ai-art-poster-v2.png]] - a 1254x1254 raster
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
- **Came back:** [[student-ai-art-poster-v3.png]] - a 1254x1254 square
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
- **Came back:** [[student-ai-art-poster-v4.png]] - a 1254x1254 poster
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
- **Came back:** [[student-ai-art-poster-v5.png]] - a 1254x1254 poster
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

## 2026-09-29, Class 5 — Project 2 framing (backfilled 2026-10-01)

This entry was reconstructed from vault file timestamps, the current notes,
and Git history on October 1. It records what those sources establish; I do
not have a record of every classroom conversation or every AI prompt used on
September 29.

### Project 1 folder cleanup

- **Tool/context:** Obsidian vault organization; no AI generation is evidenced
  by the files. Around 5:04 p.m., existing Project 1 poster iterations,
  supporting notes, and the copied assignment brief were consolidated under
  [[AI 101/Project 1]]. The AI use log's links to those files changed from
  vault-prefixed paths to shorter links after the reorganization.
- **Input/direction:** Existing Project 1 materials were being gathered in one
  project folder rather than left loose in the `AI 101` folder.
- **Output:** The poster variants and supporting files are now together under
  [[AI 101/Project 1]]; the two AI use log copies were modified at 5:04 p.m.
- **Decision/status:** **Keep as current organization** — it makes the Project 1
  record easier to find. The files do not record a separate verbal decision
  from class, so this is the present status rather than a quoted class critique.

### Project 2 question and candidate sources

- **Tool/context:** The notes themselves do not identify an AI tool or preserve
  a prompt/response for this step. A new [[AI 101/Project 2]] folder appeared
  around 5:05 p.m., and [[AI 101/Project 2/intent]] was created at
  6:00 p.m. and edited through 6:27 p.m.
- **Input/direction:** I described a recurring problem in AI-assisted coding:
  starting with an exciting idea, trusting an early LLM-approved prototype,
  then discovering too late that the toolchain, operating system, time, or
  token budget makes the intended result impractical. I asked how LLMs can
  help non-technical people code without misleading them about feasibility,
  alternatives, and workarounds.
- **Output:** The intent note records that five-step failure pattern, two
  research questions, and nine candidate source links across ACM, IGI Global,
  Taylor & Francis, IEEE, arXiv, Zenodo, and PM World Journal. Listing a link
  is not evidence that the source was read or verified that day.
- **Decision/status:** **Develop further** — a focused research direction was
  established, but no feasibility framework or source assessment was recorded
  in this note on September 29.

### Research brief placeholder and repository sync

- **Tool/context:** [[research-brief]] was created at
  6:37 p.m. and remained empty. The scheduled Git task ran at 5:00 p.m. and
  pushed commit `e88ce8a23f93c16e73f0dafb017832a6daecb18b`.
- **Output:** A placeholder for a research brief existed, but it contained no
  brief text. Because the scheduled push happened before the Project 2 notes
  were created, that Tuesday push did **not** include the new Class 5 work;
  the notes first appeared in the later October 1 sync.
- **Decision/status:** **Pending** — the research brief still needed content,
  and the 5:00 p.m. sync was too early to capture work done later in class.

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

## 2026-10-01, Class 6 — Project 2 source verification and research brief

- **Tool/context:** I reviewed the two source paragraphs already recorded in
  [[source-verification-log]] and opened the authors'
  PDFs for the cited CHIWORK and NordiCHI papers.
- **Instruction and direction:** I was asked to fill the source-verification
  template for both paragraphs, including authors, title, date, link, type,
  access date, a one-sentence account of each source, and how each was checked.
- **Came back:** The source log now has two structured records. For Feldman and
  Anderson, I read the abstract and conclusion; for Kalving, Colley, and
  Häkkilä, I read the abstract and section 5.2 on AI as a collaborative
  partner. I verified citation details against the papers' title pages.
- **Decision/status:** **Verified for these two entries** — their metadata and
  summaries are grounded in the accessible paper PDFs rather than inferred
  from the older copied excerpts. The other candidate links in the Project 2
  intent note were not part of this two-paragraph verification.

### Project 2 claim check

- **Instruction and direction:** I was asked to add and complete a claim-check
  table in [[source-verification-log]], quoting the
  source sentence and assigning a status and keep/fix/drop decision.
- **Came back:** I added a check of the claim that coding knowledge could help
  non-technical people, using a sentence from the Feldman and Anderson paper
  about how inability to read code or errors limits prompt improvement.
- **Decision/status:** **Fix** — the table recommends narrowing the wording to
  code-reading skills helping non-technical people use code LLMs more
  effectively, rather than making a broader claim about coding knowledge.

### Research brief

- **Tool/context:** I used the already verified Source 1 entry in
  [[source-verification-log]] and the Project 2 intent
  note to replace the research-brief template placeholders.
- **Instruction and direction:** I was asked to update the brief; the template
  requires a research question, short answer, evidence-based claim, corrected
  claim, workflow impact, and a concrete rule/check.
- **Came back:** [[research-brief]] now focuses on the
  verified code-literacy finding from Feldman and Anderson. It distinguishes
  the study's claim from my workflow inference and names `workflow-checklist.md`
  as the planned step file for a pre-expansion explanation-and-test checkpoint.
- **Decision/status:** **Use as a working brief** — it answers the feasibility
  concern without presenting the proposed workflow safeguard as a finding the
  study directly tested.
- **Repository sync:** The Class 6 updates were pushed to the course repository
  in commit `58b2b0e`.

### Project 2 workflow map

- **Instruction and direction:** I was asked to make a three-to-five-step
  process map, create one empty step file per Canvas node, connect the nodes in
  order, and color the human-check step differently.
- **Came back:** Created [[AI 101/Project 2/process-map.canvas]] with five
  ordered file nodes and four arrow connectors: define the goal; check
  feasibility; build a small prototype; human check; iterate or stop. Created
  five matching zero-byte step files, numbered `01` through `05`; the human
  check node is highlighted red.
- **Decision/status:** **Use as the workflow plan** — the feasibility and
  human-review gates precede larger iteration. An empty `process-map.canvas.md`
  placeholder was present when the proper `.canvas` file was created; it is now
  absent, and the exact cause of its removal was not recorded.
- **Repository sync:** The map, empty step files, and log update were pushed in
  commit `4fbca9d`; follow-up commit `d015e29` records the placeholder's removal.

### Project 2 Step 7 — workflow directions

- **Instruction and direction:** I was asked to write a `00-start-here.md`
  guide with Goal, Order, Rules, and My decisions, then fill every numbered
  step file with Starts from, Does, Good looks like, and Check.
- **Came back:** Created the requested start guide and completed all five step
  files: [[AI 101/Project 2/01-define-the-goal.md]],
  [[AI 101/Project 2/02-check-feasibility.md]],
  [[AI 101/Project 2/03-build-a-small-prototype.md]],
  [[AI 101/Project 2/04-human-check.md]], and
  [[AI 101/Project 2/05-iterate-or-stop.md]]. The instructions establish a
  sequence from goal-setting through feasibility, smallest prototype, human
  review, and a bounded iterate-or-stop decision. Each step defines its input,
  actions, success criteria, and gate before proceeding.
- **Decision/status:** **Ready to use as workflow directions** — I retain
  decisions about scope, route, risk, approval, and stopping; the model must
  state uncertainty, support current technical claims, and not report unrun
  tests as passed. The pre-existing empty `00-start-here.md.md` stub is now
  absent; the exact cause of its removal is not recorded, and the correctly
  named `00-start-here.md` file remains.
- **Repository sync:** The start guide, step directions, and updated log were
  pushed in commit `d46d603`; follow-up commit `e866448` records removal of the
  empty duplicate-name stub.

### Step 1 run — define the goal

- **Instruction and direction:** I was asked to follow `00-start-here.md` one
  step at a time and stop after each step.
- **Came back:** Added a project-specific draft to
  [[AI 101/Project 2/01-define-the-goal.md]]: workflow goal, intended user,
  inputs, must-haves, nice-to-have, out-of-scope items, observable success
  criteria, and open details for a later real-project test.
- **Decision/status:** **Approved** — the draft explicitly paused before Step
  2 until the user agreed; the follow-up approval is recorded below.
- **Follow-up:** I agreed with the Step 1 draft. Its approved output was saved
  to [[AI 101/Project 2/outputs/01-define-the-goal.md]], then I proceeded to
  Step 2 only.

### Step 2 run — check workflow feasibility

- **Instruction and direction:** Continuing one step at a time, I assessed
  whether the proposed workflow itself is feasible and identified its simplest
  test route, alternatives, constraints, and unknowns.
- **Came back:** Added a provisional check to
  [[AI 101/Project 2/02-check-feasibility.md]]. The document-based
  Obsidian/Markdown route is feasible as a planning method, but no
  project-specific feasibility claim can be made without an actual coding
  idea, target OS/device, and time/token budget.
- **Decision/status:** **Route approved** — the user said “proceed.” Saved the
  approved assessment to [[AI 101/Project 2/outputs/02-check-feasibility.md]].
  Project-specific feasibility remains unknown because no specific idea or
  target environment was supplied.

### Step 3 run — build a small prototype

- **Instruction and direction:** With the document-based workflow approved, I
  tested its smallest behavior without inventing an application idea.
- **Came back:** Added a preflight-intake dry run to
  [[AI 101/Project 2/03-build-a-small-prototype.md]]. The test used the broad
  scenario from the intent note and the missing details in the “proceed” reply;
  it checked whether the workflow would flag missing requirements and stop
  rather than claim project feasibility.
- **Decision/status:** **Dry-run pass, limited scope** — it passed the
  missing-input gate, but no code or project-specific toolchain was tested.
  The user accepted this result with “ok,” so I saved it to
  [[AI 101/Project 2/outputs/03-build-a-small-prototype.md]] and proceeded to
  Step 4 only.

### Step 4 run — human check

- **Instruction and direction:** Review the Step 3 dry run, distinguish what
  the user has actually approved from what remains untested, and stop for
  confirmation before Step 5.
- **Came back:** Added a provisional review to
  [[AI 101/Project 2/04-human-check.md]]. The conversation demonstrated only
  the missing-input gate; no real coding project, code, or target-device test
  was supplied. The user then edited the check to add speed/lag,
  cross-platform responsiveness where applicable, and a fuller build-status
  audit; I preserved those checks and noted that they were not testable in this
  no-code dry run.
- **Decision/status:** **Accepted for the workflow dry run only** — the user
  said they had made the fixes and directed continuation. Saved the Step 4
  review to [[AI 101/Project 2/outputs/04-human-check.md]]. This does not verify
  an actual project's code or technical feasibility.

### Step 5 run — iterate or stop

- **Instruction and direction:** Summarize validated and unresolved points,
  then recommend one bounded next move without assuming an application idea.
- **Came back:** Added a proposed decision to
  [[AI 101/Project 2/05-iterate-or-stop.md]]: stop revising the generic
  workflow and apply it next to one concrete coding idea, starting at Step 1
  with the target environment and budget.
- **Decision/status:** **Accepted after initial review** — this was a proposed
  stop to workflow-building, not abandonment of the workflow or a coding
  project. The user accepted it on 2026-10-08; the final Step 5 output is saved in
  [[AI 101/Project 2/outputs/05-iterate-or-stop.md]] (see the acceptance entry
  below).

## 2026-10-08 — Project 2 Step 5 accepted

- **Instruction and direction:** The user accepted the bounded next move
  proposed in Step 5.
- **Came back:** Marked [[AI 101/Project 2/05-iterate-or-stop.md]] complete
  and saved the accepted decision to
  [[AI 101/Project 2/outputs/05-iterate-or-stop.md]]. The decision is to pause
  generic workflow edits until it can be applied to one concrete coding idea,
  with its target OS/device and budget recorded.
- **Decision/status:** **Stop this workflow-building pass** — the current dry
  run only validated the missing-input gate; no particular coding project was
  tested or declared feasible.

## 2026-10-08 — Project 2 intent gap

- **Tool/context:** I reviewed the user's new note
  [[AI 101/Project 2/intent gap.md]] and the workflow materials.
- **Instruction and direction:** I was asked to update the AI use log with the
  intent-gap entry.
- **Came back:** The user intended a workflow that checks tools, alternatives,
  OS constraints, and feasibility before substantial time or tokens are spent.
  The workflow documents were created, but no specific coding idea was tested.
  The user identifies the untested real-project feasibility as the gap and
  hypothesizes that Step 3 used the broad problem instead of a concrete project.
- **Decision/status:** **Gap recorded; cause remains the user's hypothesis** —
  no concrete project was available during the dry run, so the workflow's
  project-specific feasibility performance remains unverified. The accepted
  next move remains to apply it to one real coding idea; this log does not
  claim the cause has been experimentally established.

## 2026-10-08 — Project 2 concrete app trial, Step 1

- **Tool/context:** I followed [[AI 101/Project 2/00-start-here.md]] and the
  first node of [[AI 101/Project 2/process-map.canvas]], using the existing
  intent and research notes for context. No framework research or code build
  was done at this stage.
- **Instruction and direction:** The user proposed a small web app that takes
  an image, extracts its main colors, and lets them try those colors on a
  website preview; they asked for the easiest build route and for the workflow
  to stop after each step.
- **Came back:** Added a separate image-palette app draft to
  [[AI 101/Project 2/01-define-the-goal.md]] without overwriting the earlier
  workflow-design run. It states the intended user, image input, palette and
  preview outputs, first-version requirements, observable success, and open
  decisions about color assignment, browser/deployment target, and budget.
- **Decision/status:** **Awaiting the user's Step 1 check** — no extraction
  method, framework, OS target, or hosting route has been selected or claimed
  feasible. The new app-run output will be saved in `outputs/` only after the
  user agrees to the Step 1 draft.

## 2026-10-08 — Project 2 app scope clarification, Step 1

- **Instruction and direction:** In response to the three Step 1 scope
  questions, the user chose automatic color application and an app that can
  be shared online; they were unsure about a time or cost limit.
- **Came back:** Revised the image-palette app draft in
  [[AI 101/Project 2/01-define-the-goal.md]] so image selection automatically
  updates the website preview and others can open the app by link. Marked
  manual color assignment and sharing a particular palette as unconfirmed
  extras, and left budget and build/test device details open.
- **Decision/status:** **Still at Step 1, awaiting the user's scope check** —
  no framework, extraction method, deployment route, feasibility claim, or
  prototype was produced. The next step may estimate effort and cost only
  after the Step 1 scope is confirmed. No new app-run output was saved to
  `outputs/` yet.

## 2026-10-08 — Project 2 image-palette app, Step 1 accepted

- **Instruction and direction:** The user confirmed they will build and test
  on a Windows computer and share the app with people using phones, accepting
  the refined Step 1 scope.
- **Came back:** Updated [[AI 101/Project 2/01-define-the-goal.md]] to require
  a phone-usable online app and saved the approved scope to
  [[AI 101/Project 2/outputs/image-palette-web-app/01-define-the-goal.md]].
  Automatic palette application and the still-unknown budget remain explicit.
- **Decision/status:** **Step 1 approved; stop before Step 2** — no tool or
  hosting route has been recommended, researched, built, or declared feasible.

## 2026-10-08 — Project 2 image-palette app, Step 2 proposal

- **Instruction and direction:** The user said “proceed” after approving the
  image-palette app goal, so I ran only the feasibility-check step.
- **Tool/context:** I checked the Windows tool PATH and current primary
  documentation from MDN, GitHub, Cloudflare, and W3C on local image pixels,
  browser file input, static hosting, repository visibility, and text contrast.
- **Came back:** Added a separate Step 2 proposal to
  [[AI 101/Project 2/02-check-feasibility.md]]. It recommends a small
  browser-only HTML/CSS/JavaScript page in a separate public app repository
  with GitHub Pages; compares a private-repo Cloudflare Pages route and a
  framework/library route; flags palette quality, contrast, phone formats,
  privacy, and hosting-account assumptions; and proposes a tiny falsifiable
  Windows-plus-phone test with a rough effort estimate.
- **Decision/status:** **Awaiting route and test approval.** This is research
  and an estimate, not a working prototype or a feasibility guarantee. No
  new app-run Step 2 file was saved to `outputs/`, no app was built or
  published, and no Step 3 work began.

## 2026-10-08 — Project 2 image-palette app, Step 2 route accepted

- **Instruction and direction:** The user accepted a public app-code
  repository. JPEG/PNG support is sufficient as a baseline, and other image
  formats are welcome where the browser can decode them.
- **Came back:** Updated [[AI 101/Project 2/02-check-feasibility.md]] to record
  Route A and a nonexclusive JPEG/PNG baseline. Saved the approved route,
  evidence, alternatives, risks, estimates, and bounded unrun test in
  [[AI 101/Project 2/outputs/image-palette-web-app/02-check-feasibility.md]].
- **Decision/status:** **Step 2 plan approved; stop before Step 3.** Browser
  support for every phone image format and the quality/privacy of automatic
  extraction remain unverified. No app code, repository, or live site was
  created; the feasibility test still needs to be run and reviewed before a
  larger build.

## 2026-10-08 — Project 2 image-palette app, Step 3 local spike

- **Instruction and direction:** The user said “proceed” after approving the
  public app-code route and JPEG/PNG baseline, so I attempted only the small
  prototype/feasibility test, not a larger product build.
- **Came back:** Created the dependency-free local app and its README/tests in
  [[AI 101/Project 2/image-palette-prototype/README.md]]. The page chooses an
  image, extracts color swatches from Canvas pixels, automatically updates a
  website preview, applies a black/white text fallback when needed, and shows
  input/decode errors. Recorded files, commands, observations, and limits in
  [[AI 101/Project 2/03-build-a-small-prototype.md]].
- **Actual checks:** Node syntax checks passed; simulated-pixel logic tests
  passed for colorful, monotone, and transparent inputs. The local server
  returned HTTP 200 for the HTML, CSS, and JavaScript files.
- **Decision/status:** **Partial local test only; awaiting human/browser
  check.** No browser was exposed to the computer-use tool, so real file
  decoding, appearance, and phone behavior were not tested. GitHub CLI is not
  signed in, so no separate public app repository or live link was created.
  The new app-run Step 3 output was not saved in `outputs/`; Step 4 and a
  larger build remain on hold.

## 2026-10-08 — Project 2 prototype feedback and GitHub sign-in

- **Instruction and direction:** After opening the local prototype, the user
  said it looks very basic and not polished and asked for a GitHub sign-in
  link.
- **Came back:** Recorded the visual-quality gap in
  [[AI 101/Project 2/03-build-a-small-prototype.md]] without treating the
  prototype as approved. Checked GitHub's official CLI authentication
  guidance and provided the GitHub sign-in path and CLI command.
- **Decision/status:** **Step 3 remains under review.** No polish iteration,
  public app-only repository, phone test, or Step 4 review has been completed
  in response to this feedback.

## 2026-10-08 — GitHub CLI sign-in initiated

- **Instruction and direction:** The user asked for the one-time GitHub
  device code needed to sign in.
- **Came back:** Started the GitHub CLI web authentication flow and gave the
  user its temporary device code and official verification page. The code is
  deliberately not stored in this log.
- **Decision/status:** **Awaiting the user's authorization.** A device code
  being issued does not prove sign-in succeeded; no app repo or site was
  created in this step.

## 2026-10-08 — Project 2 prototype published for phone test

- **Instruction and direction:** The user completed the GitHub sign-in flow
  after accepting a separate public app-code repository for the small test.
- **Came back:** Verified GitHub CLI authentication as the user's account,
  created a separate public repository containing only the five prototype
  files, and enabled [the GitHub Pages test site](https://mvvihaanmalik-create.github.io/ai101-image-palette-studio/).
  Updated the prototype README and the Step 3 note with the live link.
- **Actual checks:** GitHub reported the app repository PUBLIC and Pages
  `built`; HTTP requests for the page, CSS, and JavaScript returned 200.
- **Decision/status:** **Published for testing, not accepted as finished.**
  The user's concern that the design looks basic remains open. Real image
  decoding, palette quality, privacy, and phone responsiveness have not been
  checked; no Step 4 review or app-run Step 3 `outputs/` acceptance occurred.

## 2026-10-08 — Project 2 desktop screenshot review

- **Instruction and direction:** The user showed a screenshot of the running
  prototype with an image selected.
- **Came back:** Recorded in [[AI 101/Project 2/03-build-a-small-prototype.md]]
  that the desktop screenshot shows a successful image-to-five-swatches-to-
  recolored-preview flow, with a displayed contrast fallback. Noted the
  palette's emphasis on blue-gray tones while the vivid cyan accent seems
  underrepresented, and that the site preview is still visually basic.
- **Decision/status:** **Partial real-browser evidence, not Step 3 sign-off.**
  The screenshot does not verify phone behavior, error handling, network
  privacy, speed, or the correctness of the contrast calculation. No design
  change, Step 4 review, or new app-run `outputs/` file was made.

## 2026-10-08 — Project 2 phone functionality confirmed

- **Instruction and direction:** After I asked whether image selection also
  updates the swatches and preview on the live phone page, the user confirmed
  that it works.
- **Came back:** Recorded the user's phone result alongside the desktop
  screenshot and local tests in
  [[AI 101/Project 2/03-build-a-small-prototype.md]]. Saved the narrow
  functional Step 3 result to
  [[AI 101/Project 2/outputs/image-palette-web-app/03-build-a-small-prototype.md]].
- **Decision/status:** **Core upload-to-preview feasibility passed on Windows
  and a phone, with the phone result user-reported.** This does not resolve
  the user's visual-polish objection or verify invalid files, privacy,
  performance, accessibility, or every image/phone format. Stop before Step 4
  human review; no further code change was made.

## 2026-10-08 — Project 2 Step 4 human-review draft

- **Instruction and direction:** The user said “continue” after the narrow
  Windows-and-phone Step 3 functional result, so I performed only the Step 4
  audit and stopped for their check.
- **Tool/context:** I reviewed the prototype source and published file list,
  reran the simulated-pixel tests, independently calculated the screenshot's
  displayed text contrast, benchmarked only the extraction logic on Windows,
  and checked current MDN, W3C, and GitHub documentation for the privacy and
  contrast caveats. No app code was changed.
- **Came back:** Added a separate review draft to
  [[AI 101/Project 2/04-human-check.md]]. It distinguishes the passed core
  flow from untested JPG/error/privacy/performance/accessibility cases,
  records the user's rejection of the generic visual design, and proposes a
  bounded design-and-palette revision rather than extra features.
- **Decision/status:** **Awaiting the user's Step 4 check.** No Step 4 app-run
  output was saved to `outputs/`, no polish revision was begun, and Step 5 was
  not started.

## 2026-10-08 — Project 2 Step 4 clarification needed

- **Instruction and direction:** The user replied “i do” to a Step 4 message
  that asked both whether they agree with a bounded design revision and
  whether they noticed phone lag, clipping, or unreadable text.
- **Came back:** Recorded the ambiguity in
  [[AI 101/Project 2/04-human-check.md]] and asked which meaning was intended
  instead of inventing a performance result or approval.
- **Decision/status:** **Step 4 still pending clarification.** No code change,
  Step 4 `outputs/` acceptance, or Step 5 work occurred.

## 2026-10-08 — Project 2 Step 4 accepted

- **Instruction and direction:** The user clarified “i agree lets proceed,”
  approving a bounded redesign after the Step 4 audit. This did not answer
  whether the phone had lag, clipping, or unreadable text.
- **Came back:** Saved the accepted human review in
  [[AI 101/Project 2/outputs/image-palette-web-app/04-human-check.md]] and
  updated [[AI 101/Project 2/04-human-check.md]] to record the decision and
  unresolved performance/layout question.
- **Decision/status:** Keep the working browser-only core, reject the current
  generic visual treatment, and permit only the agreed upload-control,
  editorial-preview, and accent-selection revision. This is not release
  approval.

## 2026-10-08 — Project 2 Step 5 bounded revision

- **Instruction and direction:** Following the user's Step 4 approval, make
  one bounded visual-and-palette pass, retest, and stop for review.
- **Came back:** Revised the five-file app-only prototype with one labeled
  image chooser, a more intentional editorial preview that uses the selected
  image, larger swatches, and an accent-aware palette rule. Updated
  [[AI 101/Project 2/05-iterate-or-stop.md]] with the expected benefit,
  risks, checks, and requested repeat test. Published the revision to the
  separate public app repo and existing GitHub Pages test link.
- **Actual checks:** Node syntax checks and four simulated-pixel tests passed,
  including a 1%-area vivid cyan accent. Git diff whitespace check passed.
  GitHub Pages reported `built`, and revised HTML/CSS/JS returned HTTP 200.
- **Decision/status:** **Awaiting visual and phone review.** These checks do
  not prove that the user's actual cyan accent is captured, the design feels
  polished, the phone has no lag/clipping, or runtime privacy is verified.
  No new Step 5 app-run output was saved to `outputs/`; no further iteration
  or final release decision was made.

## 2026-10-08 — Project 2 revised-preview screenshot

- **Instruction and direction:** The user showed a screenshot of the revised
  website preview after the bounded Step 5 design-and-accent change.
- **Came back:** Recorded in [[AI 101/Project 2/05-iterate-or-stop.md]] that
  the desktop screenshot displays the editorial two-column composition,
  selected-image feature panel, and pale cyan/blue accent against a blue
  background. The view is more structured than the first flat preview, but
  it crops out the source filename and swatches.
- **Decision/status:** **Visual evidence, not Step 5 approval.** I cannot tell
  from this crop whether the original vivid cyan was extracted or whether
  the phone has lag/clipping. No further code, `outputs/` save, or release
  decision was made.

## 2026-10-08 — Project 2 revised phone check

- **Instruction and direction:** The user reported that the revised site
  “works fine on phone.”
- **Came back:** Added the positive user-reported phone check to
  [[AI 101/Project 2/05-iterate-or-stop.md]]. The statement supports the
  phone experience for the device they tried, without supplying device,
  browser, timing, or layout screenshots.
- **Decision/status:** **Step 5 visual/stop decision still pending.** The user
  has not explicitly accepted the editorial visual direction or identified
  whether the cropped screenshot used the original `Test 7.png`. No code
  change, app-run `outputs/` save, or final release decision was made.

## 2026-10-08 — Project 2 Step 5 accepted; stop for now

- **Instruction and direction:** Asked whether to keep the revised prototype
  as good enough or make another focused accent pass. The user chose “fine
  for now lets proceed.”
- **Came back:** Recorded the stop decision in
  [[AI 101/Project 2/05-iterate-or-stop.md]] and saved the accepted run result
  to [[AI 101/Project 2/outputs/image-palette-web-app/05-iterate-or-stop.md]].
  The live app and separate public app-only repository remain available.
- **Decision/status:** **Stop this iteration, not a blanket release claim.**
  The user accepted the current revised prototype for now. The pale accent
  observation and unverified format, error, privacy, speed, accessibility,
  and cross-browser cases remain documented. No further app code was changed.

## 2026-10-08 — Direction requested after Project 2 workflow

- **Instruction and direction:** After accepting the Step 5 stop decision,
  the user said “proceed” without naming a new task or revision.
- **Came back:** Asked which next action they want, rather than inventing a
  sixth workflow step or reopening the prototype without a target.
- **Decision/status:** **Awaiting direction.** No app code, accepted output,
  or live site was changed.

## 2026-10-08 — Project 2 utility iteration: manual accent trial

- **Instruction and direction:** The user selected the Step 5 Canvas node and
  asked to improve the app's functionality and utility. I interpreted this
  as a bounded new feature loop, not permission for an unlimited redesign.
- **Came back:** Kept automatic colors as the default but made the extracted
  swatches interactive: tapping one tries it as the website accent, with a
  contrast-aware foreground and Reset to automatic. The page background and
  main text remain auto-assigned. Recorded the scope/feasibility deltas in
  [[AI 101/Project 2/01-define-the-goal.md]] and
  [[AI 101/Project 2/02-check-feasibility.md]], and the iteration/check in
  [[AI 101/Project 2/05-iterate-or-stop.md]]. Updated the five-file app-only
  public repo and live prototype.
- **Actual checks:** Node syntax checks and six simulated logic/DOM checks
  passed, including swatch click, `aria-pressed`, and reset. Git whitespace
  check passed. GitHub Pages reported `built`, and the live HTML/JS returned
  HTTP 200 with the new controls.
- **Decision/status:** **Awaiting the user's real desktop/phone interaction
  check.** No visual or touch behavior was independently observed, no new
  utility-iteration output was saved to `outputs/`, and no further feature or
  final-release decision was made.

## 2026-10-08 — Project 2 new run: obsidian-gaze goal draft

- **Instruction and direction:** The user supplied a detailed specification
  for `obsidian-gaze`, a minimal offline Obsidian image-grading plugin, while
  the Canvas selection pointed to the prior run's Step 5 node. Their standing
  instruction is to follow [[AI 101/Project 2/00-start-here.md]] one step at
  a time and stop at each check.
- **Came back:** Started a separate Step 1 draft in
  [[AI 101/Project 2/01-define-the-goal.md]], recording the one-image-in,
  one-graded-PNG-out scope, four required filters, UI/input requirements,
  explicit exclusions, and testable success criteria. Flagged that the
  original filter source was not supplied, the full-screen versus 900px modal
  instructions conflict, mobile support needs confirmation, and the proposed
  import requires a `directors.ts` file omitted from the tree.
- **Decision/status:** **Awaiting the user's goal/scope check.** No filter
  algorithms were represented as exact copies, no plugin was built or tested,
  and nothing was saved to `outputs/` for this new run.

## 2026-10-08 — obsidian-gaze Step 1 accepted; Step 2 feasibility draft

- **Instruction and direction:** The user approved implementing the supplied
  filter recipes, delegated the modal sizing choice, and said mobile support
  is not needed. They again selected the previous Canvas Step 5 node; the
  standing workflow still requires a new project to progress in order.
- **Came back:** Recorded those decisions in
  [[AI 101/Project 2/01-define-the-goal.md]] and saved the accepted goal to
  [[AI 101/Project 2/outputs/obsidian-gaze/01-define-the-goal.md]]. Chose the
  specified large centered 900px/90vh modal. Checked official Obsidian
  build, manifest, CSS, mobile, and sample-template documentation; checked
  MDN for FileReader, Canvas export, and Web Audio; confirmed local Node,
  npm, Git, and Obsidian versions. Drafted a route comparison, manifest
  corrections, risk/effort estimate, and a smallest in-app test in
  [[AI 101/Project 2/02-check-feasibility.md]].
- **Difference noticed:** The initial manifest says `id: obsidian-gaze`,
  `name: gaze.`, and `isDesktopOnly: false`; current Obsidian publication
  rules disallow `obsidian` in IDs and a period in names, while the user's
  desktop-only scope does not call for mobile support. I recommended
  `gaze`/`Gaze`/`true` for user approval, keeping `obsidian-gaze` as the
  project name. Also noted `directors.ts` is required by the proposed import.
- **Decision/status:** **Step 2 route check pending.** No plugin code or test
  has been run; no Step 2 result saved to `outputs/`; no release decision.
