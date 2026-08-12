// Transitions from the terminal into the rooms. Both are born INSIDE the monitor
// and break out of it.
// jokes — clown HONK and BROKEN GLASS: crack web, flying shards, hole into the room.
// art   — a spark in the buffer grows into a glowing tentacle core, bursts past the
//         bezel, light combed into vertical threads.

import { clownFrames, clownLines, holeArt, portalLines } from './data';
import { later, onCleanup, reducedMotion } from './runtime';

const FRAME_MS = 200;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

/** Screen rect of the monitor glass (accounts for the 3D tilt of the case). */
function glassBox(host: HTMLElement): Box {
  const el = host.querySelector('.crt-glass') || host.querySelector('#editor');
  const r = el
    ? el.getBoundingClientRect()
    : ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight } as DOMRect);
  return {
    x: r.left,
    y: r.top,
    w: r.width,
    h: r.height,
    cx: r.left + r.width / 2,
    cy: r.top + r.height / 2,
  };
}

function fullCanvas(host: HTMLElement, cls: string): CanvasRenderingContext2D | null {
  const canvas = document.createElement('canvas');
  canvas.className = cls;
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return null;
  }
  ctx.scale(dpr, dpr);
  onCleanup(() => canvas.remove());
  return ctx;
}

// ======================= JOKES ROOM: broken glass =======================

interface Shard {
  pts: Array<[number, number]>;
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  vr: number;
  r: number;
  s: number;
}

/** Crack web from the impact point: spokes + rings, revealed in steps. */
function crackWeb(box: Box, hx: number, hy: number): { spokes: number[]; rings: number[] } {
  const spokes: number[] = [];
  const n = 13;
  for (let i = 0; i < n; i += 1) {
    spokes.push(((Math.PI * 2) / n) * i + (Math.random() - 0.5) * 0.22);
  }
  const far = Math.max(box.w, box.h);
  const rings = [far * 0.07, far * 0.17, far * 0.3, far * 0.47, far * 0.72];
  void hx;
  void hy;
  return { spokes, rings };
}

/**
 * The clown hits the glass: face frames -> HONK -> impact ->
 * cracks -> shards fly, the jokes room shows through the hole, we fly in.
 */
export function clownTransition(
  stage: HTMLElement,
  host: HTMLElement,
  done: () => void,
): void {
  // rAF does not tick in a hidden tab, and the whole animation runs on it.
  // Without this branch done() would never fire and the room would never mount.
  if (reducedMotion() || document.hidden) {
    done();
    return;
  }
  stage.innerHTML = `
    <div class="clown-stage">
      <pre class="clown-art" id="clown-art"></pre>
      <pre class="clown-log" id="clown-log"></pre>
    </div>`;
  const art = stage.querySelector('#clown-art') as HTMLPreElement;
  const log = stage.querySelector('#clown-log') as HTMLPreElement;
  const frames = clownFrames.slice(0, 3); // up to HONK — then comes the fist

  let i = 0;
  const step = (): void => {
    art.textContent = frames[i];
    art.className = `clown-art f${i}`;
    if (i < clownLines.length) log.textContent = clownLines.slice(0, i + 1).join('\n');
    i += 1;
    if (i < frames.length) later(step, FRAME_MS);
    else later(() => smash(host, done), FRAME_MS);
  };
  step();
}

