// Scroll-driven pixel-art rendering of the sky poster.
//
// An earlier version simply downscaled the image with the browser and stretched
// it back without smoothing. Only the block size read as pixel art: the colours
// stayed photographic (hundreds of muddy shades), the semi-transparent Bayer
// tile laid over that read as noise, and the blocks did not land on whole screen
// pixels (width divided by block count), so block edges blurred by half a pixel.
//
// The current version relies on three things:
//  1. PALETTE. Colours are sampled from the image itself (most populated RGB
//     bins), punched up and sorted into an even luminance ramp — 16 colours max.
//  2. DITHERING. An ordered 4x4 Bayer matrix offsets the colour BEFORE the
//     palette lookup, so the sky gradient breaks into a proper checkerboard.
//  3. WHOLE-PIXEL GRID. A cell is an integer number of screen pixels and blocks
//     are drawn as filled rectangles, so every pixel has a hard edge.
// As the page scrolls, the cell shrinks in steps and the real frame fades in.
//
// NOTE: the poster is imported as a data URI (see src/assets.d.ts) because over
// file:// a regular image taints the canvas and getImageData would throw a
// SecurityError — and without reading pixels the palette cannot be built. If the
// read fails anyway, a palette-free fallback path keeps the page working.

import { onCleanup, reducedMotion } from '../runtime';
import skySrc from '../../assets/posters/sky.jpg';

export interface PixelSky {
  set(k: number): void;
}

/** Pixelation steps: how many SCREEN pixels one cell spans on each scroll range. */
const STEPS: Array<[number, number]> = [
  [0.2, 56],
  [0.4, 36],
  [0.58, 22],
  [0.74, 13],
  [0.88, 7],
];

/** 4x4 Bayer matrix, normalised to -0.5..0.5. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5);

const PALETTE_SIZE = 16;
const DITHER = 30; // how hard the matrix offsets a colour before the palette lookup

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Build the palette: count 5x5x5 colour bins over a small copy of the frame,
 * keep the most populated ones, average within each bin, then push saturation
 * and contrast slightly so the result reads as a poster rather than a muddy
 * print. Sorting by luminance makes the palette a ramp, not a random set.
 */
function buildPalette(data: Uint8ClampedArray): RGB[] {
  const B = 5;
  const bins = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key =
      Math.min(B - 1, Math.floor((r / 256) * B)) * B * B +
      Math.min(B - 1, Math.floor((g / 256) * B)) * B +
      Math.min(B - 1, Math.floor((b / 256) * B));
    const cur = bins.get(key);
    if (cur) {
      cur.n += 1;
      cur.r += r;
      cur.g += g;
      cur.b += b;
    } else {
      bins.set(key, { n: 1, r, g, b });
    }
  }
  const top = Array.from(bins.values())
    .sort((a, b) => b.n - a.n)
    .slice(0, PALETTE_SIZE);
  const out = top.map((c) => {
    const r = c.r / c.n;
    const g = c.g / c.n;
    const b = c.b / c.n;
    // poster look: a bit more colour and contrast, without clipping
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const punch = (v: number): number =>
      Math.max(0, Math.min(255, lum + (v - lum) * 1.5 + (lum - 128) * 0.16 + 8));
    return { r: punch(r), g: punch(g), b: punch(b) };
  });
  out.sort((a, b) => a.r + a.g + a.b - (b.r + b.g + b.b));
  return out;
}

