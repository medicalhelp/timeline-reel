# Smooth motion research: reel, timeline, case study

Research for the desktop portfolio: a 90vh reel, a 10vh clip timeline with a playhead, and a case study that the timeline navigates. Benchmarks are Aristide Benoist's work and the owner's intro animation (one master timeline, `cubic-bezier(0.601, 0, 0.405, 1)`, camera moves, log-space scale, no pauses or restarts, vectors redrawn sharp).

Legend: **[V]** verified in a source listed below. **[U]** unverified, inferred from practice, or a source that could not be opened. Numbers without a tag are design recommendations to tune, not facts.

---

## 1. Aristide Benoist: what the record shows

- **Who** [V]: an independent developer who specialises in motion and interaction, freelancing for agencies and studios. Behance places him in Málaga, Spain. Awwwards lists him in Los Angeles. His site, aristidebenoist.com, is now a near-empty "Independent developer" landing page.
- **Recognition** [V]: Awwwards Independent of the Year 2023. The jury (Evan Bohringer) credited "his development of tools from scratch and raw WebGL work". He was also listed in the category in 2017 and 2019. His Awwwards profile lists about 43 works, 4 Site of the Month and 36 Site of the Day awards. Portfolio 2021, designed by Jon Way, was Site of the Month for June 2021. Earlier portfolios were designed by Brijan Powell (2018) and Ben Mingo with 3D by Michael Novia. He co-developed CANALS with Marcus Brown, a Webby nominee.
- **Portfolio 2021 tech** [V, Awwwards SOTM write-up]: built from scratch with no libraries or frameworks. It uses a custom Rollup, PostCSS and csso bundler, ships about 67 KB of JS before gzip, renders homepage images in raw WebGL, loads content from JSON and serves WebP.
- **Portfolio 2021 motion decisions** [V, same write-up]:
  - They explicitly **avoided scroll-jacking**, including subtle "directional easing that centres content", because it blocks the user.
  - They chose **click and keyboard navigation** as "the smoothest and least restrictive" option.
  - Thumbnails navigate the case studies.
  - A grid view was prototyped and **cut for simplicity**.
  - Each project has its own colour pairing and title-letter positions.
  - There is an intro animation, a detail animation and a designed About transition.
  - Aristide owned the typography and motion vision, and Jon Way the design, refined back and forth.
- **Page transitions** [V, Codrops, Feb 2026]: a Codrops tutorial calls him "a true reference when it comes to smooth, cinematic page transitions" and models its transition on his **Watson** site. The technique is to clone the page container, inject the new content, animate old out and new in at once as a crossfade, remove the old container, and lock navigation with an `isTransitioning` flag. The exact durations and eases were not readable (403). [U]
- **Image interactions** [V that the demo exists]: a third-party OGL/Three demo recreates one of his tweeted WebGL image effects. It cites "Align DOM and WebGL", OGL Flowmap, pixel distortion and gooey hover. No numbers are published.
- **No public talk or interview on his easing or lerp values was found** [V absence]. Any specific curve attributed to him is folklore.

### What makes his work feel smooth (synthesis)

