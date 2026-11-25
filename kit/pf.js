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

  /* ── the projects, ordered by time (oldest first). One long clip per company, made of several film
        segments; personal projects are unnamed on the timeline. Films are stand-ins; project titles (pr), roles and years are placeholders. ── */
  const SPF = 2;                                   // strip sprites: frames per second (media/strip-<film>.jpg, 128×72 each)
  const FDUR = { a1: 9.37, archive: 6.47, board: 9.13, 'collection-home': 6.73, 'collection-recipes': 6.73, f1: 8.87, f2: 9.83, f4: 8.87, g3: 9.33, g4: 8.87, o3: 8.93, p5: 7.93, 'recipe-page': 6.77 };
  const LOGO = { ikea: { h: 15 }, telekom: { h: 22 }, redbull: { h: 16 } };
  const PROJECTS = [
    { co: 'IKEA', logo: 'ikea', kind: 'work', pr: 'home planning', role: 'product designer', yr: 'years to confirm',
      segs: [['archive', 0.2, 6.0], ['collection-home', 0.3, 6.2], ['board', 0.4, 8.4], ['collection-recipes', 0.4, 6.0]] },
    { co: 'Telekom', logo: 'telekom', kind: 'work', pr: 'self-service app', role: 'product designer', yr: 'years to confirm',
      segs: [['board', 0.3, 8.6], ['collection-home', 0.4, 6.0], ['recipe-page', 0.3, 6.2], ['archive', 0.2, 6.0]] },
    { co: 'Red Bull', logo: 'redbull', kind: 'work', pr: 'event companion', role: 'product designer', yr: 'years to confirm',
      segs: [['collection-recipes', 0.3, 6.2], ['archive', 0.6, 5.6], ['board', 1.0, 7.8], ['collection-home', 0.3, 6.2]] },
    { co: '', name: 'recipe app', kind: 'personal', pr: 'recipe app', role: 'self-initiated', yr: '2026',
      segs: [['recipe-page', 0.3, 6.3]] },
    { co: '', name: 'collection', kind: 'personal', pr: 'collection', role: 'self-initiated', yr: '2026',
      segs: [['a1', 0.6, 4.4], ['g3', 0.8, 4.2], ['f2', 0.8, 4.6], ['p5', 0.6, 4.0], ['g4', 0.8, 4.0], ['f4', 0.6, 4.2], ['f1', 0.4, 4.4]] }
  ];
  let acc = 0; PROJECTS.forEach((p, i) => { p.i = i; p.start = acc; let a = 0; p.segs = p.segs.map(([film, from, len]) => { const g = { film, from, len, start: a }; a += len; return g; }); p.len = a; acc += a; });
  const TOTAL = acc;
  const FILMS = [...new Set(PROJECTS.flatMap(p => p.segs.map(g => g.film)))];
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
    const nameOf = p => p.kind === 'personal' ? p.name : p.co;
    const clipLabel = p => o.clipAction ? `${nameOf(p)} · ${o.clipAction}` : p.kind === 'personal' ? `${p.name}, personal` : `${p.co}, ${p.yr}`;
    root.innerHTML = `
      <section class="reel" id="reel" aria-label="reel">${[0, 1].map(k => `<video muted playsinline preload="auto" data-layer="${k}"></video>`).join('')}<div class="scrim scrim-top" aria-hidden="true"></div><div class="scrim scrim-cap" aria-hidden="true"></div><div class="scrim scrim-ctl" aria-hidden="true"></div></section>
      <header class="chrome"><div class="me"><b>Johannes Zimmer</b><span>product designer</span></div>
        <nav class="nav" aria-label="contact"><a href="#work">work</a><a href="#about">about</a><a href="mailto:hello@example.com">contact</a><a href="#cv">CV</a></nav></header>
      <div class="cap" id="cap" aria-hidden="true"><span class="l"><span class="co"></span></span><span class="l"><span class="pr"></span></span><span class="l"><span class="ro"></span></span></div>
      <p class="sr-only" id="live" aria-live="off"></p>
      <div class="ctls" id="ctls"><button class="ctl pause" id="pause" type="button"><span class="ico" aria-hidden="true"><i></i><i></i></span><span class="tx">pause</span></button><button class="ctl snd" id="snd" type="button" aria-pressed="false"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="tx">sound off</span></button></div>
      <section class="tl" id="tl" aria-label="timeline">
        <div class="tl-ruler" id="ruler"></div>
        <div class="tl-track" id="track">
          ${PROJECTS.map(p => `<button class="clip ${p.kind}" data-i="${p.i}" aria-label="${esc(clipLabel(p))}"><span class="strip" aria-hidden="true"></span>${p.kind === 'work' ? `<img class="logo" src="${BASE}media/logos-${p.logo}.svg" alt="" draggable="false" style="height:${LOGO[p.logo].h}px">` : ''}</button>`).join('')}
          <div class="tip" id="tip" aria-hidden="true"></div><div class="head" id="head"></div>
        </div>
      </section>`;
    const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
    const vids = $$('.reel video'), track = $('#track'), head = $('#head'), cap = $('#cap'), clips = $$('.clip'), live = $('#live'), pauseBtn = $('#pause');
    const S = { t: 0, playing: false, cur: -1, layer: 0, headX: 0, glide: null, raf: 0, last: performance.now(), listeners: {}, showTok: 0,
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
      out.classList.remove('top'); inc.classList.add('on', 'top');
      const fade = reduced() ? 300 : (opts2.fade ?? 1000);
      anim(inc, [{ opacity: 0 }, { opacity: 1 }], fade, 'soft');
      if (!reduced()) anim(inc, [{ transform: 'scale(1.045)' }, { transform: 'scale(1)' }], opts2.settle ?? 1600, 'arrive');
      after(fade + 40, () => { if (tok === S.showTok) { out.getAnimations().forEach(a => a.cancel()); out.classList.remove('on'); out.pause(); } });
    }
    // preload the next cut into the hidden layer ≈ 1.2 s ahead, so the cut lands on time
    function preload() {
      const p = PROJECTS[S.cur]; if (!p) return;
      const k = S.seg || 0, g = p.segs[k], end = p.start + g.start + g.len;
      if (end - S.t > 1.2) return;
      let nf;
      if (k + 1 < p.segs.length) nf = p.segs[k + 1];
      else if (S.range) nf = p.segs[0];
      else if (S.cur + 1 < PROJECTS.length) nf = PROJECTS[S.cur + 1].segs[0];
      else return;
      const key = S.cur + ':' + k, inc = vids[1 - S.layer];
      if (pre === key || inc.classList.contains('on')) return;
      pre = key;
      if (!filmOk(inc, nf.film)) inc.src = film(nf.film);
      try { inc.currentTime = nf.from; } catch (e) {}
      inc.pause();
    }

    // caption: each line slides out, then in on its own beat; a newer caption cancels an older one mid-way (no race)
    const capText = p => [p.kind === 'personal' ? 'personal' : p.co, p.pr, `${p.role}<i>·</i>${p.yr}`];
    let capTok = 0;
    async function caption(i) {
      const tok = ++capTok, lines = $$('#cap .l>span'), txt = capText(PROJECTS[i]);
      if (cap.dataset.i !== undefined && !reduced()) {
        lines.forEach(l => l.getAnimations().forEach(a => { try { a.commitStyles(); } catch (e) {} a.cancel(); }));
        await Promise.all(lines.map((l, k) => anim(l, [{ transform: 'translateY(-105%)', opacity: 0 }], 260, 'leave', { delay: ms(k * 30) }).finished.catch(() => {})));
        if (tok !== capTok) return;
      }
      cap.dataset.i = i;
      lines.forEach((l, k) => { l.getAnimations().forEach(a => a.cancel()); l.style.transform = ''; l.style.opacity = ''; l.innerHTML = txt[k]; anim(l, [{ transform: 'translateY(105%)', opacity: 0 }, { transform: 'none', opacity: 1 }], reduced() ? 200 : 900, 'arrive', { delay: ms(k * 70) }); });
    }
    // one composed string per change; polite only right after a user action, silent during autoplay
    function announce(text) { live.setAttribute('aria-live', performance.now() - S.userAt < 2500 ? 'polite' : 'off'); live.textContent = text; }
    const user = () => { S.userAt = performance.now(); };
    function setCur(i, at = 0, o2) {
      if (i === S.cur && !o2?.force) return;
      S.cur = i; clips.forEach((c, k) => { c.classList.toggle('on', k === i); if (k === i) c.setAttribute('aria-current', 'true'); else c.removeAttribute('aria-current'); });
      show(i, at, o2); if (!S.holdCap) caption(i);
      const p = PROJECTS[i]; if (!S.holdCap) announce(`${nameOf(p)}, ${p.pr}, ${p.role}, ${p.yr}`);
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
      else if (k !== S.seg) show(i, local, f);
      else { const v = vids[S.layer], g = PROJECTS[i].segs[k], want = g.from + local - g.start;
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
        if (i !== S.cur) setCur(i, local);
        else if (segAt(PROJECTS[i], local) !== S.seg) show(i, local, { fade: 900 });   // a cut inside the clip: the caption stays
        else preload();
        // keep the film in step with the clock (correct only real drift, only on the layer that holds this film)
        const v = vids[S.layer], p = PROJECTS[S.cur], g = p.segs[S.seg || 0], want = g.from + (S.t - p.start - g.start);
        if (v.readyState >= 2 && filmOk(v, g.film) && Math.abs(v.currentTime - want) > .35 && !v.seeking) { try { v.currentTime = want; } catch (e) {} }
      }
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
    // hover and keyboard focus: a small label rises above the clip (name · year), and glides between neighbours
    const tip = $('#tip'); let tipOn = false;
    const tipIn = c => {
      const p = PROJECTS[+c.dataset.i];
      tip.innerHTML = o.clipAction ? `${esc(nameOf(p))}<i>${esc(o.clipAction)}</i>` : p.kind === 'personal' ? `${esc(p.name)}<i>personal</i>` : `${esc(p.co)}<i>${esc(p.yr)}</i>`;
      const x = c.offsetLeft + c.offsetWidth / 2;
      if (!tipOn) { tip.style.left = x + 'px'; anim(tip, [{ opacity: 0, transform: 'translate(-50%,6px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], 320, 'arrive'); }
      else anim(tip, [{ left: getComputedStyle(tip).left }, { left: x + 'px' }], 420, 'arrive').finished.then(() => tip.style.left = x + 'px').catch(() => {});
      tipOn = true;
    };
    const tipOut = () => { tipOn = false; after(60, () => { if (!tipOn) anim(tip, [{ opacity: +getComputedStyle(tip).opacity }, { opacity: 0 }], 200, 'soft'); }); };
    clips.forEach(c => { c.addEventListener('mouseenter', () => tipIn(c)); c.addEventListener('mouseleave', tipOut); c.addEventListener('focus', () => { if (c.matches(':focus-visible')) tipIn(c); }); c.addEventListener('blur', tipOut); });
    $('#snd').addEventListener('click', e => { e.stopPropagation(); const b = e.currentTarget, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.querySelector('.tx').textContent = on ? 'sound on' : 'sound off'; vids.forEach(v => v.muted = !on); });
    pauseBtn.addEventListener('click', e => { e.stopPropagation(); user(); S.playing ? api.pause() : api.play(); });
    const syncPause = () => { pauseBtn.querySelector('.tx').textContent = S.playing ? 'pause' : 'play'; pauseBtn.classList.toggle('paused', !S.playing); };
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
      root, $, $$, S, PROJECTS, TOTAL, EASE, CSS, xOf, clipAt, jump, show, caption, setCur, layout, anim, ms, vids, track, head, clips, seek, pointer, after, announce, glideFrom, user,
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
