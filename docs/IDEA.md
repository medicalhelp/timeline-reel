# Portfolio: the timeline reel

**app:** design portfolio (new, not part of the collection)
**status:** idea · **added:** 2026-11-24 · **stage:** grilling
**Why it lives here:** this repo is where ideas go for now. Linked from `docs/IDEAS.md` ("Other projects").

---

## The idea, as told (2026-11-24)

A product design portfolio built like a video editor's timeline.

- **Two bands, full width.** The top 90% of the viewport height is the **reel**: it plays the work. The bottom 10% is a **timeline**, like the one in a video editor (first thought was a film strip, as on Jon Way's site, https://www.jonway.studio/). About **20 items**.
- **Each item is a project**, personal or work. Together the timeline *is* the reel: the reel plays at the top while a **playhead** runs through the timeline at the bottom.
- **Work items carry the company logo in white.** Clicking a logo opens that project's **case study**, and the playhead moves to it.
- **The timeline as navigation.** It might sit at the top instead, so it reads as a navigation element. Inside a case study, the timeline could also become the navigation of that case study itself (its sections as clips). Worth exploring.

## Decisions (grill, 2026-11-24)

**What it is**
1. **Audience:** hiring managers. It must make sense in about 30 seconds.
2. **The reel is a short film per project,** 5–15 s each, back to back like one showreel.
3. **It plays by itself;** dragging the playhead or tapping an item takes over, like an editor.
4. **The timeline is ordered by time,** so it doubles as a CV. **What a clip's length means is open:** it depends on how the reel is cut.
5. **The first screen also has:** your name and role, a caption for the current clip (company, project, your role, year) that changes as the playhead moves, and contact and CV, always reachable.
6. **Sound:** muted by default, with one quiet sound toggle.

**The timeline**
7. **At the bottom on Home; it travels to the top in a case study** and becomes that page's navigation.
8. **In a case study its clips are the case study's sections** (problem, research, concepts, design, outcome). The playhead follows the scroll; tap a clip to jump.
9. **Faces:** work clips carry the company logo in white; personal projects are visually quieter, marked with a tag.
10. **A hint of a video editor, not a costume:** clips, a playhead and a timecode; no fake toolbars. The work stays the hero.

**Opening a case study** (explore both)
11. **The reel becomes the case study:** the playing film settles into the case study's hero, and the page continues below. No cut.
12. **Zoom into the timeline:** the timeline zooms into the clip, which opens into its sections.

**Motion**
- **Butter-smooth, everywhere.** The bar is the feel of the intro scene in the `medicalhelp/the-archive` repo (feel, not a copy), which is inspired by Aristide Benoist's work: continuous, weighted, nothing snaps.
- **A motion design review is part of every round** (a senior motion designer's lens: continuity, easing, timing, interruptibility, frame rate), as in the assistant explorations.

**Scope and next step**
13. **Desktop first;** mobile later.
14. **No films yet.** For the explorations, use recordings of real work as stand-ins (the collection prototype, the assistant explorations).
15. **Next: an exploration board in light mode** (the `design-explorations` method): about 10 live desktop mockups, one builder, one review.
16. **Look to start from:** dark, cinematic, quiet type, like a screening room. A near-black stage so the films glow, white logos, small precise type.
17. **Where:** `docs/design/portfolio/` in this repo for now, moving out later.

**Round 1 feedback on H1 (2026-11-24)**
18. **Frames on the timeline:** each clip is a film strip of frames from its own film (like an editor), dimmed, with the logo in white on top.
19. **Fewer, longer clips:** one long clip per company, in order **IKEA, Telekom, Red Bull** (oldest first), about 20–30 s each, made of several films; the projects inside become the case study's sections.
20. **Personal projects:** the recipe app and the collection, unnamed on the timeline (hover names them), placed by date (both 2026, so after the companies). The collection clip shows several assistant explorations full screen, one after another.
21. **Logos:** IKEA, Telekom and Red Bull from Wikimedia Commons, converted to white SVGs (`docs/design/portfolio/media/logos-*.svg`).

## Open
- Roles and years per company.
- What a clip's length means (duration, equal, importance): decide once the reel is cut.
- Mobile.