function smash(host: HTMLElement, done: () => void): void {
  const box = glassBox(host);
  const hx = box.cx;
  const hy = box.cy + box.h * 0.06;
  const crt = host.querySelector('#crt') as HTMLElement | null;
  const ctx = fullCanvas(host, 'smash-canvas');
  if (!ctx) {
    done();
    return;
  }
  const { spokes, rings } = crackWeb(box, hx, hy);

  // the hole with the jokes room grows out of the impact point as a ragged patch
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.setAttribute('aria-hidden', 'true');
  hole.innerHTML = `<div class="hole-grid"></div><pre class="hole-art">${holeArt}</pre>`;
  host.appendChild(hole);
  onCleanup(() => hole.remove());
  const dx = hx - window.innerWidth / 2;
  const dy = hy - window.innerHeight / 2;
  hole.style.transform = `translate(${dx}px, ${dy}px) scale(0.02)`;

  if (crt) crt.classList.add('hit');

  const W = window.innerWidth;
  const H = window.innerHeight;
  const pt = (a: number, r: number): [number, number] => [
    hx + Math.cos(a) * r,
    hy + Math.sin(a) * r,
  ];

  /** Draw cracks: as many rings as steps revealed so far. */
  const drawCracks = (steps: number, alpha: number): void => {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.w, box.h);
    ctx.clip();
    ctx.lineCap = 'round';
    const upto = rings[Math.min(steps, rings.length - 1)];
    ctx.strokeStyle = `rgba(190, 245, 255, ${alpha.toFixed(3)})`;
    for (const a of spokes) {
      const [x, y] = pt(a, upto);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.strokeStyle = `rgba(150, 230, 245, ${(alpha * 0.75).toFixed(3)})`;
    ctx.lineWidth = 1.1;
    for (let k = 0; k <= Math.min(steps, rings.length - 1); k += 1) {
      ctx.beginPath();
      spokes.forEach((a, j) => {
        const [x, y] = pt(a, rings[k] * (0.82 + ((j * 37) % 40) / 100));
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }
    // white impact flash
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 90);
    g.addColorStop(0, `rgba(255,255,255,${(alpha * 0.5).toFixed(3)})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(hx - 90, hy - 90, 180, 180);
    ctx.restore();
  };

  const shards: Shard[] = [];
  const buildShards = (): void => {
    for (let k = 0; k < rings.length - 1; k += 1) {
      for (let j = 0; j < spokes.length; j += 1) {
        const a0 = spokes[j];
        const a1 = spokes[(j + 1) % spokes.length];
        const r0 = rings[k];
        const r1 = rings[k + 1];
        const pts: Array<[number, number]> = [pt(a0, r0), pt(a1, r0), pt(a1, r1), pt(a0, r1)];
        const cx = (pts[0][0] + pts[2][0]) / 2;
        const cy = (pts[0][1] + pts[2][1]) / 2;
        const ang = Math.atan2(cy - hy, cx - hx);
        const sp = 0.4 + Math.random() * 1.2;
        shards.push({
          pts: pts.map(([x, y]) => [x - cx, y - cy]),
          cx,
          cy,
          vx: Math.cos(ang) * sp * 6,
          vy: Math.sin(ang) * sp * 6 - 1.5,
          vr: (Math.random() - 0.5) * 0.16,
          r: 0,
          s: 1,
        });
      }
    }
  };

  let raf = 0;
  const flyStart = { t: 0 };
  const fly = (now: number): void => {
    if (!flyStart.t) flyStart.t = now;
    const p = Math.min(1, (now - flyStart.t) / 820);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    for (const s of shards) {
      s.cx += s.vx;
      s.cy += s.vy;
      s.vy += 0.42;
      s.r += s.vr;
      s.s += 0.012;
      ctx.save();
      ctx.translate(s.cx, s.cy);
      ctx.rotate(s.r);
      ctx.scale(s.s, s.s);
      ctx.beginPath();
      s.pts.forEach(([x, y], j) => (j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
      ctx.closePath();
      ctx.fillStyle = `rgba(150, 225, 245, ${(0.16 * (1 - p)).toFixed(3)})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(225, 255, 255, ${(0.7 * (1 - p)).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    if (p < 1) raf = window.requestAnimationFrame(fly);
    else done();
  };

  drawCracks(0, 0.9);
  later(() => drawCracks(1, 1), 150);
  later(() => drawCracks(2, 1), 300);
  later(() => {
    drawCracks(4, 1);
    buildShards();
    if (crt) crt.classList.add('blown');
    // first a real HOLE: the jokes room is visible through the ragged gap
    hole.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`;
    later(() => {
      hole.style.transform = `translate(${dx}px, ${dy}px) scale(3.4)`;
    }, 330);
    raf = window.requestAnimationFrame(fly);
  }, 470);
  onCleanup(() => window.cancelAnimationFrame(raf));
}

// ================== BEAUTY ROOM: spark -> tentacles -> light threads ==================

interface Tent {
  a: number;
  len: number;
  curl: number;
  ph: number;
  sp: number;
  w: number;
}

interface Comb {
  x: number;
  w: number;
  h: number;
  o: number;
  hue: number;
}

const BURST = 0.34; // time fraction at which the portal breaks out of the monitor
const DUR = 2300;

/**
 * Portal: a spark flares in the buffer, grows glowing tentacles, bursts past the
 * bezel and combs the light into vertical threads.
 */
export function portalTransition(host: HTMLElement, editor: HTMLElement, done: () => void): void {
  // See clownTransition: hidden tab = no frames = the transition never reaches done()
  if (reducedMotion() || document.hidden) {
    done();
    return;
  }
  const log = editor.querySelector('#term-log') as HTMLPreElement | null;
  if (log) log.textContent = portalLines.join('\n');

  const box = glassBox(host);
  const ctx = fullCanvas(host, 'portal-canvas');
  if (!ctx) {
    done();
    return;
  }
  const canvas = ctx.canvas;
  const W = window.innerWidth;
  const H = window.innerHeight;
  // while the portal is inside the monitor we only paint over the glass
  canvas.style.clipPath = `inset(${box.y}px ${W - box.x - box.w}px ${H - box.y - box.h}px ${box.x}px round 16px)`;

  const tents: Tent[] = [];
  for (let i = 0; i < 84; i += 1) {
    tents.push({
      a: Math.random() * Math.PI * 2,
      len: 0.45 + Math.random() * 0.55,
      curl: (Math.random() - 0.5) * 2.6,
      ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 0.9,
      w: 0.5 + Math.random() * 0.9,
    });
  }
  const combs: Comb[] = [];
  for (let i = 0; i < 130; i += 1) {
    combs.push({
      x: Math.random(),
      w: 0.6 + Math.random() * 5.5,
      h: 0.25 + Math.random() * 0.9,
      o: 0.05 + Math.random() * 0.5,
      hue: Math.random(),
    });
  }

  const start = performance.now();
  let raf = 0;
  let blown = false;

  const frame = (now: number): void => {
    // the rAF timestamp can be SLIGHTLY BEFORE start — then t<0 and Math.pow gives NaN
    const t = Math.min(1, Math.max(0, (now - start) / DUR));
    // once it breaks out, the core travels from the screen centre to the viewport centre
    const k = t < BURST ? 0 : Math.min(1, (t - BURST) / 0.34);
    const ease = k * k * (3 - 2 * k);
    const cx = box.cx + (W / 2 - box.cx) * ease;
    const cy = box.cy + (H / 2 - box.cy) * ease;
    const scale = t < BURST ? Math.min(box.w, box.h) * 0.42 : Math.max(W, H) * (0.2 + ease * 0.9);
    const grow = t < BURST ? Math.pow(t / BURST, 0.7) : 1;

    if (t < BURST) {
      ctx.clearRect(0, 0, W, H);
    } else {
      if (!blown) {
        blown = true;
        canvas.style.clipPath = 'inset(0px round 0px)';
        editor.classList.add('dissolving');
        const crt = host.querySelector('#crt') as HTMLElement | null;
        if (crt) crt.classList.add('flared');
      }
      ctx.fillStyle = `rgba(4, 16, 24, ${(0.42 - ease * 0.06).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // tentacles: thin filaments curled around the core, each with a spark at the tip
    const tt = (now - start) / 1000;
    for (const s of tents) {
      const L = scale * s.len * grow * (t < BURST ? 1 : 0.8 + ease * 1.5);
      ctx.beginPath();
      let px = cx;
      let py = cy;
      for (let j = 1; j <= 14; j += 1) {
        const u = j / 14;
        const r = L * u;
        const a = s.a + Math.sin(u * 2.4 + s.ph + tt * s.sp) * s.curl * u;
        px = cx + Math.cos(a) * r;
        py = cy + Math.sin(a) * r * (t < BURST ? 1 : 1 + ease * 0.35);
        if (j === 1) ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(150, 225, 255, ${(0.1 + grow * 0.2 - ease * 0.045).toFixed(3)})`;
      ctx.lineWidth = s.w * (1 + ease);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(px, py, 1.1 + ease * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(225, 250, 255, ${(0.35 + ease * 0.5).toFixed(3)})`;
      ctx.fill();
    }

    // core
    const cr = t < BURST ? 3 + grow * 14 : 17 + ease * 26;
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr * 3.2);
    core.addColorStop(0, 'rgba(255,255,255,0.95)');
    core.addColorStop(0.18, `rgba(200, 245, 255, ${(0.5 + ease * 0.4).toFixed(3)})`);
    core.addColorStop(1, 'rgba(60, 190, 200, 0)');
    ctx.fillStyle = core;
    ctx.fillRect(cx - cr * 3.2, cy - cr * 3.2, cr * 6.4, cr * 6.4);

    // flare spikes
    if (t > BURST * 0.6) {
      const sp = Math.min(1, (t - BURST * 0.6) / 0.5);
      for (let i = 0; i < 9; i += 1) {
        const a = (Math.PI / 4.5) * i + tt * 0.12;
        const R = Math.max(W, H) * sp * (0.35 + (i % 3) * 0.22);
        ctx.strokeStyle = `rgba(230, 245, 255, ${(0.14 * sp).toFixed(3)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(a) * R, cy - Math.sin(a) * R);
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
        ctx.stroke();
      }
    }

    // light combed into vertical threads — the final beat
    if (t > 0.46) {
      const c = Math.min(1, (t - 0.46) / 0.54);
      for (const s of combs) {
        const x = s.x * W;
        const hh = H * s.h * (0.4 + c);
        const g = ctx.createLinearGradient(x, cy - hh, x, cy + hh);
        const a = (s.o * c * 0.7).toFixed(3);
        g.addColorStop(0, 'rgba(120, 200, 220, 0)');
        g.addColorStop(0.5, `rgba(${s.hue > 0.7 ? '190,205,255' : '170,240,240'}, ${a})`);
        g.addColorStop(1, 'rgba(120, 200, 220, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(x, cy - hh, s.w * (1 + c * 2), hh * 2);
      }
      ctx.fillStyle = `rgba(210, 250, 250, ${(Math.pow(Math.max(0, c - 0.35) / 0.65, 2) * 0.6).toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    if (t < 1) raf = window.requestAnimationFrame(frame);
    else done();
  };
  raf = window.requestAnimationFrame(frame);
  onCleanup(() => window.cancelAnimationFrame(raf));
}
