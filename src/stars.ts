// Starfield for the art room. The sky moves SLOWER than the camera: content scrolls
// the full distance while the sky layers move a fraction of it.
//
// The scene changes thematically at each station. At the graph station stars are
// joined by lines (the sky becomes a graph); at the machine-vision station pale
// detection boxes appear around stars; at the calendar station the sky is ruled into
// a grid; at the ink station stars trail ink tails.
// A SINGLE canvas draws all of it — no extra layers and no extra frames.

import { tl } from './i18n';
import { onCleanup, onScroll, reducedMotion } from './runtime';

export type SkyScene = 'none' | 'ink' | 'cal' | 'vision' | 'graph';

interface Star {
  x: number;
  y: number;
  r: number;
  v: number;
  tw: number;
}

export interface Sky {
  scene(name: SkyScene): void;
  current(): SkyScene;
}

const VISION_WORDS = tl('skyWords');

export function startStars(canvas: HTMLCanvasElement | null): Sky {
  const noop: Sky = { scene: () => undefined, current: () => 'none' };
  if (!canvas) return noop;
  const ctx = canvas.getContext('2d');
  if (!ctx) return noop;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = window.innerWidth;
  let H = window.innerHeight * 1.25;

  const resize = (): void => {
    W = window.innerWidth;
    H = window.innerHeight * 1.25;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  };
  resize();
  window.addEventListener('resize', resize);
  onCleanup(() => window.removeEventListener('resize', resize));

  const stars: Star[] = [];
  const count = Math.min(170, Math.max(70, Math.floor(window.innerWidth / 6)));
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.35 + Math.random() * 1.5,
      v: 0.000004 + Math.random() * 0.000016,
      tw: Math.random() * Math.PI * 2,
    });
  }

  // Pairs for the graph sky are recomputed RARELY: stars drift slowly, and running
  // an O(n^2) pass every frame would only spin up the fan.
  let pairs: Array<[number, number]> = [];
  let pairsAt = -1e9;
  const LINK = 0.14; // neighbour distance threshold, in fractions of the viewport
  const recount = (): void => {
    pairs = [];
    for (let i = 0; i < stars.length; i += 1) {
      for (let j = i + 1; j < stars.length; j += 1) {
        const dx = stars[i].x - stars[j].x;
        const dy = (stars[i].y - stars[j].y) * 0.8;
        if (dx * dx + dy * dy < LINK * LINK) pairs.push([i, j]);
        if (pairs.length > 260) return;
      }
    }
  };

  let mode: SkyScene = 'none';
  let want: SkyScene = 'none';
  let mix = 0;

  const paintScene = (now: number, k: number): void => {
    if (k <= 0.01 || mode === 'none') return;
    const cw = canvas.width;
    const ch = canvas.height;

    if (mode === 'graph') {
      if (now - pairsAt > 900) {
        recount();
        pairsAt = now;
      }
      ctx.lineWidth = dpr;
      for (let p = 0; p < pairs.length; p += 1) {
        const a = stars[pairs[p][0]];
        const b = stars[pairs[p][1]];
        const dy = Math.abs(a.y - b.y);
        if (dy > 0.5) continue; // star wrapped around the edge: skip the screen-wide line
        const fade = 1 - Math.hypot(a.x - b.x, (a.y - b.y) * 0.8) / LINK;
        ctx.strokeStyle = `rgba(141, 245, 232, ${(0.3 * fade * k).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(a.x * cw, a.y * ch);
        ctx.lineTo(b.x * cw, b.y * ch);
        ctx.stroke();
      }
      return;
    }

    if (mode === 'vision') {
      ctx.lineWidth = 1.1 * dpr;
      ctx.font = `${Math.round(10 * dpr)}px ui-monospace, monospace`;
      for (let i = 0; i < stars.length; i += 7) {
        const s = stars[i];
        const bw = (36 + ((i * 13) % 70)) * dpr;
        const bh = (26 + ((i * 7) % 46)) * dpr;
        const x = s.x * cw - bw / 2;
        const y = s.y * ch - bh / 2;
        const on = (0.2 + 0.16 * (0.5 + 0.5 * Math.sin(now * 0.0008 + i))) * k;
        ctx.strokeStyle = `rgba(255, 108, 96, ${on.toFixed(3)})`;
        ctx.strokeRect(x, y, bw, bh);
        ctx.fillStyle = `rgba(255, 150, 138, ${(on * 0.85).toFixed(3)})`;
        ctx.fillText(VISION_WORDS[i % VISION_WORDS.length], x + 2 * dpr, y - 3 * dpr);
      }
      return;
    }

    if (mode === 'cal') {
      // the grid stays fixed: it should read as ruled paper, not as shimmer
      const step = 46 * dpr;
      ctx.lineWidth = dpr;
      ctx.strokeStyle = `rgba(141, 245, 232, ${(0.09 * k).toFixed(3)})`;
      ctx.beginPath();
      for (let x = 0; x < cw; x += step) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, ch);
      }
      for (let y = 0; y < ch; y += step) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(cw, Math.round(y) + 0.5);
      }
      ctx.stroke();
      // sparse "busy" cells, so the schedule shows through onto the sky as well
      for (let i = 0; i < stars.length; i += 5) {
        const s = stars[i];
        const gx = Math.floor((s.x * cw) / step) * step;
        const gy = Math.floor((s.y * ch) / step) * step;
        const a = (0.05 + 0.05 * (0.5 + 0.5 * Math.sin(now * 0.0006 + i))) * k;
        ctx.fillStyle = `rgba(255, 178, 108, ${a.toFixed(3)})`;
        ctx.fillRect(gx + dpr, gy + dpr, step - 2 * dpr, step - 2 * dpr);
      }
      return;
    }

    if (mode === 'ink') {
      ctx.lineCap = 'round';
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        const len = (10 + s.r * 26) * dpr * k;
        const sway = Math.sin(now * 0.0005 + i) * 6 * dpr;
        ctx.strokeStyle = `rgba(180, 240, 235, ${(0.16 * k).toFixed(3)})`;
        ctx.lineWidth = Math.max(0.6, s.r * 0.9) * dpr;
        ctx.beginPath();
        ctx.moveTo(s.x * canvas.width, s.y * canvas.height);
        ctx.quadraticCurveTo(
          s.x * canvas.width + sway,
          s.y * canvas.height + len * 0.55,
          s.x * canvas.width + sway * 0.4,
          s.y * canvas.height + len,
        );
        ctx.stroke();
      }
    }
  };

  let raf = 0;
  let last = performance.now();
  const loop = (now: number): void => {
    const dt = Math.min(now - last, 50);
    last = now;
    if (!document.hidden) {
      // scene change: the old one fades out and the new one fades in, without a jump
      if (want !== mode) {
        mix -= dt * 0.004;
        if (mix <= 0) {
          mix = 0;
          mode = want;
        }
      } else if (mix < 1) {
        mix = Math.min(1, mix + dt * 0.0022);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      paintScene(now, mix);
      for (const s of stars) {
        s.y -= s.v * dt;
        if (s.y < 0) s.y += 1;
        s.tw += 0.0012 * dt;
        const a = 0.35 + 0.35 * (1 + Math.sin(s.tw)) * 0.5;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 245, 255, ${a.toFixed(3)})`;
        ctx.fill();
      }
    }
    raf = window.requestAnimationFrame(loop);
  };
  raf = window.requestAnimationFrame(loop);
  onCleanup(() => window.cancelAnimationFrame(raf));

  if (!reducedMotion()) {
    const nebula = document.querySelector('.nebula') as HTMLElement | null;
    const haze = document.querySelector('.haze') as HTMLElement | null;
    onScroll(() => {
      const y = window.scrollY || 0;
      canvas.style.transform = `translate3d(0, ${(-y * 0.08).toFixed(1)}px, 0)`;
      if (nebula) nebula.style.transform = `translate3d(0, ${(-y * 0.16).toFixed(1)}px, 0)`;
      if (haze) haze.style.transform = `translate3d(0, ${(-y * 0.3).toFixed(1)}px, 0)`;
    });
  }

  return {
    scene(name: SkyScene): void {
      if (name === want) return;
      want = name;
      // under reduced motion switch instantly; no cross-fade is wanted here
      if (reducedMotion()) {
        mode = name;
        mix = 1;
      }
    },
    current: () => mode,
  };
}