1. **Own the render loop.** One rAF drives everything: WebGL planes, DOM transforms and scroll position. Nothing animates on a separate clock, so nothing drifts or stutters against anything else. [U, inferred from "tools from scratch / raw WebGL / no libraries"]
2. **WebGL planes mirror DOM boxes.** Images are GL textures positioned from DOM rects, so distortion, scale and masks cost nothing in layout. [V, the demo's sources; U that he does it this way]
3. **Restraint and user control.** No scroll-jacking, click and keyboard navigation, a cut grid view. Smoothness is partly the absence of fights with the user. [V]
4. **Tiny payload** (67 KB JS), so the first frames are never janky. [V]
5. **Per-project art direction inside one motion system.** Colours and letter positions vary, the motion grammar stays constant. [V]

---

## 2. Butter-smooth craft: principles with numbers

| Topic | Rule | Source |
|---|---|---|
| Properties | Animate `transform` and `opacity` only. Everything else triggers layout or paint. | web.dev [V] |
| `will-change` | Use sparingly. Set it just before a move and remove it after. Permanent layers waste memory. | web.dev [V] |
| Lenis defaults | `lerp: 0.1`, or `duration: 1.2` s with `easing: t => Math.min(1, 1.001 - 2^(-10t))` (expo-out; ignored if `lerp` is set). `syncTouchLerp 0.075`, `touchInertiaExponent 1.7`. | Lenis README [V] |
| Lenis + GSAP | `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t*1000))`; `gsap.ticker.lagSmoothing(0)`; no `autoRaf`. | Lenis README [V] |
| Lenis snap | Separate `lenis/snap`. `type: mandatory/proximity/lock`, `debounce: 500` ms, `distanceThreshold: '50%'`, plus `duration`, `lerp` and `easing`. CSS scroll-snap is unsupported. | lenis-snap.d.ts [V] |
| `scrollTo` | Options `duration`, `easing`, `lerp`, `lock`, `offset`, `onComplete`. | Lenis README [V] |
| Frame-rate independence | `x += (target - x) * (1 - exp(-λ·dt))`. At 60 Hz a per-frame lerp of 0.1 ≈ λ = 6.3/s. Use this, not a raw `0.1`, or 120 Hz screens move twice as fast. | Lembcke "Improved lerp smoothing" [V]; Holmér talk [U, secondhand] |
| Inertia (GSAP) | `InertiaPlugin` `resistance` default 1000/s. Duration clamps `min`/`max` (e.g. 0.5–2 s). `snap` can be a function and applies after the throw. | GSAP docs [V], key names vary by version [U] |
| FLIP | `Flip.getState` → change DOM → `Flip.from`. `nested: true` stops offsets compounding. `scale: true` uses scaleX/Y, which distorts children, so counter-scale or animate a clip instead. | GSAP Flip docs and forum [V] |
| View Transitions | `document.startViewTransition(cb)` pairs elements by `view-transition-name`. Supported in Chrome/Edge 111, Firefox 144 and Safari 18. Progressive enhancement. | Chrome docs [V] |
| Video frames | `video.requestVideoFrameCallback` gives `mediaTime` and `presentedFrames`. Upload a GL texture only on a new frame. Supported in Chrome 83, Firefox 132 and Safari 15.4. Safari video→texture upload is the known jank source, so double-buffer textures. | web.dev [V], WebKit bugs [V] |
| Reduced motion | HIG: "minimize or eliminate" animation when Reduce Motion is on. Replace movement with crossfades. | Apple HIG [V], crossfade substitute [U, Apple list post] |

### Easing palette

Put these in `tokens.css` as `--ease-*`. The standard values come from easings.net. **[V]** for the formulas, **[U]** for the exact bezier fits, which are the commonly published approximations.

| Token | cubic-bezier | Use |
|---|---|---|
| `--ease-main` | `0.601, 0, 0.405, 1` | The owner's curve. Soft start and soft landing for every big, camera-like move. |
| `--ease-out-expo` | `0.16, 1, 0.3, 1` | Things arriving: captions, hover reveals, reel hero settling. Matches the Lenis default feel. |
| `--ease-out-quart` | `0.25, 1, 0.5, 1` | Smaller UI arrivals: logos and labels. |
| `--ease-in-out-quart` | `0.76, 0, 0.24, 1` | Sharper scene changes, e.g. a wipe. |
| `--ease-in-quad-soft` | `0.5, 0, 0.75, 0` | Leaving elements only. Never used alone for anything the user waits on. |
| `linear` | — | Only for time-bound things: the playhead during playback and video progress. |

### Duration scale

Durations grow with distance travelled and with the share of the screen that changes.

- `--dur-xs` 0.18 s: hover colour and opacity.
- `--dur-s` 0.35 s: clip hover lift, caption line out.
- `--dur-m` 0.6 s: caption in, timeline label swap.
- `--dur-l` 1.0 s: crossfade between reel clips.
- `--dur-xl` 1.4 s: reel to case-study hero, timeline bottom to top.
- `--dur-xxl` 1.8 s: timeline zoom into a clip's sections. This is the longest move.

Stagger runs 0.04–0.08 s per item, and the total stagger tail is capped at about 0.4 s so the choreography never feels like it is waiting.

---

## 3. Premium reel and timeline UIs found

- **CUTT** (Framer template) [V]: on desktop the whole site travels sideways along a timeline. A red playhead at the bottom is the nav (Reel, Work, About, Contact). It has a film-leader intro that respects reduced motion, and switches to a vertical scroll on tablet and phone. Its easing is not documented.
- **Playhead** (Framer template) [V]: visitors scrub the reel on a real timeline with a program monitor and inspector panel.
- **Julia Oleksy editor portfolio** (Bartek Krzesak) [V]: a timeline bar with an indicator is the centrepiece. **Julia Plaza** [V]: a timeline with draggable clips that reorder the running order.
- **Brybry folio** by Bryan James (Awwwards case study) [V]: **the showreel is the navigation**. Click and hold opens the project currently playing, and holding drops `playbackRate` to **0.5** so you don't overshoot into the next project. A rAF loop converts `currentTime` to a percentage and drives an SVG circle via DrawSVG in **0.2 s linear** tweens, which smooths out irregular `timeupdate` steps. The background colour switches from video time.
- **jonway.studio** [V content]: Jon Way's current site (Los Angeles) is a long image run with a loading percentage. No timeline UI is visible. Jon is relevant as the designer of Aristide's 2021 folio.

The common thread is that the playhead is always a **smoothed reading of media time**, never a raw `timeupdate` value, and that scrubbing is either direct (1:1 under the pointer) or inertial with a snap on release.

---

## 4. Recipes mapped to our moments

The values are starting points. Tune them in tokens, not per component.

### Reel playback

**R1. Clip-to-clip crossfade (default).**
- Pre-roll the next clip **1.2 s** before the cut. It should be muted, `preload="auto"`, already decoded and seeked to 0, so it is playing when the fade starts.
- Crossfade opacity over `--dur-l` (1.0 s) with `--ease-main`.
- Add a "camera" push on both layers. The outgoing clip scales from 1.00 to 1.04, the incoming from 1.04 to 1.00 over 1.6 s, interpolated in log space: `s = exp(lerp(ln a, ln b, e))`.
- Nothing stops: the outgoing video keeps playing until its opacity reaches 0.

**R2. WebGL cut variant: mask wipe or displacement.**
- Use one full-bleed GL plane with two video textures (the Curtains.js pattern [V]). `mix(texA, texB, smoothstep(p - 0.15, p + 0.15, mask(uv)))`, where `mask` is a soft horizontal gradient plus low-frequency noise.
- Drive `p` from 0 to 1 over 1.1 s with `--ease-in-out-quart`.
- Add a displacement amplitude that peaks mid-transition: `amp = sin(π·p) * 0.03` in UV units.
- Upload textures inside `requestVideoFrameCallback` only.
- Keep this tasteful. One effect for the whole site.

**R3. Playhead during playback.**
- Position = clip start + `video.currentTime`, read every rAF, not on `timeupdate`, which fires at about 4–66 Hz irregularly.
- Smooth it with a frame-rate-independent damp, λ = 20/s. That is near 1:1 but hides jitter.
- Move it with `transform: translateX` and use linear easing. Time is linear.
- On a clip change the playhead does not jump. It keeps moving continuously into the next clip's box, because the timeline is one continuous strip.

**R4. Captions changing.**
- The old caption lines go `y: 0 → -30%` and opacity 1 → 0 over 0.35 s with `--ease-in-quad-soft`.
- The new lines go `y: 100% → 0` inside an `overflow: clip` line mask over 0.6 s with `--ease-out-expo`, staggered 0.06 s per line.
- The new caption starts at **50 %** of the old one's exit, so the two overlap.
- Sync it to the crossfade midpoint (R1 at t = 0.5 s), not to the cut start.
- Use a numeric counter (e.g. "04 / 20") that rolls digits in the same way.

### Timeline interaction

**R5. Hover on a clip.**
- The logo goes from opacity 0.55 to 1 over 0.18 s.
- The clip box gets a 1 px top line that draws `scaleX: 0 → 1` from the left over 0.35 s with `--ease-out-expo`.
- Optionally show a poster thumbnail above the clip: 0.4 s, `y: 8px → 0`, opacity 0 → 1, `--ease-out-expo`.
- Hover-intent delay is 60 ms. Moving across clips cross-hands without re-running the delay.
- No scale on logos. Scaling white vector logos blurs them unless they are re-rasterised, which breaks the "vectors sharp" rule.

**R6. Ghost playhead under the cursor.**
- A thin 1 px line follows the pointer with λ = 25/s and a timecode label beside it.
- Its opacity is 0.4. It fades in and out over 0.2 s when the pointer enters or leaves the timeline.

**R7. Scrubbing with inertia and snap.**
- While dragging, the playhead and reel are **1:1** with the pointer. Seek the video, throttled to one `currentTime` set per rAF, and use `fastSeek()` where available.
- Track velocity over the last 100 ms.
- On release, project with exponential decay: `x_final = x + v / k`, k ≈ 6/s, which is equivalent to GSAP `resistance` tuned so throws travel at most about 1.5 clip widths.
- Snap to the nearest clip start if within 40 % of a clip width, otherwise to the projected position.
- Settle duration = clamp(0.5, 1.2 s) based on distance, with `--ease-out-expo`.
- During the throw the video stays paused on the scrubbed frame and resumes playing from the snap point when the settle ends, with a 0.25 s volume and opacity ramp.

**R8. Wheel over the timeline.**
- Horizontal wheel or trackpad deltas move the playhead through a lerp of λ = 8/s, which is Lenis-like.
- 300 ms after the wheel goes idle, snap to the nearest clip start using the debounce in Lenis snap (500 ms default; use 300 ms here) with a 0.8 s `--ease-out-expo` settle.

**R9. Keyboard.**
- ← and → step one clip; Shift with an arrow steps five seconds.
- Each step is a 0.9 s `--ease-main` tween of the playhead and a crossfade (R1).
- Repeated presses retarget the running tween from its current value and velocity. They never restart from zero.

### Reel to case study

**R10. Clicking a logo: reel becomes case-study hero (shared element).**
- Do not crossfade to a new page. The **reel element is the hero**. Change its role, not its identity.
- Use one master timeline of 1.4 s with `--ease-main`.
- **Camera** (0.0–1.4 s): if the clicked project isn't playing, run R1's crossfade at 0.6 s inside the master timeline. Then scale the reel from 1.00 to 1.06 in log space and let it settle back to 1.00. The hero frame (90vh → e.g. 80vh) is resized with a `clip-path: inset()` that tweens from the full frame to the hero rect, not width/height. This avoids the FLIP `scale: true` child distortion [V] and keeps the video pixel-stable.
- **Type** (0.5–1.4 s): the title lines reveal per R4, staggered 0.07 s.
- Use the View Transitions API only as a fallback path. A GSAP/own-timeline version gives continuous control and interruptibility.
- If the user clicks another logo mid-transition, **retarget** to the new project. Don't queue and don't reverse.

**R11. Timeline travels from bottom to top.**
- Measure the bottom (10vh at y = 90vh) and top rects (FLIP `getState`). Move the bar with `translateY` from 90vh to 0 over 1.4 s with `--ease-main`, **starting at 0.15 s** so the hero move leads and the bar follows like a camera crane.
- The bar's height stays the same, so there is no scale and the text and logos stay crisp.
- The logos of the other 19 clips fade to 0.25 opacity during travel (0.6 s, `--ease-out-quart`).

**R12. Timeline zoom into a clip's sections.**
- This is a **camera zoom on the strip**, not a re-layout.
- Treat the strip as a world with `x ∈ [0, totalDuration]` and a camera with `{center, zoom}`. Tween to `zoom = total / clipDuration` and `center = clip midpoint` over 1.8 s with `--ease-main`.
- Interpolate zoom in log space: `z = exp(lerp(ln z0, ln z1, e))`. This keeps the perceived zoom rate constant, matching the intro.
- Redraw clip boxes, section ticks and labels each frame from the camera, using SVG or canvas recomputed rather than CSS-scaled, so 1 px lines stay 1 px and logos stay sharp.
- Section labels of the opened clip fade in once `zoom > 50 %` of the target. They take 0.5 s with `--ease-out-expo` and a 0.05 s stagger.
- The neighbouring clips slide offscreen naturally as the camera zooms. Nothing else animates.

**R13. Combined choreography (R10 + R11 + R12) as one master timeline, about 2.0 s total.**
- t = 0: reel camera, crossfade if needed.
- t = 0.15: timeline travel.
- t = 0.4: zoom starts and overlaps the travel.
- t = 0.5: title reveal.
- t = 1.2: section labels.
- t ≈ 2.0: settle.
- Nothing waits for anything else to finish. Every leg overlaps the previous one by at least 40 %.

### Case study

**R14. Case-study smooth scroll.**
- Lenis with `lerp: 0.1` or `duration: 1.2` s with its expo-out default. Use the defaults and avoid lower lerps (below about 0.07 it feels floaty and laggy).
- `wheelMultiplier: 1`.
- Native touch on trackpads and tablets: `syncTouch: false`.
- Don't add directional "centering" scroll-jacking, which Aristide's team explicitly rejected [V].

**R15. Playhead follows scroll.**
- Map scroll progress to the playhead within the zoomed clip. Each section's DOM range maps to its section span on the strip, piecewise-linearly, so the playhead crosses a section boundary exactly when the section header crosses the viewport line at 30 % from the top.
- Drive it from Lenis's `scroll` event. It is already smoothed, so **don't double-lerp**: one smoothing stage per value.
- Highlight the active section label with a 0.3 s opacity change.

**R16. Clicking a section in the top timeline.**
- `lenis.scrollTo(sectionEl, { duration: clamp(0.8, 1.6, distance/1500 s), easing: main, lock: true })`.
- The playhead follows automatically through R15, so no separate tween is needed and nothing can disagree.

**R17. Media inside the case study.**
- Images and videos reveal with `clip-path: inset(100% 0 0 0) → inset(0)` over 1.2 s with `--ease-out-expo` when 15 % visible.
- Combine this with an inner counter-scale from 1.15 to 1.0 in log space over the same time, which reads as a camera pull.
- Use a subtle parallax offset of ±6 % of the element height, driven by scroll progress, transform only.

**R18. Closing a case study (back to reel).**
- Run R13's camera moves in the forward direction to a new state, not by reversing the timeline. Zoom out to the whole strip with log zoom over 1.6 s and move the bar top to bottom over 1.4 s.
- The hero un-clips to 90vh, and the reel continues playing from the case study's clip, not from the start.
- The "nothing reverses or restarts" rule means even "back" is authored as a forward move.

### Global

**R19. One clock.**
- A single rAF ticker (`gsap.ticker` or your own) runs Lenis, the GL render, the playhead damp, the timeline camera and SVG redraw, in that order.
- Set `lagSmoothing(0)` so that after a tab switch values jump to the correct time instead of slow-motion catch-up.
- All damps use `dt`, so 60, 120 and 144 Hz screens feel identical.

**R20. Interruptibility.**
- Every tween retargets from the current value and velocity, using `overwrite: 'auto'` or a damped spring for ongoing targets.
- Clicks during transitions are accepted and retarget. No `isTransitioning` hard lock except for route-level DOM swaps.

**R21. Video preloading budget.**
- Keep three decoders warm: the current clip, the next, and the hovered or most-likely clip.
- The rest are `preload="none"` with poster frames.
- Encode short films at a keyframe interval of 0.5–1 s so scrubbing seeks fast. Long GOPs cause scrub stutter. [U, standard practice]
- Always use `muted playsinline`. Decode the first frame before the fade (`await video.play()`, then wait for one `requestVideoFrameCallback`).

**R22. Reduced motion.**
- Under `prefers-reduced-motion: reduce`, replace camera moves, zooms, parallax and wipes with **0.25 s opacity crossfades**.
- The timeline jumps to the top without travel, and the zoom becomes an instant re-layout with a fade.
- Autoplay pauses on the first clip with a play button.
- Smooth scroll falls back to native (`lenis.destroy()`).

---

## 5. Pitfalls

1. **Raw per-frame lerp (`x += (t - x) * 0.1`)** runs twice as fast on 120 Hz. Use `1 - exp(-λ dt)`.
2. **Double smoothing.** Lenis-smoothed scroll fed into another lerp feels like mush and lags behind the content. Smooth each value once.
3. **Driving the playhead from `timeupdate`.** It fires irregularly and the playhead steps. Read `currentTime` in rAF or use rVFC.
4. **Scaling vectors and text with CSS `scale`** blurs them mid-move and at rest on some GPUs. Redraw vectors from the camera, and keep text unscaled (move it, clip it).
5. **FLIP `scale: true` on containers** distorts children [V]. Use `clip-path` or counter-scale.
6. **Animating `width`, `height`, `top` or `left`, or layout-affecting `clip-path` on large elements with heavy children.** Stick to transform and opacity. `clip-path: inset()` is usually composited in Chromium [U], but profile it.
7. **Permanent `will-change` on 20 clips plus a video** costs memory and can cause blank layers. Apply it around moves only [V].
8. **Starting a fade before the incoming video has a decoded frame** shows a black flash. Wait for rVFC.
9. **Safari video→WebGL upload jank** [V, WebKit bugs]. Test Safari early, double-buffer, and consider a DOM `<video>` crossfade fallback.
10. **Reversing a timeline for "back"** looks like a rewind, not a camera move. Author forward moves.
11. **Queued transitions on rapid clicks** feel laggy. Retarget instead.
12. **Over-staggering.** More than about 0.4 s total tail makes the UI feel slow. Big moves should take 1–1.8 s, small ones under 0.6 s.
13. **Scroll-jacking or snap in the case study** fights trackpads. Lenis snap only on the timeline strip.
14. **Lenis on a nested scroller** (`allowNestedScroll`) has a performance cost [V]. Keep a single scroller.
15. **Ignoring reduced motion.** The HIG requires minimising motion [V], and this project's CLAUDE.md follows the HIG.

---

## Sources

- Awwwards, Aristide Benoist Portfolio 2021 Site of the Month: https://awwwards.com/aristide-benoist-portfolio-2021-wins-site-of-the-month-june-2021.html
- Awwwards, Independent of the Year 2023 (via search snippet; page 404 on fetch): https://awwwards.com/annual-awards-2023/independent-of-the-year
- Awwwards profile (snippet only, 503 on fetch): https://www.awwwards.com/aristidebenoist/
- Awwwards site listing (snippet only): https://www.awwwards.com/sites/aristide-benoist-portfolio
- Aristide Benoist site: https://aristidebenoist.com
- Behance, Aristide Malaga Folio: https://www.behance.net/gallery/71749473/Aristide-Malaga-Folio/report
- Dribbble: https://dribbble.com/aristidebenoist
- Webby, CANALS: https://winners.webbyawards.com/2020/websites-and-mobile-sites/features-design/best-navigationstructure/127963/canals
- Codrops, Building Async Page Transitions in Vanilla JavaScript (Watson reference; 403 on fetch, snippet and mirror only): https://tympanus.net/codrops/2026/02/26/building-async-page-transitions-in-vanilla-javascript/ and mirror https://fooqux.com/article/3411
- WebGL image interactions inspired by Aristide: https://github.com/devloop01/webgl-image-interactions-aristide
- Lenis README: https://cdn.jsdelivr.net/npm/lenis@1.3.23/README.md
- Lenis snap typings: https://cdn.jsdelivr.net/npm/lenis@1.3.23/dist/lenis-snap.d.ts
- GSAP InertiaPlugin: https://gsap.com/docs/v3/Plugins/InertiaPlugin
- GSAP Flip: https://gsap.com/docs/v3/Plugins/Flip
- GSAP forum, Flip scale distortion: https://gsap.com/community/forums/topic/42877-nested-childs-start-acting-weirdly-when-scaletrue-in-flip/
- Chrome, same-document View Transitions: https://developer.chrome.com/docs/web-platform/view-transitions/same-document
- web.dev, high-performance CSS animations: https://web.dev/articles/animations-guide
- web.dev, animations and performance: https://web.dev/articles/animations-and-performance
- web.dev, requestVideoFrameCallback: https://web.dev/articles/requestvideoframecallback-rvfc
- WebKit bug, video texture jank in Safari: https://bugs.webkit.org/show_bug.cgi?id=277603
- Scott Lembcke, Improved lerp smoothing: https://howlingmoonsoftware.com/improved-lerp-smoothing/
- Codrops, WebGL Video Transitions with Curtains.js: https://tympanus.net/codrops/2020/10/07/webgl-video-transitions-with-curtains-js/
- Codrops, Liquid Distortion Effects: https://tympanus.net/codrops/2017/10/10/liquid-distortion-effects/
- Framer, CUTT template: https://www.framer.com/marketplace/templates/cutt/
- Framer, Playhead template: https://www.framer.com/marketplace/templates/playhead/
- Contra, Julia Oleksy editor portfolio: https://contra.com/p/qrQqo6RY-editor-portfolio-julia-oleksy
- Hoverstat.es, Julia Plaza: https://www.hoverstat.es/features/julia-plaza
- Awwwards, Brybry folio case study: https://awwwards.com/case-study-of-brybry-folio-of-bryan-james.html
- Jon Way Studio: https://jonway.studio
- Apple HIG, Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Easing reference (bezier fits): https://easings.net
