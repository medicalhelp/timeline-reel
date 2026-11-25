# Review log · portfolio explorations round 1

Light mode: one build, one review by two lenses (motion; clarity and accessibility), one fix pass. Full reviewer reports are kept in the session; the findings below are the actionable list given to the builder, with the orchestrator's rulings.

## Rulings (where a finding meets an owner decision)

1. **Personal clips stay unnamed** (owner decision 20). Do **not** add a "personal" tag. Do give them a faint resting presence so the timeline still reads as five clips: strip brightness about .3 at rest, a border around 3:1 against the stage, and the hover/focus label names them.
2. **No new text on the timeline** (decision 22). Contrast fixes happen with scrims and opaque ink values, not with more labels.
3. **The path to a case study on Home** is an open question for the owner (click opens the case study, as in the original idea, versus click jumps as in H1). For this pass: keep click-to-jump on H, S, K and I; make the clip's accessible name and hover/focus label say "IKEA · open case study" only on T1/T2, where clicking opens it. Note it as open.
4. **A pause control is added** (WCAG 2.2.2): a minimal "pause" toggle beside "sound off", same style. Space no longer hijacks focused buttons.
5. **Name, role and contact stay reachable in the case study** (decision 5): a compact chrome stays on screen there.
6. **Films were re-encoded by the orchestrator** with a keyframe every 8 frames (0.27 s) for scrubbing; no need to change media.

## Motion findings (senior motion designer)

**Must**
- Kit: reduced motion still autoplays films (`show()` always plays). Play only when the clock plays; otherwise seek and pause. Same in I1 (the first film is re-seeked as it is revealed).
- S1: the throw lands on the previous clip's last frame and stalls about 0.6 s. Land at `best + 0.05`, `setCur(target)` at release, end the settle at |x − land| < 0.5 px, resume with `S.rate` easing 0 → 1 over 400 ms.
- S1: the grab jumps (playhead flies to the pointer, two cuts in 150 ms). Scrub relatively with an offset that decays (ω ≈ 10/s); defer reel seeks until within 3 px.
- S2: a resting preview loops a 0.5 s stutter. Give the preview its own clock while resting; re-anchor only after > 1.5 px of pointer movement.
- T1: the hero jumps 60 px and reverses (page `rise` applied to the reel). Apply `rise` to the text only.
- T2: the zoom overshoots and pulls back (L 315 → 5 → 29, R 631 → 1333 → 1281). Zoom straight to the final box; neighbours enter on their own leg.
- C1: the playhead jumps 696 px at a step. Capture the head before switching and lerp it to the new box.
- C1: the hero whips through the viewport (≈ 1,740 px in 0.9 s) on step and close. Fade out, reset scroll at alpha 0, fade in at place.
- C1 (reduced): a step leaves the page invisible and the strip half re-formed. Normalise every leg by the transition length, or add a simple reduced branch.
- K1: old and new lines overlap in the same cell. Use the declared `BEAT.in` delays.

**Should**
- Kit: crossfade dips to black (coverage 0.947): incoming layer on top, fade only the incoming layer.
- Kit: cuts land late (100–1000 ms): preload the next segment into the hidden layer; wait for `seeked` before fading.
- Kit: retargeting a glide stops the playhead: carry velocity (critically damped spring, ω ≈ 7/s).
- Kit: some timing runs on `setTimeout`: move to the frame clock.
- Kit/K1: caption over light films below 3:1: add a lower-left scrim.
- H3: abrupt start, long tail: smooth the target first, ω 7.5, snap below 0.002.
- S1: films play during drag: pause every layer touched in drag mode.
- S2: settle runs on the wrong layer; films flicker past while gliding (hold above 600 px/s, cue below 300 px/s); freeze on vertical exit.
- T1: reads as a crop: end scale around 0.86; morph the caption into the title as a shared element.
- T2: about 1 s of black stage and 2.8 s total: dim the reel to 0.25, compress to about 2.2 s; avoid two playheads at once.
- K1: too close to H1: make the in-clip change the hero (line 2 wipes on the cut, lines 1 and 3 stay).
- I1: the role arrives before the name: travel it with the name, 0.12 s behind.

