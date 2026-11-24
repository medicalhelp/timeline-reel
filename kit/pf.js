/* ─────────────────────────────────────────────────────────────────────────────
   portfolio explorations · shared kit (contract: kit/README.md)

   Pf.define({ ID: { title, does, why, opts, setup(ctx), async play(ctx) } })
   ?screen=ID picks the exploration. The page is live: the reel autoplays, clips
   can be clicked. A message {pf:'play', speed} from the board restarts it and runs
   the scripted demo (play), if the exploration has one. One master clock drives
   everything (BRIEF §4); speed (0.25× on the board) slows the clock, the films
   and every animation together.
   ───────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const BASE = (document.currentScript && document.currentScript.src.replace(/kit\/pf\.js.*$/, '')) || '';

  /* ── placeholder projects: 20 clips, ordered by time. Names and logos are invented placeholders. ── */
  const P = (co, lg, pr, role, yr, kind, film, from, len) => ({ co, lg, pr, role, yr, kind, film, from, len });
  const PROJECTS = [
    P('Field', 'a', 'studio identity', 'designer', '2014', 'work', 'archive', 0.2, 5.6),
    P('', '', 'type specimen', 'self-initiated', '2014', 'personal', 'recipe-page', 0.5, 4.8),
    P('Halden', 'b', 'booking flow', 'ux designer', '2015 – 2016', 'work', 'collection-home', 0.3, 6.0),
    P('OKRA', 'd', 'kitchen planner', 'product designer', '2016', 'work', 'collection-recipes', 0.4, 6.0),
    P('', '', 'photo archive', 'self-initiated', '2017', 'personal', 'archive', 1.5, 4.8),
    P('Morrow', 'c', 'banking app', 'product designer', '2017 – 2018', 'work', 'a1', 0.6, 7.6),
    P('Lumen', 'e', 'design system', 'lead designer', '2018 – 2019', 'work', 'board', 0.3, 6.8),
    P('Aster', 'a', 'onboarding', 'product designer', '2019', 'work', 'g3', 0.4, 7.4),
    P('', '', 'motion studies', 'self-initiated', '2019', 'personal', 'f2', 1.0, 5.6),
    P('Kite', 'c', 'travel planner', 'senior designer', '2020', 'work', 'collection-home', 2.0, 4.6),
    P('Northfold', 'b', 'retail checkout', 'senior designer', '2020 – 2021', 'work', 'recipe-page', 1.4, 5.2),
    P('OKRA', 'd', 'room configurator', 'senior designer', '2021', 'work', 'collection-recipes', 1.2, 5.4),
    P('', '', 'recipe app', 'self-initiated', '2022', 'personal', 'recipe-page', 0.2, 6.2),
    P('Lumen', 'e', 'tokens 2.0', 'lead designer', '2022', 'work', 'board', 2.4, 6.4),
    P('Halden', 'b', 'host tools', 'lead designer', '2023', 'work', 'a1', 1.8, 7.2),
    P('', '', 'the archive', 'self-initiated', '2023', 'personal', 'archive', 0.0, 6.4),
    P('Aster', 'a', 'ai assistant', 'principal designer', '2024', 'work', 'g3', 1.6, 7.4),
    P('Morrow', 'c', 'wealth dashboard', 'principal designer', '2024 – 2025', 'work', 'collection-home', 0.6, 6.0),
    P('', '', 'collection', 'self-initiated', '2025', 'personal', 'collection-recipes', 0.4, 6.2),
    P('Aster', 'a', 'assistant, layer', 'principal designer', '2026', 'work', 'f2', 0.4, 9.0)
  ];
  let acc = 0; PROJECTS.forEach((p, i) => { p.i = i; p.start = acc; acc += p.len; });
  const TOTAL = acc;
  const FILMS = [...new Set(PROJECTS.map(p => p.film))];
  const EXT = document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'mp4' : 'webm';
  const film = n => `${BASE}media/${n}.${EXT}`;

  /* ── easing: cubic-bezier solver (for rAF-driven motion) ───────────────── */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; } return sy(Math.min(1, Math.max(0, t))); };
  }
  const EASE = { soft: bezier(.601, 0, .405, 1), arrive: bezier(.16, 1, .3, 1), leave: bezier(.7, 0, .84, 0), inout: bezier(.65, 0, .35, 1) };
  const CSS = { soft: 'cubic-bezier(.601,0,.405,1)', arrive: 'cubic-bezier(.16,1,.3,1)', leave: 'cubic-bezier(.7,0,.84,0)', inout: 'cubic-bezier(.65,0,.35,1)' };
  const tc = s => { const m = Math.floor(s / 60), ss = Math.floor(s % 60), ff = Math.floor((s % 1) * 30); return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).has('reduced');

  let DEFS = {}, ID = null, SPEED = 1, ENGINE = null, VERSION = 0;
  class Abort extends Error {}

  /* ── the engine: reel + timeline + caption on one master clock ─────────── */
  function makeEngine(root, def) {
    const o = Object.assign({ autoplay: true, ruler: 'timecode' }, def.opts || {});
    root.innerHTML = `
      <section class="reel" id="reel" aria-label="reel">${[0, 1].map(k => `<video muted playsinline preload="auto" data-layer="${k}"></video>`).join('')}</section>
      <header class="chrome"><div class="me"><b>Johannes Zimmer</b><span>product designer</span></div>
        <nav class="nav" aria-label="contact"><a href="#work">work</a><a href="#about">about</a><a href="#contact">contact</a><a href="#cv">cv</a></nav></header>
      <div class="cap" id="cap" aria-live="polite"><span class="l"><span class="co"></span></span><span class="l"><span class="pr"></span></span><span class="l"><span class="ro"></span></span></div>
      <button class="snd" id="snd" type="button" aria-pressed="false" aria-label="sound"><span class="bars"><i></i><i></i><i></i></span><span>sound off</span></button>
      <section class="tl" id="tl" aria-label="timeline">
        <div class="tl-ruler" id="ruler"></div>
        <div class="tl-track" id="track">
          ${PROJECTS.map(p => `<button class="clip ${p.kind}" data-i="${p.i}" aria-label="${esc((p.co || p.pr) + ', ' + p.pr + ', ' + p.yr)}">${p.kind === 'personal' ? `<span class="tag">personal</span>` : `<span class="logo lg-${p.lg}">${esc(p.co)}</span>`}</button>`).join('')}
          <div class="tip" id="tip" aria-hidden="true"></div><div class="head" id="head"><span class="tc" id="tcode">00:00:00</span></div>
        </div>
      </section>`;
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
    const vids = $$('.reel video'), track = $('#track'), head = $('#head'), cap = $('#cap'), clips = $$('.clip');
    const S = { t: 0, playing: false, cur: -1, layer: 0, headX: 0, glide: null, raf: 0, last: performance.now(), listeners: {} };
    const emit = (n, d) => (S.listeners[n] || []).forEach(f => f(d));

    // layout: clip positions ∝ reel length
    let W = 1;
    const xOf = t => (t / TOTAL) * W;
    function layout() {
      W = track.clientWidth;
      clips.forEach((c, i) => { const p = PROJECTS[i]; c.style.left = xOf(p.start) + 'px'; c.style.width = Math.max(2, xOf(p.len) - 3) + 'px'; });
      const r = $('#ruler'); r.innerHTML = '';
      if (o.ruler === 'timecode') for (let s = 0; s <= TOTAL; s += 15) r.insertAdjacentHTML('beforeend', `<span style="left:${xOf(s)}px">${tc(s).slice(0, 5)}</span>`);
      if (o.ruler === 'years') PROJECTS.forEach((p, i) => { if (!i || p.yr.slice(0, 4) !== PROJECTS[i - 1].yr.slice(0, 4)) r.insertAdjacentHTML('beforeend', `<span style="left:${xOf(p.start)}px;transform:none">${p.yr.slice(0, 4)}</span>`); });
      S.headX = xOf(S.t); place();
    }
    const place = () => { head.style.transform = `translateX(${S.headX}px)`; $('#tcode').textContent = tc(S.t); };
    const clipAt = t => { for (let i = PROJECTS.length - 1; i >= 0; i--) if (t >= PROJECTS[i].start - 1e-6) return i; return 0; };
    const ms = d => d / SPEED;
    const anim = (el, kf, d, ease, extra = {}) => el.animate(kf, Object.assign({ duration: ms(d), easing: CSS[ease] || ease, fill: 'both' }, extra));

    // reel: two layers, crossfade with a slow settle (no black frame: the next film is playing before it fades up)
    async function show(i, at = 0, opts2 = {}) {
      const p = PROJECTS[i], inc = vids[1 - S.layer], out = vids[S.layer];
      const want = film(p.film);
      if (!inc.src.endsWith(want.split('/').pop()) || !inc.src) inc.src = want;
      inc.playbackRate = SPEED;
      try { inc.currentTime = p.from + at; } catch (e) {}
      inc.play().catch(() => {});
      await new Promise(r => { if (inc.readyState >= 2) r(); else { inc.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 900); } });
      S.layer = 1 - S.layer;
      inc.classList.add('on'); out.classList.remove('on');
      const fade = reduced() ? 300 : (opts2.fade ?? 1000);
      anim(inc, [{ opacity: 0 }, { opacity: 1 }], fade, 'soft');
      if (!reduced()) anim(inc, [{ transform: 'scale(1.045)' }, { transform: 'scale(1)' }], opts2.settle ?? 1600, 'arrive');
      anim(out, [{ opacity: 1 }, { opacity: 0 }], fade, 'soft', { delay: ms(fade * .25) });
      setTimeout(() => { if (!out.classList.contains('on')) out.pause(); }, ms(fade * 1.4));
    }
    // caption: each line slides out, then in on its own beat
    const capText = p => [p.kind === 'personal' ? 'personal project' : p.co, p.pr, `${p.role}<i>·</i>${p.yr}`];
    async function caption(i) {
      const lines = $$('#cap .l>span'), txt = capText(PROJECTS[i]);
      if (cap.dataset.i !== undefined && !reduced()) await Promise.all(lines.map((l, k) => anim(l, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-105%)', opacity: 0 }], 260, 'leave', { delay: ms(k * 30) }).finished.catch(() => {})));
      cap.dataset.i = i;
      lines.forEach((l, k) => { l.innerHTML = txt[k]; anim(l, [{ transform: 'translateY(105%)', opacity: 0 }, { transform: 'none', opacity: 1 }], reduced() ? 200 : 900, 'arrive', { delay: ms(k * 70) }); });
    }
    function setCur(i, at = 0, o2) {
      if (i === S.cur && !o2?.force) return;
      S.cur = i; clips.forEach((c, k) => c.classList.toggle('on', k === i));
      show(i, at, o2); caption(i); emit('clip', i);
    }

    // jump: the playhead glides to the clip on the master curve while the reel crossfades
    function jump(i, o2 = {}) {
      const p = PROJECTS[i];
      S.glide = { from: S.headX, to: xOf(p.start), t0: performance.now(), d: reduced() ? 1 : (o2.glide ?? 1100) };
      S.t = p.start; setCur(i, 0, { force: true });
    }

    function frame(now) {
      const dt = Math.min(64, now - S.last) / 1000 * SPEED; S.last = now;
      if (S.playing) {
        S.t += dt;
        if (S.t >= TOTAL) { S.t = 0; setCur(0, 0, { force: true }); S.glide = { from: S.headX, to: 0, t0: now, d: 1400 }; }
        const i = clipAt(S.t); if (i !== S.cur) setCur(i, S.t - PROJECTS[i].start);
        // keep the film in step with the clock (correct only real drift, never every frame)
        const v = vids[S.layer], p = PROJECTS[S.cur], want = p.from + (S.t - p.start);
        if (v.readyState >= 2 && Math.abs(v.currentTime - want) > .35 && !v.seeking) { try { v.currentTime = want; } catch (e) {} }
      }
      if (S.glide) {
        const g = S.glide, k = Math.min(1, (now - g.t0) / (g.d / SPEED));
        S.headX = g.from + (g.to - g.from) * EASE.soft(k);
        g.to = xOf(S.t) + (S.playing ? 0 : 0);       // keep chasing the clock while it plays
        if (k >= 1) S.glide = null;
      } else if (!S.drag) S.headX = xOf(S.t);
      place(); emit('frame', S);
      S.raf = requestAnimationFrame(frame);
    }

    // input
    clips.forEach(c => c.addEventListener('click', e => { e.stopPropagation(); jump(+c.dataset.i); }));
    // hover: a small label rises above the clip (project · year), and glides between neighbours
    const tip = $('#tip'); let tipOn = false;
    clips.forEach(c => {
      c.addEventListener('mouseenter', () => {
        const p = PROJECTS[+c.dataset.i]; tip.innerHTML = `${esc(p.pr)}<i>${esc(p.yr)}</i>`;
        const x = c.offsetLeft + c.offsetWidth / 2;
        if (!tipOn) { tip.style.left = x + 'px'; anim(tip, [{ opacity: 0, transform: 'translate(-50%,6px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], 320, 'arrive'); }
        else anim(tip, [{ left: getComputedStyle(tip).left }, { left: x + 'px' }], 420, 'arrive').finished.then(() => tip.style.left = x + 'px').catch(() => {});
        tipOn = true;
      });
      c.addEventListener('mouseleave', () => { tipOn = false; setTimeout(() => { if (!tipOn) anim(tip, [{ opacity: 1 }, { opacity: 0 }], 200, 'soft'); }, 60); });
    });
    $('#snd').addEventListener('click', e => { e.stopPropagation(); const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.lastElementChild.textContent = on ? 'sound on' : 'sound off'; vids.forEach(v => v.muted = !on); });
    const onKey = e => { if (e.key === ' ') { e.preventDefault(); S.playing ? api.pause() : api.play(); } if (e.key === 'ArrowRight') jump(Math.min(PROJECTS.length - 1, S.cur + 1)); if (e.key === 'ArrowLeft') jump(Math.max(0, S.cur - 1)); };
    document.addEventListener('keydown', onKey);
    const ro = new ResizeObserver(layout); ro.observe(track);

    const api = {
      root, $, $$, S, PROJECTS, TOTAL, EASE, CSS, xOf, clipAt, jump, show, caption, setCur, layout, anim, ms, vids, track, head, clips,
      get W() { return W; },
      play() { S.playing = true; S.last = performance.now(); vids[S.layer].play().catch(() => {}); emit('play'); },
      pause() { S.playing = false; vids.forEach(v => v.pause()); emit('pause'); },
      on(n, f) { (S.listeners[n] = S.listeners[n] || []).push(f); },
      setSpeed(s) { vids.forEach(v => v.playbackRate = s); },
      destroy() { cancelAnimationFrame(S.raf); ro.disconnect(); document.removeEventListener('keydown', onKey); vids.forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); }
    };
    layout(); setCur(0, 0, { force: true, fade: 1 });
    S.raf = requestAnimationFrame(frame);
    if (o.autoplay && !reduced()) api.play();
    return api;
  }

  /* ── runner ─────────────────────────────────────────────────────────────── */
  function build() {
    VERSION++;
    document.getAnimations().forEach(a => a.cancel());
    if (ENGINE) ENGINE.destroy();
    const def = DEFS[ID];
    document.title = `${ID} · ${def.title || ''}`;
    document.body.innerHTML = `<main class="pf" id="pf"></main>`;
    ENGINE = makeEngine(document.getElementById('pf'), def);
    ENGINE.setSpeed(SPEED);
    const v = VERSION;
    const ctx = Object.assign(Object.create(ENGINE), {
      e: ENGINE, def,
      get speed() { return SPEED; }, get reduced() { return reduced(); },
      wait(d) { return new Promise((res, rej) => setTimeout(() => (v === VERSION ? res() : rej(new Abort())), d / SPEED)); },
      alive() { if (v !== VERSION) throw new Abort(); }
    });
    if (def.setup) def.setup(ctx);
    return ctx;
  }
  async function run(speed = 1) {
    SPEED = speed; const ctx = build();
    if (DEFS[ID].play) { try { await ctx.wait(400); await DEFS[ID].play(ctx); } catch (e) { if (!(e instanceof Abort)) console.error(e); } }
  }
  function define(defs) {
    DEFS = defs; const q = new URLSearchParams(location.search);
    ID = q.get('screen') && defs[q.get('screen')] ? q.get('screen') : Object.keys(defs)[0];
    const start = () => { SPEED = +(q.get('speed') || 1); build(); if (q.has('autoplay') && DEFS[ID].play) run(SPEED); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
    window.addEventListener('message', e => { const d = e.data || {}; if (d.pf === 'play') run(d.speed || 1); if (d.pf === 'reset') { SPEED = 1; build(); } });
  }
  window.Pf = { define, PROJECTS, TOTAL, FILMS, EASE, CSS, bezier, tc, esc, film, list: () => Object.entries(DEFS).map(([id, d]) => ({ id, title: d.title, does: d.does, why: d.why })) };
})();
