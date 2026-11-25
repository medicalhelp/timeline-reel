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

  /* ── the reel: ONE continuous film (media/reel.mp4, 79.18 s, the real Reel 2025 with its title card inverted: black, white text).
        The timeline is its clips in reel order; each clip is a stretch of that film, so the playhead is the film's own time.
        A brand's logo is shown once (its first clip); its later clips carry no logo; hovering any clip of a brand lights the brand across the timeline.
        segs = the film's own shots inside the clip (film time, absolute), used by the case-study galleries.
        Project titles, roles and years are placeholders (the caption is gone, so they only feed labels and case-study copy). ── */
  const SPF = 2;                                   // strip sprite: frames per second (media/strip-reel.jpg, 128×72 each)
  const FDUR = { reel: 79.1833 };
  const LOGO = { ikea: { h: 15 }, telekom: { h: 22 }, redbull: { h: 16 }, disneyplus: { h: 30 } };
  const BRAND = { ikea: '#ffda1a', telekom: '#e20074', redbull: '#e5173f', disneyplus: '#3b6bff' };   // hover colours (IKEA: the yellow reads on near-black; its blue does not)
  const CUTS = [2.05, 3.0833, 3.8333, 4.5, 7.2333, 8.35, 9.9333, 11.4, 15.4167, 21.9167, 28.3667, 29.5167, 30.25, 31.05, 35.6, 38.2, 41.75, 43.1333, 46.6167, 51.05, 54.9333, 59.7333, 63.4167, 65.65, 67.6667, 68.6667, 75.15, 79.1833];
  const ROLE = 'product designer', YR = 'years to confirm';
  const CLIPS = [   // [kind, brand, from, to, title]  (reel seconds; the boundaries were set with Johannes from a contact sheet)
    ['card', '', 0, 2.05, 'reel 2025'],
    ['work', 'ikea', 2.05, 11.4, 'warehouse tools'],
    ['work', 'disneyplus', 11.4, 15.4167, 'new heroes intro'],
    ['work', 'telekom', 15.4167, 28.3667, 'shop and chat'],
    ['work', 'redbull', 28.3667, 38.2, 'capsule collection'],
    ['personal', '', 38.2, 46.6167, 'street food, drone news'],
    ['work', 'telekom', 46.6167, 51.05, 'floor plan editor'],
    ['work', 'ikea', 51.05, 59.7333, 'long read, assistant'],
    ['work', 'telekom', 59.7333, 79.1833, 'terrain, editor, digital x']
  ];
  const NAME = { ikea: 'IKEA', telekom: 'Telekom', redbull: 'Red Bull', disneyplus: 'Disney+' };
  const seen = {};
  const PROJECTS = CLIPS.map(([kind, brand, a, b, pr], i) => {
    const cuts = [a, ...CUTS.filter(c => c > a + 0.4 && c < b - 0.4), b], segs = [];
    for (let k = 0; k < cuts.length - 1; k++) segs.push({ film: 'reel', from: cuts[k], len: cuts[k + 1] - cuts[k], start: cuts[k] - a });
    const first = brand && !seen[brand]; if (brand) seen[brand] = 1;
    return { i, kind, brand, co: NAME[brand] || '', name: kind === 'card' ? 'reel 2025' : kind === 'personal' ? 'personal' : NAME[brand], logo: brand, logoShown: !!first, rep: !!brand && !first,
      color: BRAND[brand] || '', pr, role: kind === 'work' ? ROLE : kind === 'personal' ? 'self-initiated' : '', yr: kind === 'personal' ? '2026' : kind === 'work' ? YR : '2025', start: a, len: b - a, segs };
  });
  const TOTAL = PROJECTS[PROJECTS.length - 1].start + PROJECTS[PROJECTS.length - 1].len;
  const FILMS = ['reel'];
  const EXT = document.createElement('video').canPlayType('video/mp4; codecs="avc1.42E01E"') ? 'mp4' : 'webm';
  const film = n => `${BASE}media/${n}.${EXT}`;
  const segAt = (p, local) => { for (let k = p.segs.length - 1; k >= 0; k--) if (local >= p.segs[k].start - 1e-6) return k; return 0; };

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
    const o = Object.assign({ autoplay: true, ruler: 'none', clipAction: '', holdAtEnd: true }, def.opts || {});
    const nameOf = p => p.kind === 'work' ? p.co : p.name;
    const clipLabel = p => o.clipAction ? `${nameOf(p)} · ${o.clipAction}` : p.kind === 'work' ? `${p.co}, ${p.pr}` : p.kind === 'card' ? 'reel 2025, title' : `${p.name}, ${p.pr}`;
    const ICO = { pause: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="7" y="5" width="3.4" height="14" rx="1" fill="currentColor"/><rect x="13.6" y="5" width="3.4" height="14" rx="1" fill="currentColor"/></svg>',
      play: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l10.6-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>',
      off: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9.5v5h3.6l4.4 3.6V5.9L7.6 9.5z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>',
      on: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9.5v5h3.6l4.4 3.6V5.9L7.6 9.5z" fill="currentColor"/><path d="M15.4 9.2a4 4 0 0 1 0 5.6M18 6.8a7.6 7.6 0 0 1 0 10.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>' };
    root.innerHTML = `
      <section class="reel" id="reel" aria-label="reel">${[0, 1].map(k => `<video muted playsinline preload="auto" data-layer="${k}"></video>`).join('')}<div class="scrim scrim-top" aria-hidden="true"></div></section>
      <header class="chrome"><div class="me"><b>Johannes Zimmer</b></div>
        <nav class="nav" aria-label="contact"><a href="#work">work</a><a href="#about">about</a><a href="mailto:hello@example.com">contact</a><a href="#cv">CV</a></nav></header>
      <p class="sr-only" id="live" aria-live="off"></p>
      <div class="ctls" id="ctls"><button class="ctl pause" id="pause" type="button" aria-label="pause"><span class="ico">${ICO.pause}</span></button><button class="ctl snd" id="snd" type="button" aria-pressed="false" aria-label="sound off"><span class="ico">${ICO.off}</span></button></div>
      <section class="tl" id="tl" aria-label="timeline">
        <div class="tl-ruler" id="ruler"></div>
        <div class="tl-track" id="track">
          ${PROJECTS.map(p => `<button class="clip ${p.kind}${p.rep ? ' rep' : ''}" data-i="${p.i}" data-brand="${p.brand}" aria-label="${esc(clipLabel(p))}"${p.color ? ` style="--brand:${p.color}"` : ''}><span class="strip" aria-hidden="true"></span>${p.logoShown ? `<img class="logo" src="${BASE}media/logos-${p.logo}.svg" alt="" draggable="false" style="height:${LOGO[p.logo].h}px">` : ''}</button>`).join('')}
          <div class="tip" id="tip" aria-hidden="true"></div><div class="head" id="head"></div>
        </div>
      </section>`;
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
    const vids = $$('.reel video'), track = $('#track'), head = $('#head'), clips = $$('.clip'), live = $('#live'), pauseBtn = $('#pause');
    const S = { t: 0, playing: false, cur: -1, layer: 0, seg: 0, sound: false, vol: 0, volT: 0, headX: 0, glide: null, raf: 0, last: performance.now(), listeners: {}, showTok: 0,
      rate: 1, range: null, holdCap: false,       // hooks: clock rate, loop range [a,b] in reel seconds, hold the caption
      off: 0, offV: 0, offW: 7, ended: false, userAt: -1e9 };   // playhead offset spring (velocity-carrying glides)
    const emit = (n, d, x) => (S.listeners[n] || []).forEach(f => f(d, x));

    // the frame clock's own timer queue (speed-scaled; replaces setTimeout for timing)
    let clockMs = 0; const later = [];
    const after = (d, fn) => { later.push({ at: clockMs + d, fn }); };

    // layout: clip positions ∝ reel length
    let W = 1;
    const xOf = t => (t / TOTAL) * W;
    function layout() {
      W = track.clientWidth;
      const H = track.clientHeight, fw = Math.round(H * 16 / 9);
      clips.forEach((c, i) => {
        const p = PROJECTS[i], w = Math.max(2, xOf(p.len) - 3); c.style.left = xOf(p.start) + 'px'; c.style.width = w + 'px';
        // the frame strip: one frame per slot, taken from wherever the film is at that point of the clip
        const n = Math.max(1, Math.ceil(w / fw)); let html = '';
        for (let j = 0; j < n; j++) {
          const local = (j + .5) / n * p.len, g = p.segs[segAt(p, local)], ft = g.from + (local - g.start), N = Math.ceil(FDUR[g.film] * SPF), idx = Math.min(N - 1, Math.floor(ft * SPF));
          html += `<i style="width:${fw}px;background-image:url('${BASE}media/strip-${g.film}.jpg');background-size:${N * fw}px ${H}px;background-position:${-idx * fw}px 0"></i>`;
        }
        c.querySelector('.strip').innerHTML = html;
      });
      const r = $('#ruler'); r.innerHTML = '';
      if (o.ruler === 'timecode') for (let s = 0; s <= TOTAL; s += 15) r.insertAdjacentHTML('beforeend', `<span style="left:${xOf(s)}px">${tc(s).slice(0, 5)}</span>`);
      S.headX = xOf(S.t) + S.off; place();
    }
    const place = () => { head.style.transform = `translateX(${S.headX}px)`; };
    const clipX = i => { const p = PROJECTS[i], r = track.getBoundingClientRect(); return r.left + xOf(p.start + p.len / 2); };   // viewport x of a clip's centre (for scripted demos)
    const clipAt = t => { for (let i = PROJECTS.length - 1; i >= 0; i--) if (t >= PROJECTS[i].start - 1e-6) return i; return 0; };
    const ms = d => d / SPEED;
    const anim = (el, kf, d, ease, extra = {}) => el.animate(kf, Object.assign({ duration: ms(d), easing: CSS[ease] || ease, fill: 'both' }, extra));
    const filmOk = (v, f) => v.src.endsWith('/' + f + '.' + EXT);

    /* reel: two layers. The incoming layer goes on top and only it fades (the outgoing one stays opaque
       underneath, so coverage never dips); it starts only once its frame is decoded (seeked); films play
       only while the clock plays (reduced motion: no autoplay, so nothing moves). */
    let pre = '';
    async function show(i, at = 0, opts2 = {}) {
      const p = PROJECTS[i], k = segAt(p, at), g = p.segs[k], inc = vids[1 - S.layer], out = vids[S.layer], tok = ++S.showTok;
      S.seg = k; pre = '';
      const t = g.from + (at - g.start);
      inc.getAnimations().forEach(a => a.cancel()); inc.classList.remove('top');
      if (!filmOk(inc, g.film)) inc.src = film(g.film);
      inc.playbackRate = SPEED;
      if (inc.readyState < 2 || Math.abs(inc.currentTime - t) > .08) { try { inc.currentTime = t; } catch (e) {} }
      if (S.playing) inc.play().catch(() => {}); else inc.pause();
      await new Promise(r => {
        const ok = () => inc.readyState >= 2 && !inc.seeking; if (ok()) return r();
        const f = () => { if (ok()) { inc.removeEventListener('seeked', f); inc.removeEventListener('loadeddata', f); r(); } };
        inc.addEventListener('seeked', f); inc.addEventListener('loadeddata', f); after(900, r);
      });
      if (tok !== S.showTok) return;                 // a newer show() took over this layer
      S.layer = 1 - S.layer;
      out.muted = true; inc.muted = !S.sound; inc.volume = Math.min(1, Math.max(0, S.vol));   // one voice at a time
      out.classList.remove('top'); inc.classList.add('on', 'top');
      const fade = reduced() ? 300 : (opts2.fade ?? 1000);
      anim(inc, [{ opacity: 0 }, { opacity: 1 }], fade, 'soft');
      if (!reduced()) anim(inc, [{ transform: 'scale(1.045)' }, { transform: 'scale(1)' }], opts2.settle ?? 1600, 'arrive');
      after(fade + 40, () => { if (tok === S.showTok) { out.getAnimations().forEach(a => a.cancel()); out.classList.remove('on'); out.pause(); } });
    }
    // one composed string per change; polite only right after a user action, silent during autoplay
    function announce(text) { live.setAttribute('aria-live', performance.now() - S.userAt < 2500 ? 'polite' : 'off'); live.textContent = text; }
    const user = () => { S.userAt = performance.now(); };
    function setCur(i, at = 0, o2) {
      if (i === S.cur && !o2?.force) return;
      S.cur = i; clips.forEach((c, k) => { c.classList.toggle('on', k === i); if (k === i) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); });
      if (!o2?.natural) show(i, at, o2);              // the film is continuous: playing into the next clip is not a cut
      const p = PROJECTS[i]; announce(p.kind === 'work' ? `${p.co}, ${p.pr}` : `${p.name}, ${p.pr}`);
      emit('clip', i);
    }

    // glides: the playhead carries its velocity into a critically damped return (never stops, never restarts)
    let prevHead = 0, headV = 0;
    function glideFrom(x, w = 7) { S.off = x - xOf(S.t); S.offV = headV - (S.playing ? W / TOTAL * S.rate : 0); S.offW = w; if (reduced()) S.off = S.offV = 0; }
    function jump(i, o2 = {}) {
      const p = PROJECTS[i], x = S.headX;
      S.ended = false; S.t = p.start; glideFrom(x, o2.w ?? 7); setCur(i, 0, { force: true });
    }

    // seek (hook for scrubbing): put the reel at reel-time t, the film at that frame; cuts crossfade briefly
    function seek(t, o2 = {}) {
      const x = S.headX;
      t = Math.max(0, Math.min(TOTAL - 1e-3, t)); S.t = t; S.ended = false;
      if (o2.glide) glideFrom(x, o2.w ?? 7); else { S.off = S.offV = 0; }
      const i = clipAt(t), local = t - PROJECTS[i].start, k = segAt(PROJECTS[i], local), f = { fade: o2.fade ?? 320, settle: o2.settle ?? 1 };
      if (i !== S.cur) setCur(i, local, f);
      else { S.seg = k; const v = vids[S.layer], g = PROJECTS[i].segs[k], want = g.from + local - g.start;
        if (v.readyState >= 1 && filmOk(v, g.film) && !v.seeking && Math.abs(v.currentTime - want) > .02) { try { v.currentTime = want; } catch (e) {} } }
    }

    // a demo pointer (hook): a small dot the scripted demos move on the master clock; it dispatches real
    // pointer/mouse events, so the page's own handlers run, and sets .hov on .clip / [data-hover] (synthetic events don't trigger :hover)
    const P = { el: null, x: 0, y: 0, tw: null, down: false, over: null };
    function pfire(type, ctor = PointerEvent) {
      const el = document.elementFromPoint(P.x, P.y) || document.body;
      el.dispatchEvent(new ctor(type, { bubbles: true, cancelable: true, composed: true, clientX: P.x, clientY: P.y, pointerId: 7, pointerType: 'mouse', isPrimary: true, button: /down|up|click/.test(type) ? 0 : -1, buttons: P.down ? 1 : 0 }));
      return el;
    }
    function phover() {
      const el = document.elementFromPoint(P.x, P.y), h = el && el.closest('.clip, [data-hover]');
      if (h === P.over) return;
      if (P.over) { P.over.classList.remove('hov'); P.over.dispatchEvent(new MouseEvent('mouseleave', { clientX: P.x, clientY: P.y })); P.over.dispatchEvent(new PointerEvent('pointerleave', { clientX: P.x, clientY: P.y, pointerId: 7 })); }
      P.over = h;
      if (h) { h.classList.add('hov'); h.dispatchEvent(new MouseEvent('mouseenter', { clientX: P.x, clientY: P.y })); h.dispatchEvent(new PointerEvent('pointerenter', { clientX: P.x, clientY: P.y, pointerId: 7 })); }
    }
    function pmove() { if (P.el) P.el.style.transform = `translate(${P.x}px,${P.y}px)`; pfire('pointermove'); pfire('mousemove', MouseEvent); phover(); }
    function pointerTick(now) {
      const w = P.tw; if (!w) return;
      const k = Math.min(1, (now - w.t0) / (w.d / SPEED)), e = (typeof w.ease === 'function' ? w.ease : EASE[w.ease] || EASE.soft)(k);
      P.x = w.x0 + (w.x1 - w.x0) * e; P.y = w.y0 + (w.y1 - w.y0) * e + Math.sin(Math.PI * e) * (w.arc || 0);
      pmove(); if (k >= 1) { P.tw = null; w.done(); }
    }
    const pointer = {
      get x() { return P.x; }, get y() { return P.y; },
      show(x, y) {
        if (!P.el) { P.el = document.createElement('div'); P.el.className = 'pf-cursor'; P.el.innerHTML = '<i></i>'; root.appendChild(P.el); }
        P.x = x; P.y = y; P.el.style.transform = `translate(${x}px,${y}px)`;
        anim(P.el.firstChild, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], 320, 'arrive'); pmove();
      },
      to(x, y, d = 900, ease = 'soft', arc = 0) { return new Promise(r => { P.tw = { x0: P.x, y0: P.y, x1: x, y1: y, d, ease, arc, t0: performance.now(), done: r }; }); },
      down() { P.down = true; pfire('pointerdown'); pfire('mousedown', MouseEvent); if (P.el) anim(P.el.firstChild, [{ transform: 'scale(1)' }, { transform: 'scale(.72)' }], 160, 'arrive'); },
      up(click = true) { P.down = false; const el = pfire('pointerup'); pfire('mouseup', MouseEvent); if (click) el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: P.x, clientY: P.y, detail: 1 })); if (P.el) anim(P.el.firstChild, [{ transform: 'scale(.72)' }, { transform: 'scale(1)' }], 260, 'arrive'); },
      wheel(dy) { const el = document.elementFromPoint(P.x, P.y) || document.body; el.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: P.x, clientY: P.y, deltaY: dy, deltaMode: 0 })); },
      hide() { if (P.over) { P.over.classList.remove('hov'); P.over.dispatchEvent(new MouseEvent('mouseleave')); P.over = null; } if (P.el) anim(P.el.firstChild, [{ opacity: 1 }, { opacity: 0 }], 360, 'soft'); }
    };

    function frame(now) {
      const dt = Math.min(64, now - S.last) / 1000 * SPEED; S.last = now;
      clockMs += dt * 1000;
      for (let k = later.length - 1; k >= 0; k--) if (later[k].at <= clockMs) { const f = later[k].fn; later.splice(k, 1); f(); }
      emit('tick', S, now);                          // hook: input-driven state, before the engine positions anything
      if (S.playing) {
        S.t += dt * S.rate;
        if (S.range && S.t >= S.range[1]) { S.t = S.range[0]; show(S.cur, S.t - PROJECTS[S.cur].start, { fade: 900 }); }
        if (S.t >= TOTAL) {
          if (o.holdAtEnd) { S.t = TOTAL - 1e-3; S.ended = true; api.pause(); }   // one pass, then a calm hold on the last frame
          else { const x = S.headX; S.t = 0; glideFrom(x); setCur(0, 0, { force: true }); }
        }
      }
      if (S.playing) {
        const i = clipAt(S.t), local = S.t - PROJECTS[i].start;
        if (i !== S.cur) setCur(i, local, { natural: true });
        S.seg = segAt(PROJECTS[i], local);              // the film's own shots: no layer swap, the film just plays
        // keep the film in step with the clock (correct only real drift, only on the layer that holds this film)
        const v = vids[S.layer], p = PROJECTS[S.cur], g = p.segs[S.seg || 0], want = g.from + (S.t - p.start - g.start);
        if (v.readyState >= 2 && filmOk(v, g.film) && Math.abs(v.currentTime - want) > .35 && !v.seeking) { try { v.currentTime = want; } catch (e) {} }
      }
      { const tv = S.sound ? 1 : 0; S.vol += (tv - S.vol) * (1 - Math.exp(-8 * Math.min(.064, dt / SPEED))); if (Math.abs(tv - S.vol) < .004) S.vol = tv;   // sound fades over ≈ 0.4 s
        const v = vids[S.layer]; v.volume = Math.min(1, Math.max(0, S.vol)); v.muted = !S.sound && S.vol === 0; }
      if (S.glide) { glideFrom(S.glide.from ?? S.headX, S.glide.w ?? 7); S.glide = null; }   // compat: pages may still set S.glide
      if (S.off || S.offV) {
        const w = S.offW; let left = dt;
        while (left > 0) { const hh = Math.min(left, 1 / 240); S.offV += (-w * w * S.off - 2 * w * S.offV) * hh; S.off += S.offV * hh; left -= hh; }
        if (Math.abs(S.off) < .15 && Math.abs(S.offV) < 2) S.off = S.offV = 0;
      }
      if (!S.drag) S.headX = xOf(S.t) + S.off;
      if (dt > 0) headV = (S.headX - prevHead) / dt; prevHead = S.headX;
      place(); pointerTick(now); emit('frame', S);
      S.raf = requestAnimationFrame(frame);
    }

    // input (click jumps to the clip; a page can intercept in the capture phase)
    clips.forEach(c => c.addEventListener('click', e => { e.stopPropagation(); user(); jump(+c.dataset.i); if (S.ended) api.play(); }));
    // brand focus: hovering a clip lights its brand's clips in the brand colour and fades the rest (see pf.css)
    const focusOn = c => { const b = PROJECTS[+c.dataset.i].brand;     // no brand (personal, title card): no colour, but the others still fade
      clips.forEach((k, j) => { const pj = PROJECTS[j]; k.classList.toggle('hv', k === c); k.classList.toggle('full', !!b && k === c && pj.logoShown); k.classList.toggle('half', !!b && k === c && !pj.logoShown); k.classList.toggle('kin', !!b && k !== c && pj.brand === b); k.classList.toggle('dim', k !== c && (!b || pj.brand !== b)); }); };
    const focusOff = () => clips.forEach(k => k.classList.remove('hv', 'full', 'half', 'kin', 'dim'));
    clips.forEach(c => { c.addEventListener('mouseenter', () => focusOn(c)); c.addEventListener('mouseleave', focusOff); c.addEventListener('focus', () => { if (c.matches(':focus-visible')) focusOn(c); }); c.addEventListener('blur', focusOff); });
    // hover and keyboard focus: a small label rises above the clip (name · year), and glides between neighbours
    const tip = $('#tip'); let tipOn = false;
    const tipIn = c => {
      const p = PROJECTS[+c.dataset.i];
      tip.innerHTML = o.clipAction ? `${esc(nameOf(p))}<i>${esc(o.clipAction)}</i>` : p.kind === 'work' ? `${esc(p.co)}<i>${esc(p.pr)}</i>` : p.kind === 'card' ? `${esc(p.name)}` : `${esc(p.name)}<i>${esc(p.pr)}</i>`;
      tip.style.setProperty('--brand', p.color || '');
      const x = c.offsetLeft + c.offsetWidth / 2;
      if (!tipOn) { tip.style.left = x + 'px'; anim(tip, [{ opacity: 0, transform: 'translate(-50%,6px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], 320, 'arrive'); }
      else anim(tip, [{ left: getComputedStyle(tip).left }, { left: x + 'px' }], 420, 'arrive').finished.then(() => tip.style.left = x + 'px').catch(() => {});
      tipOn = true;
    };
    const tipOut = () => { tipOn = false; after(60, () => { if (!tipOn) anim(tip, [{ opacity: +getComputedStyle(tip).opacity }, { opacity: 0 }], 200, 'soft'); }); };
    clips.forEach(c => { c.addEventListener('mouseenter', () => tipIn(c)); c.addEventListener('mouseleave', tipOut); c.addEventListener('focus', () => { if (c.matches(':focus-visible')) tipIn(c); }); c.addEventListener('blur', tipOut); });
    const sndBtn = $('#snd');
    sndBtn.addEventListener('click', e => { e.stopPropagation(); S.sound = sndBtn.getAttribute('aria-pressed') !== 'true'; sndBtn.setAttribute('aria-pressed', S.sound); sndBtn.setAttribute('aria-label', S.sound ? 'sound on' : 'sound off'); sndBtn.querySelector('.ico').innerHTML = S.sound ? ICO.on : ICO.off; vids[S.layer].muted = !S.sound; });
    pauseBtn.addEventListener('click', e => { e.stopPropagation(); user(); S.playing ? api.pause() : api.play(); });
    const syncPause = () => { pauseBtn.setAttribute('aria-label', S.playing ? 'pause' : 'play'); pauseBtn.querySelector('.ico').innerHTML = S.playing ? ICO.pause : ICO.play; pauseBtn.classList.toggle('paused', !S.playing); };
    // keys: space plays/pauses unless a control has focus (then it activates the control); ← → step clips
    const onKey = e => {
      const onCtl = e.target && e.target.closest && e.target.closest('button, a, input, textarea, select, [contenteditable]');
      if (e.key === ' ' && !onCtl) { e.preventDefault(); user(); S.playing ? api.pause() : api.play(); }
      if (e.key === 'ArrowRight') { user(); jump(Math.min(PROJECTS.length - 1, S.cur + 1)); }
      if (e.key === 'ArrowLeft') { user(); jump(Math.max(0, S.cur - 1)); }
    };
    document.addEventListener('keydown', onKey);
    const ro = new ResizeObserver(layout); ro.observe(track);

    const api = {
      root, $, $$, S, PROJECTS, TOTAL, EASE, CSS, xOf, clipAt, jump, show, setCur, clipX, layout, anim, ms, vids, track, head, clips, seek, pointer, after, announce, glideFrom, user,
      listen(t, n, f, op) { t.addEventListener(n, f, op); (S.listeners.destroy = S.listeners.destroy || []).push(() => t.removeEventListener(n, f, op)); },
      get W() { return W; }, get headV() { return headV; },
      play() {
        if (S.ended) { S.ended = false; const x = S.headX; S.t = 0; glideFrom(x); setCur(0, 0, { force: true }); }
        S.playing = true; S.last = performance.now(); vids[S.layer].playbackRate = SPEED; vids[S.layer].play().catch(() => {}); syncPause(); emit('play');
      },
      pause(o2) { S.playing = false; vids.forEach(v => v.pause()); if (!o2 || !o2.quiet) syncPause(); emit('pause'); },   // quiet: a hold (e.g. a scrub), not the viewer's pause
      on(n, f) { (S.listeners[n] = S.listeners[n] || []).push(f); },
      setSpeed(s) { vids.forEach(v => v.playbackRate = s); },
      destroy() { emit('destroy'); cancelAnimationFrame(S.raf); ro.disconnect(); document.removeEventListener('keydown', onKey); vids.forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); }
    };
    layout(); setCur(0, 0, { force: true, fade: 1 });
    S.raf = requestAnimationFrame(frame);
    syncPause();
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
  window.Pf = { define, PROJECTS, TOTAL, FILMS, FDUR, SPF, segAt, LOGO, EASE, CSS, bezier, tc, esc, film, list: () => Object.entries(DEFS).map(([id, d]) => ({ id, title: d.title, does: d.does, why: d.why })) };
})();
