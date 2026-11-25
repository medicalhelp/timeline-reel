# Brief: the portfolio as a timeline reel

**Date:** 2026-11-24 · **Owner:** Johannes · **Built by:** Claude with the `design-explorations` method, **light mode** (one builder, one review by both lenses)
**Idea and decisions:** `docs/IDEA.md` (the grill). This brief turns them into a round of explorations.
**Output:** the repo root: `board.html` (desktop frames), one page per cluster with `?screen=ID`, `kit/`, `media/` (the real reel, encoded; strip and logos), `research/`.
**Ships to:** this repository (`medicalhelp/timeline-reel`, moved from the collection repo on 2026-11-25); Johannes reviews the board first.

## 1. The problem
A product design portfolio has to make sense to a hiring manager in about 30 seconds, and most look the same: a grid of thumbnails. The work is motion and interaction, so the portfolio should show it moving, and its structure should be the career itself.

## 2. The core idea
**The portfolio is a reel, and the timeline is its index.** The top 90vh plays one short film per project, back to back; the bottom 10vh is the timeline of those films, ordered by time, with a playhead. Clicking a clip opens its case study, and the timeline becomes that page's navigation.

## 3. Decisions (from the grill)
- **Audience:** hiring managers; clear in 30 seconds.
- **Reel:** a 5–15 s film per project, autoplay; dragging the playhead or clicking a clip takes over. Muted, one sound toggle.
- **Timeline:** ordered by time; at the bottom on Home, at the top in a case study, where its clips are the case study's sections and the playhead follows the scroll. About 20 clips. Work clips show the company logo in white; personal projects are quieter, with a tag. Minimal: clips and a playhead that is a single thin line; no ruler, no timecode, no handle (decided after H1).
- **First screen also:** the name (small, no role); contact and CV. No caption (round 1 update, see `docs/IDEA.md` 23–31).
- **Opening a case study, explore both:** the reel becomes the case study's hero, or the timeline zooms into the clip and opens it into sections.
- **Desktop first** (1440 × 900 frame); mobile later.
- **Look:** dark, cinematic, quiet type; a near-black stage so the films glow; white logos; small precise type.
- **The film:** the real Reel 2025 (`media/reel.mp4`), one continuous film; clips are stretches of it, in its own order. Roles, years and project titles are **placeholders**.

## 4. Motion bar: butter-smooth
Measured against the intro in `medicalhelp/the-archive` (feel, not copy) and Aristide Benoist's work (`research/smooth-motion.md`).
1. **One master clock.** Everything (reel, playhead, timeline, sound fade) is driven from one timeline in a single `requestAnimationFrame` loop, never from scattered timers.
2. **Long, soft curves.** Big moves use soft-start, soft-landing curves (the archive's `cubic-bezier(.601,0,.405,1)`, or an expo-out `cubic-bezier(.16,1,.3,1)` for arrivals), 0.8–1.6 s. Small moves 240–400 ms. Nothing linear except the playhead while playing (that is real time).
3. **Smoothed input.** Pointer-driven things (scrub, hover, scroll-linked playhead) follow a smoothed target (lerp ≈ 0.12–0.2 per frame at 60 fps, time-corrected), so motion never jitters or snaps.
4. **The camera moves, not the pieces.** Prefer moving one container (scale/translate) over many elements; scale in log space.
5. **Never stop, reverse or restart** inside a gesture; transitions overlap (the next starts before the last fully lands).
6. **Transform and opacity only,** no layout animation; videos preloaded and swapped without a black frame; type stays sharp.
7. **Reduced motion:** crossfades only, no camera moves; autoplay off.
8. **Every piece has a comment block with its timing,** like the assistant explorations.

## 5. The explorations (10)
_Updated after H1 feedback: five clips (IKEA, Telekom, Red Bull, then the recipe app and the collection), frame strips with white logos, personal clips unnamed, no ruler or timecode, the playhead a single line._

**H · Home** (`home.html`)
- **H1 · the reel and the timeline** (the reference, done).
- **H2 · frames on approach**: at rest the timeline shows only the logos on black; when the pointer comes near the timeline, the frame strips fade up underneath.
- **H3 · the timeline breathes**: hovering the timeline grows it from 10vh to about 16vh (the reel gives way by the same amount), frames brighten and read better; leaving shrinks it back.

**S · Scrubbing** (`scrub.html`)
- **S1 · drag to scrub**: grab anywhere on the timeline; the playhead follows the pointer with smoothing, the reel shows that moment of the film; on release a short inertia carries it on and it settles on the nearest clip start or keeps playing from there.
- **S2 · hover to preview**: resting on a clip for about 300 ms shows its film in the reel (the playhead stays where it was, a ghost line marks the hovered point); leaving returns to the playing clip.

**T · Opening a case study** (`case.html`)
- **T1 · the reel becomes the hero**: click a logo; the playing film settles into the case study's hero (it shrinks from full bleed into the hero frame), the timeline travels to the top and re-forms as that company's sections; the page continues below. No cut.
- **T2 · zoom into the clip**: click a logo; the timeline zooms into the clicked clip until it fills the strip and splits into its sections, then the case study appears beneath it.

**C · Case study** (`case.html`)
- **C1 · the timeline as section navigation**: a case study page (IKEA as the example) with the timeline at the top: its clips are the sections (problem, research, concepts, design, outcome); the playhead follows the scroll; clicking a section scrolls there smoothly; the neighbouring companies sit as thin clips at both ends to step to.

**K · Change** (`caption.html`)
- **K1 · a project change, by the timeline alone**: with no caption, the entering clip's brand bar swells, a band of its colour washes along the clip and a ring leaves the playhead; the film is never touched.

**I · Arrival** (`arrive.html`)
- **I1 · first load**: the name settles in, the timeline's clips draw in from left to right with their logos, the first film fades up and the playhead starts moving: one continuous gesture in the archive's spirit.

## 6. Out of scope
Mobile; real project content; real logos; sound design; the full case study text.

## 7. References
`docs/IDEA.md` · https://www.jonway.studio/ · `the-archive/index.html` and `CONCEPT.md` (master curve, one timeline, Resolve-style timeline UI) · `research/smooth-motion.md` · the assistant explorations (`docs/design/assistant/`), whose kit pattern (`?screen=ID`, one timing path, replay) this round reuses.
