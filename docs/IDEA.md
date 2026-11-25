# Portfolio: the timeline reel

**app:** design portfolio (new, not part of the collection)
**status:** idea · **added:** 2026-11-24 · **stage:** grilling
**Where it lives:** `medicalhelp/timeline-reel` (moved from the collection repo on 2026-11-25, with its history; the collection's `docs/IDEAS.md` keeps a pointer).

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
17. **Where:** first `docs/design/portfolio/` in the collection repo; since 2026-11-25 its own repository, `medicalhelp/timeline-reel`.

**Round 1 feedback on H1 (2026-11-24)**
18. **Frames on the timeline:** each clip is a film strip of frames from its own film (like an editor), dimmed, with the logo in white on top.
19. **Fewer, longer clips:** one long clip per company, in order **IKEA, Telekom, Red Bull** (oldest first), about 20–30 s each, made of several films; the projects inside become the case study's sections.
20. **Personal projects:** the recipe app and the collection, unnamed on the timeline (hover names them), placed by date (both 2026, so after the companies). The collection clip shows several assistant explorations full screen, one after another.
21. **Logos:** IKEA, Telekom and Red Bull from Wikimedia Commons, converted to white SVGs (`media/logos-*.svg`).

22. **Minimal timeline:** no time indicators at all, neither a ruler on the timeline nor a timecode at the playhead; the playhead is a single thin line with no handle. Everything focuses on the work.

**Round 1 update: the real reel (2026-11-25)**
23. **The real reel replaces the stand-in films:** `reel/Reel 2025.mp4` (83 s, 1080p60, with sound) is the one film the page plays. Encoded to `media/reel.mp4` / `.webm` (720p60, a keyframe every 16 frames, audio kept) with the strip `media/strip-reel.jpg`; the original stays untouched in `reel/`. Everything before supersedes: clips are no longer made of several films, there are no stand-in films in use.
24. **Clips follow the reel's own order, no re-editing.** Boundaries were set with Johannes from a contact sheet: title card 0–2.05 s; IKEA 2.05–11.4; Disney+ 11.4–15.42 (the "Neue Helden" intro; added after Johannes named it as a client); Telekom 15.42–28.37; Red Bull 28.37–38.2; personal (street food festival, drone news; unnamed) 38.2–46.62; Telekom 46.62–51.05; IKEA 51.05–59.73; Telekom 59.73–79.18 (terrain, editor, Digital X). The black tail (79.18–83.1) is trimmed. The cut times come from scene detection (±0.1 s); adjust in `kit/pf.js` (`CLIPS`).
25. **Each brand's logo shows once** (its first clip). Later clips of that brand have no logo; nothing is coloured at rest, brand colour only on hover, see 32 (IKEA yellow, Telekom magenta, Red Bull red, Disney+ blue). Adjacent clips of the same brand are merged. Supersedes 19 (one long clip per company).
26. **The title card is the first clip** on the timeline (a short unnamed black clip), re-rendered from the original: black background, white text, same motion.
27. **No captions.** The lower-third (company, project, role, year) is removed everywhere, and so are the bottom-left and bottom-right scrims. Supersedes the caption in the brief and the old K1.
28. **Controls:** pause and sound are 40 px round icon buttons on a black blur (always readable). Sound is muted by default; the button unmutes with a ≈ 0.4 s fade; audio loops and pauses with the reel.
29. **Header:** only "Johannes Zimmer", 14 px in the page's sans (Inter), no "product designer"; the top gradient is lighter and shorter (112 px, ≈ .5 at the top).
30. **K1 is repurposed:** "a project change, by the timeline alone": the entering clip's brand bar swells, a band of its colour washes along the clip, a ring leaves the playhead (white for the card and the personal clip).
31. **Case studies are still per clip** (placeholder copy, section frames from the reel); the title card does not open one.
32. **Brand focus on hover (all explorations):** the brand colour is a full-clip layer, never a stripe. Hover a clip with a logo: it goes solid in its brand colour (100 %), the brand's other clips take 25 %, every other clip fades to 65 %. Hover a repeat clip (no logo): it takes 50 %, the brand's other clips 25 % (the logo clip too), the rest fade. Hover a clip with no brand (personal, title card): no colour, the others fade the same way. 320 ms, master curve. On IKEA yellow the logo turns dark. The hover label is black with white text and no stripe. (Tried and dropped: a faint tint at rest, and a `color` blend: "looks horrible".) Supersedes the underline in 25.

## Open
- Roles and years per company.
- Confirm the two guessed boundaries: 51.05–59.73 (long read, assistant) as IKEA, 59.73–79.18 (terrain, editor, Digital X) as Telekom; and the project titles ("warehouse tools" etc.) are placeholders.
- A brand's case study from a repeat clip: open that clip's own section, or the brand's whole story?
- Mobile.