**Nice**: H1 caption in/out overlap; H2 personal clips invisible at rest; S1 settle length; T1/T2 strip crossing the hero; interruptible open/close; C1 wheel interrupt; C1 title area dead for the playhead; I1 first film earlier (about 1.1 s).

## Clarity and accessibility findings

**Must**
- Home screens: no visible path to a case study (see ruling 3).
- Text over films fails AA (role 1.9:1, company 2.5:1, nav 2.6:1, name 3.6:1). Dedicated scrims (top 0–160 px at .88; lower-left plate behind the caption at about .85, feathered), opaque `--ink-2` over film (#b9b7b3), name at 24 px or weight 500; re-measure against the brightest frames.
- No pause control (ruling 4). Space breaks keyboard activation (ruling 4).
- Reduced motion does not stop films (also motion must).
- H3: no visible focus on clips (clip-path clips the outline): inset focus ring, grow the timeline on focus-within.
- S2: keyboard Enter jumps to IKEA (uses clientX): handle keyboard clicks by the clip's index.
- T1/T2/C1: invisible elements take focus in the case study: `inert` on hidden layers.
- T1/T2/C1: sections and neighbours not keyboard-reachable or named: real buttons with labels in a `nav`, `aria-current` on the active section.
- T1/T2/C1: focusing an off-screen button scrolls the page and breaks the layout: handle `focusin` or use native scrolling with smoothing.
- T1/T2/C1: name, role and contact disappear (ruling 5).

**Should**
- Personal clips invisible (ruling 1). Tooltip also on keyboard focus; `aria-current` on the playing clip.
- Live region too chatty during autoplay: off while autoplaying, polite after user actions; one composed string per change in K1.
- Sound toggle name doesn't contain its visible text.
- Hierarchy: the 44 px caption "product design" reads like the person's tagline. Use the project name as the caption title (placeholders are fine) and a slightly stronger identity block.
- S2: preview vs current state unclear: outline the hovered clip, ghost line at 60 %.
- C1/T1/T2: active section shown only by brightness; film colour reads as selection: a 2 px ink bar under the active section, desaturated section frames.
- C1/T1/T2: neighbours unrecognisable and their tooltip clipped: wider neighbours with a small logo; clamp tooltips to the viewport.
- H1: no calm end state after one pass (optional; ruling: hold on the last frame after one pass, paused, until the viewer acts).
- I1: role overlaps the name (also motion).
- Case study: an `h1` and a `main` with a label.
- Tooltip secondary text slightly low (opacity .68).

**Nice**: a one-time "drag to scrub" hint (only if it stays minimal); one tab stop for the timeline with roving focus; real `mailto:` and CV links in the mockups; avoid "a1" in titles; T2 dark beat (also motion); consistent wording ("CV", one term for personal).

## Result of the fix pass (2026-11-25)

All musts and shoulds were applied (per the rulings), most nices too. Re-measured by the builder:

| Break | Before | After |
|---|---|---|
| T1 hero | 60 px jump, then reversed | no reversals, ≤ 11 px per frame, ends at scale 0.86 |
| T2 zoom | overshoot (L 315 → 5 → 29, R 631 → 1333 → 1281) | monotonic (L 316 → 59, R 631 → 1191) |
| C1 playhead at a step | 696 px in one frame | no reversals, soft 1.4 s curve |
| C1 hero whip | ≈ 1,740 px in 0.9 s | no movement while visible (fade, reset, fade in) |
| S1 grab and settle | jump to pointer, 0.6 s stall | soft start, lands on Red Bull's first frame |
| S2 resting preview | 0.5 s stutter loop | plays forward, no backward jumps |
| K1 caption | old and new line in one cell | at most one line visible per cell |

Contrast over the brightest frames: name 13.5:1, role 6.8:1, nav 7.6:1, caption 6.7–12.1:1, pause and sound 5.1:1.

**Not done:** interruptible open and close; a wheel interrupt during a C1 step; a drag-to-scrub hint (ruled out); one tab stop for the timeline; a real CV link.

**Open for the owner:** how Home opens a case study (click opens or click jumps); the hold on the last frame after one pass in H1; the lower-left scrim reads as a dark vignette over very light footage (the price of AA with these stand-ins); project titles are placeholders.

Orchestrator check: all 10 explorations load the right screen and play to the end with zero console errors (Chromium, 1440 × 900).