/** Nearest palette colour. The palette is short, so a linear scan beats a tree. */
function nearest(pal: RGB[], r: number, g: number, b: number): RGB {
  let best = pal[0];
  let bestD = Infinity;
  for (let i = 0; i < pal.length; i += 1) {
    const p = pal[i];
    // perceptual weights: green counts more, blue less
    const d = 2 * (p.r - r) * (p.r - r) + 4 * (p.g - g) * (p.g - g) + 3 * (p.b - b) * (p.b - b);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function startPixelSky(canvas: HTMLCanvasElement | null): PixelSky {
  if (!canvas) return { set: () => undefined };
  const ctx = canvas.getContext('2d');
  if (!ctx) return { set: () => undefined };

  const small = document.createElement('canvas');
  const sctx = small.getContext('2d', { willReadFrequently: true });
  const img = new Image();
  let ready = false;
  let palette: RGB[] | null = null;
  let k = 0;
  let queued = false;
  const still = reducedMotion();

  const size = (): void => {
    const w = Math.max(320, canvas.clientWidth || window.innerWidth);
    const h = Math.max(240, canvas.clientHeight || window.innerHeight);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  /** Image rect that covers the canvas (same maths as CSS background-size: cover). */
  function cover(iw: number, ih: number, w: number, h: number): [number, number, number, number] {
    const s = Math.max(w / iw, h / ih);
    const dw = iw * s;
    const dh = ih * s;
    return [(w - dw) / 2, (h - dh) * 0.18, dw, dh];
  }

  /** The palette is built once, from a small copy of the frame. */
  const makePalette = (): void => {
    if (palette || !sctx) return;
    try {
      small.width = 72;
      small.height = 72;
      sctx.clearRect(0, 0, 72, 72);
      const [dx, dy, dw, dh] = cover(img.width, img.height, 72, 72);
      sctx.drawImage(img, dx, dy, dw, dh);
      palette = buildPalette(sctx.getImageData(0, 0, 72, 72).data);
    } catch (e) {
      palette = null; // canvas is tainted — fall back to the palette-free path
    }
  };

  const paint = (): void => {
    queued = false;
    if (!ready || !sctx) return;
    size();
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (k <= 0.001) return;

    let cell = 0;
    for (let i = 0; i < STEPS.length && !cell; i += 1) {
      if (k < STEPS[i][0]) cell = STEPS[i][1];
    }

    if (cell) {
      // the cell is an integer number of screen pixels, so block edges stay sharp
      const cols = Math.ceil(W / cell);
      const rows = Math.ceil(H / cell);
      small.width = cols;
      small.height = rows;
      sctx.clearRect(0, 0, cols, rows);
      sctx.imageSmoothingEnabled = true;
      const [dx, dy, dw, dh] = cover(img.width, img.height, cols, rows);
      sctx.drawImage(img, dx, dy, dw, dh);

      let px: Uint8ClampedArray | null = null;
      try {
        px = sctx.getImageData(0, 0, cols, rows).data;
      } catch (e) {
        px = null;
      }

      ctx.globalAlpha = Math.min(1, k * 2.2);
      if (px && palette && palette.length) {
        const pal = palette;
        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < cols; x += 1) {
            const i = (y * cols + x) * 4;
            // dithering: the matrix offsets the colour BEFORE the palette lookup
            const t = BAYER[(y % 4) * 4 + (x % 4)] * DITHER;
            const c = nearest(pal, px[i] + t, px[i + 1] + t, px[i + 2] + t);
            ctx.fillStyle = `rgb(${c.r | 0},${c.g | 0},${c.b | 0})`;
            ctx.fillRect(x * cell, y * cell, cell, cell);
          }
        }
      } else {
        // fallback: pixels could not be read — at least draw large, aligned blocks
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(small, 0, 0, cols, rows, 0, 0, cols * cell, rows * cell);
        ctx.imageSmoothingEnabled = true;
      }

      // grid between pixels: only on large cells and barely visible, to signal
      // that the pixelation is deliberate without drawing a lattice over the image
      if (cell > 12) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.22, (cell - 12) / 90);
        ctx.strokeStyle = 'rgba(2, 8, 12, 0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = cell; x < W; x += cell) {
          ctx.moveTo(x + 0.5, 0);
          ctx.lineTo(x + 0.5, H);
        }
        for (let y = cell; y < H; y += cell) {
          ctx.moveTo(0, y + 0.5);
          ctx.lineTo(W, y + 0.5);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    // Reveal: on the last range the real frame fades in over the blocks. It starts
    // appearing while the cell is still small, otherwise the photo would pop in.
    const real = cell ? (cell <= 7 ? Math.max(0, (k - 0.8) / 0.08) * 0.5 : 0) : Math.min(1, (k - 0.88) / 0.12);
    if (real > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, real);
      const [dx, dy, dw, dh] = cover(img.width, img.height, W, H);
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  img.onload = (): void => {
    ready = true;
    makePalette();
    paint();
  };
  img.src = skySrc;
  window.addEventListener('resize', paint);
  onCleanup(() => window.removeEventListener('resize', paint));

  return {
    set(next: number): void {
      const v = Math.max(0, Math.min(1, next));
      if (Math.abs(v - k) < 0.004 && v !== 0 && v !== 1) return;
      k = v;
      if (still) {
        paint();
        return;
      }
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(paint);
    },
  };
}
