# timeline-reel

Johannes's product design portfolio, designed as a **timeline reel**: the top 90vh plays one short film per project, back to back; the bottom 10vh is the timeline of those films with a playhead. Clicking a clip opens its case study, and the timeline becomes that page's section navigation. Audience: hiring managers, who need to get it in about 30 seconds.

This repo holds **round 1 of design explorations**: 10 live desktop mockups on a board. It is not the shipping site yet. It was moved here from the collection repo (`medicalhelp/collection`, `docs/design/portfolio/`) on 2026-11-25, with its git history.

## Read first
1. `docs/IDEA.md`: the idea as told, plus every decision from the grill sessions and the feedback rounds (numbered). It wins over anything else.
2. `BRIEF.md`: the round's brief: decisions, the **motion bar** (§4), the 10 explorations (§5).
3. `REVIEW.md`: what the motion and the clarity reviewers found, the rulings, and the before/after numbers.
4. `docs/evidence/chat-extract.md`: the verbatim conversation (Johannes's messages, every grill question and answer).

## Open it
Open `board.html` in a browser (file:// works). The frames are live; "replay" runs each demo, "0.25×" slows it down. A single exploration: `home.html?screen=H1` (also `scrub.html` S1/S2, `case.html` T1/T2/C1, `caption.html` K1, `arrive.html` I1). Append `&reduced` for reduced motion.

## How it is built
- **One dependency-free kit** in `kit/` (`pf.js`, `pf.css`, contract in `kit/README.md`): one master clock in a single rAF loop drives the reel (one continuous film on two video layers that crossfade on jumps), the timeline (frame strips from `media/strip-reel.jpg`, white logos from `media/logos-*.svg`, brand underlines, a playhead that carries its velocity), the icon pause and sound buttons (sound fades over ≈ 0.4 s).
- **Each page** calls `Pf.define({ ID: { title, does, why, opts, setup(ctx), play(ctx) } })` and is opened with `?screen=ID`. Every exploration has a comment block with its timing at 1×.
- **The board** (`board.html` + `board-data.js`) is data-driven: one lane per cluster.
- **Media:** the real reel (`reel/Reel 2025.mp4`, untouched) encoded to `media/reel.mp4` and `reel.webm` (720p60, H.264 / VP9, a keyframe every 16 frames for scrubbing, audio kept; the title card inverted to white on black, black tail trimmed). `media/strip-reel.jpg` holds the timeline frames (128×72 each, 2 per second). Logos: IKEA, Telekom, Red Bull and Disney+ from Wikimedia Commons, converted to white. The old stand-in films (`media/a1.mp4`, `archive.mp4` …) are no longer used.
- **Clips** (`kit/pf.js`, `CLIPS` → `PROJECTS`): the reel's own order: title card, IKEA, Disney+, Telekom, Red Bull, one unnamed personal clip, Telekom, IKEA, Telekom. One logo per brand (first clip), brand-colour underline on the repeats, brand colour on hover. Roles, years and project titles are placeholders. Cut times come from scene detection; adjust in `CLIPS`.

## Rules (from Johannes's decisions)
- **Minimal timeline:** no ruler, no timecode, no text on the timeline; the playhead is a single thin line. Personal clips stay unnamed (hover names them). A brand's first clip shows its logo in white over dimmed frame strips; later clips of the brand only carry a brand-colour underline. **No captions** anywhere; pause and sound are round icon buttons on a black blur; the header is just the name (small, sans).
- **Dark, cinematic, quiet type:** near-black stage, the films are the colour, white logos. Desktop first (1440 × 900); mobile later.
- **Butter-smooth motion** (BRIEF §4): one master clock; soft-start, soft-landing curves (the archive's `cubic-bezier(.601,0,.405,1)`), 0.8–1.6 s for big moves; pointer input follows a smoothed, time-corrected target; move one container, not many pieces; never stop, reverse or restart mid-gesture; transform and opacity only; a reduced-motion version for everything. The feel reference is `medicalhelp/the-archive` (`index.html`, `CONCEPT.md`): feel, not copy. Research: `research/smooth-motion.md`.
- **A motion design review is part of every round.**
- **Verify by looking:** Playwright at 1440 × 900, play each demo (`window.postMessage({pf:'play',speed:1},'*')`), screenshot several moments, look at them, zero console errors.

## Method
New rounds follow the **design-explorations** method: grill, brief with a measurable motion bar, research, kit plus one reference piece by hand, approval, then scale with a builder and reviewers. The skill's single source is the `medicalhelp/claude-skills` repo; on the Mac it is linked into `~/.claude/skills/`. The worked example and the evidence for why it works live in the collection repo (`docs/design/assistant/HOW-WE-GOT-HERE.md`).

## Open (Johannes to decide)
1. How Home opens a case study: clicking a clip opens it (the original idea, as in T1/T2), or clicking jumps the reel (H1).
2. H1 holds paused on its last frame after one pass (from the review); keep it, or loop.
3. (Resolved: the corner scrims are gone; the top one is lighter and shorter.) Check the top gradient over very bright footage.
4. Roles, years, project titles and case-study copy; the two guessed clip boundaries (see `docs/IDEA.md`, Open).
5. Which explorations win, then the next round, then mobile.

## Git
Use the GitHub account `medicalhelp`. Commit messages are short and plain (`docs(design): …`, `feat: …`).
