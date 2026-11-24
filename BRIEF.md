# Brief: the portfolio as a timeline reel

**Date:** 2026-11-24 · **Owner:** Johannes · **Built by:** Claude with the `design-explorations` method, **light mode** (one builder, one review by both lenses)
**Idea and decisions:** `docs/ideas/portfolio-timeline.md` (the grill). This brief turns them into a round of explorations.
**Output:** `docs/design/portfolio/`: `board.html` (desktop frames), one page per cluster with `?screen=ID`, `kit/`, `media/` (stand-in films), `research/`.
**Ships to:** branch `claude/determined-dirac-b6sucm`; Johannes reviews the board first.

## 1. The problem
A product design portfolio has to make sense to a hiring manager in about 30 seconds, and most look the same: a grid of thumbnails. The work is motion and interaction, so the portfolio should show it moving, and its structure should be the career itself.

## 2. The core idea
**The portfolio is a reel, and the timeline is its index.** The top 90vh plays one short film per project, back to back; the bottom 10vh is the timeline of those films, ordered by time, with a playhead. Clicking a clip opens its case study, and the timeline becomes that page's navigation.

## 3. Decisions (from the grill)
- **Audience:** hiring managers; clear in 30 seconds.
- **Reel:** a 5–15 s film per project, autoplay; dragging the playhead or clicking a clip takes over. Muted, one sound toggle.
- **Timeline:** ordered by time; at the bottom on Home, at the top in a case study, where its clips are the case study's sections and the playhead follows the scroll. About 20 clips. Work clips show the company logo in white; personal projects are quieter, with a tag. A hint of an editor (clips, playhead, timecode), no fake toolbars.
- **First screen also:** name and role; a caption for the current clip (company, project, role, year); contact and CV.
- **Opening a case study, explore both:** the reel becomes the case study's hero, or the timeline zooms into the clip and opens it into sections.
- **Desktop first** (1440 × 900 frame); mobile later.
- **Look:** dark, cinematic, quiet type; a near-black stage so the films glow; white logos; small precise type.
- **Stand-in films:** recordings of real work (the archive intro, the collection, the assistant explorations, the recipe page). Company names and logos are **placeholders** until the real project list exists.

## 4. Motion bar: butter-smooth
Measured against the intro in `medicalhelp/the-archive` (feel, not copy) and Aristide Benoist's work (`research/smooth-motion.md`).
1. **One master clock.** Everything (reel, playhead, caption, timeline) is driven from one timeline in a single `requestAnimationFrame` loop, never from scattered timers.
2. **Long, soft curves.** Big moves use soft-start, soft-landing curves (the archive's `cubic-bezier(.601,0,.405,1)`, or an expo-out `cubic-bezier(.16,1,.3,1)` for arrivals), 0.8–1.6 s. Small moves 240–400 ms. Nothing linear except the playhead while playing (that is real time).
3. **Smoothed input.** Pointer-driven things (scrub, hover, scroll-linked playhead) follow a smoothed target (lerp ≈ 0.12–0.2 per frame at 60 fps, time-corrected), so motion never jitters or snaps.
4. **The camera moves, not the pieces.** Prefer moving one container (scale/translate) over many elements; scale in log space.
5. **Never stop, reverse or restart** inside a gesture; transitions overlap (the next starts before the last fully lands).
6. **Transform and opacity only,** no layout animation; videos preloaded and swapped without a black frame; type stays sharp.
7. **Reduced motion:** crossfades only, no camera moves; autoplay off.
8. **Every piece has a comment block with its timing,** like the assistant explorations.

## 5. The explorations (10)
**H · Home**
- **H1 · the reel and the timeline** (the reference): autoplay through all clips, playhead running, caption changing, name, role and contact; click a clip to jump (the playhead glides, the reel crossfades); hover a clip.
- **H2 · a quieter timeline**: logos only on a hairline track, no ruler; the playhead is a soft light rather than a line.
- **H3 · the timeline as a CV**: a year ruler and timecode, clip widths by reel length, years and roles readable at a glance.

**S · Scrubbing**
- **S1 · drag to scrub**: grab the timeline or playhead; the reel follows frame by frame with smoothing; release with a little inertia and settle on the nearest clip.
- **S2 · hover to preview**: hovering a clip shows its film in the reel after a short delay, and returning to the playhead resumes.

**T · Opening a case study**
- **T1 · the reel becomes the hero**: click a logo; the playing film settles into the case study's hero, the timeline travels to the top and re-forms as the sections; the page continues below. No cut.
- **T2 · zoom into the clip**: the timeline zooms into the clicked clip until it fills the strip and splits into its sections; the reel follows into the case study.

**C · Case study**
- **C1 · the timeline as section navigation**: a case study page with the timeline at the top; the playhead follows the scroll; clicking a section scrolls there smoothly; neighbouring projects as thin clips at the ends.

**K · Caption**
- **K1 · the caption as a lower third**: company, project, role and year change in sync with the cut, each line sliding in on its own beat.

**I · Arrival**
- **I1 · first load**: the name and the timeline assemble, the first film fades up, the playhead starts: one continuous gesture in the archive's spirit.

## 6. Out of scope
Mobile; real project content; real logos; sound design; the full case study text.

## 7. References
`docs/ideas/portfolio-timeline.md` · https://www.jonway.studio/ · `the-archive/index.html` and `CONCEPT.md` (master curve, one timeline, Resolve-style timeline UI) · `research/smooth-motion.md` · the assistant explorations (`docs/design/assistant/`), whose kit pattern (`?screen=ID`, one timing path, replay) this round reuses.
