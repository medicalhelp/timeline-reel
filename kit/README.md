# Portfolio kit: how to build an exploration

Read `../BRIEF.md`, then `../home.html` (H1, the reference), then `../research/smooth-motion.md`. Each cluster is one page in `docs/design/portfolio/`; each exploration is opened with `?screen=ID` and is one desktop screen (1440 × 900, shown at half size on the board).

## Skeleton

```html
<link rel="stylesheet" href="kit/pf.css">
<style>/* cluster-only styles, on the kit's tokens */</style>
<script src="kit/pf.js"></script>
<script>
Pf.define({
  X1: {
    title: 'short name of the idea',
    does: 'what it does, in a few words',
    why: 'what it is good at · what it costs',
    opts: { autoplay: true },                      // the timeline has no ruler or timecode (decided)
    setup(ctx) {},        // change or add to the live page (restyle the timeline, add a case study layer…)
    async play(ctx) {}    // the scripted demo the board's "replay" runs
  }
});
</script>
```

## ctx (the live engine; everything runs on one master clock)

| | |
|---|---|
| `ctx.S` | State: `t` (seconds in the reel), `playing`, `cur` (clip index), `headX` (playhead px), `glide`. |
| `ctx.jump(i)` | Go to clip `i`: the playhead glides on the master curve, the reel crossfades, the caption changes. |
| `ctx.play()`, `ctx.pause()` | The clock. |
| `ctx.on('frame' / 'clip' / 'play' / 'pause', fn)` | Hooks. `frame` runs every rAF with the state. |
| `ctx.anim(el, keyframes, ms, ease)` | `element.animate` at the board's speed; `ease`: `'soft'` (the archive's master curve), `'arrive'` (expo-out), `'leave'` (expo-in), `'inout'`, or any CSS easing. |
| `ctx.EASE.soft(k)` etc. | The same curves as functions, for rAF-driven motion. |
| `ctx.wait(ms)` | Pause in a demo; aborts cleanly on replay. |
| `ctx.xOf(t)`, `ctx.clipAt(t)`, `ctx.W` | Timeline geometry. |
| `ctx.$`, `ctx.$$`, `ctx.root`, `ctx.track`, `ctx.head`, `ctx.clips`, `ctx.vids` | The DOM. |
| `ctx.PROJECTS`, `ctx.TOTAL` | The 20 placeholder projects (`co`, `lg`, `pr`, `role`, `yr`, `kind`, `film`, `from`, `len`, `start`). |
| `ctx.reduced` | Reduced motion: crossfades only, no camera moves, no autoplay. |

## Rules
- **Desktop only, 1440 × 900.** Dark stage; the films are the colour.
- **Motion bar (BRIEF §4):** one master clock (use `ctx.on('frame')`, never `setInterval`); soft curves for big moves (0.8–1.6 s), 240–400 ms for small ones; pointer-driven motion follows a smoothed, time-corrected target; move one container rather than many pieces; never stop, reverse or restart mid-gesture; transform and opacity only; a reduced-motion version.
- **A comment block with the timing at 1×** at the top of every exploration, as in H1.
- **Placeholders stay placeholders:** no real company names or logos.
- **Check your work:** Playwright at 1440 × 900 (Chromium is preinstalled), play the demo (`window.postMessage({pf:'play',speed:1},'*')`), screenshot several moments, look at them, and check for console errors.
